# Scripts vs. Config Data

One of the most important architectural concepts in DayZ is the separation between **script logic** and **config data**. Understanding this distinction is key to modding and development.

## The Two Worlds

| Aspect | Scripts | Config (config.cpp) |
|--------|---------|---------------------|
| **Location** | `scripts/` (Layers 1-5) | `DZ/`, `Core/` |
| **File format** | [Enforce Script (`.c`)](/modding/enforce-syntax) | Config C++ (`.cpp`) |
| **Purpose** | Behavior, simulation, control flow | Object definitions, properties, metadata |
| **Compilation** | Compiled by Enforce Script compiler | Parsed by config loader at startup |
| **When it runs** | Runtime (game loop) | Load time (startup) |
| **Defines** | How things work | What things are |
| **Examples** | Damage calculation, inventory logic | Item weight, size, model path, slots |

## Config Data (`DZ/`)

The `DZ/` directory contains all static object definitions organized by category:

| Category | Subcategories |
|----------|--------------|
| **Gear** | books, camping, consumables, containers, cooking, crafting, cultivation, drinks, food, medical, navigation, optics, radio, tools, traps |
| **Weapons** | ammunition, animations, archery, attachments, data, explosives, firearms, launchers, melee, misc, nonlethal, pistols, projectiles, proxies, shotguns |
| **Vehicles** | data, parts, water, wheeled |
| **Characters** | backpacks, belts, bodies, data, glasses, gloves, headgear, heads, masks, pants, proxies, shoes, tops, vests, zombies |
| **Structures** | data, furniture, industrial, military, rail, residential, roads, ruins, signs, specific, walls, wrecks |
| **Worlds** | chernarusplus, enoch (Livonia), sakhal — each with ce/, data/, navmesh/ |

### Config File Structure

Each `config.cpp` follows a consistent pattern:

```cpp
class CfgPatches {
    class DZ_Gear_Medical {
        units[] = {};
        weapons[] = {};
        requiredAddons[] = { "DZ_Data" };
    };
};

class CfgVehicles {
    class ItemBase;
    class BandageDressing: ItemBase {
        scope = 2;
        displayName = "Bandage";
        descriptionShort = "A sterile bandage for treating wounds";
        model = "\dz\gear\medical\bandage.p3d";
        weight = 10;
        itemSize[] = {1,1};
        inventorySlot[] = { "MedSlot" };
        // ...
    };
};
```

### How Scripts Use Config Data

Scripts access config properties at runtime through the config system:

```c
// Example: Reading config properties in script
float weight = ConfigGetFloat(id, "weight");
string model;
ConfigGetText(id, "model", model);
int slotCount = ConfigGetInt(id, "inventorySlotCount");
```
> **Note:** Config functions are standalone (`ConfigGetFloat`, `ConfigGetText`, etc.) — they are **not** called as `GetGame().GetConfigFloat(...)`.

## Scripts (`scripts/`)

The scripts implement all runtime behavior. They reference config-defined classes by name but never hardcode their properties.

### How Scripts Reference Config

```c
// In 3_game/entities/inventoryitem.c
class InventoryItem : EntityAI {
    // Behavior is here — what happens when you use, equip, or combine items
    // Config data defines weight, size, model, slots
    void OnItemUsed() {
        // Script logic references config indirectly through engine APIs
    }
};
```

### Config References Scripts Too

Config files can also reference script classes for custom behaviors:

```cpp
class BandageDressing: Inventory_Base {
    // This config class gets instantiated as the script class below
};

// In 4_world/classes/useractionscomponent/
// The script class handles the actual bandage behavior
```

## Real-World Example: Bandage

**Config (`DZ/gear/medical/config.cpp`)**:
```cpp
class BandageDressing: Inventory_Base {
    scope = 2;
    displayName = "Bandage";
    descriptionShort = "Used to stop bleeding";
    model = "\dz\gear\medical\bandage.p3d";
    weight = 10;
    itemSize[] = {1,1};
    inventorySlot[] = { "MedSlot" };
};
```

**Script (`4_world/classes/useractionscomponent/`)**:
```c
// The script class that handles bandage application logic:
// - Check if player is bleeding
// - Apply bandage animation
// - Reduce bleeding level
// - Consume the item
class BandageAction : ActionContinuousBase {
    // Script logic for applying bandages
};
```

## Why This Separation Matters

1. **Modability**: Mods can add new items by writing config files alone — no script changes needed
2. **Performance**: Config data is loaded once at startup; scripts load the config hierarchy
3. **Maintainability**: Object properties (weight, size, damage values) live in one place, not scattered across scripts
4. **Data-driven design**: Adding a new weapon only requires a config entry; the existing script systems (shooting, reloading, inventory) handle it automatically
5. **Localization**: Display names and descriptions can reference string table entries from `languagecore/`
