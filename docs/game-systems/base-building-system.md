# Base Building System

DayZ's base building lets players deploy kit items from inventory into world entities (fences, watchtowers, shelters, tents), then progressively construct them part-by-part by attaching materials and using tools. The system is **config-driven**: the part list, required materials, build prerequisites, collision rules, and tool matching are all read from the `cfgVehicles` config tree — the scripts just provide the lifecycle framework.

**Primary locations**:
- `P:/scripts/4_world/entities/itembase/basebuildingbase.c` — root buildable entity (`BaseBuildingBase`)
- `P:/scripts/4_world/classes/basebuilding/construction.c` — the part/stage/material engine (`Construction`)
- `P:/scripts/4_world/classes/basebuilding/constructionpart.c` — per-part data (`ConstructionPart`)
- `P:/scripts/4_world/classes/basebuilding/constructionactiondata.c` — per-player part-variant state
- `P:/scripts/4_world/classes/hologram.c` — placement preview
- `P:/scripts/4_world/entities/itembase/kitbase.c` — inventory kit form (`KitBase`)
- `P:/scripts/4_world/entities/itembase/basebuildingbase/fence.c`, `watchtower.c`, `sheltersite.c` — concrete buildables
- `P:/scripts/4_world/entities/itembase/fencekit.c`, `watchtowerkit.c`, … — concrete kits

> **See also**: [User Actions System](./user-actions-system) (build/dismantle/place actions), [Inventory System](./inventory-system) (attachment slots, locks), [Damage & Combat](./damage-combat), [Base Building](/world-gameplay/base-building) (gameplay overview).

---

## Mental Model

A buildable structure has a **dual life**: a portable **kit** in inventory (`KitBase`) and a fixed **world entity** (`BaseBuildingBase`) once deployed. The kit spawns the structure on placement then deletes itself; the structure can fold back to a kit.

The world entity owns a `Construction` helper object that reads the config tree, manages all **construction parts** (walls, floors, gates), checks build prerequisites (`required_parts`, `conflicted_parts`), consumes **materials** (attachments like planks/nails), and shows/hides the corresponding animation selections + proxy physics.

```
KitBase (inventory)  ──deploy──►  BaseBuildingBase (world entity)
   │                                    │ owns
   │                                    ▼
   │                              Construction
   │                                │ reads config
   │                                ▼
   │                         map<partName, ConstructionPart>
   │                                │ gates build
   │                                ▼
   │                         required_parts / conflicted_parts / Materials
   │
   ◄──────────fold─────────────────  (if no base + no attachments)
```

The player interacts through the [User Actions System](./user-actions-system): `ActionTogglePlaceObject` (enter placing mode) → `ActionDeployObject` (commit placement) → `ActionAttachToConstruction` (add materials) → `ActionBuildPart` (construct a part) → `ActionDismantlePart` (reverse).

---

## Class Hierarchy

```
Object → EntityAI → ItemBase
   ├── BaseBuildingBase                         basebuildingbase.c
   │     ├── Fence                              basebuildingbase/fence.c
   │     ├── Watchtower                         basebuildingbase/watchtower.c
   │     ├── ShelterSite                        basebuildingbase/sheltersite.c
│     ├── TerritoryFlag                      basebuildingbase/totem.c
│     └── StaticFlagpole                     basebuildingbase/staticflagpole.c  (extends TerritoryFlag)
   ├── KitBase                                  kitbase.c  (IsBasebuildingKit() = true)
   │     ├── FenceKit                           fencekit.c
   │     ├── WatchtowerKit                      watchtowerkit.c
   │     └── ShelterKit, TotemKit …
   └── TentBase                                 tentbase.c  (reuses the deploy/placing pipeline)
```

`BaseBuildingBase extends ItemBase` — so a buildable **is** an inventory-capable entity, but it overrides portability to make itself fixed once deployed:
- `IsTakeable()` → `false` (`basebuildingbase.c:1008`)
- `CanPutInCargo` / `CanRemoveFromCargo` → `false` (`:1014, 1019`)
- `CanPutIntoHands` → `false` (`:1025`; `Fence` re-allows only when `!HasBase()`, `fence.c:406`)

---

## `BaseBuildingBase` — The World Entity

A buildable owns a `Construction` helper (`:8`) and exposes it via `GetConstruction()` (`:975`). The visual model contains many animation "phases" (selections) — one per part (e.g. `wall_base_down`, `wall_wood_up`). A part is "built" by showing its selection and adding proxy physics; unbuilt parts are hidden.

### Synced state

| Field | Purpose |
|-------|---------|
| `bool m_HasBase` | Whether the foundation/base part exists (`:10`) |
| `int m_SyncParts01/02/03` | Three bitmasks (31 bits each) = up to **93 construction parts** tracked for sync/persistence (`:12-14`) |
| `int m_InteractedPartId`, `m_PerformedActionId` | Last action performed on a part, so clients can play a sound (`:15-16`) |

Registered for net sync in the constructor (`:44-49`); persisted in `OnStoreSave`/`OnStoreLoad` (`:420-464`). `RegisterPartForSync`/`UnregisterPartForSync` (`:148-204`) set/clear bits by part id; `IsPartBuildInSyncData` (`:206`) reads them.

### Construction lifecycle events (server → client)

| Event | File:line | Effect |
|-------|-----------|--------|
| `OnPartBuiltServer(player, part_name, action_id)` | `:587` | Registers part bit, sets base state if it's the base part (+ spawns kit drop via `CreateConstructionKit()`), updates navmesh/visuals |
| `OnPartBuiltClient` | `:620` | Plays build sound |
| `OnPartDismantledServer` | `:627` | Clears the bit; if it's the base part → schedules `DestroyConstruction()` (deletes the whole entity) (`:656`) |
| `OnPartDestroyedServer` | `:667` | Same as dismantle but triggered by damage (`EEHealthLevelChanged` `:496-528` when a zone reaches `STATE_RUINED`, cascading to `DestroyConnectedParts`) |

---

## `Construction` & `ConstructionPart` — The Part/Stage Engine

`Construction` (`construction.c:11`) is **not an entity** — it's a plain helper object owned by `BaseBuildingBase`. At init it reads the config tree `cfgVehicles <type> Construction` (`UpdateConstructionParts` `:235-270`) and builds a `map<string, ref ConstructionPart>`.

### `ConstructionPart` fields (`constructionpart.c`)

| Field | Purpose |
|-------|---------|
| `m_Name` | Localized display name |
| `m_Id` | Unique id 1..93, used for sync bits |
| `m_PartName` | Config class name (e.g. `wall_base_down`) |
| `m_MainPartName` | Parent config group (used to resolve which group of parts the player is aiming at) |
| `m_IsBuilt` | Current built state |
| `m_IsBase` | True for the foundation (dismantling it destroys the whole structure) |
| `m_IsGate` | Gate-specific part |
| `m_RequiredParts` | Parts that must already be built before this one |

### No hard-coded "stage enum"

Stages are entirely **config-driven** via `required_parts` / `conflicted_parts` arrays and the `is_base` flag. Progression is enforced by:

- `HasRequiredPart(part_name)` (`construction.c:412`) — every part in `required_parts` must be built
- `HasConflictPart` (`:438`) — none of `conflicted_parts` may be built (e.g. wood wall vs metal wall are mutually exclusive)
- `HasDependentPart` (`:479`) — blocks dismantling a part that something else still depends on

### The master build gate — `CanBuildPart` (`construction.c:296`)

```
!IsPartConstructed
  && HasRequiredPart
  && !HasConflictPart
  && HasMaterials
  && (!use_tool || CanUseToolToBuildPart)
  && !MaterialIsRuined
```

### Material type enum (`construction.c:1`)

```c
enum ConstructionMaterialType {
    MATERIAL_NONE = 0, MATERIAL_LOG = 1, MATERIAL_WOOD = 2,
    MATERIAL_STAIRS = 3, MATERIAL_METAL = 4, MATERIAL_WIRE = 5
}
```

Read from config `material_type` per part (`GetMaterialType` `:1005`); only used to pick the build/dismantle sound in `BaseBuildingBase.GetBuildSoundByMaterial` (`basebuildingbase.c:1193`).

### Action-type IDs (plain `const int`, `_constants.c:6-8`)

```c
const int AT_BUILD_PART     = 193;
const int AT_DISMANTLE_PART = 195;
const int AT_DESTROY_PART   = 209;
```

Tool-vs-part matching uses config bitmasks `build_action_type` / `dismantle_action_type` (`CanUseToolToBuildPart` `construction.c:959-980` bitwise-ANDs the part's config value with the tool's config value).

### Build / Dismantle / Destroy server entry points

| Method | File:line | Effect |
|--------|-----------|--------|
| `BuildPartServer(player, part_name, action_id)` | `:75` | Resets damage-zone health, `TakeMaterialsServer` (consumes/locks attachments), destroys collision trigger, → `GetParent().OnPartBuiltServer(...)` |
| `DismantlePartServer` | `:98` | `ReceiveMaterialsServer` (spawns material piles back), `DropNonUsableMaterialsServer`, → `OnPartDismantledServer` |
| `DestroyPartServer` | `:121` | `DestroyMaterialsServer` + drop + `OnPartDestroyedServer` |
| `DestroyConnectedParts` | `:141` | Recursively destroys parts that depended on a destroyed part |

### Materials handling (the heart of build requirements)

All config-driven via `cfgVehicles <type> Construction <main_part> <part> Materials`. For each material entry it reads `slot_name`, `quantity`, `lockable`:

| Method | File:line | Behavior |
|--------|-----------|----------|
| `HasMaterials` | `:617` | Checks each slot has an attachment with enough quantity |
| `TakeMaterialsServer` | `:671` | If `lockable`, **locks the slot** (plank/nail becomes a permanent visible part); else subtracts quantity, or deletes the object when `quantity == -1` |
| `ReceiveMaterialsServer` | `:726` → `StaticConstructionMethods.SpawnConstructionMaterialPiles` `:1233` | On dismantle, drops material piles; quantity reduced by `DECONSTURCT_MATERIAL_LOSS = 0.2` (`:14`) scaled by health level — **dismantling returns materials, at a ~20%+ damage loss** |
| `SetLockOnAttachedMaterials` | `:911` | Failsafe to keep lockable materials locked |

### Visuals & physics

| Method | File:line | Effect |
|--------|-----------|--------|
| `ShowConstructionPart` / `HideConstructionPart` | `:578-588` | `SetAnimationPhase(part_name, 0/1)` |
| `ShowConstructionPartPhysics` / `Hide...` | `:591-599` | `AddProxyPhysics` / `RemoveProxyPhysics` |

### Collision check when building

`IsColliding` (`:1021`) and `IsCollidingEx(CollisionCheckData)` (`:1070`) — reads `collision_data` memory-point names from config, builds a box, calls `GetGame().IsBoxCollidingGeometry(...)`, ignoring objects where `IsIgnoredByConstruction()` is true (`basebuildingbase.c:1170` returns true for buildables themselves).

---

## Hologram — Placement Preview

`class Hologram` (`hologram.c:1`) is a plain class (not an entity). It holds:
- `m_Parent` (the ItemBase being placed), `m_Player`, `m_Projection` (the ghost EntityAI shown in-world), `m_ProjectionTrigger` (`ProjectionTrigger` at `:1570`, detects if a player is standing inside the projection)

### Projection creation

Constructor (`:68`): creates the projection entity from `ProjectionBasedOnParent()` (`:217`). For kits/tents this appends `"Placing"` to the type name (`:241`: `item.GetType() + "Placing"` when `IsInherited(TentBase) || IsBasebuildingKit()`). The projection is given an `_deployable.rvmat`/`_undeployable.rvmat` material so it **turns red when invalid** (`RefreshVisual` `:1497`, `CorrectMaterialPathName` `:1521`).

### Update loop — `UpdateHologram(timeslice)` (`:256`)

1. `SetProjectionPosition(GetProjectionEntityPosition(...))` (`:282`) — positions the ghost
2. `SetProjectionOrientation(AlignProjectionOnTerrain(...))` (`:283`) — aligns to ground normal if `m_AlignToTerrain` (config `alignHologramToTerain`)
3. `EvaluateCollision()` (`:285`) — runs the validity checks
4. `RefreshTrigger()`, `CheckPowerSource()`, `RefreshVisual()`
5. `m_Projection.OnHologramBeingPlaced(m_Player)`

### Position computation — `GetProjectionEntityPosition` (`:1087`)

Raycasts from the camera along look direction; clamps distance to `[projectionRadius, 2*radius]` (capped at `LARGE_PROJECTION_DISTANCE_LIMIT = 6`); special-cases watchtower trigger boxes (`CorrectForWatchtower` `:1219`).

### Validity checks — all combined in `EvaluateCollision` (`:432`)

| Check | File:line | Rule |
|-------|-----------|------|
| `IsCollidingBBox` | `:540` | `IsBoxCollidingGeometry` (excludes projection + player + action item) |
| `IsCollidingPlayer` | `:1337` | Set by `ProjectionTrigger.OnEnter` when a player overlaps |
| `IsClippingRoof` | `:475` | Blocks placing on the underside of floors / above camera |
| `IsBaseViable` | `:587` | Four corner raycasts; requires intact + static + flat surface |
| `IsCollidingAngle` | `:507` | Pitch/roll within config `yawPitchRollLimit` |
| `IsPlacementPermitted` | `:807` | → `m_Parent.CanBePlaced(...)` |
| `HeightPlacementCheck` | `:821` | Within `DEFAULT_MAX_PLACEMENT_HEIGHT_DIFF = 1.5` m of player |
| `IsUnderwater` / `IsInTerrain` / `IsCollidingGPlot` / `IsCollidingZeroPos` | `:845` / `:889` / `:651` / `:663` | Other placement rules |

> **Note:** There is no foundation-snap system. Placement is free-form raycast-based; the closest thing to "snapping" is `IsBaseViable`/`IsBaseFlat` requiring a flat intact surface.

### Key exposed methods

`IsColliding()`, `IsFloating()`, `IsHidden()`, `GetProjectionPosition()`, `GetProjectionOrientation()`, `GetProjectionEntity()`, `SetProjectionPosition/Orientation`, `AddProjectionRotation`/`SubtractProjectionRotation` (mouse-wheel rotate), `SetUpdatePosition(bool)`, `EvaluateCollision(item)`, `PlaceEntity(entity_for_placing)` (`:993` — used by deploy to swap projection → real object).

---

## Deploy / Place System (Kit → World Entity)

Two action layers:

| Action | Type | Role |
|--------|------|------|
| `ActionTogglePlaceObject` | instant, local | Enter placing mode; `Start()` calls `player.TogglePlacingLocal()` which spawns a local `Hologram` |
| `ActionDeployObject` / `ActionPlaceObject extends ActionDeployObject` | continuous | `ActionUsesHologram()` returns true (`actiondeployobject.c:15`), `IsDeploymentAction()` true (`:25`) |

### Flow (`ActionDeployObject`)

1. `ActionCondition` (client) (`actiondeployobject.c:35`) — requires `player.IsPlacingLocal()` and `!GetHologramLocal().IsColliding()` and `item.CanBePlaced(...)`
2. `SetupAction` (`:78`) — freezes the hologram (`SetUpdatePosition(false)` `:90`), captures `m_Position`/`m_Orientation` from the hologram
3. `OnStartServer` (`:126`) — `player.PlacingStartServer(mainItem)`, `mainItem.SetIsBeingPlaced(true)`, plays deploy sound
4. `OnFinishProgressClient` (`:162`) — calls `entity_for_placing.OnPlacementComplete(player, position, orientation)`. **This is the commit.**
5. `OnEndServer` (`:212`) — if placed and `mainItem.IsBasebuildingKit()`, **deletes the kit** (`:238-240`)

### How a kit becomes a structure

`FenceKit.OnPlacementComplete` (`fencekit.c:19-34`):

```c
Fence fence = Fence.Cast(GetGame().CreateObjectEx("Fence", GetPosition(), ECE_PLACE_ON_SURFACE));
fence.SetPosition(position);
fence.SetOrientation(orientation);
HideAllSelections();   // kit hidden so deploy action can delete it
```

The kit spawns the `Fence` `BaseBuildingBase` entity and then deletes itself. The fence starts with `m_HasBase=false` (just the kit bundle model visible), ready for construction.

---

## Dismantle & Fold

### Dismantle a part — `ActionDismantlePart`

`DismantleCondition` (`:144`):
- target must `CanUseConstruction()`
- not allowed if a combination lock or flag is attached (`:153`)
- resolves part via `construction.GetConstructionPartToDismantle(partName, item)` → `CanDismantlePart` (`construction.c:468`): part must be built, have **no dependent built part**, and tool must match `dismantle_action_type`
- gate parts can't be dismantled while open (`:166`)

Server finish `OnFinishProgressServer` (`:95`):

```c
construction.DismantlePartServer(player, part.GetPartName(), AT_DISMANTLE_PART);
item.DecreaseHealth(UADamageApplied.DISMANTLE, false);  // tool damage
```

`DismantlePartServer` → `ReceiveMaterialsServer` (**returns materials**, reduced by `DECONSTURCT_MATERIAL_LOSS`) → `OnPartDismantledServer`. If the dismantled part `IsBase()`, the whole construction is deleted (`basebuildingbase.c:653-657`) — i.e. dismantling the foundation folds the whole fence.

### Fold (alternative) — `ActionFoldBaseBuildingObject`

Only works when `CanFoldBaseBuildingObject()` is true (no base, no attachments — `basebuildingbase.c:1067`). Calls `CreateConstructionKitInHands(player)` then `DestroyConstruction()` (`:61-62`), handing a fresh kit to the player.

---

## End-to-End: Building a Fence

```
1. PLAYER HOLDS FenceKit, triggers ActionTogglePlaceObject
   → player.TogglePlacingLocal()                                 actiontoggleplaceobject.c:58
   → Hologram spawns projection "FenceKitPlacing"                 hologram.c:241

2. PLAYER TRIGGERS ActionPlaceObject
   → ActionDeployObject.SetupAction captures pos/orientation     actiondeployobject.c:95-99
   → OnFinishProgressClient → OnPlacementComplete                actiondeployobject.c:174

3. FenceKit.OnPlacementComplete creates the Fence entity         fencekit.c:27
   → OnEndServer deletes the kit                                 actiondeployobject.c:238-240
   Fence starts m_HasBase=false

4. ATTACH WoodenLog via ActionAttachToConstruction
   → resolves slot from selection                                constructionactiondata.c:250
   → Fence.CanReceiveAttachment allows logs pre-base             fence.c:386

5. EQUIP SHOVEL, aim at base, run ActionBuildPart
   → OnFinishProgressServer → BuildPartServer("base", AT_BUILD_PART)  actionbuildpart.c:126
   → Construction.BuildPartServer                                construction.c:75
      TakeMaterialsServer (consumes/locks attachments)
   → Fence.OnPartBuiltServer → BaseBuildingBase.OnPartBuiltServer     basebuildingbase.c:587
      SetBaseState(true), CreateConstructionKit() drops a kit,
      RegisterPartForSync, SetPartFromSyncData shows the part

6. BUILD wall_base_down + wall_base_up
   (each requires base built — HasRequiredPart                   construction.c:412)

7. ATTACH WoodenPlank + Nails, BUILD wall_wood_down / wall_wood_up
   TakeMaterialsServer locks those material slots               construction.c:671
   (wall_metal_* are mutually exclusive via conflicted_parts)

8. OPTIONAL: attach BarbedWire, mount → CreateAreaDamage        basebuildingbase.c:1086
   BUILD wall_gate → CheckGateState sets GATE_STATE_FULL         fence.c:77-103
   combination-lock slot unlocks

9. DISMANTLE reverses it
   ActionDismantlePart → DismantlePartServer → ReceiveMaterialsServer (returns materials)
   Dismantling the base deletes the entity                       basebuildingbase.c:653-657
```

---

## Fence & Watchtower Specifics

### Fence (`fence.c`)

Kit type = `"FenceKit"` (`:46`).

Attachment slots (`:22-24, 7`): `Wall_Camonet`, `Wall_Barbedwire_1` (down), `Wall_Barbedwire_2` (up), `Att_CombinationLock`. Material slots driven by config `Construction.wall.*.Materials` (e.g. `Material_WoodenLog`, `Material_WoodenPlank`, `Material_Nails`, `Material_MetalWire`).

Gate path: build `wall_gate` (the `is_gate` part). `CheckGateState` (`fence.c:77`) sets `m_GateState` to `GATE_STATE_PARTIAL`/`GATE_STATE_FULL` depending on whether all its `required_parts` are built. Once `GATE_STATE_FULL`, the combination-lock slot unlocks (`CanDisplayAttachmentSlot` `:183`, `CanReceiveAttachment` `:394`). Gate open/close rotates `*_Rotate` animations by `GATE_ROTATION_ANGLE_DEG = 100` (`OpenFence` `:447`).

### Watchtower (`watchtower.c`)

Same mechanism; 3 floors × 3 walls. Constants: `BASE_VIEW_NAME="level_"`, `BASE_WALL_NAME="_wall_"`, `MAX_WATCHTOWER_FLOORS=3`, `MAX_WATCHTOWER_WALLS=3` (`:11-15`). `UpdateVisuals` (`:44`) shows `level_N` + its walls only when the previous `level_N_roof` is built — a config-driven chain. The hologram knows about watchtower trigger boxes via `m_WatchtowerIgnoreComponentNames` / `m_WatchtowerBlockedComponentNames` (`hologram.c:63-66`, populated in the constructor `:83-103`).

---

## Integration with User Actions & Inventory

### User Actions

Actions are registered in `SetActions()`:
- `BaseBuildingBase.SetActions` (`basebuildingbase.c:1243`) — adds `ActionDetachFromTarget`, removes take-actions
- `Fence.SetActions` (`fence.c:825`) — adds `ActionTogglePlaceObject`, `ActionPlaceObject`, `ActionFoldBaseBuildingObject`, `ActionOpenFence`, `ActionCloseFence`
- `KitBase.SetActions` (`kitbase.c:146`) — adds toggle + deploy

**Variant system** for choosing which part to build: `ConstructionActionData` holds two `ActionVariantManager`s — one for `ActionBuildPart` (with tool) and one for `ActionBuildShelter` (no tool) (`constructionactiondata.c:39-46`). `OnUpdateActions` (`:129`) calls `GetConstructionPartsToBuild(main_part_name, ...)` (`construction.c:339`) which filters parts the player can currently build; the variant count lets the player cycle parts. The selected part is read via `GetBuildPartAtIndex(m_VariantID)` (`actionbuildpart.c:153`).

The `m_MainPartName` comes from `target.GetActionComponentName(component_index)` — the model's view-geometry components are named to match config main-part names, so aiming at a different section of the fence offers different buildable parts.

Continuous actions (`ActionBuildPart`, `ActionDismantlePart`) use `ActionConditionContinue` to re-validate each frame (collision re-check on server via `IsCollidingEx`, `actionbuildpart.c:102`).

### Inventory / attachments

Materials (planks, nails, logs) are **regular inventory attachments** on the buildable. Material slots are defined in config under `GUIInventoryAttachmentsProps` (used by `ConstructionActionData.GetAttachmentSlotFromSelection` `constructionactiondata.c:250` to map a clicked model selection → slot id). `HasMaterials`/`TakeMaterialsServer` find attachments by slot name (`construction.c:617, 671`). When `lockable`, the slot is locked via `GetInventory().SetSlotLock(slot, true)` so the material becomes a permanent visual/physics part.

---

## Config Data Schema

There is no DZ data script class for base building; everything is read from the **engine config tree `cfgVehicles`** at runtime via `GetGame().ConfigGet*`. The relevant config paths (all read in `construction.c`):

| Config path | Purpose | Read at |
|-------------|---------|---------|
| `cfgVehicles <type> Construction <main_part> <part>` | Part: `name`, `id`, `is_base`, `is_gate`, `show_on_init` | `construction.c:257-262` |
| `... <part> required_parts` (array) | Prerequisite parts | `:415, :548` |
| `... <part> conflicted_parts` (array) | Mutually-exclusive parts | `:441` |
| `... <part> Materials <material>` | `type`, `slot_name`, `quantity`, `lockable` | `:620-638, :687-693` |
| `... <part> collision_data` (two memory-point names) | Collision box for build check | `:1128` |
| `... <part> build_action_type` / `dismantle_action_type` (bitmasks) | Tool matching | `:962, 985` |
| `... <part> material_type` (int → `ConstructionMaterialType`) | Sound selection | `:1008` |
| `cfgVehicles <type> GUIInventoryAttachmentsProps` | selection→slot mapping | `constructionactiondata.c:252` |
| `cfgVehicles <type> attachments`, `hybridAttachments`, `mountables` | Attachment config | `basebuildingbase.c:54-63, :942` |

---

## Directory Structure

```
classes/
├── basebuilding/
│   ├── construction.c            Construction engine + enums + StaticConstructionMethods
│   │                             + CollisionCheckData + ConstructionBoxTrigger
│   ├── constructionpart.c        ConstructionPart data holder
│   └── constructionactiondata.c  Per-player part-variant state (ActionVariantManager)
├── hologram.c                    Hologram (placement preview) + ProjectionTrigger
└── toggleselections.c            ToggleAnimations (legacy helper)

entities/itembase/
├── basebuildingbase.c            BaseBuildingBase root
├── kitbase.c                     KitBase root (IsBasebuildingKit = true)
├── fencekit.c / watchtowerkit.c / shelterkit.c / totemkit.c   concrete kits
├── tentbase.c                    TentBase (reuses deploy/placing pipeline)
└── basebuildingbase/
    ├── fence.c                   Fence (walls, gate, barbed wire, camonet, lock)
    ├── watchtower.c              Watchtower (3 floors × 3 walls)
    ├── sheltersite.c             ShelterSite
    ├── totem.c                  TerritoryFlag
    └── staticflagpole.c

classes/useractionscomponent/actions/
├── continuous/
│   ├── actionbuildpart.c                 ActionBuildPart (construct a part)
│   ├── actiondismantlepart.c             ActionDismantlePart
│   ├── actiondestroypart.c               ActionDestroyPart
│   ├── actionfoldbasebuildingobject.c    ActionFoldBaseBuildingObject
│   ├── actionplaceobject.c               ActionPlaceObject extends ActionDeployObject
│   └── deployactions/actiondeployobject.c  ActionDeployObject
├── singleuse/
│   ├── actionattachtoconstruction.c      ActionAttachToConstruction (add material)
│   └── actiontoggleplaceobject.c         ActionTogglePlaceObject (enter placing mode)
└── interact/
    └── actionbuildshelter.c              ActionBuildShelter (no-tool build path)
```

---

## Related Documentation

- [User Actions System](./user-actions-system) — build/dismantle/place/attach actions flow through the action pipeline
- [Inventory System](./inventory-system) — attachment slots, slot locks, material handling
- [Damage & Combat](./damage-combat) — part destruction cascade (`EEHealthLevelChanged`)
- [Base Building](/world-gameplay/base-building) — gameplay-facing overview
- [Data Config → Structures](/data-config/structures) — structure config
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
