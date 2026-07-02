# User Actions System

The **User Actions System** is DayZ's unified pipeline for every context-sensitive player interaction — drinking, eating, opening doors, attaching items, crafting, bandaging, loading magazines, and hundreds more. Almost everything a player *does* in the world (other than raw movement, shooting, and inventory drag-and-drop) flows through this system. With ~470 files it is one of the largest subsystems in the codebase.

**Primary location**: `P:/scripts/4_world/classes/useractionscomponent/`

> **See also**: [Inventory System](./inventory-system) (hand FSM & junctures), [Networking & RPC](./networking) (`ScriptInputUserData` / `DayZPlayerSyncJunctures`), [Damage & Combat](./damage-combat), [Weapons System](./weapons-system) (weapon actions reuse this pipeline).

> **Writing a custom action?** See [Writing Custom Actions — Patterns & Recipes](/modding/action-recipes) for a cookbook of concrete patterns (`ActionAttach`, `ActionDrink`, `ActionBandage`, `FirearmActionAttachMagazine`, `ActionWorldCraft`) drawn from DayZ's ~390 action files, covering which base class to pick and how to specialize it.

---

## Mental Model

An **Action** is a self-contained unit of behavior with three parts:

1. **Conditions** — "Can I do this right now?" (stance, item state, target reach, custom logic)
2. **Component** — "How does it progress?" (instant, single-use animation, continuous over time)
3. **Side effects** — "What actually changes in the world?" (`OnStartServer` / `OnExecuteServer` / `OnEndServer`)

The **ActionManager** owns the lifecycle: it polls input, finds candidate actions for the current item+target, sends the request to the server, and on server authorization runs the action locally. The **client is authoritative for input and visuals; the server is authoritative for the `Can()` re-check and all state-mutating effects.**

---

## Class Hierarchy

```
ActionBase_Basic   (engine-native root)
  └── ActionBase                        actionbase.c
        ├── ActionInstantBase           actions/actioninstantbase.c      (IsInstant = true)
        └── AnimatedActionBase          animatedactionbase.c             (drives an animation)
              ├── ActionSingleUseBase   actions/actionsingleusebase.c    (one-shot anim)
              ├── ActionInteractBase    actions/actioninteractbase.c     (no main item; world interaction)
              │     └── ActionInteractLoopBase  actions/actioninteractloopbase.c
              └── ActionContinuousBase  actions/actioncontinuousbase.c   (looping, progress over time)
ActionSequentialBase : ActionBase       actions/actionsequentialbase.c   (multi-step sequence)
```

Each animated category is paired with a **Command Callback (CB)** that drives the engine animation state machine:

```
ActionBaseCB : HumanCommandActionCallback        animatedactionbase.c
  ├── ActionSingleUseBaseCB                       actionsingleusebase.c
  ├── ActionInteractBaseCB                        actioninteractbase.c
  │     └── ActionInteractLoopBaseCB              actioninteractloopbase.c
  └── ActionContinuousBaseCB                      actioncontinuousbase.c
```

Action categories (`_constants.c`): `AC_SINGLE_USE = 1`, `AC_CONTINUOUS = 2`, `AC_INTERACT = 3`.

### What each base is for

| Base | Use When | Example |
|------|----------|---------|
| `ActionInstantBase` | Effect happens immediately, no animation | Picking up with quickbar |
| `ActionSingleUseBase` | One-shot animated action (plays once) | Drinking one sip, attaching a scope |
| `ActionInteractBase` | Interaction with the world, no item needed | Opening doors, turning valves |
| `ActionInteractLoopBase` | Interact that can repeat while held | — |
| `ActionContinuousBase` | Looping action with progress bar | Eating, bandaging, mining wood |
| `ActionSequentialBase` | Multi-phase action | Complex crafting |

---

## The `ActionBase` Contract

`ActionBase` (`actionbase.c`) defines the overridable contract every action implements. The three methods you almost always override:

```c
// 1. Wire up preconditions (mandatory for meaningful actions)
override void CreateConditionComponents() {
    m_ConditionItem   = new CCINonRuined();   // item must exist & not be ruined
    m_ConditionTarget = new CCTCursor();       // must be aiming at it
}

// 2. The per-action logic gate (true = action is available)
override bool ActionCondition(PlayerBase player, ActionTarget target, ItemBase item) {
    // custom checks: door index, fill level, recipe match, etc.
    return true;
}

// 3. The actual world effect (server-authoritative)
override void OnStartServer(ActionData action_data) { ... }
```

Other overridable hooks (default no-ops):
- **Lifecycle**: `OnStart / OnStartServer / OnStartClient`, `OnEnd / OnEndServer / OnEndClient`, `OnUpdate / OnUpdateClient / OnUpdateServer`
- **Execution**: `OnExecute / OnExecuteServer / OnExecuteClient` (fired by the `UA_ANIM_EVENT` animation event)
- **Predicates**: `HasTarget()`, `IsInstant()`, `IsLocal()`, `UseAcknowledgment()`, `UseMainItem()`, `MainItemAlwaysInHands()`, plus many `CanBeUsed*` flags
- **Continuous-only**: `OnStartAnimationLoop / OnEndAnimationLoop / OnFinishProgress` (each with `…Server` / `…Client` variants)

Constructor fields most actions set:
- `m_CommandUID` — the engine animation command (e.g. `DayZPlayerConstants.CMD_ACTIONMOD_DRINK`)
- `m_StanceMask` — allowed stances (`STANCEMASK_ERECT`, `STANCEMASK_CROUCH`, …)
- `m_Text` — the action-wheel prompt label (often a localization key like `"#open"`)

---

## Conditions — "Can I do this?"

Each action composes two reusable condition components, wired in `CreateConditionComponents()`:

- **`m_ConditionItem`** (`CCIBase`) — item-side preconditions. Located in `itemconditioncomponents/`.
- **`m_ConditionTarget`** (`CCTBase`) — target-side preconditions. Located in `targetconditionscomponents/`.

### Item conditions (`CCIBase` subclasses)

| Class | Gate |
|-------|------|
| `CCIDummy` / `CCINone` | No item requirement |
| `CCIPresent` | Item must exist |
| `CCINonRuined` | Item must exist and not be destroyed |
| `CCINotEmpty` | Item has contents (e.g. a water bottle) |
| `CCINotRuinedAndDry` | Item not ruined and not wet |
| `CCINotRuinedAndEmpty` | Item not ruined and empty |

### Target conditions (`CCTBase` subclasses)

| Class | Gate |
|-------|------|
| `CCTDummy` / `CCTNone` | No target requirement |
| `CCTSelf` | Target is the player |
| `CCTObject` | Target is any object (within `m_MaximalActionDistanceSq`) |
| `CCTMan` | Target is another character |
| `CCTCursor` | Whatever the cursor is aimed at |
| `CCTCursorNoObject` / `CCTCursorNoRuinCheck` / `CCTCursorParent` | Cursor variants |
| `CCTSurface` | Target is a ground surface |
| `CCTTree` | Target is a tree (chopping wood) |
| `CCTWaterSurface` | Target is water |
| `CCTNonRuined` | Target object not destroyed |

Each condition overrides `bool Can(PlayerBase player, ...)`. These compose inside `ActionBase.Can(...)` (`actionbase.c`):

```c
bool Can(PlayerBase player, ActionTarget target, ItemBase item) {
    if (!m_StanceMask ... )                          return false;  // stance gate
    if (!m_ConditionMask ...)                        return false;  // condition/animation gate
    if (!m_ConditionTarget.Can(player, target))      return false;  // CCT gate
    if (!m_ConditionItem.Can(player, item))          return false;  // CCI gate
    if (!ActionCondition(player, target, item))      return false;  // custom logic gate
    return true;
}
```

`CanContinue(...)` re-runs a subset of these each tick during a continuous action — if you walk out of reach or ruin the item mid-action, it cancels.

---

## Action Components — "How does it progress?"

The **ActionComponent** (`CABase`, in `actioncomponents/`) defines the per-tick progress math. The Command Callback calls `m_ActionComponent.Execute(action_data)` each frame; the component returns a `UA_*` state:

| Return | Meaning |
|--------|---------|
| `UA_PROCESSING` | Still in progress |
| `UA_FINISHED` | Done — fire `OnExecute` |
| `UA_CANCEL` | Abort |
| `UA_ERROR` | Invalid state |

| Component | Behavior |
|-----------|----------|
| `CADummy` | No-op |
| `CASingleUse` | Returns `UA_FINISHED` immediately |
| `CAInteract` / `CAInteractLoop` | Single/looping interact |
| `CAContinuousBase` | Base for time-based progress (`IsContinuousAction() = true`) |
| `CAContinuousTime` | Progress over a fixed duration |
| `CAContinuousQuantity` | Progress proportional to quantity consumed (drinking, pouring) |
| `CAContinuousFill` | Filling a container |
| `CAContinuousMineWood` | Chopping wood |
| `CAContinuousLoadMagazine` | Loading ammo into a magazine |

**The split**: the *action class* owns preconditions + side effects; the *component* owns timing/progress math. This lets one component (e.g. `CAContinuousQuantity`) be reused across dozens of actions.

---

## Registration & Input Mapping

### Registration — `ActionConstructor`

`ActionConstructor.ConstructActions()` (`actionconstructor.c`) is called once during `ActionManagerBase` construction. It `Spawn()`s every action typename (hundreds of `actions.Insert(ActionDrink)`, `actions.Insert(ActionOpenDoors)`, …), gives each a sequential `SetID`, and indexes them in:
- `m_ActionsArray` — by numeric ID
- `m_ActionNameActionMap` — by typename

Lookups: `GetAction(typename)` and `GetAction(int actionID)` (both in `actionmanagerbase.c`).

### Input Mapping — `ActionInput`

`ActionInput` (`actioninput.c`) bridges the engine input system to actions. Each action declares its input type via `GetInputType()` (e.g. `ActionInteractBase → InteractActionInput`). Concrete inputs:

| Input | Behavior |
|-------|----------|
| `StandardActionInput` | Polls candidate actions, runs `action.Can(...)`, picks the best match |
| `InteractActionInput` | For interact-category actions |
| `ContinuousInteractActionInput` | For looping interacts |

Key methods:
- `Update()` — polls engine input
- `UpdatePossibleActions(player, target, item, mask)` — runs `Can()` on all candidate actions
- `JustActivate()` — edge-detected "input just pressed" (watched by the manager)
- `OnActionStart()` / `OnActionEnd()`

Each frame the client calls `ActionManagerClient.FindContextualUserActions()` (`actionmanagerclient.c`): gathers current item + target, computes the condition mask, and feeds every `ActionInput` via `UpdatePossibleActions(...)`.

### Target Finding — `ActionTargets`

`ActionTargets` (`actiontargets.c`) builds the candidate target list each frame:
1. Casts a camera ray (`m_RayStart → m_RayEnd = start + camDir * c_RayDistance`)
2. `DayZPhysics.RaycastRVProxy(...)` — proxy-aware raycast
3. Sorts results by distance, skips non-action-targets (`!cursorTarget.CanBeActionTarget()`)
4. Stores vicinity (non-cursor) objects via `m_VicinityObjects.StoreVicinityObject(...)`
5. Filters obstruction (`IsObstructed` / `FilterObstructedObjects`)

`ActionTarget` itself is a small struct: `{ object, parent, componentIndex, cursorHitPos, utility }`.

---

## End-to-End Lifecycle: Keypress → Execution

This is the complete flow for an action in multiplayer. Follow this sequence to understand how input becomes a world effect.

### Phase 1 — Client detects input

```
HumanInputController (engine)
   │
   ▼  per frame
ActionManagerClient.Update(pCurrentCommandID)            actionmanagerclient.c
   │
   ▼  (no action currently running)
InputsUpdate()                                           actionmanagerclient.c
   │
   ▼  polls each ActionInput
ActionInput.Update()  →  UpdatePossibleActions(...)      actioninput.c
   │  (runs action.Can(...) on all candidates)
   ▼
ActionInput.JustActivate()  ──►  ActionStart(action, target, item)   actionmanagerclient.c
```

### Phase 2 — Client builds request & sends to server

`ActionStart()` (`actionmanagerclient.c`):
1. `ActionPossibilityCheck` — basic validation
2. `action.SetupAction(...)` — builds `m_CurrentActionData`
3. **Multiplayer path** — writes a network packet (this is **`ScriptInputUserData`, not `ScriptRPC`**):

```c
ScriptInputUserData ctx = new ScriptInputUserData;
ctx.Write(INPUT_UDT_STANDARD_ACTION_START);     // 1
ctx.Write(action.GetID());
action.WriteToContext(ctx, m_CurrentActionData);
if (action.UseAcknowledgment()) {
    m_PendingActionAcknowledgmentID = ++m_LastAcknowledgmentID;
    ctx.Write(m_PendingActionAcknowledgmentID);
}
ctx.Send();
m_CurrentActionData.m_State = UA_AM_PENDING;     // awaiting server
```

(`INPUT_UDT_*` constants live in `3_game/tools/component/_constants.c`.)

| Constant | Value | Purpose |
|----------|-------|---------|
| `INPUT_UDT_STANDARD_ACTION_START` | 1 | Begin an action |
| `INPUT_UDT_STANDARD_ACTION_END_REQUEST` | 2 | Client requests to end |
| `INPUT_UDT_STANDARD_ACTION_INPUT_END` | 3 | Input-released end |

### Phase 3 — Server authorizes

`ActionManagerServer.OnInputUserDataProcess(userDataType, ctx)` (`actionmanagerserver.c`):
1. Reads action ID, looks up via `GetAction(actionID)`
2. `ReadFromContext(...)` reconstructs the target/item → stored in `m_PendingAction`
3. Next `Update()` tick re-runs `SetupAction(...)` then `StartDeliveredAction()`

`StartDeliveredAction()` is the **authoritative gate**:
- Re-validates `pickedAction.Can(player, target, item)` server-side
- `AddActionJuncture(...)` — reserves the inventory slot (prevents races/dupes)
- **Accept** → `DayZPlayerSyncJunctures.SendActionAcknowledgment(player, ackID, true)` + runs `action.Start(...)` server-side (fires `OnStartServer` / `OnExecuteServer`)
- **Reject** → `SendActionAcknowledgment(player, ackID, false)`

### Phase 4 — Client receives verdict & runs locally

Server → client replies come back via **sync junctures** (not RPC). `ActionManagerBase.OnSyncJuncture(...)` (`actionmanagerbase.c`):

| Juncture | Client Effect |
|----------|---------------|
| `SJ_ACTION_ACK_ACCEPT` | `m_CurrentActionData.m_State = UA_AM_ACCEPTED` |
| `SJ_ACTION_ACK_REJECT` | `m_CurrentActionData.m_State = UA_AM_REJECTED` |
| `SJ_ACTION_INTERRUPT` | `m_Interrupted = true` |

Back in `ActionManagerClient.Update()`:
- `UA_AM_ACCEPTED` → `action.Start(m_CurrentActionData)` runs locally → animation plays, `OnExecuteClient` fires cosmetic effects
- `UA_AM_REJECTED` → action never starts locally (server said no)

### Phase 5 — Ending the action

- Client sends `INPUT_UDT_STANDARD_ACTION_END_REQUEST` (or `..._INPUT_END` on input release)
- Server `OnInputUserDataProcess` handles both, sets `m_ActionWantEndRequest` / `m_ActionInputWantEnd`
- Server processes end in `Update()` → may send `SendActionInterrupt` back if the action was force-interrupted

### Communication channels summary

| Direction | Channel | Constants |
|-----------|---------|-----------|
| Client → Server | `ScriptInputUserData` | `INPUT_UDT_STANDARD_ACTION_*` |
| Server → Client | `DayZPlayerSyncJunctures` | `SJ_ACTION_ACK_ACCEPT / REJECT`, `SJ_ACTION_INTERRUPT` |

**One-line summary**: client detects input → runs `Can()` locally → sends action ID via `ScriptInputUserData` → server re-runs `Can()` + juncture → ACK/REJ via sync juncture → on ACK both sides run the action (client = visuals, server = authoritative effects).

---

## Sequence Diagram

```
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │  frame: ActionManagerClient.Update     │
    │  → ActionInput.JustActivate()          │
    │  → ActionStart()                       │
    │  → action.Can() (client gate)          │
    │                                         │
    │  ──INPUT_UDT_STANDARD_ACTION_START──►  │  (ScriptInputUserData)
    │     { actionID, target, item, ackID }  │
    │                                         │  OnInputUserDataProcess
    │                                         │  → GetAction(actionID)
    │                                         │  → SetupAction
    │                                         │  → action.Can() (SERVER gate)
    │                                         │  → AddActionJuncture
    │                                         │
    │  ◄────SJ_ACTION_ACK_ACCEPT────────────  │  (DayZPlayerSyncJunctures)
    │                                         │
    │  action.Start() (local)                 │  action.Start() (server)
    │  → animation plays                      │  → OnStartServer / OnExecuteServer
    │  → OnExecuteClient (cosmetic)           │     (world effect: OpenDoor, etc.)
    │                                         │
    │  ──INPUT_UDT_STANDARD_ACTION_END────►   │
    │     _REQUEST                            │
    │                                         │  EndRequest processed
    │                                         │  → OnEndServer
    └─────────────────────────────────────────┘
```

---

## Worked Example: `ActionOpenDoors`

File: `actions/interact/actionopendoors.c`. A minimal interact action showing every override:

```c
class ActionOpenDoors: ActionInteractBase
{
    void ActionOpenDoors() {
        m_CommandUID = DayZPlayerConstants.CMD_ACTIONMOD_OPENDOORFW;
        m_StanceMask = STANCEMASK_CROUCH | STANCEMASK_ERECT;
        m_Text = "#open";
    }

    override void CreateConditionComponents() {
        m_ConditionItem   = new CCINone();     // no item needed
        m_ConditionTarget = new CCTCursor();   // aim at the door
    }

    override bool ActionCondition(PlayerBase player, ActionTarget target, ItemBase item) {
        if (!target || !IsBuilding(target)) return false;
        Building building;
        if (Class.CastTo(building, target.GetObject())) {
            int doorIndex = building.GetDoorIndex(target.GetComponentIndex());
            if (doorIndex == -1) return false;
            if (!IsInReach(player, target, UAMaxDistances.DEFAULT)) return false;
            return building.CanDoorBeOpened(doorIndex, CheckIfDoorIsLocked());
        }
        return false;
    }

    override void OnStartServer(ActionData action_data) {
        Building building;
        if (Class.CastTo(building, action_data.m_Target.GetObject())) {
            int doorIndex = building.GetDoorIndex(action_data.m_Target.GetComponentIndex());
            if (doorIndex != -1 && building.CanDoorBeOpened(doorIndex, CheckIfDoorIsLocked()))
                building.OpenDoor(doorIndex);     // ← the actual world effect
        }
    }

    override void OnEndServer(ActionData action_data) { /* noise event */ }
    override bool IsLockTargetOnUse() { return false; }
}
```

Note the layering: `CreateConditionComponents` (mechanical gates) + `ActionCondition` (semantic gate) + `OnStartServer` (authoritative effect). `ActionLockedDoors : ActionOpenDoors` only overrides `CheckIfDoorIsLocked()→false`, showing how subclasses specialize behavior with minimal code.

Other action families live in `actions/singleuse/` (e.g. `ActionAttach`), `actions/continuous/` (eating/drinking), `actions/instant/`, `actions/interact/`, and `actions/weapons/` (e.g. `FirearmActionAttachMagazine`, `FirearmActionBase` — these reuse the same pipeline to feed the [Weapons FSM](./weapons-system)).

---

## Directory Structure

```
useractionscomponent/
├── _constants.c                  AC_* category constants
├── actionbase.c                  ActionBase root + ActionBaseCB
├── animatedactionbase.c          AnimatedActionBase + ActionBaseCB
├── actionconstructor.c           Registers all actions, assigns IDs
├── actioninput.c                 Input → action bridge (+ StandardActionInput etc.)
├── actionmanagerbase.c           Shared manager: registries, sync junctures
├── actionmanagerclient.c         Client: input polling, ActionStart, packet send
├── actionmanagerserver.c         Server: authorization, junctures, server-side Start
├── actiontargets.c               Raycast-based target finding
├── actionvariantsmanager.c       Action variant resolution
├── actions/                      Category base classes + concrete actions
│   ├── actioninstantbase.c
│   ├── actionsingleusebase.c
│   ├── actioninteractbase.c
│   ├── actioninteractloopbase.c
│   ├── actioncontinuousbase.c
│   ├── actionsequentialbase.c
│   ├── continuous/               Eating, bandaging, mining, filling…
│   ├── instant/                  Immediate-effect actions
│   ├── interact/                 Doors, valves, switches…
│   ├── singleuse/                Attach, detach, one-shot anims
│   └── weapons/                  Firearm actions (mag swap, unjam, load bullet)
├── actioncomponents/             CABase + CA* (progress math)
├── itemconditioncomponents/      CCIBase + CCI* (item gates)
└── targetconditionscomponents/   CCTBase + CCT* (target gates)
```

---

## Related Documentation

- [Inventory System](./inventory-system) — hand FSM and inventory junctures that actions depend on
- [Weapons System](./weapons-system) — weapon actions (`actions/weapons/`) feed the weapon FSM through this same pipeline
- [Networking & RPC](./networking) — `ScriptInputUserData` and `DayZPlayerSyncJunctures` details
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index of this directory
- [Modding → Safe Patterns](/modding/safe-patterns) — how to add a custom action correctly
