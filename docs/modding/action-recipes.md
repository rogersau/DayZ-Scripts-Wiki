# Writing Custom Actions — Patterns & Recipes

This is a **cookbook of concrete action patterns** drawn from DayZ's ~390 action files in `4_world/classes/useractionscomponent/actions/`. The companion [User Actions System](/game-systems/user-actions-system) page documents the framework (the `ActionBase` hierarchy, the `ActionManager` client↔server flow, conditions, and components). This page answers the practical question: **which base class do I pick, and what does a real action look like?**

**Primary location**: `P:/scripts/4_world/classes/useractionscomponent/actions/`

| Directory | Count | Category | When to use |
|-----------|-------|----------|-------------|
| `singleuse/` | ~105 | `AC_SINGLE_USE` | One-shot effect with an animation |
| `continuous/` | ~210 | `AC_CONTINUOUS` | Progress bar / looped action |
| `interact/` | ~71 | `AC_INTERACT` | World interaction, no item needed |
| `weapons/` | 7 | (weapon) | Firearm manipulation (delegates to `WeaponManager`) |
| `instant/` | 1 | instant | Immediate, no animation (rare — debug/internal) |

> **One-line decision rule:** instant effect + animation → `ActionSingleUseBase` (override `OnExecuteServer`); progress bar/loop → `ActionContinuousBase` (install a `CAContinuous*` in a CB subclass, override `OnFinishProgressServer`); world look-and-press without an item → `ActionInteractBase` (`InteractActionInput`, `OnStartServer`/`OnExecuteServer`); firearm manipulation → `FirearmActionBase` (delegate to `WeaponManager`, junctures, `GetProgress() = -1`); immediate no-animation → `ActionInstantBase` (rare, `Start()` does the work).

---

## The Four Concrete Bases

All four live in `actions/` (the framework bases are `ActionBase` / `AnimatedActionBase` in the parent dir):

| Base | Extends | Input type | UseMainItem | `GetActionCategory()` |
|------|---------|-----------|-------------|----------------------|
| `ActionSingleUseBase` | `AnimatedActionBase` | `DefaultActionInput` (`:37`) | true | `AC_SINGLE_USE` |
| `ActionContinuousBase` | `AnimatedActionBase` | `ContinuousDefaultActionInput` (`:179`) | true | `AC_CONTINUOUS` |
| `ActionInteractBase` | `AnimatedActionBase` | `InteractActionInput` (`:61`) | **false** (`:71`) | `AC_INTERACT` |
| `ActionInstantBase` | `ActionBase` (not `AnimatedActionBase`) | — | — | overrides `IsInstant() = true` |
| `FirearmActionBase` | `ActionBase` | `DefaultActionInput` (`:15`) | — | `AC_SINGLE_USE` (but special) |

The input type determines which input bucket the action binds to ("use item" / "interact with world" / "weapon"). Overriding `GetInputType()` is how an action moves between buckets.

---

## Pattern 1 — Single-Use Action (the most common)

**Shape:** one-shot effect fired on the single animation event.

```c
class ActionFoo : ActionSingleUseBase
{
    void ActionFoo()
    {
        m_CommandUID = DayZPlayerConstants.CMD_ACTIONMOD_XXX;  // or CMD_ACTIONFB_XXX + m_FullBody=true
        m_StanceMask = DayZPlayerConstants.STANCEMASK_ERECT | STANCEMASK_CROUCH;
        m_Text = "#localised";
    }
    override void CreateConditionComponents()
    {
        m_ConditionItem  = new CCINonRuined();
        m_ConditionTarget = new CCTSelf();           // or CCTObject/CCTCursor/CCTMan(dist)
    }
    override bool ActionCondition(PlayerBase player, ActionTarget target, ItemBase item) { ... }
    override void OnExecuteServer(ActionData action_data) { ... }   // state-changing side effect
    // optional: OnExecuteClient for predictive/visual sync
}
```

### Worked example: `ActionAttach` (`singleuse/actionattach.c`)

The canonical "I have an item, I click another item to slot it in" action.

- `:7` — `class ActionAttach : ActionSingleUseBase`
- Constructor sets only `m_Text = "#attach"` (`:11`)
- `CreateConditionComponents()` (`:14`): `CCINonRuined` item + `CCTNonRuined(DEFAULT)` target, `m_CommandUID = CMD_ACTIONMOD_ATTACHITEM`, `m_StanceMask = ERECT | CROUCH`
- **Custom ActionData** `AttachActionData` (`:1`) adds `int m_AttSlot`; `CreateActionData()` (`:22`) instantiates it
- **`SetupAction()` override** (`:28`) — pattern for actions needing client-only precomputation: on client calls `FindFreeLocationForItem(...ATTACHMENT...)` to find a free slot, stores it in the custom ActionData
- `ActionCondition()` (`:61`) — `targetEntity.GetInventory().CanAddAttachment(item) && !targetEntity.CanUseConstruction()` (last check stops conflict with build actions)
- **`OnExecuteServer` (`:72`) and `OnExecuteClient` (`:82`) both call `AttachItem()` (`:90`)** — note the split: `OnExecuteServer` returns early if multiplayer (`:74`), so on a DS the client-predictive call does the work
- `AttachItem()` calls `player.PredictiveTakeEntityToTargetAttachmentEx(entity, item, m_AttSlot)`

### Other single-use clusters

| Cluster | Examples |
|---------|----------|
| **Toggle on/off** (~20 files) | `actionturnonchemlight`, `actionturnoffheadtorch`, `actionturnontransmitter`, `actionturnonnvg`, `actionturnonalarmclock` |
| **Consume single** | `actiontakeabite`, `actiontakeasip`, `actionforceabite`, `actionlickbattery` |
| **Fold/unfold** | `actionfoldbandana`, `actionunfoldmap` |
| **Gardening** | `actionplantseed`, `actionemptyseedspack`, `actiondisinfectplantbit` |
| **Explosives/locks** | `actiontriggerremotely`, `actionpin`, `actionnextcombinationlockdial` |
| **Medical** (`medical/`) | `actioninjectself`, `actionbitecharcoaltablets`, `actiondisinfectself`, `actioneattabletfromwrapper` |

### Medical specialization pattern — `ActionInjectSelf` → `ActionInjectEpinephrineSelf`

- `medical/actioninjectself.c:1` — full-body crouch: `CMD_ACTIONFB_INJECTION`, `m_FullBody = true`, `m_SpecialtyWeight = UASoftSkillsWeight.PRECISE_MEDIUM` (`:5-9`)
- `OnExecuteServer` (`:23`) calls virtual `ApplyModifiers(action_data)`
- `OnEndServer` (`:31`) deletes the item if `m_WasExecuted` — **the "delete syringe after use" pattern**
- `ApplyModifiers` (`:49`) calls `action_data.m_MainItem.OnApply(action_data.m_Player)` — delegates effect to the medical item
- `actioninjectepinephrineself.c:1` — `ActionInjectEpinephrineSelf : ActionInjectSelf` **only overrides `ApplyModifiers`** — minimal ~8-line specialization

---

## Pattern 2 — Continuous Action (progress bar / loop)

**Shape:** install a `CAContinuous*` component via a callback (CB) subclass; the component drives the progress bar and calls `OnFinishProgressServer` on completion.

```c
class ActionFooCB : ActionContinuousBaseCB
{
    override void CreateActionComponent()
    {
        m_ActionData.m_ActionComponent = new CAContinuousTime(UATimeSpent.FOO);  // or Repeat/Quantity*
    }
}
class ActionFoo : ActionContinuousBase
{
    void ActionFoo() {
        m_CallbackClass = ActionFooCB;
        m_CommandUID = CMD_ACTIONFB_FOO; m_FullBody = true; m_StanceMask = ...; m_Text = "#foo";
    }
    override void CreateConditionComponents() { ... }
    override bool ActionCondition(...) { ... }                          // start gate
    override void OnFinishProgressServer(ActionData action_data) { ... } // effect on completion
    // optional: ActionConditionContinue for per-tick re-validation, OnEndServer for cleanup/agents
}
```

### The CA components (in `actioncomponents/`)

The component decides *how* progress accumulates:

| Component | Behavior |
|-----------|----------|
| `CAContinuousTime(time)` | Fixed duration; `Execute()` accumulates `GetDeltaT()` until `m_AdjustedTimeToComplete`, then `OnCompletePogress` → `UA_FINISHED`. Used for saline, build |
| `CAContinuousRepeat(time)` | **Looped**: after completing a cycle, resets `m_TimeElpased` and returns `UA_PROCESSING` again (`:47`). Used for bandaging, mining — each tick applies effect |
| `CAContinuousQuantityEdible(qty, ...)` | Drains item quantity (eat/drink) |
| `CAContinuousMineWood` / `CAContinuousMineRock` | Mining progress |
| `CAContinuousFillFuel` / `Fill` / `FillCoolant` | Liquid filling |
| `CAContinuousQuantityLiquidTransfer` | Liquid transfer |
| `CAContinuousCraft` | Crafting (recipe-driven time) |

The bridge: `cacontinuousbase.c:12` — `OnCompletePogress(action_data)` casts the action to `ActionContinuousBase` and calls `action.OnFinishProgress(action_data)`.

### Worked example: `ActionDrink` / `ActionEat` (consume pattern)

- `continuous/actionconsume.c:9` — `ActionConsume : ActionContinuousBase` with callback `ActionConsumeCB` (`:1`) installing `CAContinuousQuantityEdible(DEFAULT, DEFAULT)`
- `ActionCondition` (`:20`) = edibility gate: `player.CanEatAndDrink() && player.CanConsumeFood(dta) && item.CanBeConsumed(dta)`
- `OnEndServer` (`:45`) — on completion, clamps quantity; transmits agents via `PluginTransmissionAgents.TransmitAgents(player, item, AGT_UACTION_TO_ITEM)` — **agent transmission lives in `OnEndServer`**
- `actiondrink.c:9` — `ActionDrink : ActionConsume` — its own CB installs `CAContinuousQuantityEdible(UAQuantityConsumed.DRINK, ...)`, sets `CMD_ACTIONMOD_DRINK`/`CMD_ACTIONFB_DRINK`, `IsDrink() = true`. **Overrides nothing else** — parent owns condition/execute.

**Portion-sizing via CB inheritance** (`actioneat.c`): `ActionEatBigCB` uses `EAT_BIG`; `ActionEatCB : ActionEatBigCB` overrides to `EAT_NORMAL`; `ActionEatSmallCB` to `EAT_SMALL`. Action classes mirror: `ActionEatBig : ActionConsume`, `ActionEat : ActionEatBig`, `ActionEatSmall : ActionEatBig`. Same food, three portion tiers.

### Worked example: Medical treatment

**Bandage (looped, effect-per-tick via `CAContinuousRepeat`):**
- `medical/actionbandagebase.c:1` — `ApplyBandage(item, player)`: `player.GetBleedingManagerServer().RemoveMostSignificantBleedingSourceEx(item)`, transmits agents `AGT_ITEM_TO_FLESH`, then `item.AddQuantity(-1, true)` or `item.Delete()`
- `medical/actionbandageself.c:1` — `ActionBandageSelfCB` sets `CAContinuousRepeat(UATimeSpent.BANDAGE / effectivity)` (bandage quality matters); `ActionCondition = player.IsBleeding()` (`:38`); `OnFinishProgressServer` (`:43`) calls `ApplyBandage(...)`

**Saline (fixed-duration via `CAContinuousTime`):**
- `medical/actiongivesalinetarget.c:5` — `ActionGiveSalineTargetCB` installs `CAContinuousTime(UATimeSpent.SALINE)`
- `OnFinishProgressServer` (`:29`) — reads consumed amount from the CA component: `Param1<float>.Cast(action_data.m_ActionComponent.GetACData())` to get `delta`, then `ntarget.GetModifiersManager().ActivateModifier(eModifiers.MDF_SALINE)` + `action_data.m_MainItem.Delete()`. **The "delta extraction" pattern.**

### Worked example: `ActionBuildPart` (base building)

- `continuous/actionbuildpart.c:25` — declares custom `BuildPartActionData` carrying `string m_PartType`
- `OnActionInfoUpdate` (`:44`) sets `m_Text = "#build " + partName` from `ConstructionActionData` — **dynamic text via variant index `m_VariantID`**
- `ActionConditionContinue` (`:89`) — re-checks collision each tick (`IsCollidingEx` + `CanBuildPart`)
- `OnFinishProgressServer` (`:112`) — `construction.BuildPartServer(...)`, then `item.DecreaseHealth(UADamageApplied.BUILD)` — **tool-damage-on-use pattern**
- `SetupAction` (`:144`) → `SetBuildingAnimation(item)` (`:161`) **switches `m_CommandUID` by tool type** (Pickaxe→DIG, Pliers→INTERACT, SledgeHammer→MINEROCK, default→ASSEMBLE)
- Full `WriteToContext`/`ReadFromContext`/`HandleReciveData` (`:183-212`) carry `m_PartType` client→server
- `ActionBuildPartNoTool : ActionBuildPart` (`:224`) — overrides `GetInputType() = ContinuousInteractActionInput`, `UseMainItem() = false` — **a continuous action re-classified as interact** (no tool needed)

### `OnFinishProgressServer` vs `OnExecuteServer` for continuous actions

Continuous actions use **`OnFinishProgressServer`** (fired by the CA component) for the main effect; **`OnExecuteServer`** fires *every tick* — used for per-tick effects (e.g. `ActionMineTree` spawns/reactivates the particle effecter each tick, `actionminetree.c:103`).

---

## Pattern 3 — Interact Action (world, no item)

**Shape:** bound to the interact (look-at-world) input; no item in hands required; `UseMainItem() = false`.

### Worked example: `ActionCloseDoors` (`interact/actionclosedoors.c`)

- `:1` `ActionCloseDoors : ActionInteractBase`; no `CreateConditionComponents` override (inherits base `CCTObject(DEFAULT)`)
- `ActionCondition` (`:18`) — the canonical door-interaction gate:
  ```
  IsBuilding(target) → building.GetDoorIndex(target.GetComponentIndex())
    → IsInReach(player, target, UAMaxDistances.DEFAULT)
    → building.CanDoorBeClosed(doorIndex)
  ```
  Note the **component-index lookup** (which sub-selection of the building was hit)
- `OnStartServer` (`:42`) — `building.CloseDoor(doorIndex)` (NOT `OnExecuteServer` — door actions use `OnStartServer` so they fire at animation start)
- `OnEndServer` (`:60`) — **noise emission**: builds `NoiseParams`, `GetGame().GetNoiseSystem().AddNoisePos(player, position, noisePar, NoiseAIEvaluate.GetNoiseReduction(weather))`. Closing doors makes noise to alert zombies
- `IsLockTargetOnUse() = false` (`:74`)

### Interact clusters

| Cluster | Examples |
|---------|----------|
| Doors/fences | `actionclosedoors`, `actionopendoors`, `actionopenfence`, `actionlockdoors`, `actionunlockcontainerdoor`, `actiontoggletentopen` |
| Power/electronics | `actionturnonpowergenerator`, `actionturnonspotlight`, `actionoperatepanel`, `actionuseundergroundlever` |
| Pick up | `actiontakeitem`, `actiontakeitemtohands`, `actiontakehybridattachment`, `actionpickupchicken` |
| Tents | `actionpacktent`, `actionpackshelter`, `actionrepacktent`, `actionfoldobject` |
| Ladders/transport | `actionenterladder`, `actiongetintransport`, `actionpullbodyfromtransport` |

---

## Pattern 4 — Weapon Action (delegate to `WeaponManager`)

`weapons/` contains 7 files: `firearmactionbase.c`, `firearmactionattachmagazine.c` (+ Quick), `firearmactiondetachmagazine.c`, `firearmactionloadbullet.c` (+ Quick), `firearmactionloadmultibullet.c`, `firearmactionmechanicmanipulate.c`, `firearmactionunjam.c`.

### How weapon actions differ (the key insight)

`FirearmActionBase : ActionBase` (`firearmactionbase.c:1`) — **NOT `AnimatedActionBase`**. They:
- `GetProgress() = -1` (`:66`) — **no progress bar**; progress is driven by the weapon animation, not a CA component
- `Start()` (`:32`) sets `m_State = UA_PROCESSING` and **delegates to `player.GetWeaponManager()`** rather than doing the effect itself
- `OnUpdate()` (`:54`) **ends the action when `WeaponManager.IsRunning()` becomes false** — the WeaponManager owns the lifecycle
- `ActionConditionContinue` (`:20`) = `!wpn.IsIdle()` — keep going while the weapon animation runs
- `AddActionJuncture` (`:71`) heavily overridden to **reserve the magazine's inventory location** via `GetGame().AddInventoryJunctureEx(...)` — weapons need juncture locking (network agreement on who controls the mag) instead of plain inventory reservations

### Worked example: `FirearmActionAttachMagazine` (`firearmactionattachmagazine.c`)

1. **Custom ActionData** `AttachMagazineActionData` (`:5`) carries `ref InventoryLocation m_ilOldMagazine` and `Magazine m_oldMagazine` — the slot the current mag will be swapped into
2. `ActionCondition` (`:26`) — `player.GetWeaponManager().CanAttachMagazine(wpn, mag) || CanSwapMagazine(...)` AND `hcw.GetRunningAction() != WeaponActions.RELOAD`
3. `Post_SetupAction` (`:94`) — client computes where the old magazine will go via `WeaponManager.PrepareInventoryLocationForMagazineSwap(...)`
4. `InventoryReservation` (`:115`) — **elaborate three-way reservation**: reserves the old mag's target location, the new mag's attachment slot, AND the weapon's hands location, with full rollback if any fails
5. `Start` (`:199`) — **the core delegation**: `ClearInventoryReservationEx(action_data)` then `player.GetWeaponManager().AttachMagazine(mag, this)` OR `SwapMagazineEx(mag, ilOldMagazine, this)`. The `this` passes the action as a callback so the WeaponManager notifies completion

### `FirearmActionUnjam` (`firearmactionunjam.c`)

Smallest concrete: `ActionCondition = player.GetWeaponManager().CanUnjam(wpn)` (`:29`), `Start` (`:38`) = `player.GetWeaponManager().Unjam(this)`.

**Weapon action recipe:** delegate every effect to `WeaponManager`; use junctures instead of inventory reservations; serialize the swap-target `InventoryLocation`; let `OnUpdate` end the action when the WeaponManager stops.

---

## Pattern 5 — Instant Action (rare)

Only one vanilla file: `instant/actiondebug.c` — `ActionDebug : ActionInstantBase`, wrapped in `#ifdef DIAG_DEVELOPER`.

- `ActionInstantBase : ActionBase` (NOT `AnimatedActionBase`), `IsInstant() = true`. No callback, no `m_CommandUID`, no progress
- `ActionDebug` overrides `Start()` directly — no `OnExecuteServer`. Effect is immediate in `Start`
- `UseAcknowledgment() = false` — no server round-trip ack

Instant actions are rare in vanilla — most "immediate" gameplay uses singleuse or interact. This category exists primarily for debug/internal immediate dispatch.

---

## Cross-Cutting Patterns

### Animation declaration (in constructor)

| Field | Purpose |
|-------|---------|
| `m_CommandUID` | Primary animation (`CMD_ACTIONMOD_*` upper-body, `CMD_ACTIONFB_*` full-body) |
| `m_CommandUIDProne` | Prone-stance variant (pair with `HasProneException() = true`) |
| `m_FullBody = true` | Switches from `CMD_ACTIONMOD_*` to `CMD_ACTIONFB_*` animation set |
| `m_StanceMask` | Which stances allow the action (`STANCEMASK_ERECT \| STANCEMASK_CROUCH`) |
| `m_Text` | Prompt string; can be dynamic via `OnActionInfoUpdate` or `GetText()` |
| `m_Sound` | Sound set name (played via `PlayActionSound` in the CB); `GetSoundCategory` routes to soundset categories |
| `m_SpecialtyWeight` | Soft-skill weight (`UASoftSkillsWeight.PRECISE_MEDIUM` for medical, `ROUGH_HIGH` for building) |

### Execute-hook lifecycle — when each is used

| Hook | When | Typical use |
|------|------|-------------|
| `OnStartServer` | Animation START | Effect at anim begin (door actions) |
| `OnExecuteServer` | Singleuse: the single `UA_ANIM_EVENT`. Continuous: **every tick** | Singleuse main effect; continuous per-tick effects (mining particles) |
| `OnStartAnimationLoop` / `OnEndAnimationLoop` | Continuous-only, bracket the loop | Setup/teardown around the loop |
| `OnFinishProgressServer` | Continuous-only, fired by CA component on completion | **Where continuous actions apply their main effect** |
| `OnEndServer` | Action end (success or fail) | Cleanup: agent transmission, particle teardown, item deletion, noise, quantity clamping |
| `ApplyModifiers` | Medical convenience virtual | `item.OnApply(player)` |

### Common `ActionCondition` gate patterns

| Pattern | Example |
|---------|---------|
| Self-target | `CCTSelf` + `HasTarget() = false` (eat, drink, inject-self) |
| World object in reach | `IsInReach(player, target, UAMaxDistances.DEFAULT)` |
| Is-a-kind checks | `IsTree() && IsCuttable()`, `IsBuilding(target)`, `IsInherited(VehicleBattery)` |
| Config/component checks | `GetCompEM().CanSwitchOn()`, `GetInventory().CanAddAttachment()` |
| State gates | `player.IsBleeding()`, `player.GetBrokenLegs() == BROKEN_LEGS` |
| Consume triad | `player.CanEatAndDrink() && player.CanConsumeFood(dta) && item.CanBeConsumed(dta)` |

### Spawning effects (`SEffectManager`)

Pattern from `actionminetree.c`: store an effecter ID in custom ActionData. `OnExecuteServer` (per-tick) calls `SEffectManager.CreateParticleServer(pos, params)` if `m_EffecterID == -1`, else `SEffectManager.ReactivateParticleServer(id)`. `OnEndServer` calls `SEffectManager.DestroyEffecterParticleServer(id)`.

### Stat modification

Actions generally do **NOT** call `GetStatEnergy().Add(...)` directly. The canonical path is to **delegate to the player**: `player.Consume(consumeData)` (which internally adjusts energy/water/stomach stats), or `player.GetModifiersManager().ActivateModifier(eModifiers.MDF_SALINE)`. The `PlayerConsumeData` object (`EConsumeType`, amount, source, agents) is the transport.

### Inventory interaction patterns

| Pattern | API |
|---------|-----|
| Predictive attachment | `player.PredictiveTakeEntityToTargetAttachmentEx(entity, item, slot)` |
| Create in hands | `player.GetHumanInventory().CreateInHands(name)` (+ `CreateInInventory` / `CreateObjectEx(...ECE_PLACE_ON_SURFACE)` fallbacks) |
| Take as attachment | `targetIB.GetInventory().TakeEntityAsAttachment(InventoryMode.LOCAL, item)` |
| Quantity manipulation | `item.AddQuantity(-1, true)` / `item.SetQuantity(0)` / `item.Delete()` |
| Tool damage | `item.DecreaseHealth(UADamageApplied.BUILD, false)` |
| Clear reservations | `ClearInventoryReservationEx(action_data)` |

> **Note on lambdas:** Inventory lambdas (`TurnItemIntoItemLambda`, `SwapLambda`, etc.) are conspicuously **absent** from action classes. Actions call high-level inventory APIs (`PredictiveTakeEntityToTargetAttachmentEx`, `TakeEntityAsAttachment`, `CreateInHands`) which internally use the lambda machinery. Lambdas are used by the inventory/recipe systems directly.

---

## Crafting Bridge — `ActionWorldCraft`

The active crafting action is `ActionWorldCraft` in `continuous/` (`continuous/actionworldcraft.c`):

- `:34` `ActionWorldCraft : ActionContinuousBase`, callback installs `CAContinuousCraft(UATimeSpent.DEFAULT_CRAFT)` — **craft time comes from the recipe**, not the component
- **Dynamic text**: `GetText()` (`:65`) and `OnActionInfoUpdate` (`:58`) call `PluginRecipesManager.GetRecipeName(player.GetCraftingManager().GetRecipeID(m_VariantID))` — `m_VariantID` selects which recipe among the possible ones
- `SetupAction` (`:126`) resolves the recipe ID client-side, then `PluginRecipesManager.GetRecipeAnimationInfo(...)` (`:138`) gets the recipe-specific animation → `m_CommandUID = action_data_wc.m_AnimationID` (`:143`). **Animations and sounds are per-recipe.**
- `ActionConditionContinue` (`:89`) re-validates each tick: `moduleRecipesManager.IsRecipePossibleToPerform(m_RecipeID, item1, item2, player)`
- `OnFinishProgressServer` (`:170`) — **the actual craft**: `module_recipes_manager.PerformRecipeServer(m_RecipeID, m_MainItem, item2, player)`

**The bridge:** `ActionWorldCraft` + `CAContinuousCraft` + `PluginRecipesManager`. The action class owns input/animation/network; the recipes manager owns validation (`IsRecipePossibleToPerform`), presentation (`GetRecipeAnimationInfo`/`GetSoundCategory`), and execution (`PerformRecipeServer`). **A modder adds a recipe to the recipes manager, not a new action class** — `ActionWorldCraft` is generic and recipe-driven via `m_VariantID`. (`continuous/actioncraft.c` is a legacy stub — real crafting goes through `ActionWorldCraft`.)

See [Crafting & Cooking System](/game-systems/crafting-cooking-system) for the recipe plugin side.

---

## Related Documentation

- [User Actions System](/game-systems/user-actions-system) — the framework: `ActionBase` hierarchy, `ActionManager` client↔server flow, conditions, components
- [Crafting & Cooking System](/game-systems/crafting-cooking-system) — recipe plugin side of `ActionWorldCraft`
- [Base Building System](/game-systems/base-building-system) — `ActionBuildPart`/`ActionDismantlePart` deep-dive
- [Weapons & Firearms System](/game-systems/weapons-system) — `WeaponManager` (where weapon actions delegate)
- [Damage System](/game-systems/damage-system) — bandage actions call `RemoveMostSignificantBleedingSourceEx`
- [Player Modifiers & Symptoms](/game-systems/modifiers-symptoms-system) — medical actions activate modifiers
- [Safe Modding Patterns](./safe-patterns) — general modding guidance
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
