# Crafting & Cooking System

DayZ's item-transformation pipeline has two distinct halves that share no base class:

1. **Crafting** — two ingredients combine into a result via **script-declared recipe plugins** (`RecipeBase`). Registered on the server, matched on the client, executed server-side. Covers fireplaces, torches, sawing, painting, preparing, decrafting (~110 recipes).
2. **Cooking** — food progresses through **config-defined food stages** (`FoodStage`) driven by a heat source. `Cooking` ticks on a `FireplaceBase` and mutates the `FoodStage` of `Edible_Base` items.

Both ultimately go through the [User Actions System](./user-actions-system) for the player-input side.

**Primary locations**:
- `P:/scripts/4_world/classes/craftingmanager.c` — client orchestrator
- `P:/scripts/4_world/classes/recipes/` — `RecipeBase` plugin system (~170 files)
- `P:/scripts/4_world/classes/cooking/` — `Cooking` class + fire-consumable model
- `P:/scripts/4_world/classes/foodstage/foodstage.c` — food stage state machine
- `P:/scripts/4_world/entities/itembase/edible_base.c` — food item base class
- `P:/scripts/4_world/entities/itembase/fireplacebase.c` — owns the cooking loop
- `DZ/gear/food/config.cpp` — `FoodStages` / `FoodStageTransitions` config data

> **See also**: [User Actions System](./user-actions-system) (`ActionWorldCraft`), [Inventory System](./inventory-system), [Player Modifiers & Symptoms](./modifiers-symptoms-system) (food agents/nutrition), [Crafting & Cooking](/world-gameplay/crafting-cooking) (gameplay overview), [Food Stages](/world-gameplay/food-stages) (config transitions).

---

## Mental Model

```
CRAFTING                                  COOKING
────────────────                          ────────────────
player picks 2 items                      player puts food on fire
   │                                         │
   ▼                                         ▼
CraftingManager.OnUpdate (CLIENT)         FireplaceBase heating tick
   │  GetValidRecipes → match plugins        │  CookWithEquipment / CookOnDirectSlot
   ▼                                         ▼
ActionWorldCraft (User Actions System)    Cooking.UpdateCookingState
   │  animation + server RPC                 │  temp up, cooking-time accumulator
   ▼                                         ▼
PluginRecipesManager.PerformRecipeServer  Edible_Base.ChangeFoodStage
   │  CheckRecipe + sanity                   │  → FoodStage.ChangeFoodStage
   ▼                                         ▼
RecipeBase.PerformRecipe                  OnFoodStageChange
   │  SpawnItems → ApplyModifications        │  remove agents, swap visuals
   ▼                                         ▼
result spawned, ingredients consumed      RAW → BAKED → BURNED (etc.)
```

---

## Crafting — The Recipe Plugin System

### Architecture split

| Component | Side | Role |
|-----------|------|------|
| `CraftingManager` | **Client only** | Recipe matching, UI/variant setup, action triggering |
| `PluginRecipesManager` | **Server** | Recipe registry, validation, execution |
| `RecipeBase` plugins | **Server** | One class per recipe — declares ingredients/results, optionally customizes `Do` |
| `CacheObject` | Server | Per-item-type recipe-ID cache for fast lookup |

`CraftingManager` does **not** execute recipes — its header is explicit: *"Client only - manage set up crafting on client"*.

### `RecipeBase` contract (`recipes/recipebase.c`)

Constants: `MAX_NUMBER_OF_INGREDIENTS = 2`, `MAXIMUM_RESULTS = 10`.

The overridable plugin contract:

| Hook | When |
|------|------|
| `void Init()` `:88` | **Abstract** — declare ingredients, results, conditions |
| `bool CanDo(ItemBase ingredients[], PlayerBase player)` `:551` | Final custom validity check (default: rejects ingredients with attachments) |
| `void Do(ItemBase ingredients[], PlayerBase player, array<ItemBase> results, float specialty_weight)` `:563` | Custom side-effects on completion |
| `void OnSelected(ItemBase, ItemBase, PlayerBase)` `:515` | When player picks this recipe |

Engine methods you don't override:
- `CheckIngredientMatch` `:115` — matches items to slots via `IsKindOf`
- `CheckConditions` `:429` — validates quantity/damage ranges
- `CheckRecipe` `:479` — combines `IsRecipeAnywhere` + `CanDo` + `CheckConditions`
- `PerformRecipe` `:521` — the full execution sequence (see below)

### `RecipeBase` data fields (set in `Init()`)

Per ingredient `[0..1]`:
- `m_Ingredients[2]` — `array<string>` of candidate classnames per slot
- `m_MinQuantityIngredient` / `m_MaxQuantityIngredient`
- `m_MinDamageIngredient` / `m_MaxDamageIngredient`
- `m_IngredientDestroy` / `m_IngredientAddHealth` / `m_IngredientAddQuantity`

Per result `[0..9]`:
- `m_ItemsToCreate[10]`, `m_NumberOfResults`
- `m_ResultSetQuantity` / `m_ResultSetHealth`
- `m_ResultInheritsHealth` (`-2` = average of ingredients)
- `m_ResultInheritsColor` (classname suffix)
- `m_ResultReplacesIngredient` (transfer attachments/cargo)
- `m_ResultToInventory` (`-1` = inventory, `-2` = ground)

Recipe-level:
- `m_IsInstaRecipe` (no animation, fires RPC instantly)
- `m_AnywhereInInventory`, `m_Specialty`, `m_AnimationLength`

### Concrete example: `CraftFireplace` (`recipes/recipes/craftfireplace.c`)

```c
override void Init() {
    m_IsInstaRecipe = false;
    // ingredient 0 candidates
    InsertIngredient(0, "WoodenStick"); ...
    // ingredient 1 candidates
    InsertIngredient(1, "Rag"); ...
    AddResult("Fireplace");
    m_ResultInheritsHealth[0] = -2;   // average of ingredients
    m_ResultToInventory[0]   = -2;    // spawn on ground
}

override bool CanDo(ItemBase ingredients[], PlayerBase player) {
    return ingredients[0].GetType() != ingredients[1].GetType();  // not same item
}

override void Do(ItemBase ingredients[], PlayerBase player,
                 array<ItemBase> results, float specialty_weight) {
    // custom: move ingredients into the new fireplace as attachments
    // rather than destroying them
}
```

This shows the pattern: **config-style fields are set in `Init()`, but anything beyond simple spawn/destroy is done in `Do()`**.

### Recipe registration — `PluginRecipesManagerBase.RegisterRecipies()` (`recipes/recipes/pluginrecipesmanagerbase.c:8`)

A hardcoded list of `RegisterRecipe(new CraftXxx)` calls (~110 active recipes; many `paint*` commented out). The `Ingredient` enum (`:1`): `FIRST=1, SECOND=2, BOTH=3`.

### Server-side manager — `PluginRecipesManager` (`plugins/pluginbase/pluginrecipesmanager.c`)

Storage: `ref array<ref RecipeBase> m_RecipeList` (`:42`, indexed by ID), `MAX_NUMBER_OF_RECIPES` (`:19`), `MAX_CONCURENT_RECIPES = 128` (`:20`).

Key methods:

| Method | Purpose |
|--------|---------|
| `RegisterRecipe` `:436` | Insert into `m_RecipeList`, assign ID |
| `GenerateRecipeCache` `:173` / `WalkRecipes` `:212` / `MatchItems` `:256` | Build per-item-type `CacheObject` by walking CfgVehicles/Weapons/Magazines against each recipe's ingredient lists |
| `GetValidRecipes(item1, item2, ids, player)` `:86` → `GetValidRecipesProper` `:105` | Cache intersection + `RecipeBase.CheckRecipe` per candidate |
| `PerformRecipeServer(id, item_a, item_b, player)` `:310` | Re-sort ingredients, `CheckRecipe` + `RecipeSanityCheck`, call `RecipeBase.PerformRecipe` |
| `IsRecipePossibleToPerform` `:289` | `CheckRecipe` + sanity (used by the action's per-tick re-validation) |
| `GetIsInstaRecipe` `:145` / `GetRecipeLengthInSecs` `:133` / `GetRecipesForItem` `:386` | |

`RecipeSanityCheck` (ownership + `< 5m` proximity; `ACCEPTABLE_DISTANCE = 5`, `:8`) is the anti-cheat gate.

> **Note on data loading:** There is **no JSON/XML recipe loader** for crafting recipes. They are purely script-declared via `Init()`. (`JsonFileLoader` exists in `3_game/tools/` but the recipe system doesn't use it.)

---

## Cooking — The Heat-Driven Pipeline

### `CookingMethodType` enum (`cooking.c:1`)

| Value | Name | Source |
|-------|------|--------|
| 0 | `NONE` | — |
| 1 | `BAKING` | Dry heat (fireplace, stick, empty cookware) |
| 2 | `BOILING` | Liquid in pot/cauldron |
| 3 | `DRYING` | Gasoline / smoking slot |
| 4 | `TIME` | Time-only (decay) |

> **There is no explicit BURNING method** — burning is the implicit fallback when a food has no further valid transition (`GetNextFoodStageType` returns `BURNED`, `foodstage.c:474`).

### `Cooking` class (`cooking.c:12`)

Key constants:
- `DEFAULT_COOKING_TEMPERATURE = 150` (`:22`), `FOOD_MAX_COOKING_TEMPERATURE = 150` (`:23`)
- `COOKING_FOOD_TIME_INC_VALUE = 2` (`:17`) — cooking-time increment per tick
- `COOKING_LARD_DECREASE_COEF = 25` (`:18`)
- `TIME_WITH_SUPPORT_MATERIAL_COEF = 1.0` vs `WITHOUT = 2.0` (`:14-15`) — lard/liquid speeds cooking
- Equipment typenames: `Pot`, `FryingPan`, `Cauldron`, ingredient `Lard` (`:32-35`)

Key methods:

| Method | Purpose |
|--------|---------|
| `CookWithEquipment(ItemBase cooking_equipment, float cooking_time_coef = 1)` `:117` | Pot/pan/cauldron path; decides method via `GetCookingMethodWithTimeOverride`, processes each cargo item |
| `CookOnStick(Edible_Base item, float cook_time_inc)` `:184` | Stick path (gate `CanBeCookedOnStick`) |
| `ProcessItemToCook(...)` `:44` | Per-item dispatcher — `CanBeCooked()` → `UpdateCookingState`; else overheating (qty loss, damage, agent removal) |
| `UpdateCookingState(...)` `:196` | **Core loop** — next stage, temp, time accumulator, stage transition |
| `UpdateCookingStateOnStick(...)` `:283` | Stick variant (always `BAKING`) |
| `SmokeItem(Edible_Base, float)` `:344` | Smoking slot — RAW→DRIED, else→BURNED |
| `GetCookingMethodWithTimeOverride` `:430` | Decides method from equipment state (gasoline→DRYING, liquid→BOILING, lard→BAKING-fast, empty→BAKING-slow) |
| `AddTemperatureToItem` `:486` | Drives heat via `GetCookingTargetTemperature`; applies `TemperatureDataInterpolated` with `ACCESS_COOKING` |

### `UpdateCookingState` — the core tick (`cooking.c:196`)

```c
new_stage_type = item.GetNextFoodStageType(cooking_method);           // :203
food_properties = FoodStage.GetAllCookingPropertiesForStage(          // :212
    new_stage_type, null, type);  // {min_temp, cook_time, max_temp}
AddTemperatureToItem(item, equip, coef);                              // :219

if (food_temperature >= food_min_temp) {                              // :226
    SetCookingTime(GetCookingTime() + COOKING_FOOD_TIME_INC_VALUE * coef);  // :231
    if (GetCookingTime() >= food_time_to_cook) {                      // :235
        item.ChangeFoodStage(new_stage_type);                         // :240
        // quantity decrease unless lard present (:246-265)
        ResetCookingTime();                                           // :269
    }
}
```

---

## FoodStage — The State Machine

File: `foodstage/foodstage.c`. Single class `FoodStage` (no separate base).

### `FoodStageType` enum (`:1`)

| Value | Name |
|-------|------|
| 0 | `NONE` |
| 1 | `RAW` |
| 2 | `BAKED` |
| 3 | `BOILED` |
| 4 | `DRIED` |
| 5 | `BURNED` |
| 6 | `ROTTEN` |

### `eCookingPropertyIndices` (`:15`): `MIN_TEMP=0, COOK_TIME=1, MAX_TEMP=2`

### Data model — config-backed, cached in static maps

- `m_EdibleBasePropertiesMap` (`:59`): `<foodTypeHash, <stageNameHash, <propertiesIdxHash, array<float>>>>` — visual/nutrition/cooking properties
- `m_EdibleBaseTransitionsMap` (`:61`): `<foodTypeHash, <stageNameHash, <transitionClassHash, [transition_to, cooking_method]>>>` — the **transition rule table**
- `m_FoodStageTransitionKeys` (`:63`): all known transition class hashes (including modded)

### Construction & cache fill

Constructor `FoodStage(Edible_Base)` (`:66`):
- `SetupFoodStageMapping()` (`:90`) — reads config `CfgVehicles <type> Food FoodStages <Stage> {visual_properties, nutrition_properties, cooking_properties}`
- `SetupFoodStageTransitionMapping()` (`:93`) — reads `CfgVehicles <type> Food FoodStageTransitions <Stage> <TransitionClass> {transition_to, cooking_method}`
- `ChangeFoodStage(RAW)`

### Transition logic — how food burns

- `CanChangeToNewStage(CookingMethodType)` (`:437`) — true if `GetNextFoodStageType != NONE`
- `GetNextFoodStageType(CookingMethodType)` (`:448`) — looks up the transitions map for the current stage, returns the `transition_to` whose `cooking_method` matches
- **If no match → returns `FoodStageType.BURNED`** (`:474`) — this is how food burns

`ChangeFoodStage(FoodStageType)` (`:506`) → `SetFoodStageType` (`:204`) → `OnFoodStageChange` (`:511`) → `m_FoodItem.OnFoodStageChange(stageOld, stageNew)` (`:521`).

`UpdateVisualsEx` (`:524`) swaps hidden selection/texture/material based on `visual_properties`.

Nutrition accessors (static, `:244+`): `GetFullnessIndex`(0), `GetEnergy`(1), `GetWater`(2), `GetNutritionalIndex`(3), `GetToxicity`(4), `GetAgents`(5), `GetDigestibility`(6), `GetAgentsPerDigest`(7).

Serialization: `OnStoreSave`/`OnStoreLoad` (`:681-727`) persist stage type + selection/texture/material indices.

### Transition rule format (config)

Each food's config lists transition classes per stage, each with `transition_to` (a `FoodStageType` int) and `cooking_method` (a `CookingMethodType` int). Example for meat:

```
RAW  + BAKING → BAKED
RAW  + BOILING → BOILED
BAKED + BAKING → BURNED   (no further transition defined → burns)
```

See [Food Stages](/world-gameplay/food-stages) for the full config transition table.

---

## Food Class Hierarchy — `Edible_Base`

File: `entities/itembase/edible_base.c` (~1111 lines). `class Edible_Base : ItemBase` (`:1`). Concrete foods (`apple.c`, `cowsteakmeat.c`, `bottle_base.c`, `carp.c`, …) extend it.

State:
- `ref FoodStage m_FoodStage` (`:17`)
- `m_DecayTimer`, `m_DecayDelta`, `m_LastDecayStage` (`:18-20`) — decay/rot progression
- `m_MakeCookingSounds` (`:13`)

Constructor (`:25`): if `HasFoodStage()`, creates `m_FoodStage = new FoodStage(this)` and registers net-sync vars: `m_FoodStage.m_FoodStageType` (range NONE..COUNT) and `m_FoodStage.m_CookingTime` (`:31-32`) — so **food stage and cooking progress replicate to clients**.

Key methods:

| Method | Purpose |
|--------|---------|
| `CanBeCooked()` `:129` / `CanBeCookedOnStick()` `:134` | Opt-in gates (default `false`) |
| `ChangeFoodStage(FoodStageType)` `:598` | Delegates to `m_FoodStage` |
| `GetNextFoodStageType` / `CanChangeToNewStage` `:603,613` | Delegate |
| `TransferFoodStage(Edible_Base source)` `:619` | Copy stage + decay (used when splitting/combining) |
| `OnFoodStageChange(stageOld, stageNew)` `:630` | `HandleFoodStageChangeAgents` (`:637`) then visuals |
| `GetCookingTime/SetCookingTime/ResetCookingTime` `:657-674` | Delegate |

`OnFoodStageChange` → `HandleFoodStageChangeAgents` (`:637`): BAKED/BOILED/DRIED/BURNED **remove all agents except BRAIN/HEAVYMETAL** (cooking kills disease — see [Modifiers & Symptoms](./modifiers-symptoms-system)).

Decay logic (`:798-903`) transitions food to `ROTTEN` or `DRIED` over time based on `m_DecayTimer`.

---

## End-to-End: Cooking (Raw Meat on a Stick over a Fire)

Stick cooking uses the **direct-cooking-slot attachment** path:

```
1. ATTACHMENT
   Edible attached to long stick → attached to fireplace on DirectCookingA/B/C slot
   FireplaceBase.EEItemAttached (slot tracking) → m_DirectCookingSlots[i]    fireplacebase.c:101,241

2. HEATING TICK  (FireplaceBase timer)
   if (DirectCookingSlotsInUse())                                         fireplacebase.c:1888
      for each m_DirectCookingSlots[i]:
         CookOnDirectSlot(item, itemTemp, fireTemp)                       fireplacebase.c:2151

3. CookOnDirectSlot
   m_CookingProcess = new Cooking()  (lazy)                               fireplacebase.c:2154
   m_CookingProcess.CookWithEquipment(slot_item)                          fireplacebase.c:2156

4. Cooking.CookWithEquipment → ProcessItemToCook                          cooking.c:117,44
   item.CanBeCooked()?  → UpdateCookingState(item, method, equip, coef)   cooking.c:50

5. UpdateCookingState                                                      cooking.c:196
   new_stage = item.GetNextFoodStageType(BAKING)  → BAKED                 cooking.c:203
   {min_temp, cook_time} = FoodStage.GetAllCookingPropertiesForStage(...)  cooking.c:212
   AddTemperatureToItem(...)                                              cooking.c:219
   if (food_temp >= min_temp):                                            cooking.c:226
      SetCookingTime(+COOKING_FOOD_TIME_INC_VALUE * coef)                 cooking.c:231
      if (cooking_time >= time_to_cook):                                  cooking.c:235
         item.ChangeFoodStage(BAKED)                                      cooking.c:240
         (quantity decrease unless lard)                                  cooking.c:246

6. ChangeFoodStage                                                         edible_base.c:598
   → FoodStage.ChangeFoodStage(BAKED)                                     foodstage.c:506
   → SetFoodStageType → OnFoodStageChange                                 foodstage.c:204,511
   → Edible_Base.OnFoodStageChange                                        edible_base.c:630
      → HandleFoodStageChangeAgents (remove contaminants)                 edible_base.c:637
      → UpdateVisualsEx (swap texture/selection)                          foodstage.c:524

7. NEXT STAGE
   BAKED meat: GetNextFoodStageType(BAKING) → BURNED (no transition)      foodstage.c:474
   After another cook-time interval → BURNED
   Net-sync updates client; visuals swap to burned texture
```

**Parallel paths on the same fireplace:**
- **Pot on tripod**: `if (HasCookingStand() && m_CookingEquipment) CookWithEquipment()` (`fireplacebase.c:1881`)
- **Smoking slot**: `SmokeOnSmokingSlot` → `Cooking.SmokeItem`: RAW→DRIED, else→BURNED (`cooking.c:344`)

---

## End-to-End: Crafting (Combine Two Items)

```
1. PLAYER INPUT
   Player has item1 in hands, targets item2 (world)
      OR drags one onto the other in inventory
   ActionVariantManager → CraftingManager.OnUpdate(item, target, idx)      craftingmanager.c:69

2. RECIPE MATCHING (CLIENT)
   PluginRecipesManager.GetValidRecipes(item1, item2, m_recipes, player)   craftingmanager.c:111
      → GetValidRecipesProper                                             pluginrecipesmanager.c:105
      → cache intersection + RecipeBase.CheckRecipe per candidate          pluginrecipesmanager.c:123
   Valid IDs → m_recipes; variant count set                                craftingmanager.c:129

3. ACTION START
   ActionWorldCraft (continuous action, CMD_ACTIONFB_CRAFTING)             actionworldcraft.c:34
   SetupAction reads recipeID from CraftingManager                         actionworldcraft.c:126
   ActionConditionContinue re-validates each tick via
      IsRecipePossibleToPerform (CheckRecipe + sanity)                     pluginrecipesmanager.c:289

4a. INSTANT PATH  (m_IsInstaRecipe == true)
   Client sends RPC_CRAFTING_INVENTORY_INSTANT                             craftingmanager.c:147
   → PlayerBase handler                                                    playerbase.c:5463
   → PerformRecipeServer(...)                                              playerbase.c:5467

4b. NORMAL PATH  (animation completes)
   ActionWorldCraft.OnFinishProgressServer                                 actionworldcraft.c:170
   → module_recipes_manager.PerformRecipeServer(recipeID, item1, item2)    actionworldcraft.c:187

5. SERVER EXECUTION
   PluginRecipesManager.PerformRecipeServer                                pluginrecipesmanager.c:310
      SortIngredientsInRecipe                                              pluginrecipesmanager.c:321
      CheckRecipe + RecipeSanityCheck (ownership + <5m proximity)          pluginrecipesmanager.c:323,324
      RecipeBase ptrRecipe = m_RecipeList[id]                              pluginrecipesmanager.c:336
      ptrRecipe.PerformRecipe(item_a, item_b, player)                      pluginrecipesmanager.c:337

6. RecipeBase.PerformRecipe                                                recipebase.c:521
   SpawnItems                                                              recipebase.c:532,215
      m_ResultToInventory == -1 → CreateInInventory                        recipebase.c:242
      else → SpawnEntityOnGroundRaycastDispersed                           recipebase.c:257
   ApplyModificationsResults                                               recipebase.c:534,268
      set quantity/health; ResultInheritsHealth (-2=avg); ResultInheritsColor
      ResultReplacesIngredient (TransferItemProperties + TransferInventory) recipebase.c:344-357
   ApplyModificationsIngredients                                           recipebase.c:535,373
      m_IngredientDestroy → queue delete; else apply deltas
   Do(...)  ← plugin custom logic                                          recipebase.c:537
   DeleleIngredientsPass()                                                 recipebase.c:539
```

---

## Integration Points

### Cooking ↔ Fireplace

`FireplaceBase` (`entities/itembase/fireplacebase.c`) owns the cooking loop. It holds:
- `m_CookingEquipment` (pot/pan on the `CookingEquipment` slot)
- `m_DirectCookingSlots[3]` (`:101`)
- `m_SmokingSlots` (`:102`)
- A lazily-created `Cooking m_CookingProcess`

Slot population in `EEItemAttached`/`EEItemDetached` (cases `"DirectCookingA/B/C"`, `"CookingEquipment"`, smoking slots — `:241-317`). The heating tick (`:1880-1911`) dispatches to `CookWithEquipment()` / `CookOnDirectSlot()` / `SmokeOnSmokingSlot()` (`:2135-2168`).

Concrete fireplaces extend `FireplaceBase`: `fireplace.c`, `fireplaceindoor.c`, `barrelholes_colorbase.c`, `ovenindoor.c` — overriding attachment/visual rules.

### User Actions System ↔ Crafting

`ActionWorldCraft` (`actionworldcraft.c:34`, continuous action, `CMD_ACTIONFB_CRAFTING`) is the bridge, using `CAContinuousCraft` for timing. The `ActionVariantManager` lets the player cycle recipes; `m_VariantID` maps to a recipe via `CraftingManager.GetRecipeID`. `RPC_CRAFTING_INVENTORY_INSTANT` (`craftingmanager.c:147` → `playerbase.c:5463`) handles instant inventory crafts. Specialized single-purpose actions (`actioncraft.c`, `actioncraftboneknife.c`, …) bypass the generic combine for specific recipes.

### Inventory ↔ Item Transformation

Results spawn via `Inventory.CreateInInventory` / `PlayerBase.SpawnEntityOnGroundRaycastDispersed` (`recipebase.c:242,257`). `ResultReplacesIngredient` uses `MiscGameplayFunctions.TransferItemProperties` + `TransferInventory` to move attachments/cargo from a consumed ingredient into the result (`recipebase.c:353-355`). Food-stage preservation across splits uses `Edible_Base.TransferFoodStage` (`edible_base.c:619`).

---

## Directory Structure

```
classes/
├── craftingmanager.c            CLIENT orchestrator (recipe matching, action setup)
├── recipes/
│   ├── recipebase.c             RecipeBase root (Init/CanDo/Do/PerformRecipe)
│   ├── cacheobject.c            Per-item-type recipe-ID cache
│   ├── pluginrecipesmanagerbase.c   RegisterRecipies() hardcoded list + Ingredient enum
│   └── recipes/                 ~170 concrete recipe plugins
│        ├── craftfireplace.c crafttorch.c craftbandana.c …
│        ├── decraft*.c  sawoff*.c  paint*.c  prepare*.c
│        └── pluginbase/pluginrecipesmanager.c   Server manager (4_world/plugins/pluginbase/)
├── cooking/
│   ├── cooking.c                Cooking class + CookingMethodType enum
│   ├── fireconsumable.c         FireConsumable (item + energy)
│   └── fireconsumabletype.c     FireConsumableType (typename, energy, isKindling)
└── foodstage/
    └── foodstage.c              FoodStage state machine + FoodStageType enum

entities/itembase/
├── edible_base.c                Edible_Base : ItemBase (food items)
└── fireplacebase.c              FireplaceBase (owns the cooking loop)
```

---

## Related Documentation

- [User Actions System](./user-actions-system) — `ActionWorldCraft` drives the crafting animation/RPC
- [Inventory System](./inventory-system) — item spawning, attachment transfer
- [Player Modifiers & Symptoms](./modifiers-symptoms-system) — food agents (disease), nutrition, stomach/digestion
- [Crafting & Cooking](/world-gameplay/crafting-cooking) — gameplay-facing overview
- [Food Stages](/world-gameplay/food-stages) — config transition tables
- [Data Config → Gear & Items](/data-config/gear-items) — item config including food
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
