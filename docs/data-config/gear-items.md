# Gear & Items

The `DZ/gear/` directory defines all usable and carryable items in the game, organized into 15 subcategories.

## Categories

| Category | Directory | Examples |
|----------|-----------|----------|
| Books | `gear/books/` | Map, Notebook, Field Guide |
| Camping | `gear/camping/` | Tent, Sleeping Bag, Campfire |
| Consumables | `gear/consumables/` | Charcoal Tablets, Disinfectant |
| Containers | `gear/containers/` | Backpack, Chest Holster, Ammo Box |
| Cooking | `gear/cooking/` | Cooking Pot, Frying Pan, Tripod |
| Crafting | `gear/crafting/` | Toolbox, Sewing Kit, Leather Kit |
| Cultivation | `gear/cultivation/` | Gardening Supplies, Seed Pouch |
| Drinks | `gear/drinks/` | Water Bottle, Soda, Beer |
| Food | `gear/food/` | Rice, Beans, Fruit, Meat |
| Medical | `gear/medical/` | Bandage, Splint, Blood Bag |
| Navigation | `gear/navigation/` | Compass, GPS, Map |
| Optics | `gear/optics/` | Binoculars, Rangefinder |
| Radio | `gear/radio/` | Walkie Talkie, Radio Receiver |
| Tools | `gear/tools/` | Hatchet, Knife, Screwdriver |
| Traps | `gear/traps/` | Fish Trap, Snare Trap |

## Common Config Properties

All inventory items share common config properties:

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

## Item Types

### Medical Items

```cpp
class BandageDressing: Inventory_Base {
    scope = 2;
    displayName = "Bandage";
    descriptionShort = "Used to stop bleeding";
    model = "\dz\gear\medical\bandage.p3d";
    weight = 10;
    itemSize[] = {1,1};
    inventorySlot[] = { "MedSlot" };
    varQuantityInit = 1;
    varQuantityMin = 0;
    varQuantityMax = 6;
};
```

### Food Items

```cpp
class Rice: Inventory_Base {
    scope = 2;
    displayName = "Rice";
    descriptionShort = "A bag of rice";
    model = "\dz\gear\food\rice.p3d";
    weight = 500;
    itemSize[] = {1,1};
    varQuantityInit = 100;
    varQuantityMin = 0;
    varQuantityMax = 100;
    
    // Food-specific properties
    energy = 200;        // Energy per unit
    water = 0;           // Water per unit
    nutrition = 10;      // Nutritional value
    stage = FOOD_STATE_RAW;  // Initial state
    cookable = 1;        // Can be cooked
};
```

### Tool Items

```cpp
class Hatchet: Inventory_Base {
    scope = 2;
    displayName = "Hatchet";
    descriptionShort = "A handy hatchet";
    model = "\dz\gear\tools\hatchet.p3d";
    weight = 800;
    itemSize[] = {2,1};
    inventorySlot[] = { "Knife" };
    
    // Tool-specific
    damagePerUse = 0.05;       // Damage per use
    varQuantityInit = 100;     // Tool durability
    varQuantityMin = 0;
    varQuantityMax = 100;
    varQuantityDestroyOnMin = 1;  // Breaks when depleted
};
```

## Container Items

Containers define cargo space:

```cpp
class CookingPot: Inventory_Base {
    scope = 2;
    displayName = "Cooking Pot";
    model = "\dz\gear\cooking\pot.p3d";
    weight = 500;
    itemSize[] = {2,2};
    
    // Container properties
    itemsCargoSize[] = {2,2};    // 2x2 cargo grid
    canBeDigged = 0;             // Can be buried?
};
```

## How Gear Interacts with Scripts

Scripts reference gear classes by name:

```c
// In script — the InventoryItem class checks what type it is
class InventoryItem : EntityAI {
    bool IsMedicalItem() {
        return GetType().Contains("Bandage") || 
               GetType().Contains("Splint");
    }
    
    bool IsFoodItem() {
        return ConfigGetFloat("energy") > 0;
    }
};
```
