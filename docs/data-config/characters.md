# Characters

The `DZ/characters/` directory defines all player-wearable items, clothing, backpacks, and zombie/NPC definitions.

## Categories

| Category | Directory | Config Size | Examples |
|----------|-----------|-------------|----------|
| Backpacks | `characters/backpacks/` | 84 KB | Backpacks, hiking bags, tactical bags |
| Belts | `characters/belts/` | 19 KB | Belt attachments, holsters, pouches |
| Bodies | `characters/bodies/` | — | Body models, base geometries (3D assets only) |
| Data | `characters/data/` | 233 KB | Shared character configuration |
| Glasses | `characters/glasses/` | 32 KB | Sunglasses, goggles, NVGs |
| Gloves | `characters/gloves/` | 56 KB | All hand-wearable items |
| Headgear | `characters/headgear/` | 209 KB | Hats, helmets, caps |
| Heads | `characters/heads/` | 120 KB | Head models and hair |
| Masks | `characters/masks/` | 42 KB | Face masks, bandanas, gas masks |
| Pants | `characters/pants/` | 116 KB | All leg-wear |
| Proxies | `characters/proxies/` | — | Proxy attachments (3D assets only) |
| Shoes | `characters/shoes/` | 78 KB | Footwear |
| Tops | `characters/tops/` | 196 KB | Shirts, jackets |
| Vests | `characters/vests/` | 48 KB | Body armor, tactical vests |
| Zombies | `characters/zombies/` | 381 KB | Infected/zombie models |

## Clothing Config Structure

All clothing items share common properties:

```cpp
class Clothing_Base: Inventory_Base {
    // Visual properties
    model = "\dz\characters\path\model.p3d";
    hiddenSelections[] = { "camo" };
    hiddenSelectionsTextures[] = { "path\to\texture.paa" };
    
    // Slot and inventory
    inventorySlot[] = { "Body" };       // Where it goes
    itemSize[] = {2,2};                 // Inventory size
    
    // Protection
    armor = 5;                          // Damage reduction
    heatIsolation = 0.2;               // Temperature insulation
    waterResistance = 0.1;             // Water resistance
    noiseReduction = 0.1;             // Movement noise reduction
    
    // Capacity
    itemsCargoSize[] = {0,0};          // Internal cargo grid
    
    // Durability
    varQuantityInit = 100;
    varQuantityMin = 0;
    varQuantityMax = 100;
    varQuantityDestroyOnMin = 1;        // Destroyed when ruined
};
```

## Clothing Properties

### Armor & Protection

| Property | Range | Effect |
|----------|-------|--------|
| `armor` | 0-100 | Damage reduction percentage |
| `heatIsolation` | 0.0-1.0 | Heat retention (higher = warmer) |
| `waterResistance` | 0.0-1.0 | Water repellency |
| `noiseReduction` | 0.0-1.0 | Movement sound dampening |
| `shockProtection` | 0.0-1.0 | Concussive damage reduction |
| `bleedProtection` | 0.0-1.0 | Bleeding chance reduction |

### Capacity

Clothing can carry items via:

```cpp
class Vest_Base: Clothing_Base {
    itemsCargoSize[] = {4,2};          // 4x2 cargo grid
    attachementSlots[] = {             // External slots
        "Vest_LeftPouch",
        "Vest_RightPouch"
    };
};
```

## Backpack Config

```cpp
class Backpack_Base: Clothing_Base {
    // Backpack specific
    itemsCargoSize[] = {4,4};          // 4x4 cargo grid (size varies)
    
    // Attachment points
    attachementSlots[] = {
        "Backpack_CargoLeft",
        "Backpack_CargoRight",
        "Backpack_CargoTop"
    };
    
    // Interaction
    quickBarAccess = 1;                // Accessible from quick bar
    inventoryAccess = 1;               // Opens inventory screen
};
```

## Helmet Config

```cpp
class Helmet_Base: Clothing_Base {
    inventorySlot[] = { "Headgear" };
    armor = 30;                         // High damage reduction
    heatIsolation = 0.3;
    
    // Helmet specific
    nvCapable = 0;                      // Can mount NVGs?
    soundSuppression = 0;              // Hearing protection
    visor = 0;                          // Has visor?
    
    // Attachment slots
    attachementSlots[] = {
        "Helmet_Accessory"             // NVG mount, headlamp, etc.
    };
};
```

## Zombie Config

```cpp
class Zombie_Base: EntityAI {
    // Health
    health = 200;                       // Base health
    armor = 10;                         // Natural armor
    
    // Behavior
    sightRange = 100;                   // Detection range
    hearingRange = 50;                  // Sound detection
    smellRange = 30;                    // Scent detection
    
    // Combat
    meleeDamage = 15;                   // Attack damage
    meleeRange = 1.2;                   // Attack range
    attackSpeed = 1.0;                  // Attack frequency
    
    // Movement
    walkSpeed = 1.5;                    // Walking speed
    runSpeed = 4.5;                     // Running speed
};
```

## How Scripts Use Clothing Data

```c
// Script checks clothing for protection values
class Clothing : InventoryItem {
    float GetArmor() {
        return ConfigGetFloat("armor");
    }
    
    float GetHeatIsolation() {
        return ConfigGetFloat("heatIsolation");
    }
    
    // Player temperature system uses this
    float GetTemperatureModifier() {
        float insulation = 0;
        for each (Clothing item in GetWornClothing()) {
            insulation += item.GetHeatIsolation();
        }
        return insulation;
    }
};
```
