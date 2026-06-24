# Plants

The `DZ/plants/` directory defines all trees, bushes, and plants that can be cut, harvested, or interacted with. From `P:/DZ/plants/config.cpp` (~1,290 lines).

## Plant Categories

Plants are organized by hardness and type in `CfgNonAIVehicles`:

| Category | Subtypes | Count | Harvest Type |
|----------|----------|-------|-------------|
| `BushSoft` | Softwood bushes | 10 | Sticks, firewood |
| `BushHard` | Hardwood bushes | 12 | Sticks, long sticks |
| `TreeSoft` | Softwood trees | 25+ | Firewood, logs, bark |
| `TreeHard` | Hardwood trees | 40+ | Logs, long sticks, bark |

## Bush Configuration

Bushes follow a standard pattern:

```cpp
class BushSoft
{
    isCuttable = 1;
    primaryDropsAmount = 3;        // How many primary items drop
    secondaryDropsAmount = 2;      // How many secondary items drop
    toolDamage = 4;                // Tool wear per cut
    cycleTimeOverride = 2;         // Harvest animation time (seconds)
    
    primaryOutput = "LongWoodenStick";   // Main drop
    secondaryOutput = "FireWood";        // Secondary drop
};

class BushHard
{
    isCuttable = 1;
    primaryDropsAmount = 2;
    secondaryDropsAmount = 3;
    toolDamage = 4;
    cycleTimeOverride = 2;
    
    primaryOutput = "WoodenStick";       // Hardwood gives shorter sticks
    secondaryOutput = "LongWoodenStick";
};
```

### Bush Variants

| Bush Type | Hardness | Primary Drop | Secondary Drop |
|-----------|----------|-------------|----------------|
| Birch bush | Soft | LongWoodenStick | FireWood |
| Hazel bush | Soft | LongWoodenStick | FireWood |
| Hawthorn bush | Soft | LongWoodenStick | FireWood |
| Spruce bush | Soft | LongWoodenStick | FireWood |
| Oak bush | Soft | LongWoodenStick | FireWood |
| Rose bush | Soft | LongWoodenStick | FireWood |
| Elder bush | Soft | LongWoodenStick | FireWood |
| Pine bush | Soft | LongWoodenStick | FireWood |
| Birch bush (hard) | Hard | WoodenStick | LongWoodenStick |
| Hazel bush (hard) | Hard | WoodenStick | LongWoodenStick |
| Beech bush (hard) | Hard | WoodenStick | LongWoodenStick |
| Blackthorn bush | Hard | WoodenStick | LongWoodenStick |

## Tree Configuration

Trees define the same cutting properties but yield larger outputs:

```cpp
class TreeSoft
{
    isCuttable = 1;
    primaryDropsAmount = 4;        // 4 logs per tree
    secondaryDropsAmount = 3;      // 3 long sticks
    toolDamage = 4;
    cycleTimeOverride = 2;         // Softwood cuts faster
    
    primaryOutput = "FireWood";    // Softwood → firewood
    secondaryOutput = "LongWoodenStick";
    
    barkType = "";                 // Optional: "Bark_Birch" for birch
};

class TreeHard
{
    isCuttable = 1;
    primaryDropsAmount = 6;        // 6 logs from large hardwoods
    secondaryDropsAmount = 4;      // 4 long sticks
    toolDamage = 4;
    cycleTimeOverride = 3;         // Hardwood takes longer
    
    primaryOutput = "WoodenLog";   // Hardwood → logs (for building)
    secondaryOutput = "FireWood";
};
```

### Tree Variants

| Tree Type | Hardness | Primary Drop | Secondary Drop | Bark | Special |
|-----------|----------|-------------|----------------|------|---------|
| Birch | Soft | FireWood | LongWoodenStick | Bark_Birch | |
| Beech | Soft | FireWood | LongWoodenStick | | |
| Ash | Soft | FireWood | LongWoodenStick | | |
| Apple | Soft | FireWood | LongWoodenStick | | Fruit tree |
| Spruce | Soft | FireWood | LongWoodenStick | | |
| Poplar | Soft | FireWood | LongWoodenStick | | |
| Pear | Soft | FireWood | LongWoodenStick | | Fruit tree |
| Oak | Soft | FireWood | LongWoodenStick | | |
| Robinia | Soft | FireWood | LongWoodenStick | | |
| Larch | Soft | FireWood | LongWoodenStick | | |
| Town trees | Soft | FireWood | LongWoodenStick | | Urban |
| Birch (hard) | Hard | WoodenLog | FireWood | Bark_Birch | Building material |
| Hornbeam | Hard | WoodenLog | FireWood | | |
| Beech (hard) | Hard | WoodenLog | FireWood | | |
| Ash (hard) | Hard | WoodenLog | FireWood | | |
| Walnut | Hard | WoodenLog | FireWood | | |
| Oak (hard) | Hard | WoodenLog | FireWood | | |
| Pine | Hard | WoodenLog | FireWood | | |
| Willow | Hard | WoodenLog | FireWood | | |
| Rowan | Hard | WoodenLog | FireWood | | |

### Naming Convention

Tree variants use a suffix system:
- `_1f` — First full (largest) variant
- `_2f` — Second full variant
- `_3f` — Third full variant
- `_1s` — First sparse (thinner) variant
- `_2s` — Second sparse variant

Example: `Quercus_1f`, `Quercus_2f`, `Quercus_1s`, `Quercus_2s`

Trail variants exist for some trees: `_Trail_B` (blue), `_Trail_G` (green), `_Trail_R` (red), `_Trail_Y` (yellow) — used for map marker differentiation.

## Falling Effects

Some trees have falling particle effects:

```cpp
class TreeHard
{
    class FxFallingParticleEffect
    {
        // Particles emitted when tree falls
    };
};
```

Leaf particle effects vary by tree type (conifer: needles, deciduous: leaves).

## Decorative Plants

`CfgVehicles` defines purely decorative plants:

```cpp
class ChristmasTree : HouseNoDestruct {};
class ChristmasTree_Green : HouseNoDestruct {};
```

These have no interaction properties and are purely visual.

## Per-World Plant Variants

World-specific plant data exists in:
- `DZ/plants_bliss/` — Livonia-specific vegetation
- `DZ/plants_sakhal/` — Sakhal-specific vegetation (taiga, tundra)

## Clutter Objects

Related foliage objects in `DZ/plants/clutter/` provide ground-level detail:
- Grass tufts
- Flowers  
- Mushrooms
- Small rocks
- Ground debris

These are placed via the [Surface Characters](./surfaces#surface-characters-clutter) system.

## Related Documentation

- [Surfaces](./surfaces) — Ground surface definitions that determine where plants grow
- [Crafting & Cooking](/world-gameplay/crafting-cooking) — Using harvested wood for crafting
- [Base Building](/world-gameplay/base-building) — Using WoodenLog for construction
- [Config System Guide](./config-cpp-guide) — General config file format
