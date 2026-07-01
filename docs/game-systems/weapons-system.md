# Weapons & Firearms System

DayZ's weapons are **finite state machines (FSMs)**. Every weapon — pistol, bolt-action rifle, full-auto assault rifle, shotgun, crossbow — is a script class that owns a hierarchical FSM describing its stable states (chambered/empty, mag in/out, jammed) and the transitions between them. The FSM drives animation, inventory moves (loading magazines, chambering rounds), and the actual firing of bullets.

**Primary locations**:
- `P:/scripts/4_world/entities/firearms/` — weapon class hierarchy + FSM (~107 files)
- `P:/scripts/4_world/classes/weapons/weaponmanager.c` — per-player input → FSM bridge
- `P:/scripts/4_world/systems/inventory/dayzplayerinventory.c` — per-tick event pump
- `P:/scripts/3_game/systems/inventory/weaponinventory.c` — native weapon primitives
- `P:/scripts/3_game/systems/fsmbase.c` — generic FSM framework

> **See also**: [User Actions System](./user-actions-system) (weapon reload/unjam actions flow through it), [Inventory System](./inventory-system) (hands slot & junctures), [Damage & Combat](./damage-combat), [Networking & RPC](./networking).

---

## Mental Model

A weapon has two halves:

1. **Native `Weapon` (C++)** — provides the low-level chamber/magazine/muzzle primitives: `PushCartridgeToChamber`, `PopCartridgeFromChamber`, `EjectCartridge`, `ServerAcquireCartridge`, `TryFireWeapon`. These touch real inventory and spawn real projectiles.
2. **Script `Weapon_Base`** — owns the FSM, decides *when* to call those primitives based on state, and synchronizes state across the network.

The FSM is the brain; the native layer is the muscle. The player's **`WeaponManager`** translates input (trigger pull, reload key) into FSM **events**; the FSM transitions between **states**; each state's `OnEntry`/`OnUpdate` calls native primitives to actually move ammo and fire.

---

## Weapon Class Hierarchy

The root script class is `Weapon_Base` (`weapon_base.c`), which `extends Weapon` — an **engine-native class**. Concrete playable weapons (M4A1, AKM, Mosin, FNX-45, Magnum…) are **defined in C++ configs**, not scripts; their `class X_Base` config chains up through one of these script bases. Each script base overrides `InitStateMachine()` to build the appropriate FSM.

```
Weapon  (native, C++)
 └── Weapon_Base                     weapon_base.c          root script class; holds m_fsm, fire/jam/sync logic
      ├── Rifle_Base                 rifle_base.c           minimal rifle FSM (mechanism/charging only)
      │    └── RifleBoltLock_Base    rifleboltlock_base.c   full bolt-lock FSM (M4A1 family)
      │         └── M4A1_Base        automaticrifle/m4a1.c
      ├── BoltActionRifle_Base       boltactionrifle_base.c        bolt-action (Mosin, CZ527)
      ├── BoltActionRifleExternalMagazine_Base
      ├── BoltActionRifleInnerMagazine_Base
      ├── Pistol_Base                pistol_base.c                 pistol stable states
      │    ├── PistolAlt_Base        pistolalt_base.c
      │    └── (Magnum, FNX-45, etc. via config)
      ├── SingleShotPistol_Base     singleshotpistol_base.c
      ├── DoubleBarrel_Base                                        double-barrel shotgun
      ├── OpenBolt_Base                                            open-bolt weapons
      ├── ChamberFirstInnerMagSemiAuto_Base                        SKS, Ruger 10/22 family
      ├── RifleBoltFree_Base / RifleSingleShot_Base
      ├── RifleSingleShotManual_Base
      └── Archery_Base                                             crossbow
```

Subdirectories hold weapon families: `automaticrifle/`, `boltactionrifle_*`, `launcher/`, `machinegun/`, `pistol/`, `rifle/`, `shotgun/`, `smg/`, `archery/`.

`Weapon_Base` key members (`weapon_base.c`):
- `ref WeaponFSM m_fsm` — the state machine
- `m_isJammed`, `m_Charged`, `m_WeaponOpen`, `m_weaponAnimState`
- `m_ChanceToJam` — per-shot jam probability
- `m_abilities` — array of `AbilityRecord` (action/actionType pairs the weapon supports)

---

## The Weapon FSM

`WeaponFSM` (`weaponfsm.c`) `extends HFSMBase<WeaponStateBase, WeaponEventBase, WeaponActionBase, WeaponGuardBase>`. The generic FSM framework is `FSMBase<...>` (`3_game/systems/fsmbase.c`); `FSMTransition` is the templated transition row.

### Construction — manual factory pattern

There is **no generic builder**. Each weapon base hand-instantiates states and adds transitions one by one. Example (`rifle_base.c`):

```c
override void InitStateMachine() {
    WeaponStableState E = new WeaponStableState(this, NULL, DefaultAnimState.DEFAULT);
    WeaponStateBase Mech = new WeaponCharging(this, NULL,
        WeaponActions.MECHANISM, WeaponActionMechanismTypes.MECHANISM_CLOSED);

    m_fsm = new WeaponFSM();
    m_fsm.AddTransition(new WeaponTransition(E,    new WeaponEventMechanism,           Mech));
    m_fsm.AddTransition(new WeaponTransition(Mech, new WeaponEventHumanCommandActionFinished, E));

    SetInitialState(E);
    m_fsm.Start();
}
```

`AddTransition` auto-registers states and assigns each a unique `InternalStateID` (used for save/load). More complex weapons (e.g. `RifleBoltLock_Base`) build machines with dozens of states covering chamber/fire/jam/reload permutations.

### Hierarchical (nested) states

Compound states (like `WeaponChambering`, `WeaponAttachMagazine`) contain their **own nested `m_fsm = new WeaponFSM(this)`**. `WeaponStateBase.HasFSM()` flags this; `ProcessEvent` / `OnUpdate` recurse into the sub-machine. This is how a reload is modeled as a multi-step sub-process inside one outer transition.

### The four FSM primitives

| Primitive | Role | File |
|-----------|------|------|
| **States** | "What the weapon is doing right now" | `fsm/states/` |
| **Events** | "What just happened" (trigger pull, anim event) | `fsm/events.c` |
| **Guards** | "Is this transition allowed?" (has ammo? chambered? jammed?) | `fsm/guards.c` |
| **Actions** | Side effects run during a transition | `fsm/actions.c` |

### State classes (`fsm/states/`)

| Class | Role |
|-------|------|
| `WeaponStateBase` | Root — `OnEntry/OnUpdate/OnAbort/OnExit` hooks, holds nested `m_fsm` |
| `WeaponStableState` | Idle resting states (chamber/mag/jam combos); `IsIdle()=true`; carries `m_animState` + per-muzzle `MuzzleState` (E/F/L/U) |
| `WeaponStateJammed` | Jammed stable state |
| `WeaponStartAction` | Base for any state that plays an anim action via `hcw.StartAction(...)` |
| `WeaponFire` / `WeaponFireWithEject` / `WeaponFireMultiMuzzle` / `WeaponFireToJam` / `WeaponFireAndChamber` / `WeaponFireAndChamberFromInnerMagazine` / `WeaponFireMagnum` | Fire states |
| `WeaponDryFire` | Empty-trigger click |
| `WeaponCharging` / `WeaponCharging_CK` / `WeaponChargingOpenBolt_CK` | Mechanism cocking |
| `WeaponChambering` (+ `_Start/_Base/_Preparation/_Cartridge/_MultiMuzzle…`) | Single-round chambering (compound) |
| `ChamberMultiBullet` / `WeaponMagnumChambering` / `WeaponCylinderRotate` | Looped/multi-muzzle chambering |
| `WeaponAttachMagazine` / `WeaponAttachMagazineOpenBoltCharged` / `RemoveNewMagazineFromInventory` / `AttachNewMagazine` | Magazine attach/swap (compound) |
| `WeaponEjectCasing` / `WeaponEjectBullet` / `WeaponEjectAllMuzzles` | Casing/bullet ejection |
| `WeaponReplacingMagAndChamberNext` / `WeaponChamberFromAttMag` / `WeaponEjectCasingAndChamberFromAttMag` | Combo swap-and-chamber |
| `WeaponUnjamming` / `LoopedChambering_*` / `BulletShow_W4T` / `BulletHide_W4T` / `MagazineShow` / `MagazineHide` | Sub-states |

### Events (`fsm/events.c`)

`WeaponEventBase` carries an `m_eventID` from `enum WeaponEventID`:

| Event | When |
|-------|------|
| `MECHANISM` | Charging handle pulled |
| `TRIGGER` / `TRIGGER_JAM` | Trigger pulled (normal / fire-then-jam) |
| `TRIGGER_AUTO_START` / `TRIGGER_AUTO_END` | Full-auto fire hold |
| `LOAD1_BULLET` | Load a single round |
| `CONTINUOUS_LOADBULLET_START` / `_END` | Looped bullet loading |
| `UNJAM` | Clearing a jam |
| `ATTACH_MAGAZINE` / `DETACH_MAGAZINE` / `SWAP_MAGAZINE` | Magazine operations |
| `HUMANCOMMAND_ACTION_FINISHED` / `_ABORTED` | Anim action completed/aborted |
| `RELOAD_TIMEOUT` / `DRY_FIRE_TIMEOUT` | Internal fire-rate / dry-fire timers |
| `SET_NEXT_MUZZLE_MODE` | Multi-muzzle weapons |
| `ANIMATION_EVENT` | Animation-driven sub-events |

Animation events (`WeaponEventAnimation`, produced by `WeaponAnimEventFactory` from the `WeaponEvents` enum): `BULLET_SHOW`, `BULLET_HIDE`, `BULLET_EJECT`, `BULLET_IN_CHAMBER`, `MAGAZINE_SHOW`, `COCKED`, `SLIDER_OPEN`, `CYLINDER_ROTATE`, `UNJAMMED`, … These fire at specific frames and drive the chambering/reload sub-FSMs. `WeaponEventFactory` reconstructs events from IDs for network replication.

### Guards (`fsm/guards.c`)

`WeaponGuardBase` — composable via `GuardAnd` / `GuardNot` / `GuardOr`. Concrete guards:

`WeaponGuardHasAmmo`, `WeaponGuardHasAmmoInnerMagazine`, `WeaponGuardHasMag`, `WeaponGuardJammed`, `WeaponGuardChamberEmpty` / `ChamberFull`, `WeaponGuardCurrentChamberEmpty` / `Full`, `WeaponGuardChamberMultiHasRoomBullet`, `WeaponGuardWeaponCharged`, `WeaponGuardWeaponManagerWantContinue`, …

---

## WeaponManager — Input → FSM Bridge

`WeaponManager` (`weaponmanager.c`) is a per-`PlayerBase` component. It owns the weapon-in-hand ref, pending-action state, jamming sync, and magazine candidate lists. It is the **only** path through which player input reaches the weapon FSM.

### Key methods

| Method | Purpose |
|--------|---------|
| `Fire(Weapon_Base wpn)` | `weaponmanager.c:484` — trigger pull; decides dry-fire / jam / normal fire |
| `AttachMagazine` / `SwapMagazine` / `DetachMagazine` | Magazine ops → `StartAction(AT_WPN_*)` |
| `LoadSingleBullet` / `LoadMultiBullet` | Bullet chambering |
| `Unjam` | Clear jam |
| `EjectBullet` | Eject round |
| `SetNextMuzzleMode` | Cycle muzzle |
| `StartAction(int action, ...)` | `weaponmanager.c:770` — reserves inventory, then SP `m_readyToStart=true` or MP `Synchronize()` |
| `StartPendingAction()` | `weaponmanager.c:807` — maps `AT_WPN_*` → `WeaponEvent*`, posts to FSM |
| `Update()` | `weaponmanager.c:887` — refreshes `m_WeaponInHand`, jam chance, anim state |
| `Synchronize()` | `weaponmanager.c:519` — client → server weapon action packet |
| `OnInputUserDataProcess(...)` | `weaponmanager.c:628` — server-side handler |
| `OnSyncJuncture(...)` | `weaponmanager.c:578` — receives server ACK/REJ |

`CanFire` gate (`weaponmanager.c:79`): weapon in hands, not lifting, raised, not destroyed, raise completed, not in inventory processing, not in cooldown.

### The trigger-pull decision (`Fire`)

```c
void Fire(Weapon_Base wpn) {
    int mi = wpn.GetCurrentMuzzle();
    if (wpn.IsChamberFiredOut(mi) || wpn.IsJammed() || wpn.IsChamberEmpty(mi))
        wpn.ProcessWeaponEvent(new WeaponEventTrigger(m_player));        // dry fire
    else if (wpn.JamCheck(0))
        wpn.ProcessWeaponEvent(new WeaponEventTriggerToJam(m_player));   // fire then jam
    else
        wpn.ProcessWeaponEvent(new WeaponEventTrigger(m_player));        // normal fire
}
```

`StartPendingAction` maps action types to events:

| Action Type | Event Posted |
|-------------|--------------|
| `AT_WPN_ATTACH_MAGAZINE` | `WeaponEventAttachMagazine` |
| `AT_WPN_LOAD_BULLET` | `WeaponEventLoad1Bullet` |
| `AT_WPN_LOAD_MULTI_BULLETS_START` | `WeaponEventContinuousLoadBulletStart` |
| `AT_WPN_UNJAM` | `WeaponEventUnjam` |
| `AT_WPN_EJECT_BULLET` | `WeaponEventMechanism` |

---

## End-to-End: Fire Cycle (Trigger Pull → Bullet)

This spans three layers: input → `WeaponManager` → `Weapon_Base` → FSM → native engine.

```
1. TRIGGER INPUT
   HumanInputController (engine)
      │
      ▼
   WeaponManager.Fire(wpn)                           weaponmanager.c:484
      │  (dry-fire / jam / normal decision)
      ▼
   wpn.ProcessWeaponEvent(WeaponEventTrigger)         weapon_base.c:295
      │
      ├─► SyncEventToRemote(e)                        weapon_base.c:1240
      │     (server-controlled player only)
      │     writes INPUT_UDT_WEAPON_REMOTE_EVENT +
      │     packed event → ScriptRemoteInputUserData
      │     → p.StoreInputForRemotes(ctx)
      │     (other clients replay the same FSM event)
      │
      ▼
2. FSM TRANSITION
   m_fsm.ProcessEvent(e)                              weaponfsm.c:226
      │  finds matching transition (source state + event + guard passes)
      ├─► oldState.OnExit()
      ├─► transition action runs
      ├─► m_State = newState
      └─► newState.OnEntry()
            + ValidateAndRepair()                     weaponfsm.c:453

3. FIRE STATE EXECUTES  (e.g. WeaponFire / WeaponFireAndChamber / WeaponFireToJam)
   OnEntry:
      ├─► AddJunctureToAttachedMagazine(...)          weaponfire.c:58
      ├─► TryFireWeapon(m_weapon, mi)   ◄── NATIVE    3_game/.../weaponinventory.c:8
      │     engine spawns projectile, applies ballistics/damage
      │     fires EEFired (weapon_base.c:341 → muzzle flash, overheating particles)
      ├─► GetAimingModel().SetRecoil(m_weapon)        (recoil applied)
      └─► m_weapon.OnFire(mi)                         weapon_base.c:1028 (m_BurstCount++)
      [WeaponFireAndChamber also: eject casing, hide bullet, 
       pushToChamberFromAttachedMagazine(m_weapon, mi)  weapon_utils.c:1]

4. LOOP / NEXT SHOT
   fireState.OnUpdate(dt)                             weaponfire.c:77
      m_dtAccumulator += dt;
      if (m_dtAccumulator >= GetReloadTime(mi))
          ProcessWeaponEvent(new WeaponEventReloadTimeout(p));
          → FSM transitions back to stable state (semi) or re-fires (full-auto)
      Fire states set IsWaitingForActionFinish()=true
          → blocks until WeaponEventHumanCommandActionFinished
      Empty chamber → routes to WeaponDryFire instead
```

The actual shot — **`TryFireWeapon`** — is a `proto native` function. The script layer no longer applies damage directly; it spawns the projectile and the engine handles ballistics, hit detection, and damage via the [Damage & Combat](./damage-combat) system. `EEFired` is the script hook for cosmetic effects (muzzle flash, overheating).

---

## End-to-End: Reload / Chambering Cycle

Two distinct flows depending on weapon type.

### Magazine attach/swap (external-mag weapons)

```
WeaponManager.AttachMagazine
   → StartAction(AT_WPN_ATTACH_MAGAZINE)
      → [MP] Synchronize() → server juncture ACK
      → [SP / after ACK] StartPendingAction()
         → posts WeaponEventAttachMagazine
            → FSM transitions into WeaponAttachMagazine (COMPOUND STATE)
```

The compound state `WeaponAttachMagazine` (`weaponattachmagazine.c:114`) has a **nested sub-FSM**:

```
m_start  (WeaponStartAction — plays reload anim)
   │  MagazineShow
   ▼
m_attach (AttachNewMagazine — moves mag: LeftHand → MAGAZINE slot)
   │  SliderOpen
   ▼
m_eject  (WeaponEjectCasing)
   │  Cocked  + [chamber empty AND has ammo]
   ▼
m_chamber (chambers a round from the now-attached mag)
   │  Cocked  + [no ammo]
   ▼
m_onCK
   │  HumanCommandActionFinished
   ▼
   NULL  (terminate)
```

On entry, the new magazine is moved to the **left hand** (`InventorySlots.LEFTHAND`) via `GameInventory.LocationSyncMoveEntity`; `AttachNewMagazine` later moves it to `InventorySlots.MAGAZINE`. `OnAbort`/`OnExit` return or drop the mag if interrupted. `SwapMagazine` (`WeaponReplacingMagAndChamberNext`) does detach-old + attach-new + chamber in one compound flow.

### Single-round chambering (loose ammo, internal-mag weapons)

```
WeaponManager.LoadSingleBullet → AT_WPN_LOAD_BULLET → posts WeaponEventLoad1Bullet
   → FSM transitions into WeaponChambering (COMPOUND STATE)
```

`WeaponChambering` (`weaponchambering.c:543`) sub-FSM:

```
m_start  (WeaponChambering_Start)
   │  BulletEject
   ▼
m_eject  (WeaponEjectCasing)
   │  Cocked
   ▼
m_onCK
   │  BulletShow
   ▼
m_chamber (WeaponChambering_Cartridge)
   │  on exit: AcquireCartridgeFromMagazine + PushBulletToChamber + SetCharged + CloseBolt
   │  BulletInChamber
   ▼
m_w4t
   │  HumanCommandActionFinished
   ▼
   NULL
```

The chambering plumbing (`WeaponChambering_Base`, `weaponchambering.c:21`):
- `AcquireCartridgeFromMagazine()` → `m_srcMagazine.ServerAcquireCartridge(damage, type)`
- `PushBulletToChamber()` → `m_weapon.PushCartridgeToChamber(mi, damage, type)`

On entry the source ammo pile moves to the **left hand**; on exit/abort it returns to its previous location or is dropped (`HandleDropMagazine`).

**Looped / multi-bullet chambering** (`ChamberMultiBullet`, `weaponchambering.c:799`) loops `m_chamber → m_w4sb2 → m_chamber` while guards `WeaponGuardHasAmmoInLoopedState && WeaponGuardChamberMultiHasRoomBullet && WeaponGuardWeaponManagerWantContinue` hold — this is how you load a shotgun tube or SKS internal mag one shell at a time.

**Inner-magazine weapons** (shotguns, SKS, Ruger 10/22, Mosin) chamber from their own internal magazine on fire via `pushToChamberFromInnerMagazine` (`weapon_utils.c:33`) / `WeaponFireAndChamberFromInnerMagazine` (`weaponfire.c:350`).

The key insight: **the FSM states themselves drive the inventory moves** (`GameInventory.LocationSyncMoveEntity`, `FindFreeLocationFor`, `DayZPlayerUtils.HandleDropMagazine`) and call the native chamber primitives. The FSM is not just state-tracking — it is the orchestrator of the reload.

---

## Integration with the Hand / Inventory System

The weapon lives in the player's **hands slot**. Coordination between `WeaponManager`, the weapon FSM, and the engine animation system is handled by **`DayZPlayerInventory`** (`4_world/systems/inventory/dayzplayerinventory.c`) — the single dispatcher.

| Method | Role |
|--------|------|
| `PostWeaponEvent(WeaponEventBase e)` `:304` | `WeaponManager` calls this; queues `m_DeferredWeaponEvent` on a Timer so the event fires inside the player's command-handler tick (not re-entrantly) |
| `HandleWeaponEvents(dt, out bool exitIronSights)` `:346` | **Per-tick pump** — refreshes `weapon.UpdateCoolDown(dt)`, calls `weapon.GetCurrentState().OnUpdate(dt)` (this is how fire/chamber states get their tick), drains `hcw.IsEvent()` from the animation system and forwards each as `WeaponEventAnimation` to `weapon.ProcessWeaponEvent(...)` |
| `AbortWeaponEvent()` `:282` | On anim action abort → `weapon.ProcessWeaponAbortEvent(new WeaponEventHumanCommandActionAborted(...))` |
| `CancelWeaponEvent()` / `DeferredWeaponFailed()` | Cleanup / error paths |

The hand FSM proper (`hand_*.c`: `hand_actions.c`, `hand_events.c`, `hand_guards.c`, `hand_states.c`, `handanimated_*.c`) governs moving items **into/out of** the hands slot. The weapon FSM is independent but is gated on the weapon actually being in hands: `WeaponManager.Update` re-syncs `m_WeaponInHand` whenever `GetItemInHands()` changes, and `CanFire` / `CanAttachMagazine` all check `m_player.GetHumanInventory().GetEntityInHands() == wpn`. Weapon stable states reach back to the anim system via `HumanCommandWeapons` in `WeaponStableState.SyncAnimState` and `WeaponStartAction.OnEntry`.

---

## Network Synchronization

Weapon state replicates through the engine's **`ScriptInputUserData` / `ScriptRemoteInputUserData` juncture system** — not raw `ScriptRPC`. Three distinct channels:

### A. Weapon actions (client → server)

`WeaponManager.Synchronize()` (`weaponmanager.c:519`): client writes `INPUT_UDT_WEAPON_ACTION` + `m_PendingWeaponAction` + ack ID + payload (target magazine / inventory location) into a `ScriptInputUserData` and sends. Server `OnInputUserDataProcess` (`weaponmanager.c:628`) reads it, runs an **inventory juncture** (`GetGame().AddInventoryJunctureEx` / `AddActionJuncture` — the authoritative lock on the magazine slot), then either `StartPendingAction()` or sends an ACK. The ACK returns via `OnSyncJuncture` (`weaponmanager.c:578`):

| Juncture | Client Effect |
|----------|---------------|
| `SJ_WEAPON_ACTION_ACK_ACCEPT` | `m_readyToStart = true` → fires the event |
| `SJ_WEAPON_ACTION_ACK_REJECT` | clears reservations, aborts |
| `SJ_WEAPON_SET_JAMMING_CHANCE` | syncs jam probability |

### B. FSM events (server → other clients)

`Weapon_Base.SyncEventToRemote(e)` (`weapon_base.c:1240`), called at the top of **every** `ProcessWeaponEvent` / `ProcessWeaponAbortEvent`. On the server-controlled player it writes `INPUT_UDT_WEAPON_REMOTE_EVENT` + the packed event (`WeaponEventBase.WriteToContext`, `events.c:54` — packs `eventID` in upper 16 bits + animEvent in lower 16 + player + magazine) into a `ScriptRemoteInputUserData` and calls `p.StoreInputForRemotes(ctx)`. Remote clients reconstruct via `CreateWeaponEventFromContext` → `WeaponEventFactory` and feed the same event into their local weapon FSM. **This keeps all clients' FSMs in lockstep** without the server running every client's FSM.

### C. Persistent state (save/load)

`WeaponFSM.OnStoreSave` / `OnStoreLoad` (`weaponfsm.c:627` / `:693`) serialize the current stable state by `GetCurrentStateID()`. `Weapon_Base.OnStoreSave/OnLoad` (`weapon_base.c:624` / `:489`) save current muzzle index, fire-mode list, jammed flag, and FSM state. `LoadCurrentFSMState` / `SaveCurrentFSMState` (plus "Unstable" variants for mid-transition saves) walk `m_UniqueStates` keyed by `InternalStateID`.

### D. Validate-and-repair

`WeaponFSM.ValidateAndRepair` (`weaponfsm.c:453`) runs after every transition: compares the FSM's logical state (`HasBullet` / `HasMagazine` / `IsJammed` / chamber flags) against the weapon's *physical* state. On mismatch it walks the transition table (`ValidateAndRepairStateFinder`, `:612`) to find the correct stable state, or as a last resort calls `weapon.RandomizeFSMState()` + `weapon.Synchronize()`. Capped by `MAX_SYNCHRONIZE_ATTEMPTS = 12` / `MIN_SYNCHRONIZE_INTERVAL = 3000ms` (`weaponfsm.c:6-8`) to avoid spam; `OnFailThresholdBreached` (`:600`) logs permanent breakage.

---

## Communication Flow Summary

```
┌────────────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐
│ Local Client   │  │ Server         │  │ Other Client │  │ Native Engine│
│ (input owner)  │  │ (authoritative)│  │ (replication)│  │ (C++ Weapon) │
└───────┬────────┘  └───────┬────────┘  └──────┬───────┘  └──────┬───────┘
        │                    │                  │                 │
   WeaponManager.Fire        │                  │                 │
        │                    │                  │                 │
        ├─ INPUT_UDT_ ──────►│                  │                 │
        │  WEAPON_ACTION     │                  │                 │
        │  (ScriptInputUser…) │                  │                 │
        │                    │                  │                 │
        │              inventory juncture       │                 │
        │              AddActionJuncture        │                 │
        │                    │                  │                 │
        │◄─ SJ_WEAPON_ ──────┤                  │                 │
        │   ACTION_ACK_…     │                  │                 │
        │                    │                  │                 │
   StartPendingAction        │                  │                 │
   → PostWeaponEvent         │                  │                 │
        │                    │                  │                 │
   ProcessWeaponEvent ───────┼──────────────────┤                 │
        │                    │                  │                 │
        │   SyncEventToRemote (server player)   │                 │
        │              INPUT_UDT_WEAPON_ ───────►│                 │
        │              REMOTE_EVENT             │                 │
        │              (ScriptRemoteInputUser…) │                 │
        │                    │                  │                 │
        │                    │          ProcessWeaponEvent        │
        │                    │          (local FSM replay)        │
        │                    │                  │                 │
        │              FSM fire state OnEntry    │                 │
        │              ├──────────────────────────────────────────►│
        │              │ TryFireWeapon (proto native)              │
        │              │                       spawns projectile   │
        │              │                       applies damage      │
        │              ◄──────────────────────────────────────────┤
        │              EEFired → muzzle flash particles            │
```

---

## How to Add a Custom Weapon (Modding)

1. **Pick the closest script base** (`Weapon_Base` subclass) that matches your weapon's action type (bolt-action, semi-auto, full-auto, internal-mag, revolver…).
2. **Override `InitStateMachine()`** to build a FSM with the right states/transitions — copy from the most similar existing base and adjust.
3. **Define the config** (`config.cpp` in your mod's `DZ/` data): `class MyWeapon_Base : RifleBoltLock_Base { ... }` plus the concrete non-Base variant.
4. **Tune native parameters** in config: magazine type, chamber size, muzzle count, fire rate (`GetReloadTime`), recoil, jam chance.
5. You rarely need to touch the FSM states/guards/events directly unless you're inventing a novel action type.

See [Modding → Real Mod Examples](/modding/real-mod-examples) and [Data Config → Weapons](/data-config/weapons).

---

## Directory Structure

```
entities/firearms/
├── weapon_base.c                 Root script class (holds FSM, fire/jam/sync)
├── weaponfsm.c                   WeaponFSM (HFSMBase subclass)
├── rifle_base.c, boltactionrifle_base.c, pistol_base.c, …   Family bases
├── automaticrifle/ machinegun/ launcher/ pistol/ rifle/ shotgun/ smg/ archery/
└── fsm/
    ├── events.c                  WeaponEventBase + WeaponEventFactory
    ├── guards.c                  WeaponGuardBase + concrete guards
    ├── actions.c                 WeaponActionBase + transition side-effects
    └── states/
         ├── weaponstatebase.c    Root state (OnEntry/OnUpdate/OnAbort/OnExit)
         ├── weaponstablestate.c  Idle states (chamber/mag/jam combos)
         ├── weaponstatejammed.c  Jammed state
         ├── weaponstartaction.c  Anim-action base
         ├── weaponfire.c         All fire states (+ DryFire)
         ├── weaponcharging.c     Cocking/mechanism
         ├── weaponchambering.c   Chambering (compound) + multi-bullet
         ├── weaponattachmagazine.c  Mag attach/swap (compound)
         ├── weaponejectcasing.c  / weaponejectbullet.c
         └── …

classes/weapons/
└── weaponmanager.c               Per-player input → FSM bridge

systems/inventory/
├── dayzplayerinventory.c         Per-tick event pump (PostWeaponEvent, HandleWeaponEvents)
├── weaponinventory.c             Native Weapon primitives (PushCartridgeToChamber, TryFireWeapon…)
└── weapon_utils.c                pushToChamberFromAttachedMagazine / InnerMagazine helpers

3_game/systems/
└── fsmbase.c                     Generic FSMBase / FSMTransition framework
```

---

## Related Documentation

- [User Actions System](./user-actions-system) — weapon reload/unjam actions (`actions/weapons/`) flow through the action pipeline before reaching `WeaponManager`
- [Inventory System](./inventory-system) — hands slot, hand FSM, inventory junctures
- [Damage & Combat](./damage-combat) — what happens when the projectile hits
- [Networking & RPC](./networking) — `ScriptInputUserData` / `ScriptRemoteInputUserData` / sync junctures
- [Animation System](./animation-system) — `HumanCommandWeapons`, animation events
- [Data Config → Weapons](/data-config/weapons) — weapon config definitions
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
