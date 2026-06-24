# Gear & Items

The `DZ/gear/` directory defines all usable and carryable items in the game, organized into 15 subcategories. From `P:/DZ/gear/`.

## Categories Overview

| Category | Directory | Config Size | Items | Base Class |
|----------|-----------|-------------|-------|------------|
| Books | `gear/books/` | ~2,100 lines | 100+ | `Book_Base` |
| Camping | `gear/camping/` | ~3,300 lines | 20+ | `Inventory_Base`, `Container_Base` |
| Consumables | `gear/consumables/` | ~4,430 lines | 60+ | `Inventory_Base`, `Box_Base` |
| Containers | `gear/containers/` | ~2,240 lines | 20+ | `Container_Base` |
| Cooking | `gear/cooking/` | ~2,080 lines | 15+ | `FireplaceBase`, `Bottle_Base` |
| Crafting | `gear/crafting/` | ~1,700 lines | 20+ | `Inventory_Base` |
| Cultivation | `gear/cultivation/` | ~2,050 lines | 25+ | `Inventory_Base` + `CfgHorticulture` |
| Drinks | `gear/drinks/` | ~1,140 lines | 10+ | `Edible_Base`, `Bottle_Base` |
| Food | `gear/food/` | ~14,600 lines | 150+ | `Edible_Base` |
| Medical | `gear/medical/` | ~2,990 lines | 35+ | `Inventory_Base`, `Edible_Base` |
| Navigation | `gear/navigation/` | ~610 lines | 5+ | `ItemMap`, `ItemCompass`, `ItemGPS` + `CfgLocationTypes` |
| Optics | `gear/optics/` | ~340 lines | 3 | `ItemOptics` |
| Radio | `gear/radio/` | ~480 lines | 4 | `Transmitter_Base`, `Inventory_Base` |
| Tools | `gear/tools/` | ~6,315 lines | 60+ | `Inventory_Base`, `Switchable_Base` |
| Traps | `gear/traps/` | ~840 lines | 6 | `Trap_Base` + `CfgAmmo` |

## Common Config Properties

All items inherit from `Inventory_Base` and share:

```cpp
class Inventory_Base {
    scope = 2;                          // 0=hidden, 1=unavailable, 2=available
    displayName = "Item Name";          // Localized display name
    descriptionShort = "Description";   // Item description
    model = "\dz\gear\path\model.p3d"; // 3D model path
    weight = 100;                        // Weight in grams
    itemSize[] = {1,1};                 // Inventory slot size [width, height]
    inventorySlot[] = { "Slot" };       // Valid inventory slots
    rotationFlags = 0;                  // Rotation behavior in inventory
    canBeSplit = 0;                     // Can stack be split?
    quantityBar = 1;                    // Show quantity bar
    stackMax = 1;                       // Maximum stack quantity
    varQuantityInit = 1;               // Initial quantity
    varQuantityMin = 0;                 // Minimum quantity
    varQuantityMax = 1;                 // Maximum quantity
    varQuantityDestroyOnMin = 0;        // Destroy when quantity reaches 0
};
```

## Category Deep Dives

### Books (`gear/books/`)

100+ classic literature titles. Each book is pure config data — no special script behavior.

```cpp
class ItemBook: Book_Base
{
    class DamageSystem
    {
        class GlobalHealth { class Health {
            hitpoints = 100;
            // pristine → damaged → destruct material transitions
        };};
    };
};

class BookBible: ItemBook
{
    title = "The Holy Bible";
    author = "Various";
    file = "\dz\gear\books\data\bible_en.html";   // Full text
    lootTag[] = { "Religious" };
};
```

Each book has `title`, `author`, `file` (HTML text), and cover texture. No quantity/consumable mechanics. Includes works in English, French, German, Russian, and Czech.

### Camping (`gear/camping/`)

Tents and shelters with two-state (packed/pitched) mechanics.

```cpp
class TentBase: Container_Base
{
    placement = "ForceSlopeOnTerrain";
    physLayer = "item_large";
    carveNavmesh = 1;
    forceFarBubble = "true";
    itemsCargoSize[] = {7, 10};      // Storage grid
    attachments[] = { "CamoNet", "Lights" };
};
```

| Item | Variants | Storage | Use |
|------|----------|---------|-----|
| MediumTent | Green, Orange | 7×10 | 2-person |
| LargeTent | Standard | 7×14 | 4-person |
| CarTent | Standard | 7×10 | Vehicle shelter |
| PartyTent | Blue, White | 7×14 | Decorative |

Each tent has paired `Placing` and `ClutterCutter` classes.

### Consumables (`gear/consumables/`)

Diverse category covering materials, crafting components, and utility items.

| Subgroup | Items | Key Properties |
|----------|-------|----------------|
| Paper | Paper, PunchedCard, GiftWrapPaper | `isMeleeWeapon=1`, `absorbency=1` |
| Fabric | Rag, BurlapStrip | Crafting materials |
| Stones | Stone, SmallStone | Tool crafting |
| Fuel | GasCanister (3 sizes), ButaneCanister | Stackable, quantity |
| Batteries | Battery9V | Energy management |
| Light | Roadflare, Chemlight (5 colors) | Light sources, `_FarBubble`/`_NearBubble` |
| Pelts | 13 types (Wildboar→Fox) | Shared `Pelt_Base`, texture-only variance |
| Crafting | Hook, BoneHook, WoodenHook, Jig, Bait, Netting | Fishing components |
| Building | Nail, NailBox, WoodenPlank, WoodenLog, MetalPlate | Construction |

### Containers (`gear/containers/`)

Storage items with inventory grids and liquid capacity.

```cpp
class Barrel_ColorBase: Container_Base
{
    varQuantityMax = 200000;           // 200L
    stackedUnit = "ml";
    varLiquidTypeInit = 512;           // Water
    liquidContainerType = 0xFFFF;       // Any liquid
    heavyItem = 1;
    carveNavmesh = 1;
};
```

| Container | Size | Special |
|-----------|------|---------|
| Barrel (4 colors) | 200L | Temp-controlled, heavy |
| Refrigerator | World | Perishable storage |
| FirstAidKit | 4×3 | Medical |
| PlateCarrierPouches (4 colors) | 3×3 | Vest attachment |
| WaterproofBag (3 colors) | 5×5 | Lightweight |
| Bear (4 colors) | 6×6 | Backpack |
| GiftBox (S/M/L) | Varies | Numbered variants `_1`—`_4` |

### Cooking (`gear/cooking/`)

Fireplaces and cooking vessels.

```cpp
class FireplaceBase: Inventory_Base
{
    varTemperatureMax = 1000;
    varWetMax = 1;
    // AnimationSources: Ashes, Kindling, Sticks, Wood, Stone, Tripod, Oven, Lid...
};
```

| Item | Fuel | Purpose |
|------|------|---------|
| Fireplace | Wood | Ground cooking |
| FireplaceIndoor | Wood | Interior cooking |
| FireplaceFireBarrel | Wood | Barrel fire |
| OvenIndoor | Wood | Indoor baking |
| BarrelHoles (4 colors) | Wood | Dual container/fire |
| Pot/Cauldron | — | Liquid cooking (Bottle_Base) |
| FryingPan | — | Surface cooking |
| Tripod/CookingStand | — | Support |
| PortableGasStove | Butane | Portable heat |

### Crafting (`gear/crafting/`)

Materials for item crafting, construction, and restraint mechanics.

```cpp
class Rope: Inventory_Base
{
    OnRestrainChange = "RopeLocked";      // Dual-state restraint
    RestrainTime = 10;
    inventorySlot[] = { "Rope", "Material_FPole_Rope", "Material_Shelter_Rope" };
};
```

Dual-state items: `Rope`/`RopeLocked`, `MetalWire`/`MetalWireLocked`. Melee: `Spear`, `SpearBone`, `SpearStone`. Fire starting: `HandDrillKit`.

### Cultivation (`gear/cultivation/`)

Farming system with unique `CfgHorticulture` section for plant visual states.

| Seed | Plant | Plot Type |
|------|-------|-----------|
| TomatoSeeds(Pack) | Plant_Tomato | GardenPlot/Greenhouse/Polytunnel |
| PepperSeeds(Pack) | Plant_Pepper | GardenPlot/Greenhouse/Polytunnel |
| PumpkinSeeds(Pack) | Plant_Pumpkin | GardenPlot/Greenhouse/Polytunnel |
| ZucchiniSeeds(Pack) | Plant_Zucchini | GardenPlot/Greenhouse/Polytunnel |
| PotatoSeed | Plant_Potato | GardenPlot/Greenhouse/Polytunnel |
| CannabisSeeds(Pack) | Plant_Cannabis | GardenPlot/Greenhouse/Polytunnel |

### Drinks (`gear/drinks/`)

Bottled liquids with temperature and quantity tracking.

| Drink | Capacity | Feature |
|-------|----------|---------|
| Canteen | 1000ml | Military |
| WaterBottle | 1000ml | Standard |
| GlassBottle | 500ml | Breakable |
| WaterPouch | 1000ml | Improvised |
| FilteringBottle | 1000ml | Built-in purifier |
| SodaCan (5 brands) | 330ml | `_Empty` paired class |

```cpp
class WaterBottle: Bottle_Base
{
    varQuantityInit = 1000;   varQuantityMax = 1000;
    varLiquidTypeInit = 512;   destroyOnEmpty = 0;
    isMeleeWeapon = 1;
};
```

### Food (`gear/food/`) — 14,600 lines

The most complex gear config. Uses a stage-transition cooking system:

```
BaseFoodStageTransitions → Raw → Baked/Boiled/Dried/Burned/Rotten
├── MeatStageTransitions       (all meats)
├── FruitStageTransitions      (fruits, vegetables)
├── MushroomsStageTransitions  (9 mushroom types)
└── NotCookable                (canned goods, snacks)
```

| Group | Examples | Transition |
|-------|----------|------------|
| Canned | BakedBeansCan, PeachesCan, TunaCan + `_Opened` | NotCookable |
| Produce | Apple, Tomato, Zucchini, Pumpkin, Potato | FruitStage |
| Meat | 14 types (Beef→Fox→Fish) | MeatStage |
| Grains | Rice, Cereal, PowderedMilk | NotCookable |
| Mushrooms | 9 types (Agaricus→Craterellus) | MushroomStage |
| Foraged | Berries, Worm, Shrimp | FruitStage |
| Corpses | DeadChicken (4 colors), DeadRabbit, DeadFox | AnimalCorpsesStage |

### Medical (`gear/medical/`)

Treatment items for health conditions.

| Category | Items |
|----------|-------|
| Wound | BandageDressing, DisinfectantSpray, DisinfectantAlcohol |
| Medication | CharcoalTablets, PainkillerTablets, Tetracycline, VitaminBottle, IodineTincture, PurificationTablets, ChelatingTablets |
| Injection | Epinephrine, Morphine, AntiChemInjector, Syringe |
| IV | SalineBag, SalineBagIV, BloodBagEmpty/Full/IV, StartKitIV |
| Diagnostic | Thermometer, BloodTestKit |
| Treatment | Splint (`+ Splint_Applied: Clothing`), Defibrillator |

```cpp
class BandageDressing: Inventory_Base
{
    varQuantityDestroyOnMin = 1;   varQuantityInit = 4;
    varQuantityMax = 4;             varCleannessInit = 1;
};
```

### Navigation (`gear/navigation/`)

Unique for including `CfgLocationTypes` — map marker definitions:

```cpp
class Capital: Name   { color[] = {1,1,1,1}; importance = 6; };
class City: Name      { color[] = {1,1,1,1}; importance = 5; };
class Hill: NameIcon  { texture = "..."; };
```

| Item | Function | Power |
|------|----------|-------|
| ChernarusMap (open/closed) | Navigation | None |
| Compass/OrienteeringCompass | Direction | None |
| GPSReceiver | Position | Battery9V |

### Optics (`gear/optics/`)

| Item | Zoom Range | Feature |
|------|-----------|---------|
| Binoculars | 100-4000m | Manual zoom |
| Rangefinder | 100-500m | Distance readout |

### Radio (`gear/radio/`)

| Item | Range | Power |
|------|-------|-------|
| PersonalRadio | 5km | Battery9V |
| BaseRadio | Global | Mains |
| Megaphone | 100m | Battery9V |
| Radio | Global | Battery9V |

### Tools (`gear/tools/`) — 6,315 lines

Largest by item count. Covers all tool types:

| Group | Examples |
|-------|----------|
| Cutting | Hacksaw, HandSaw, KitchenKnife, StoneKnife, BoneKnife |
| Striking | Hammer, SledgeHammer, Wrench, Crowbar, Pipe |
| Digging | Shovel, FieldShovel, Sickle, FarmingHoe |
| Fastening | Screwdriver, Pliers, EpoxyPutty |
| Fishing | FishingRod (3: Standard, Improvised, Obsolete) |
| Lighting | Flashlight (+ Raycaster) |
| Restraint | Handcuffs/HandcuffsLocked, HandcuffKeys, Lockpick |
| Keys | ScientificBriefcaseKeys, ShippingContainerKeys (4 colors) |
| Repair | WeaponCleaningKit, SewingKit, LeatherSewingKit, ElectronicRepairKit |
| Heat | Heatpack, Blowtorch, FireExtinguisher |
| Demo | RemoteDetonator (Receiver/Trigger), FireworksLauncher |
| Misc | Pen (4 colors), CanOpener, MessTin, Broom, Paddle, Iceaxe |

### Traps (`gear/traps/`)

Placeable traps with `CfgAmmo` explosion definitions.

```cpp
class LandMineExplosion: DefaultAmmo
{
    indirectHit = 0.5;   indirectHitRange = 2;
    explosive = 1;
    class DamageApplied { type = "FragGrenade";
        Health = 17; Blood = 100; Shock = 100; };
};
```

| Trap | Mechanism |
|------|-----------|
| BearTrap | Pinches, holds target |
| LandMineTrap | Explosive (triggers LandMineExplosion) |
| TripwireTrap | Alarm + trip |
| RabbitSnareTrap | Small game capture |
| SmallFishTrap | Passive fishing |
| FishNetTrap | Passive fishing |

## Shared Config Patterns

All gear items follow consistent patterns:

1. **Damage system**: `DamageSystem > GlobalHealth > Health` with `healthLevels[]` mapping health fractions to visual materials
2. **Color variants**: `_ColorBase` parent → concrete `_ColorName` children
3. **Opened state**: Canned foods pair `Can` + `Can_Opened`
4. **Locked state**: Restraint items pair `Item` + `ItemLocked`
5. **Proxy attachments**: Visual-only classes for character display
6. **String references**: `displayName = "$STR_CfgVehicles_ClassName0"`

## Related Documentation

- [Config System Guide](./config-cpp-guide) — Config file format reference
- [Crafting & Cooking](/world-gameplay/crafting-cooking) — Using items in recipes
- [Medical System](/world-gameplay/player-stats) — Health and status effects
