# Damage System (Native Pipeline)

DayZ's damage application is **native C++** (the Enfusion engine). The script layer does **not** compute or apply damage itself — instead it calls native entry points, and the engine fires **callback hooks** (`EEOnDamageCalculated` → apply → `EEHitBy` → `EEHealthLevelChanged` → `EEKilled`) back into script, which then builds the *consequences*: bleeding sources, shock accumulation, injury animations, unconsciousness, and death bookkeeping.

> For the high-level conceptual overview (damage types, melee/firearm/explosion at a glance, injury state diagram), see [Damage & Combat](./damage-combat). This page documents the **implementation pipeline** — the actual native entry points, the callback sequence, and the consequence subsystems, all code-cited.

**Primary locations**:
- `P:/scripts/3_game/damagesystem.c` — `DamageSystem` (thin native wrapper), `TotalDamageResult`, `DamageType`
- `P:/scripts/3_game/entities/object.c` — `ProcessDirectDamage` (`:1130`), native health API
- `P:/scripts/4_world/entities/manbase/playerbase.c` — `EEHitBy` (`:1086`), `EEKilled` (`:1045`), uncon handling
- `P:/scripts/4_world/entities/dayzplayerimplement.c` — `EEHitBy` + `KillerData` (`:1521`), death
- `P:/scripts/4_world/classes/bleedingsources/` — bleeding source lifecycle
- `P:/scripts/4_world/classes/shockhandler.c` — shock accumulation
- `P:/scripts/4_world/classes/injuryhandler.c` — injury animation levels
- `P:/scripts/4_world/classes/areadamage/` — area damage (legacy + `areadamagenew/`)

> **See also**: [Player Modifiers & Symptoms](./modifiers-symptoms-system) (`ShockMdfr`/`ShockDamageMdfr`), [Weapons & Firearms](./weapons-system) (firearm source), [User Actions System](./user-actions-system) (bandage/suture actions), [Animation System](./animation-system) (hit/death anims).

---

## Mental Model — the Native Pipeline

```
SCRIPT ENTRY (one of three)              NATIVE ENGINE (C++)
─────────────────────────                ────────────────────
ProcessDirectDamage(CLOSE_COMBAT,...) ─┐
DamageSystem.CloseCombatDamage(...)   ─┼─► resolve component → damage zone (config map)
DamageSystem.ExplosionDamage(...)     ─┘    read CfgAmmo DamageApplied (Health/Blood/Shock)
                                          apply to native per-zone health values
                                                 │
                                                 ▼  callback chain (in order)
                                          EEOnDamageCalculated (script may veto)
                                                 │
                                          EEHitBy(damageResult, type, source, component,
                                                  dmgZone, ammo, modelPos, speedCoef)
                                                 │
                                          ┌──────┴───────┐
                                          ▼              ▼
                                   PlayerBase.EEHitBy   DayZPlayerImplement.EEHitBy
                                   (bleeding, shock,    (KillerData, hit anim)
                                    broken legs,
                                    nonlethal conv.)
                                                 │
                                          EEHealthLevelChanged (per affected zone)
                                                 │
                                          (if Health hits 0) EEKilled(killer)
```

The script consequence work happens **inside the callbacks**, not before the damage is dealt.

---

## DamageSystem & Entry Points

`P:/scripts/3_game/damagesystem.c`

### `DamageType` enum (`:10-17`)

| Value | Name | Source |
|-------|------|--------|
| 0 | `CLOSE_COMBAT` | Melee |
| 1 | `FIRE_ARM` | Bullets |
| 2 | `EXPLOSION` | Explosives |
| 3 | `STUN` | Stun |
| 4 | `CUSTOM` | Script-defined (mods) |

### Native entry points (`:22-25`)

```c
static proto native void CloseCombatDamage(EntityAI source, Object target,
    int targetComponentIndex, string ammo, vector worldPos, int flags = ALL_TRANSFER);
static proto native void CloseCombatDamageName(EntityAI source, Object target,
    string targetComponentName, string ammo, vector worldPos, int flags = ALL_TRANSFER);
static proto native void ExplosionDamage(EntityAI source, Object directHitObject,
    string ammo, vector worldPos, int damageType);
```

### `TotalDamageResult` (`:1-5`)

Native object the engine returns after a hit, exposing `GetDamage(zone, healthType)` and `GetHighestDamage(healthType)`. This is how script reads back *how much* Health/Blood/Shock was actually dealt.

### Routing by type — which entry point each damage source uses

| Source | Script entry | Called from |
|--------|--------------|-------------|
| **Melee** | `DamageSystem.CloseCombatDamage(...)` | `dayzplayermeleefightlogic_lightheavy.c:652,682,699,714` |
| **Explosion** | `DamageSystem.ExplosionDamage(...)` | `destructioneffectbase.c:52`, `object.c:155`, `dayzgame.c:3577` |
| **Firearm bullets** | **None** — native projectile applies `FIRE_ARM` damage directly on impact | (engine) |
| **Generic/direct** (traps, area damage, fall, heat) | `Object.ProcessDirectDamage(damageType, source, componentName, ammoName, modelPos, damageCoef, flags)` | `object.c:1130` — most common |

> **Key insight:** Firearms skip the script entry point entirely. The native projectile/`EntityAI` directly applies `FIRE_ARM` damage on impact (ammo config + engine bullet-vs-component raycast), then `EEHitBy` fires. This is the defining difference between firearms and melee/explosion.

`ProcessDirectDamage` flags (`object.c:1-7`): `ALL_TRANSFER`, `NO_ATTACHMENT_TRANSFER`, `NO_GLOBAL_TRANSFER`, `NO_TRANSFER`.

> **Note:** the `componentName` param to `ProcessDirectDamage` is actually the **DamageZone name**, not a geometry component (despite the comment at `object.c:1124`).

---

## Damage Zones

Zones are **config-defined** (`CfgVehicles ... DamageSystem DamageZones`), read by:
- `DamageSystem.GetDamageZoneMap` (`damagesystem.c:27-73`) — reads `CfgVehicles <type> DamageSystem DamageZones <zone> componentNames`
- `GetComponentNamesFromDamageZone` (`:104`)
- `GetDamageZoneFromComponentName` (`:76-102`) — scans the zone map
- Native `GetDamageZoneNameByComponentIndex` (`object.c:1156`)

Each named zone (e.g. `Head`, `Torso`, `LeftArm`, `Brain`) maps to a set of geometry component names. Each zone has its own per-zone Health/Shock/Blood health types managed natively by the engine.

### How a hit selects a body zone

| Source | Selection method |
|--------|------------------|
| **Bullet** | Engine bullet raycast produces a component index → engine resolves to damage zone natively → passes `dmgZone` into `EEHitBy` (`playerbase.c:1086`) |
| **Melee** | Pre-decided *before* damage by `m_MeleeCombat.GetHitZoneIdx()` (`dayzplayermeleefightlogic_lightheavy.c:662,682`) |
| **Area damage** (raycasted) | Raycasts from trigger → `contactComponent` → `GetDamageZoneNameByComponentIndex` (`areadamage.c:209`) |
| **Area damage** (no raycast) | Random hitzone (`areadamage.c:154` `GetRandomHitZone`) |

---

## `HitInfo` — NOT the Damage Payload

`P:/scripts/3_game/hitinfo.c` (8 lines, entirely native getters):

```c
proto native float  GetSurfaceNoiseMultiplier();
proto native string GetAmmoType();
proto native vector GetPosition();
proto native vector GetSurfaceNormal();
proto native string GetSurface();
proto native bool   IsWater();
```

`HitInfo` describes a **surface hit** (footsteps, projectile impact on terrain/world) — used by footstep/sound systems. It is **not** the damage payload. The damage payload is `TotalDamageResult` + the `EEHitBy` parameters.

For synced client hit visuals, `SyncHitInfo` (`synchitinfo.c:1-9`: `m_AnimType, m_HitDir, m_HealthDamage, m_Fullbody, m_HasSource`) is the network-synced hit-reaction data, separate from both `HitInfo` and `TotalDamageResult`.

---

## The `EEHitBy` Callback Sequence

When the native engine applies damage, this fires in order on the target:

### 1. `EEOnDamageCalculated` (`object.c:1136`)

Script may veto/modify the `TotalDamageResult` (returns `true` by default to proceed).

### 2. Engine applies Health/Blood/Shock to native per-zone health for the resolved `dmgZone`.

### 3. `EEHitBy` fires — split between two classes:

**`PlayerBase.EEHitBy`** (`playerbase.c:1086`), in order:
- `m_AdminLog.PlayerHitBy(...)` (`:1092`)
- If Shock>0: record `m_LastShockHitTime`, read `unconRefillModifier` from ammo (`:1095-1109`)
- **Bleeding source spawn**: `dmg = damageResult.GetDamage(dmgZone,"Blood"); GetBleedingManagerServer().ProcessHit(dmg, source, component, dmgZone, ammo, modelPos)` (`:1120-1123`)
- **Nonlethal conversion**: if ammo's `transferShockToDamage==1`, `AddHealth("","Health", -ConvertNonlethalDamage(shockDmg, type))` (`:1144-1151`); for `FIRE_ARM` scaled by `NL_DAMAGE_FIREARM_CONVERSION_PLAYERS` (`:1233`)
- **Broken-legs modifier** if any leg/foot zone health ≤1 (`:1153-1162`)
- **Shock sync**: `m_ShockHandler.CheckValue(true)` (`:1205`) → `DealShock`/`GiveShock` depletes native Shock

**`DayZPlayerImplement.EEHitBy`** (`dayzplayerimplement.c:1521`) (called via `super`):
- If `!IsAlive()`: builds `KillerData` (`:1540-1556`)
- Else: picks a damage-hit animation via `EvaluateDamageHitAnimation` → `DayZPlayerSyncJunctures.SendDamageHitEx` (`:1564-1565`)

### 4. `EEHealthLevelChanged` (`playerbase.c:5703`)

Fires per affected zone. Drives part-destruction cascades (e.g. base building — see [Base Building](./base-building-system)).

### 5. `EEKilled` (if Health hits 0)

See [Death Flow](#death-flow) below.

---

## Bleeding System (`bleedingsources/`)

Files: `bleedingsource.c`, `bleedingsourcezone.c`, `bleedingsourcelocation.c` (placeholder), `bleedingsourcesmanagerbase.c`, `bleedingsourcesmanagerserver.c`, `bleedingsourcesmanagerremote.c`.

### Architecture — bitmask-based

Each possible bleed location gets a power-of-2 `m_Bit` (`bleedingsourcesmanagerbase.c:148,162`). The player stores active sources in a single `m_BleedingBits` int synced over the network (consumed by `BleedingSourcesManagerRemote.OnVariablesSynchronized`, `bleedingsourcesmanagerremote.c:33`).

### `BleedingSourceZone` (`bleedingsourcezone.c`)

Static *template* metadata for a zone — `m_FireSelectionName, m_Bit, m_EmitterOffset/Orientation, m_Bone, m_FlowModifier, m_MaxTime, m_ParticleName, m_InventorySlotLocation`. ~26 zones registered in `BleedingSourcesManagerBase.Init()` (`bleedingsourcesmanagerbase.c:21-62`) covering Head/Neck/Torso/arms/legs/feet, each tied to an inventory slot (MASK, BODY, GLOVES, LEGS, FEET) so clothing can block them.

### `BleedingSource` (`bleedingsource.c:7`)

A live, *instantiated* source. Constructor (`:31`) spawns the particle (`CreateParticle`, `:87-111`), parents it to the player bone, and starts the screen-edge bleed indication. Has `m_ActiveTime`/`m_MaxTime` lifetime and an `eBleedingSourceType` (`NORMAL`/`CONTAMINATED`).

### Creation on hit — the chain

```
PlayerBase.EEHitBy                                            playerbase.c:1120
  dmg = damageResult.GetDamage(dmgZone,"Blood")
  GetBleedingManagerServer().ProcessHit(dmg, source, component, dmgZone, ammo, modelPos)
        │
        ▼
BleedingSourcesManagerServer.ProcessHit                       bleedingsourcesmanagerserver.c:167
  reads bleedThreshold + type from CfgAmmo <ammo> DamageApplied
  bleed chance via BleedChanceData.CalculateBleedChance       bleedchancedata.c:70
     (Melee/Infected use tables; infected uses damage%-roll)
  if damage > dmg_max*(1-bleedThreshold):                     :197
        │
        ▼
AttemptAddBleedingSource(component)                           bleedingsourcesmanagerbase.c:194
  GetBitFromSelectionID → resolves "fire" geometry selection to a bit   :107
  CanAddBleedingSource (bit not already set)                  :241
        │
        ▼
AddBleedingSource(bit)                                       bleedingsourcesmanagerserver.c:31
  sets bit in m_BleedingBits
  constructs new BleedingSource(...) (particle + indication)
  m_Player.OnBleedingSourceAdded()
```

### Blood drain over time — `OnTick`

`BleedingSourcesManagerServer.OnTick` (`bleedingsourcesmanagerserver.c:127-152`) runs every `TICK_INTERVAL_SEC = 3` (`:3`):

- Computes `blood_scale` from current blood (`Math.InverseLerp(BLOOD_THRESHOLD_FATAL, BLEEDING_LOW_PRESSURE_BLOOD, blood)`, `:143`) — blood pressure falls as you lose blood
- Calls each `BleedingSource.OnUpdateServer(tick, blood_scale, no_blood_loss)` (`bleedingsource.c:118-147`):

```c
m_Player.AddHealth("GlobalHealth","Blood",
    PlayerConstants.BLEEDING_SOURCE_BLOODLOSS_PER_SEC * blood_scale * deltatime * flow);
```

- For `CONTAMINATED` type, `flow *= PlayerConstants.BLEEDING_SOURCE_BURN_MODIFIER` (`:140-143`)
- Ages the source; when `m_ActiveTime >= m_MaxTime` it self-requests deletion (`:122-129`)

### Stopping (bandage)

`RemoveMostSignificantBleedingSourceEx(item)` (`bleedingsourcesmanagerserver.c:91`):
- `GetMostSignificantBleedingSource` (`:97-125`) picks the bit with highest `FlowModifier`
- `RemoveBleedingSource(bit)` (`:43-74`): clears the bit from `m_BleedingBits`, may roll a wound-infection chance inserting `eAgents.WOUND_AGENT` (`:49-62`), calls `OnBleedingSourceRemovedEx(item)`

The bandage/suture action calls `RemoveMostSignificantBleedingSourceEx(this)`. `RemoveAllSources()` (`:170`) and `RequestDeletion` (`:22`) handle lifetime/bulk removal.

---

## Shock → Unconsciousness

### `ShockHandler` (`shockhandler.c`)

Tracks `m_Shock` (pending shock from a hit), `m_CumulatedShock`, and reflects to `m_Player.m_CurrentShock` (network-synced, `playerbase.c:110,539`).

**Accumulation:**
- `SetShock(dealtShock)` (`:94-98`) **adds** shock to `m_Shock` and calls `CheckValue(false)`. Called from `PlayerBase` on events like broken legs (`playerbase.c:3651,3697,3722,4096`).
- `CheckValue(forceUpdate)` (`:108-129`): `m_CumulatedShock += m_Shock` on both client & server. On server, once `m_CumulatedShock >= UPDATE_THRESHOLD (3)` it applies `m_ShockMultiplier`, then **`DealShock()`** (`:101-105`): `m_Player.GiveShock(-m_CumulatedShock)`. `GiveShock` (`playerbase.c:3544`) = `AddHealth("","Shock", shock)` — native Shock health depletion. Then `Synchronize()` sends via `DayZPlayerSyncJunctures.SendShock` (`:131-134`).
- **Ammo-driven shock is applied natively** (the `Shock` damage type from `CfgAmmo`); `EEHitBy` detects it at `playerbase.c:1095` (`damageResult.GetDamage(dmgZone,"Shock")>0`) and calls `m_ShockHandler.CheckValue(true)` (`:1205`).

### Unconsciousness — no script threshold

The engine watches native Shock health; when it hits 0 the engine sets the protected `m_ShouldBeUnconscious` flag (`dayzplayerimplement.c:149`, set to `false` only on death at `:669`). The command-handler tick (`playerbase.c:2984-3033`) reacts:

- `m_ShouldBeUnconscious && !m_IsUnconscious` (`:3000`) → `StartCommand_Unconscious(0)` (`:3030`), `m_IsUnconscious=true`, `OnUnconsciousStart()`
- `m_IsUnconscious && !m_ShouldBeUnconscious` (`:3035`) → wake-up logic

### Shock modifiers (refill/drain)

| Modifier | File | Role |
|----------|------|------|
| `ShockMdfr` | `shock.c` | Refills Shock over time via `AddHealth("","Shock", deltaT*GetRefillSpeed(...))` (`:75`), gated by `SHOCK_REFILL_COOLDOWN_AFTER_HIT` and pulse type (`:64`) |
| `ShockDamageMdfr` | `shockdamage.c` | Drains Shock when blood is critically low (`≤ SHOCK_DAMAGE_BLOOD_THRESHOLD_HIGH`, `:26`) — secondary shock damage from blood loss |

### Shock/Hit reactions (client visual only)

`ShockDealtEffect` (`shockhitreaction.c:1`) and `DamageDealtEffect` (`bullethitreaction.c:1`) are **purely client-side postprocess (PPE) reactions** — blur/vignette/color ramps driven by `PPERequester_ShockHitReaction`/`PPERequester_HealthHitReaction`. Visual feedback only, not damage math. Triggered via `SpawnShockEffect`/`SpawnDamageDealtEffect2` (from symptoms like `painheavystate.c:47`).

---

## Injury Handler (`injuryhandler.c`)

`InjuryAnimationHandler` drives the limp/injury additive animation by sampling global Health every `VALUE_CHECK_INTERVAL = 5`s (`:42,91-97`).

### Pipeline (`CheckValue`, `:154-171`)

1. `health_current_normalized = m_Player.GetHealth("","Health") / m_HealthMaxValue` (`:156`)
2. `GetInjuryLevel` (`:192-215`) maps to `eInjuryHandlerLevels` against thresholds in `InjuryHandlerThresholds` (`:1-7`: RUINED<0.1, BADLY_DAMAGED<0.2, DAMAGED<0.3, WORN<0.5, else PRISTINE)
3. Optional `GetOverrideLevel` (`:100-152`) applies drug/leg overrides:
   - `MORPHINE` → PRISTINE
   - `PAIN_KILLERS_LVL0/1` clamp down
   - `BROKEN_LEGS` uses average leg health (RightLeg/LeftLeg/RightFoot/LeftFoot, `:140-148`) against `BROKEN_LEGS_*_THRESHOLD`
4. On level change: `SendValue` (`:180-183`) via `DayZPlayerSyncJunctures.SendInjury`, fires `m_ChangedStateInvoker`, sets `m_Player.m_HealthLevel` + `SetSynchDirty`
5. `SetInjuryCommandParams(enable, level)` (`:185-190`) → applied next `Update` via `GetCommandModifier_Additives().SetInjured(value, enabled)` (`:84`)

### `eInjuryOverrides` bitmask (`:27-37`)

`MORPHINE=1, PAIN_KILLERS_LVL0=2, PAIN_KILLERS_LVL1=4, BROKEN_LEGS=8, BROKEN_LEGS_SPLINT=16, PRONE_ANIM_OVERRIDE=32`.

`InjuryAnimValues` (`:9-16`) maps levels LVL0..LVL4 = 0..1 anim weights.

---

## Area Damage (`areadamage/`)

Two generations coexist:

### Legacy (deprecated) — `areadamage.c` + `areadamagetrigger.c` + `areadamage*regular*`/`onetime*`

`AreaDamageBase extends AreaDamageManager` + `AreaDamageTrigger` (`areadamagetrigger.c`, uses `EOnTouch` to add insiders `:31-36`, calls `m_AreaDamageType.OnEnter/OnLeave` `:62-76`).

Damage application: `EvaluateDamage_Common` (`areadamage.c:119-147`):

```c
object.ProcessDirectDamage(m_DamageType, m_ParentObject, hitzone, m_AmmoName, "0.5 0.5 0.5", 1);  // :142
```

Hitzone chosen by `GetRaycastedHitZone` (`:162`, vertical raycasts from trigger; falls back to random Left/RightFoot `:222-225`) or `GetRandomHitZone` (`:154`). Looped variants use a `Timer`; one-time fire once; deferred ones add a delay.

### Current — `areadamagenew/`

| Class | File | Role |
|-------|------|------|
| `AreaDamageManager` | `areadamagemanager.c:8` | Owns an `AreaDamageComponent` + `AreaDamageTriggerBase`. `SetDamageComponentType` (`:41-67`) swaps between BASE / HITZONE / RAYCASTED (`AreaDamageComponentTypes`, `:1-6`) |
| `AreaDamageTriggerBase` | `areadamagetriggerbase.c` | Extends `Trigger`, forwards every `OnEnter/OnStay/OnLeave` Server/Client/Begin/End event to the manager (`:54-201`), removes insiders when dead (`ShouldRemoveInsider :208`). Adds `lastDamaged` via `AreaDamageTriggerInsider` (`:1-9`) |
| `AreaDamageComponent` | `areadamagecomponent.c` | `EvaluateDamageInternal` (`:56-72`): `object.ProcessDirectDamage(m_DamageType, m_Parent.GetParentObject(), data.Hitzone, m_AmmoName, data.Modelpos, damageCoef)` (`:67`) |
| `AreaDamageEvents` | `areadamageevents.c` | Events contract: `OnEnter*/OnStay*/OnLeave*`, `OnEvaluateDamage`, `PreDamageActions`/`PostDamageActions` |

### Examples

- **Traps** call `ProcessDirectDamage` directly — `trap_landmine.c:181` `ProcessDirectDamage(CLOSE_COMBAT, this, "", "LandMineExplosion_CarWheel", "0 0 0", 1)`; `trap_bear.c:140,170`; `trap_tripwire.c:87`
- **Heat/contamination** — `geyserarea.c:150`, `hotspringtrigger.c:101`, `volcanictrigger.c:100`: `ProcessDirectDamage(CUSTOM, this, "", "HeatDamage", "0 0 0", coef)`
- **Landmines/vehicles** — `DestructionEffectBase.DealExplosionDamage` → `DamageSystem.ExplosionDamage` (`destructioneffectbase.c:50-52`)

---

## Death Flow

### `KillerData` (`killerdata.c`)

```c
class KillerData { EntityAI m_Killer; EntityAI m_MurderWeapon; bool m_KillerHiTheBrain; }
```

The `KillerData` is built **earlier, inside `EEHitBy`** when the lethal hit lands (`dayzplayerimplement.c:1527-1557`):

```c
if (!IsAlive()) {
    if (!m_KillerData) {
        m_KillerData = new KillerData();
        m_KillerData.m_Killer = source.GetHierarchyRootPlayer();
        m_KillerData.m_MurderWeapon = source;
    }
    if (killer.IsPlayer() && dmgZone == "Brain") {
        m_KilledByHeadshot = true;
        if (m_KillerData.m_Killer == killer) m_KillerData.m_KillerHiTheBrain = true;
    }
}
```

("only one player is considered killer in the event of crossfire" — `:1540`.) The `Brain` zone is the headshot zone.

### `EEKilled`

When native Health hits 0 in a killing zone, the engine calls `EEKilled(killer)`:

**`PlayerBase.EEKilled`** (`playerbase.c:1045-1084`):
- `m_AdminLog.PlayerKilled`
- `delete GetBleedingManagerServer()` (`:1054-1055` — wipes all bleed sources)
- `GetHive().CharacterKill(this)` (DB)
- disables VoN
- `GetSymptomManager().OnPlayerKilled()`
- inserts corpse into mission's corpse manager (`:1069-1073`)

**`DayZPlayerImplement.EEKilled`** (`dayzplayerimplement.c:762-767`): `SendDeathJuncture(-1, 0)` then `super.EEKilled`.

### Death sync

The actual `m_DeathSyncSent` send happens in `PlayerBase` command tick (`playerbase.c:2720-2722`):

```c
if (!m_DeathSyncSent && m_KillerData)
    SyncEvents.SendEntityKilled(this, m_KillerData.m_Killer, m_KillerData.m_MurderWeapon, m_KillerData.m_KillerHiTheBrain);
```

Same pattern on infected (`dayzinfected.c:155-173`).

### Death animation

`SimulateDeath` (`dayzplayerimplement.c:811-848`) starts the death-darkening timer; headshots have `duration=0` (`:821-824`). `StartCommand_Death` (`:707`). `DYING_PROGRESSION_TIME` gates whether an uncon-to-death fade plays.

---

## End-to-End: Bullet Hit on a Player

For a **firearm bullet** (no script `CloseCombatDamage` call — projectile is native):

```
1. PROJECTILE IMPACT (native)
   bullet raycast hits player, resolves component index → damage zone natively
   (via config DamageSystem DamageZones map, damagesystem.c:27)
   reads CfgAmmo <ammo> DamageApplied (Health/Blood/Shock, bleedThreshold, type,
   transferShockToDamage, unconRefillModifier)

2. EEOnDamageCalculated (object.c:1136)  ── script may veto/modify

3. ENGINE APPLIES Health/Blood/Shock to native per-zone health for dmgZone

4. EEHitBy fires (playerbase.c:1086):
   ├─ m_AdminLog.PlayerHitBy                                              :1092
   ├─ if Shock>0: record m_LastShockHitTime, read unconRefillModifier     :1095-1109
   ├─ BLEEDING SOURCE SPAWN:
   │    dmg = damageResult.GetDamage(dmgZone,"Blood")                     :1120
   │    GetBleedingManagerServer().ProcessHit(...)  → AttemptAdd → Add    :1123
   ├─ NONLETHAL CONVERSION (if transferShockToDamage):
   │    AddHealth("","Health", -ConvertNonlethalDamage(shockDmg, type))   :1144-1151
   ├─ BROKEN LEGS modifier (if leg/foot zone health ≤1)                   :1153-1162
   └─ SHOCK SYNC: m_ShockHandler.CheckValue(true) → DealShock/GiveShock   :1205

5. DayZPlayerImplement.EEHitBy (dayzplayerimplement.c:1521):
   ├─ if !IsAlive(): build KillerData                                     :1540-1556
   └─ else: EvaluateDamageHitAnimation → SendDamageHitEx                  :1564-1565

6. EEHealthLevelChanged (playerbase.c:5703) per affected zone

7. InjuryAnimationHandler.Update (every 5s): re-sample Health → injury level
   → SetInjuryCommandParams updates limp anim                             injuryhandler.c:80-98,154

8. IF SHOCK HEALTH HIT 0:
   engine sets m_ShouldBeUnconscious → command tick (playerbase.c:3000)
   → StartCommand_Unconscious(0)                                          :3030
```

For **melee**, only step 1 differs: `dayzplayermeleefightlogic_lightheavy.c:682` calls `DamageSystem.CloseCombatDamage(m_Player, target, hitZoneIdx, ammo, hitPosWS)` (hit zone pre-decided by `m_MeleeCombat.GetHitZoneIdx()`). Steps 2–8 are identical.

---

## Melee vs Firearm vs Explosion — Pipeline Differences

| Aspect | Melee | Firearm | Explosion |
|--------|-------|---------|-----------|
| **Script entry** | `DamageSystem.CloseCombatDamage(source, target, hitZoneIdx, ammo, hitPos, flags)` (`damagesystem.c:22`) from `dayzplayermeleefightlogic_lightheavy.c:652,682,699,714` | **None** — native projectile applies damage directly | `DamageSystem.ExplosionDamage(source, directHitObj, ammo, worldPos, damageType)` (`damagesystem.c:25`) from `destructioneffectbase.c:52`, `object.c:155` |
| **DamageType** | `CLOSE_COMBAT(0)` | `FIRE_ARM(1)` | `EXPLOSION(2)` |
| **Hit-zone selection** | Pre-decided: `m_MeleeCombat.GetHitZoneIdx()` (targeted component) before damage | Native bullet raycast → component → zone | Radius/`directHitObject`; area damage uses raycast or random zone (`areadamage.c:154,162`) |
| **Nonlethal conversion** | `NL_DAMAGE_CLOSECOMBAT_CONVERSION_PLAYERS = 0` (no conversion) | `NL_DAMAGE_FIREARM_CONVERSION_PLAYERS` (`constants.c:1005`) — shock partly converts to Health dmg via `ConvertNonlethalDamage` (`playerbase.c:1231-1237`) | N/A |
| **Bleeding source chance** | Via `BleedChanceData.CalculateBleedChance("Melee", ...)` table (`bleedchancedata.c:18-38`) | Blood damage vs bleedThreshold only (`bleedingsourcesmanagerserver.c:197`) | Same threshold path |
| **Flags used** | often `NO_ATTACHMENT_TRANSFER` (finishers, `:652`) | default `ALL_TRANSFER` (damages attachments too) | `ExplosionDamage` takes a damageType param |
| **Special behaviors** | Finisher/stealth-kill branch (`EvaluateFinisherAttack :645`), block/dummy-hit logic | `Bullet_CupidsBolt` special-case full heal (`playerbase.c:1164-1202`), `FlashGrenade_Ammo` drains stamina (`:1113`) | Flash/stamina, destruction behavior chaining |

All three converge after the native apply on the **same** `EEHitBy` → bleed `ProcessHit` → `ShockHandler.CheckValue` → `InjuryAnimationHandler` → (death → `EEKilled`/`KillerData`) path.

---

## File Reference Index

| File | Key contents |
|------|--------------|
| `3_game/damagesystem.c` | `DamageSystem`, `TotalDamageResult`, `DamageType`, zone-map helpers |
| `3_game/hitinfo.c` | `HitInfo` (surface, not damage payload) |
| `3_game/killerdata.c` | `KillerData` |
| `3_game/bleedchancedata.c` | `BleedChanceData.CalculateBleedChance` |
| `3_game/entities/object.c` | `ProcessDirectDamage` (`:1130`), `EEOnDamageCalculated` (`:1136`), `GetHealth/SetHealth/AddHealth` (`:986-1026`), `GetDamageZoneNameByComponentIndex` (`:1156`) |
| `3_game/effects/destructioneffects/destructioneffectbase.c` | `DealExplosionDamage` (`:50`) |
| `4_world/entities/manbase/playerbase.c` | `EEHitBy` (`:1086`), `EEKilled` (`:1045`), `EEHealthLevelChanged` (`:5703`), `GiveShock` (`:3544`), uncon handling (`:2984-3033`) |
| `4_world/entities/dayzplayerimplement.c` | `EEHitBy`+`KillerData` (`:1521-1557`), `EEKilled` (`:762`), `SimulateDeath` (`:811`) |
| `4_world/entities/synchitinfo.c` | `SyncHitInfo` (networked hit reaction) |
| `4_world/entities/manbase/dayzplayer/dayzplayermeleefightlogic_lightheavy.c` | `CloseCombatDamage` melee entry (`:652,682,699,714`) |
| `4_world/classes/injuryhandler.c` | `InjuryAnimationHandler` |
| `4_world/classes/shockhandler.c` | `ShockHandler` (`SetShock:94`, `CheckValue:108`, `DealShock:101`) |
| `4_world/classes/playermodifiers/modifiers/shock.c` | `ShockMdfr` (refill) |
| `4_world/classes/playermodifiers/modifiers/shockdamage.c` | `ShockDamageMdfr` (blood-loss shock drain) |
| `4_world/classes/shockhitreaction/shockhitreaction.c` | `ShockDealtEffect` (client PPE) |
| `4_world/classes/bullethitreaction/bullethitreaction.c` | `DamageDealtEffect`, `EffectRadial` (client PPE) |
| `4_world/classes/bleedingsources/` | `BleedingSource`, `BleedingSourceZone`, managers (base/server/remote) |
| `4_world/classes/bleedingindication/bleedingindicationconstants.c` | screen-edge drop indicators (visual) |
| `4_world/classes/areadamage/areadamage.c` | legacy `AreaDamageBase` (`EvaluateDamage_Common:119`) |
| `4_world/classes/areadamage/areadamagetrigger.c` | legacy trigger |
| `4_world/classes/areadamage/areadamagenew/areadamagemanager.c` | `AreaDamageManager` + `SetDamageComponentType:41` |
| `4_world/classes/areadamage/areadamagenew/areadamagetriggerbase.c` | current trigger event forwarding |
| `4_world/classes/areadamage/areadamagenew/areadamageevents.c` | events contract |
| `4_world/classes/areadamage/areadamagenew/damagecomponents/areadamagecomponent.c` | `EvaluateDamageInternal:56` → `ProcessDirectDamage:67` |

---

## Related Documentation

- [Damage & Combat](./damage-combat) — high-level conceptual overview, injury state diagram
- [Player Modifiers & Symptoms](./modifiers-symptoms-system) — `ShockMdfr`/`ShockDamageMdfr`, blood/health stats
- [Weapons & Firearms](./weapons-system) — the firearm source of `FIRE_ARM` damage
- [User Actions System](./user-actions-system) — bandage/suture actions call `RemoveMostSignificantBleedingSourceEx`
- [Animation System](./animation-system) — hit-reaction & death animations
- [Base Building](./base-building-system) — `EEHealthLevelChanged` part-destruction cascade
- [Networking & RPC](./networking) — `DayZPlayerSyncJunctures`, `SyncEvents.SendEntityKilled`
- [Data Config → Weapons](/data-config/weapons) — ammo `DamageApplied` config
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
