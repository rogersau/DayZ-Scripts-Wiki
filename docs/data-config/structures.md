# Structures

The `DZ/structures/` directory defines all building and structure types in the game world, including their models, damage states, and interaction points.

## Categories

| Category | Directory | Contents |
|----------|-----------|----------|
| Data | `structures/data/` | Shared structure configuration |
| Furniture | `structures/furniture/` | Chairs, tables, shelves, beds |
| Industrial | `structures/industrial/` | Factories, warehouses, silos |
| Military | `structures/military/` | Bunkers, barracks, watchtowers |
| Rail | `structures/rail/` | Train related structures |
| Residential | `structures/residential/` | Houses, apartments, cabins |
| Roads | `structures/roads/` | Road surfaces, barriers, signs |
| Ruins | `structures/ruins/` | Destroyed building variants |
| Signs | `structures/signs/` | Signage and information boards |
| Specific | `structures/specific/` | Unique/notable structures |
| Walls | `structures/walls/` | Fences, walls, barriers |
| Wrecks | `structures/wrecks/` | Vehicle and building wreckage |

## Per-Map Variants

| Variant | Directory | World |
|---------|-----------|-------|
| Bliss (Livonia) | `structures_bliss/` | Enoch |
| Sakhal | `structures_sakhal/` | Sakhal |

## Structure Config Format

Structures follow the `CfgVehicles` config class hierarchy:

```cpp
class House_Base: Building {
    scope = 2;
    model = "\dz\structures\residential\house.p3d";
    
    // Building properties
    destructionEffects = "DestructionHouse";  // Destruction VFX
    
    // Selections for damage states
    hiddenSelections[] = {
        "body",
        "damage_01",
        "damage_02",
        "damage_03"
    };
    
    // Loot positions (memory points)
    memoryPoints[] = {
        "loot_floor",
        "loot_table",
        "loot_shelf_1",
        "loot_shelf_2"
    };
    
    // Interior navigation
    navMesh = "house_interior";
    
    // Building attributes
    hasDoors = 1;
    hasWindows = 1;
    hasStairs = 1;
    floors = 2;
};
```

## Building Damage States

Buildings have multiple damage states defined through hidden selections:

```cpp
class House_Base: Building {
    // Damage states (0.0 = pristine, 1.0 = destroyed)
    class DamageSystem {
        class GlobalHealth {
            class Damage {
                class Health {
                    health = 10000;
                    unit = "Health";
                };
                class DamageZones {
                    class Walls {
                        class Health {
                            health = 1000;
                        };
                        class Armor {
                            armor = 10;
                        };
                    };
                };
            };
        };
    };
};
```

## Furniture Config

```cpp
class Furniture_Base: Inventory_Base {
    scope = 2;
    model = "\dz\structures\furniture\table.p3d";
    
    // Interaction
    canBeMoved = 1;                     // Can be picked up/relocated
    isContainer = 1;                    // Can store items
    itemsCargoSize[] = {2,2};          // Storage grid
};
```

## Wall/Fence Config

```cpp
class Fence_Base: Building {
    scope = 2;
    model = "\dz\structures\walls\fence.p3d";
    
    // Wall properties
    height = 2.5;                       // Wall height (meters)
    climbable = 0;                      // Can be climbed over
    
    // Damage
    armor = 50;
    destructionEffects = "DestructionFence";
};
```

## Structure Textures

Each per-map variant has different textures:

```cpp
// Base structure
class House_Base: Building {
    hiddenSelectionsTextures[] = {
        "dz\structures\residential\data\house_body_co.paa"
    };
};

// Bliss variant (Livonia)
class House_Livonia: House_Base {
    hiddenSelectionsTextures[] = {
        "dz\structures_bliss\residential\data\house_body_co.paa"
    };
};

// Sakhal variant
class House_Sakhal: House_Base {
    hiddenSelectionsTextures[] = {
        "dz\structures_sakhal\residential\data\house_body_co.paa"
    };
};
```

## Script Interaction with Structures

```c
// Building interaction in script
class Building : EntityAI {
    int GetDoorCount();
    bool IsDoorOpen(int doorIndex);
    void OpenDoor(int doorIndex);
    void CloseDoor(int doorIndex);
    
    // Memory points for loot
    vector GetMemoryPoint(string name);
    
    // Damage state
    float GetHealth();
    int GetDamageState();  // 0=pristine, 1=damaged, 2=ruined
    
    // Interior queries
    bool IsInBuilding(vector position);
    int GetFloor(vector position);
};
```
