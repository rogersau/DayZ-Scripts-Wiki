# Explosion System

There is **no monolithic Explosion object** in DayZ's scripts — `classes/explosion.c` is a WIP stub. An explosion is a **function call**: `Object.Explode(damageType, ammoType)` → `SynchExplosion()` (client VFX broadcast) + native `DamageSystem.ExplosionDamage(...)` (engine-side AoE). The script layer provides the **lifecycle around that call** — trap arming/detonation, grenade fuses, remote detonators, and the destruction-effect chaining that lets one explosion trigger secondary explosions from nearby destructible objects (gas canisters, fuel stations).

All actual damage application, radius, distance falloff, and entity selection happen **native/engine-side**, keyed by the ammo type's config (`cfgAmmo <ammoType>`).

**Primary locations**:
- `P:/scripts/3_game/entities/object.c` — `Explode` (`:144`), `SynchExplosion` (`:159`), `OnExplodeClient` (`:173`)
- `P:/scripts/3_game/damagesystem.c` — `DamageSystem.ExplosionDamage` (`:25`, `proto native`)
- `P:/scripts/3_game/effects/destructioneffects/destructioneffectbase.c` — `DealExplosionDamage` (`:50`), chaining hook
- `P:/scripts/4_world/classes/destructioneffects/destructioneffects.c` — concrete destruction-effect subclasses
- `P:/scripts/4_world/entities/explosivesbase.c` — `ExplosivesBase` (`EEKilled` → `InitiateExplosion`)
- `P:/scripts/4_world/entities/itembase/grenade_base.c` — `Grenade_Base` (pin/fuse/detonate)
- `P:/scripts/4_world/entities/itembase/trapbase/` — `trap_landmine.c`, `trap_bear.c`, `trap_tripwire.c`
- `P:/scripts/4_world/classes/explosions/flashbangeffect.c` — `FlashbangEffect`

> **See also**: [Damage System](./damage-system) (`ProcessDirectDamage`, `DamageType`), [Weapons & Firearms](./weapons-system), [Effect System](./effect-system) (particles), [Contaminated Areas](./contaminated-area-system) (gas grenades).

---

## Mental Model

```
TRIGGER SOURCES                          THE DETONATION                  CONSEQUENCES
─────────────                            ─────────────                   ────────────
Trap (landmine proximity)   ─┐
Grenade (fuse timer)         │
Remote detonator (pair)      ├─► SetHealth(0) → EEKilled         ──► native AoE damage
Destruction effect (chain)   │   → InitiateExplosion                  (radius/falloff
ExplosivesBase.OnActivated   │   → Explode(damageType, ammo)            from ammo config)
                             │       │
                             │       ├─► SynchExplosion (RPC)  ──► client VFX (particle/sound/light)
                             │       └─► DamageSystem.ExplosionDamage
                             │             (proto native — engine handles the rest)
                             │
                             └─► secondary: ruin nearby destructibles
                                 → their OnHealthLevelChanged
                                 → their DealExplosionDamage  (CHAIN)
```

---

## The Detonation Call — `Object.Explode`

`P:/scripts/3_game/entities/object.c:144`:

```c
void Explode(int damageType, string ammoType = "") {
    if (ammoType == "") ammoType = ConfigGetString("ammoType");
    if (ammoType == "") ammoType = "Dummy_Heavy";
    if (GetGame().IsServer()) {
        SynchExplosion();
        DamageSystem.ExplosionDamage(EntityAI.Cast(this), null, ammoType, GetPosition(), damageType);
    }
}
```

That single native call is the detonation. Lifecycle: **resolve ammoType → broadcast to clients → call native `DamageSystem.ExplosionDamage`**.

### Data carried (per the native signature)

| Param | Meaning |
|-------|---------|
| `source` (EntityAI) | The exploding entity |
| `directHitObject` (null for pure AoE) | A directly-hit object, if any |
| `ammoTypeName` (string) | Drives radius/damage/falloff via `cfgAmmo` |
| `worldPos` (vector) | Epicenter |
| `damageType` (int) | Almost always `DamageType.EXPLOSION` |

There is **no explicit radius** in the call — radius/falloff is resolved from the ammo's config by the native engine.

### Client sync — `SynchExplosion` (`object.c:159`)

On dedicated server sends `ERPCs.RPC_EXPLODE_EVENT` to clients; in singleplayer calls `OnExplodeClient()` directly. `OnExplodeClient()` (`:173`) plays `AmmoEffects.PlayAmmoParticle`/`PlayAmmoEffect` from config.

`DamageType` enum (`damagesystem.c:10`): `CLOSE_COMBAT=0, FIRE_ARM, EXPLOSION, STUN, CUSTOM`.

---

## `DamageSystem.ExplosionDamage` Entry Point

`P:/scripts/3_game/damagesystem.c:25`:

```c
static proto native void ExplosionDamage(EntityAI source, Object directHitObject,
    string ammoTypeName, vector worldPos, int damageType);
```

This is **native/C++** — all actual damage application, falloff, and entity queries happen engine-side.

### Script callers

| Caller | File:line | Context |
|--------|-----------|---------|
| `Object.Explode` | `object.c:155` | The generic path |
| `DestructionEffectBase.DealExplosionDamage` | `destructioneffectbase.c:52` | Destruction-driven explosions (chaining) |
| `LandMineTrap.Explode` | `trap_landmine.c:236` | Direct call with a +0.1m Y offset |

---

## Area-of-Effect / Falloff

The AoE is **native/engine-driven**, not script-computed. `DamageSystem.ExplosionDamage` is `proto native`; there is **no `GetEntitiesInRange`** in the explosion path. Radius, damage, and distance falloff all come from the **ammo's config** (`cfgAmmo <ammoType>`), so each ammoType (e.g. `Plastic_Explosive_Ammo`, `LandMineExplosion_CarWheel`, `GasCanister_Ammo`) defines its own blast.

The only script-side distance math is:

| Effect | File:line | Math |
|--------|-----------|------|
| **Camera shake** | `dayzgame.c:3439-3447` | `distance_to_player = vector.Distance(pos, playerPos)`; if `< m_AmmoShakeParams.m_Radius`, intensity lerped (`Math.InverseLerp`/`Math.Lerp`) into `SpawnCameraShake` |
| **Noise** | `dayzgame.c:3407-3414` | `AddNoiseTarget(pos, 21, ...)` — AI-awareness noise |
| **Trap proximity** (separate from explosion AoE) | `trapbase.c:623` | `GetClosestCarWheel` uses `vector.Distance(...) < 1` |

> **Note:** Area damage (a *different* system) does its own entity queries via `AreaDamageTrigger` insiders + raycasts — see [Damage System](./damage-system). Explosions do **not** use that path.

---

## Destruction Effects & Chaining

`P:/scripts/3_game/effects/destructioneffects/destructioneffectbase.c:1` — `class DestructionEffectBase`. Base behavior attached to an entity's destruction. Key members (`:23-25`): `bool m_HasExplosionDamage`, `DamageType m_DamageType`, `string m_AmmoType`.

### The chaining hook

- **Entry** — `OnHealthLevelChanged` (`:55`) fires when an entity's health level drops. On the server, if `HasExplosionDamage()` is true → `DealExplosionDamage()` (`:72`)
- **`HasExplosionDamage()`** (`:45`) — `m_HasExplosionDamage && m_AmmoType`
- **`DealExplosionDamage()`** (`:50-52`):

```c
DamageSystem.ExplosionDamage(m_Entity, null, m_AmmoType, m_Entity.GetPosition(), m_DamageType);
```

### How chaining works

A destruction effect's own `DealExplosionDamage()` raises a new explosion that can ruin nearby entities, which in turn fire their own `OnHealthLevelChanged` → their own `DealExplosionDamage`. Concrete subclasses set their ammo: e.g. `DestructionEffectGasCanister` (`destructioneffects.c:124`) sets `m_AmmoType="GasCanister_Ammo"` and `m_DamageType=DamageType.EXPLOSION`.

> **Base vs subclasses:** `P:/scripts/3_game/effects/destructioneffects/` holds only the base (`destructioneffectbase.c`); the concrete subclasses (`DestructionEffectGasCanister`, `DestructionEffectFuelStation`, etc.) live in `P:/scripts/4_world/classes/destructioneffects/destructioneffects.c`.

### Visual/audio

Client side of `OnHealthLevelChanged` (`:78-107`) plays `m_ParticleOneTime` via `PlayParticle`, and `m_SoundSetOneTime`/`m_SoundSetPersistent` via `m_Entity.PlaySoundSet...`. `OnExplosionEffects` (`:157`) is a relay hook so an entity destroyed by a *nearby* explosion can react (e.g. spawn extra particles).

---

## Explosives & Grenades

### `ExplosivesBase` (`entities/explosivesbase.c`)

Base for all explosives. `EEKilled` (`:100`) → `InitiateExplosion()` + `UnpairRemote()`. Subclasses override `InitiateExplosion`.

### `Grenade_Base` (`grenade_base.c`) `extends ExplosivesBase`

Pin/fuse state: `m_Pinned` (default true), `m_FuseTimer`, `m_FuseDelay` (`DEFAULT_FUSE_DELAY = 10`, `:32`).

| Method | File:line | Role |
|--------|-----------|------|
| `Unpin()` | `:52` | Player action → `OnUnpin()` (`:188`) → `m_Pinned=false`, `OnActivateStarted()` |
| `Activate()` | `:122` | Runs `m_FuseTimer.Run(m_FuseDelay, this, "OnActivateFinished")`. Auto-triggered by `EEItemLocationChanged` (`:273`): when grenade leaves hands while unpinned, safety handle releases → `Activate()` |
| `OnActivateFinished` | `:201` | `SetHealth("","",0.0)` → kills grenade → `EEKilled` |
| `InitiateExplosion` | `:151` | By type: `FRAGMENTATION`/`ILLUMINATING` loop `m_AmmoTypes` calling `Explode(DamageType.EXPLOSION, m_AmmoTypes[i])`; `CHEMICAL`/`NON_LETHAL` do nothing |
| `OnActivatedByItem` | `:63` | Tripwire chain: calls `Unpin()` → fuse → explode |

Grenade types: `FRAGMENTATION`, `CHEMICAL` (gas — see [Contaminated Areas](./contaminated-area-system)), `ILLUMINATING`, `NON_LETHAL`.

### Remote detonation — `RemotelyActivatedItemBehaviour`

`P:/scripts/3_game/remotelyactivateditembehaviour.c:1` — per-item component holding `m_PairDevice`, net IDs, persistent pairing ID. `Pair()`/`Unpair()` maintain bidirectional links.

| Explosive | File | Trigger mechanism |
|----------|------|-------------------|
| `Plastic_Explosive` | `plastic_explosive.c:1` | Owns `m_RAIB`; accepts `RemoteDetonatorReceiver` on `TriggerRemoteDetonator_Receiver` slot. `OnActivatedByItem` (`:236`) — if paired + armed + activator is pair device → `SetHealth(0)` + `InitiateExplosion()` |
| `RemoteDetonatorTrigger` | `remotedetonator.c:46` | Player-held; `OnActivatedByItem` (`:125`) checks range (`UAMaxDistances.EXPLOSIVE_REMOTE_ACTIVATION`), calls `device.OnActivatedByItem(this)` on the paired explosive |
| `ImprovisedExplosive` | `improvisedexplosive.c:1` | Supports 3 trigger types (alarm clock, kitchen timer, remote); drops each attached explosive and fires them with staggered delay (`TIME_TRIGGER_DELAY_SECS = 0.3`) |

Pairing on arm: `ReplaceDetonatorItemOnArmLambda.OnSuccess` (`remotedetonator.c:277`) spawns a `RemoteDetonatorReceiver` on the explosive, pairs, and calls `explosive.Arm()`.

---

## Traps

### `TrapTrigger` (`traptrigger.c:3`)

`class TrapTrigger : Trigger`. `CanAddObjectAsInsider` (`:26`) requires `m_Enabled && parent active`. `OnEnterServerEvent` (`:31`) → `m_ParentObj.SnapOnObject(victim)`. `TripWireTrigger` (`:68`) adds movement-stance filtering (only triggers on jogging/sprinting erect players, or crouch-sprint).

### `TrapBase` (`trapbase.c`) — arming

| Method | File:line | Role |
|--------|-----------|------|
| `StartActivate` | `:438` | Arms via timer: `m_Timer.Run(m_InitWaitTime, this, "SetActive")` |
| `SetActive` | `:414` | `m_IsActive=true`, `CreateTrigger()` (`:475`) spawns the `TrapTrigger` entity + `SetExtents` |
| `SnapOnObject(victim)` | `:216` | When an insider enters; for non-explosive traps deals `m_DamagePlayers`/`m_DamageOthers`; calls `OnSteppedOn` |
| `GetClosestCarWheel` | `:623` | `vector.Distance(...) < 1` to find a wheel near a landmine |

### `LandMineTrap` (`trap_landmine.c`)

| Phase | File:line | Detail |
|-------|-----------|--------|
| Arming timer | `:21` | `m_InitWaitTime = 10`; `OnPlacementComplete` (`:285`) → `StartActivate` |
| Vehicle detection | `:101` | `OnSteppedOn` — if `victim.IsInherited(CarScript)`, starts repeating `m_UpdateTimer` (0.05s) |
| Wheel check | `:89` | `OnUpdate` → `GetClosestCarWheel`; if within 1m → `OnServerSteppedOn` |
| **The explosion** | `:177` | `OnServerSteppedOn`: `wheel.ProcessDirectDamage(CLOSE_COMBAT, this, "", "LandMineExplosion_CarWheel", "0 0 0", 1)` damages the wheel; then `Explode(DamageType.EXPLOSION)` |
| `Explode` override | `:220` | Resolves ammoType, `SynchExplosion()`, `DamageSystem.ExplosionDamage(this, NULL, ammoType, GetPosition()+Vector(0,0.1,0), damageType)` (`:236`) — note the +0.1m Y offset |
| Player step | `:120-156` | Roll broken legs (`BROKEN_LEG_PROB=90`), bleed sources, clothing damage, then `Explode` (`:157`) |

### `TripwireTrap` (`trap_tripwire.c`)

`CreateTrigger` (`:60`) spawns a `TripWireTrigger` (long thin box extents). `OnSteppedOn` (`:72`) → `victim.ProcessDirectDamage(CLOSE_COMBAT, this, "", "TripWireHit", "0 0 0", 1)`. **Chained grenade detonation**: tripwire holds a grenade as attachment; `SetInactive` (`:150`) iterates attachments and calls `attachment.OnActivatedByItem(this)` (`:165`) → the grenade's `OnActivatedByItem` → `Unpin()` → fuse → explode. So a tripwire+grenade is a scripted trap chain.

### `BearTrap` (`trap_bear.c`)

Non-explosive; `OnSteppedOn` (`:67`) raycasts (`m_RaycastSources`) and deals leg damage; car handling reuses `GetClosestCarWheel`/`OnServerSteppedOn`.

---

## Visual / Audio / Camera Shake

### Particles

| Source | File:line | Detail |
|--------|-----------|--------|
| Ammo config | `object.c:183` | `OnExplodeClient` → `AmmoEffects.PlayAmmoParticle(ammoType, pos)` / `PlayAmmoEffect` |
| Generic explosion | `dayzgame.c:3419` | `DayZGame.ExplosionEffects`: if `source.ShootsExplosiveAmmo()`, plays `AmmoTypesAPI.GetExplosionParticleID(ammoType, surface)` via `ParticleManager.GetInstance().PlayInWorld` (`:3431-3435`); calls `source.OnExplosionEffects(...)` |
| ExplosivesBase VFX | `explosivesbase.c:64` | `OnExplosionEffects` plays `m_ParticleExplosionId` (surface-aware, e.g. `EXPLOSION_GRENADE_SNOW`) with `ParticleManager.PlayOnObject`; calls `CreateLight()` |

### Light

| Light | File:line | Properties |
|-------|-----------|------------|
| `ExplosiveLight` | `explosivesbase.c:1` | brightness 10, radius 30, lifetime 0.15s |
| `FlashGrenadeLight` | `grenade_base.c:12` | brightness 50, radius 20, lifetime 0.35s |

Created by `CreateLight()` (`explosivesbase.c:175`) via `ScriptedLightBase.CreateLight`.

### Sounds

| Source | Sound set |
|--------|-----------|
| Destruction effects | `m_SoundSetOneTime`/`Persistent` via `PlaySoundSet`/`PlaySoundSetLoop` (`destructioneffectbase.c:91-97`) |
| Landmine | `landmine_safetyPin_SoundSet`, `landmine_timer2_SoundSet` (loop), `landmineActivate_SoundSet` (`trap_landmine.c:52,57,215`) |
| Tripwire | `TripwireTrap_Trigger_SoundSet` (`trap_tripwire.c:94`) |
| Flashbang | `Tinnitus_Soundset` + `FlashbangAttenuation` master attenuation (`flashbangeffect.c:107,131`) |

### Camera shake / knockdown / force

- **Camera shake** — `dayzgame.c:3447`: `GetGame().GetPlayer().GetCurrentCamera().SpawnCameraShake(modifier * m_AmmoShakeParams.m_Strength)`, where `m_AmmoShakeParams` is loaded per-ammo (`:3440`) and falloff is distance-based (`:3444-3446`)
- **Flashbang stun** — `PPERequester_FlashbangEffects` (`flashbangeffect.c:26`, `SetFlashbangIntensity`) + tinnitus attenuation; the `STUN` `DamageType` exists (`damagesystem.c:15`) for stun ammo
- **No generic knockdown impulse in script** — any physical impulse comes from the native damage system. Bleeding/broken-leg effects from landmines are script-applied (`trap_landmine.c:128-146`): `DamageAllLegs`, `AttemptAddBleedingSourceBySelection`, `DamageClothing`

---

## End-to-End: Vehicle Over a Landmine

```
1. PLACE & ARM
   Player places landmine → OnPlacementComplete                            trap_landmine.c:285
      → StartActivate → 10s timer → SetActive                              trapbase.c:414
      → CreateTrigger spawns TrapTrigger                                   trapbase.c:475

2. VEHICLE ENTERS TRIGGER
   TrapTrigger.OnEnterServerEvent → m_ParentObj.SnapOnObject(victim)       traptrigger.c:31

3. WHEEL PROXIMITY LOOP
   LandMineTrap.OnSteppedOn (victim IsInherited CarScript)                 trap_landmine.c:101
      → starts m_UpdateTimer (0.05s loop)                                  :116
   OnUpdate → GetClosestCarWheel (distance < 1m) → OnServerSteppedOn       trapbase.c:623

4. DETONATION
   OnServerSteppedOn:                                                      trap_landmine.c:177
      wheel.ProcessDirectDamage(CLOSE_COMBAT, this, "", "LandMineExplosion_CarWheel", ...)
      Explode(DamageType.EXPLOSION)

5. Explode                                                                 trap_landmine.c:220
      SynchExplosion()  (RPC to clients)
      DamageSystem.ExplosionDamage(this, NULL, ammoType,
         GetPosition()+Vector(0,0.1,0), damageType)                        :236
      (native AoE damages vehicle + nearby entities per ammo config)
      DeleteThis()

6. CLIENT VFX
   RPC_EXPLODE_EVENT → OnExplodeClient                                     object.c:173
      → AmmoEffects particle/sound
   DayZGame.ExplosionEffects                                               dayzgame.c:3419
      → EXPLOSION_LANDMINE particle + camera shake within radius
```

---

## End-to-End: Grenade Throw → Pin → Fuse → Detonation

```
1. CONSTRUCT
   Grenade_Base: m_Pinned=true, fuse delay 10s, type FRAGMENTATION          grenade_base.c:294

2. UNPIN (player action)
   ActionUnpin → Unpin() → OnUnpin(): m_Pinned=false, OnActivateStarted()   :52, :188

3. THROW / DROP
   EEItemLocationChanged: location no longer HANDS && !IsPinned()           :273
      → Activate()                                                         :122

4. FUSE
   m_FuseTimer.Run(m_FuseDelay, this, "OnActivateFinished")                :135
   (10s fuse)

5. FUSE EXPIRES
   OnActivateFinished: SetHealth("","",0.0) → entity killed               :201

6. EXPLODE
   ExplosivesBase.EEKilled → InitiateExplosion + UnpairRemote              explosivesbase.c:100
   Grenade_Base.InitiateExplosion:                                         grenade_base.c:151
      FRAGMENTATION: loop m_AmmoTypes calling Explode(DamageType.EXPLOSION, ammo)  :159
      OnExplode() schedules DeleteSafe after 0.25s                         :167

7. Explode → SynchExplosion + DamageSystem.ExplosionDamage                 object.c:144
   → native AoE + client VFX (EXPLOSION_GRENADE_* particle, light, shake)

(Tripwire variant: TripwireTrap.SetInactive trap_tripwire.c:165
   → grenade.OnActivatedByItem(this) → grenade_base.c:63 OnActivatedByItem
   → Unpin() → same fuse path)
```

---

## Directory Structure

```
3_game/
├── entities/object.c                          Explode (:144), SynchExplosion (:159), OnExplodeClient (:173)
├── damagesystem.c                             DamageSystem.ExplosionDamage (:25, proto native), DamageType enum
├── remotelyactivateditembehaviour.c           RemotelyActivatedItemBehaviour (pairing)
└── effects/destructioneffects/
    └── destructioneffectbase.c                DestructionEffectBase (DealExplosionDamage :50, chaining hook)

4_world/
├── classes/
│   ├── explosion.c                            Explosion (WIP stub)
│   ├── explosions/
│   │   └── flashbangeffect.c                  FlashbangEffect
│   ├── destructioneffects/
│   │   └── destructioneffects.c               Concrete subclasses (GasCanister, FuelStation, …)
│   └── areadamage/                            (separate system — see Damage System)
├── entities/
│   ├── explosivesbase.c                       ExplosivesBase (EEKilled → InitiateExplosion)
│   ├── grenade_base.c                         Grenade_Base (pin/fuse/detonate)
│   ├── explosivesbase/
│   │   ├── plastic_explosive.c                Plastic_Explosive (remote detonator)
│   │   ├── improvisedexplosive.c              ImprovisedExplosive (3 trigger types)
│   │   ├── remotedetonator.c                  RemoteDetonatorTrigger / Receiver
│   │   └── claymoremine.c
│   └── trapbase/
│       ├── trapbase.c                         TrapBase (arming, SnapOnObject)
│       ├── trap_landmine.c                    LandMineTrap (vehicle proximity)
│       ├── trap_bear.c                        BearTrap (non-explosive leg damage)
│       └── trap_tripwire.c                    TripwireTrap (grenade chain)
└── entities/scriptedentities/triggers/
    ├── traptrigger.c                          TrapTrigger / TripWireTrigger
    └── traptriggerinsider.c
```

---

## Related Documentation

- [Damage System](./damage-system) — `ProcessDirectDamage`, `DamageType`, the native damage pipeline explosions feed into
- [Weapons & Firearms](./weapons-system) — firearms share the native damage application
- [Effect System](./effect-system) — particle/sound playback (`AmmoEffects`, `ParticleManager`)
- [Contaminated Areas](./contaminated-area-system) — gas grenades (`CHEMICAL` type) spawn `ContaminatedArea_Local`
- [Damage & Combat](./damage-combat) — high-level conceptual overview
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
