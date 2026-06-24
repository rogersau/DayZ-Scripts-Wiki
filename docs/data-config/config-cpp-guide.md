# config.cpp Guide

This page serves as a reference for the `config.cpp` file format used throughout the `DZ/` directory to define game objects.

## Overview

Config files use a C-like syntax with classes, inheritance, and properties. They are parsed at game startup and define **all objects in the game world**.

## Config Class Hierarchy

```
CfgPatches              — Addon/mod registration
CfgVehicles             — All entities including items, characters, vehicles, buildings
CfgWeapons              — Weapon definitions
CfgMagazines            — Magazine/ammunition types
CfgAmmo                 — Projectile ballistics
CfgNonAIVehicles        — Non-interactive vehicles
CfgSlots                — Inventory slot types
CfgVoice                — Voice types
CfgIdentities           — Character identities
CfgWorlds               — World/map definitions
CfgSoundSets            — Sound configuration
CfgSoundShaders         — Sound playback properties
CfgEffectParticles      — Particle effect definitions
CfgAddons               — Addon system configuration
```

## Common Class Structure

```cpp
class ClassName: ParentClass {
    // Properties
    scope = 2;                          // 0=hidden, 1=unavailable, 2=available
    displayName = "Name";              // Display name (can use $STR_ locale keys)
    descriptionShort = "Description";  // Tooltip description
    
    // References
    model = "\dz\category\model.p3d";  // File path (backslash delimited)
    
    // Arrays
    arrayName[] = { "value1", "value2" };
    numberArray[] = {1, 2, 3};
};
```

## Property Types

| Type | Syntax | Example |
|------|--------|---------|
| Integer | `name = value;` | `scope = 2;` |
| Float | `name = value;` | `weight = 150.5;` |
| String | `name = "text";` | `displayName = "Apple";` |
| Boolean | `name = 0/1;` | `canBeSplit = 0;` |
| Array | `name[] = {v1, v2};` | `itemSize[] = {1,1};` |
| Vector | `name[] = {x,y,z};` | `position[] = {1,2,3};` |
| Color | `name[] = {r,g,b};` | `color[] = {1,0,0};` |
| String array | `name[] = {"s1","s2"};` | `magazines[] = {"Mag_AKM"};` |

## Damage System Pattern

Every item with durability uses a consistent `DamageSystem` structure for visual degradation:

```cpp
class DamageSystem
{
    class GlobalHealth
    {
        class Health
        {
            hitpoints = 100;           // Total durability
            healthLevels[] = {         // Visual states by health %
                {1,                    // 100% health (pristine)
                    {"material.rvmat"}
                },
                {0.7,                  // 70% health (worn)
                    {"material_damage.rvmat"}
                },
                {0.5,                  // 50% health (damaged)
                    {"material_damage.rvmat"}
                },
                {0.3,                  // 30% health (badly damaged)
                    {"material_damage.rvmat"}
                },
                {0,                     // 0% health (destroyed)
                    {"material_destruct.rvmat"}
                }
            };
        };
    };
};
```

Real `hitpoints` values from source: AlarmClock=50, KitchenTimer=30, BandageDressing=100, Ammo boxes=100. Each entry in `healthLevels[]` maps a health threshold (1.0→0.0) to visual material overrides. Empty `{}` means no visual change at that threshold.

## CfgPatches — Addon Registration

Every config directory starts with `CfgPatches` to register the addon:

```cpp
class CfgPatches {
    class DZ_Gear_Medical {
        units[] = {};                          // Units defined here
        weapons[] = {};                        // Weapons defined here
        requiredAddons[] = { "DZ_Data" };      // Dependencies
    };
};
```

**Key points**:
- Addon class name should be unique (e.g., `DZ_Gear_Medical`)
- `units[]` and `weapons[]` list new types defined in this file
- `requiredAddons[]` lists dependencies that must load first
- The game resolves dependencies before loading addons

## CfgVehicles — Entity/Object Definitions

The most common config class, used for all entity types:

```cpp
class CfgVehicles {
    // Inheritance chain
    class Inventory_Base;                    // Forward declaration
    
    class BandageDressing: Inventory_Base {  // New class extending parent
        scope = 2;
        displayName = "Bandage";
        model = "\dz\gear\medical\bandage.p3d";
        weight = 10;
        itemSize[] = {1,1};
        inventorySlot[] = { "MedSlot" };
        varQuantityInit = 1;
        varQuantityMin = 0;
        varQuantityMax = 6;
    };
};
```

### Inheritance

Config supports single inheritance:

```cpp
class Parent_Class {
    weight = 100;
    color = "red";
};

class Child_Class: Parent_Class {
    // Inherits weight=100 and color="red"
    weight = 200;           // Override parent value
    // color still inherited as "red"
};
```

### Common CfgVehicles Properties

| Property | Type | Description |
|----------|------|-------------|
| `scope` | int | Visibility (0=hidden, 1=unavailable, 2=available) |
| `displayName` | string | UI display name |
| `descriptionShort` | string | Tooltip description |
| `model` | string | 3D model path |
| `weight` | float | Weight in grams |
| `itemSize[]` | float[2] | Inventory slot dimensions [width, height] |
| `inventorySlot[]` | string[] | Valid inventory slots |
| `rotationFlags` | int | Rotation behavior in inventory |
| `canBeSplit` | bool | Can stack be split? |
| `quantityBar` | bool | Show quantity bar? |
| `stackMax` | int | Maximum stack quantity |
| `varQuantityInit` | float | Initial quantity |
| `varQuantityMin` | float | Minimum quantity |
| `varQuantityMax` | float | Maximum quantity |
| `varQuantityDestroyOnMin` | bool | Destroy at 0 quantity? |
| `hiddenSelections[]` | string[] | Model selection names |
| `hiddenSelectionsTextures[]` | string[] | Texture paths per selection |
| `itemsCargoSize[]` | int[2] | Container cargo grid |
| `attachementSlots[]` | string[] | Attachment slot names |

## CfgWeapons — Weapon Definitions

```cpp
class CfgWeapons {
    class Rifle_Base: Inventory_Base {
        reloadAction = "Reload";
        chamberSize = 1;
        chamberableFrom[] = { "Ammo_762x39" };
        magazines[] = { "Mag_AKM_30Rnd" };
        recoil = "recoil_ak";
        dispersion = 0.001;
    };
    
    class AKM: Rifle_Base {
        displayName = "AKM";
        weight = 3300;
        itemSize[] = {4,2};
    };
};
```

## CfgMagazines — Ammunition

```cpp
class CfgMagazines {
    class Mag_AKM_30Rnd: Magazine_Base {
        scope = 2;
        displayName = "AKM Magazine";
        model = "\dz\weapons\ammunition\akm_mag.p3d";
        weight = 230;
        count = 30;                  // Round capacity
        ammo = "Bullet_762x39";     // Ammo type
    };
};
```

## CfgSlots — Slot Definitions

```cpp
class CfgSlots {
    slot Head {
        displayName = "Head";
        selection = "head";
        childSlots[] = { "Headgear", "Mask", "Eyewear" };
    };
    slot Back {
        displayName = "Back";
        selection = "back";
    };
};
```

## CfgAddons — Preload System

```cpp
class CfgAddons {
    class PreloadAddons {
        list[] = {
            "DZ_Data",
            "DZ_Characters",
            "DZ_Gear_Medical",
            // ... all registered addons
        };
    };
};
```

## Key Patterns

### Localized Strings

```cpp
displayName = "$STR_CFG_ITEM_BANDAGE";
// Corresponding entry in languagecore/*.xml
// <String ID="STR_CFG_ITEM_BANDAGE">Bandage</String>
```

### Conditional Compilation

```cpp
#ifdef DEVELOPER
class DebugItem: Inventory_Base {
    scope = 2;
};
#endif
```

### Parent References

```cpp
class CfgVehicles {
    class Inventory_Base;                    // Forward reference
    class Clothing_Base: Inventory_Base {}; // Extends forward ref
    class Shirt_Base: Clothing_Base {};     // Extends chain
};
```

### Damage System Block

```cpp
class DamageSystem {
    class GlobalHealth {
        class Health {
            health = 1000;
        };
        class Armor {
            armor = 10;
        };
    };
};
```

## Common Patterns by Category

| Category | Base Class | Key Properties |
|----------|-----------|----------------|
| Medical | `Inventory_Base` | `varQuantityMax`, `varQuantityDestroyOnMin` |
| Food | `Inventory_Base` | `energy`, `water`, `nutrition`, `cookable` |
| Weapon | `Rifle_Base` / `Pistol_Base` | `magazines[]`, `recoil`, `dispersion` |
| Clothing | `Clothing_Base` | `armor`, `heatIsolation`, `itemsCargoSize[]` |
| Vehicle | `Car_Base` / `Boat_Base` / `Helicopter_Base` | `maxSpeed`, `fuelCapacity`, `parts[]` |
| Structure | `House_Base` / `Building` | `destructionEffects`, `memoryPoints[]` |
| Ammo | `Ammo_Base` | `caliber`, `muzzleVelocity`, `damage` |
