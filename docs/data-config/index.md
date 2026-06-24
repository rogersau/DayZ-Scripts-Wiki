# Data & Config

This section documents the static configuration data in `P:\DZ\` that defines all game objects, items, weapons, characters, structures, and world data. Unlike the scripts in `scripts/` which implement **behavior**, the config data defines **what exists** in the game world.

## Overview

The `DZ/` directory contains a hierarchy of category folders, each with its own `config.cpp` defining game objects. This is a **data-driven design**: adding a new item often only requires writing a config file — no script changes needed.

## Directory Structure

```
DZ/
├── AI/                       — Infected AI configuration
├── anmals/                   — Animal species definitions
├── anims/                    — Animation definitions
├── characters/               — Player clothing, backpacks, zombies
│   ├── backpacks/
│   ├── bodies/
│   ├── glasses/
│   ├── gloves/
│   ├── headgear/
│   ├── masks/
│   ├── pants/
│   ├── shoes/
│   ├── tops/
│   └── vests/
├── data/                     — Shared game data
│   └── config.cpp           — Master addon registry
├── gear/                     — All usable items
│   ├── books/
│   ├── camping/
│   ├── consumables/
│   ├── containers/
│   ├── cooking/
│   ├── crafting/
│   ├── cultivation/
│   ├── drinks/
│   ├── food/
│   ├── medical/
│   ├── navigation/
│   ├── optics/
│   ├── radio/
│   ├── tools/
│   └── traps/
├── modulesDayz/              — Game modules config
├── plants/                   — Plant definitions
├── rocks/                    — Rock/geology definitions
├── server/                   — Server configuration
├── sounds/                   — Sound assets and definitions
├── structures/               — Building/structure definitions
├── surfaces/                 — Surface type definitions
├── ui/                       — UI configuration
├── vehicles/                 — Vehicle definitions
│   ├── data/
│   ├── parts/
│   ├── water/
│   └── wheeled/
├── weapons/                  — Weapon definitions
│   ├── ammunition/
│   ├── archery/
│   ├── attachments/
│   ├── data/
│   ├── explosives/
│   ├── firearms/
│   ├── launchers/
│   ├── melee/
│   ├── pistols/
│   ├── projectiles/
│   └── shotguns/
└── worlds/                   — World-specific data
    ├── chernarusplus/
    ├── enoch/                 (Livonia)
    └── sakhal/
```

## Per-World Variants

Some categories have per-map variants:

| Variant | World | Directory |
|---------|-------|-----------|
| `_bliss` | Livonia (Enoch) | `data_bliss/`, `structures_bliss/`, `plants_bliss/`, etc. |
| `_sakhal` | Sakhal | `data_sakhal/`, `structures_sakhal/`, `rocks_sakhal/`, etc. |

## Config File Structure

Every `config.cpp` follows a consistent pattern documented in the [config.cpp Guide](./config-cpp-guide).

## Category Reference

Each `DZ/` directory has a corresponding documentation page:

| Directory | Documentation | Description |
|-----------|---------------|-------------|
| `AI/` | [AI Config](./ai-config) | AI behaviour trees, noise, damage configs |
| `animals/` | [Animals](./animals) | Animal species definitions |
| `anims/` | [Animation Data](./animation-data) | Skeleton and animation XML definitions |
| `characters/` | [Characters](./characters) | Clothing, backpacks, zombies |
| `gear/` | [Gear & Items](./gear-items) | All usable items (15 subcategories) |
| `plants/` | [Plants](./plants) | Trees, bushes, harvesting |
| `rocks/` | [Rocks](./rocks) | Rock/stone world objects |
| `sounds/` | [Sound Config](./sounds-config), [Sound Pipeline](./sound-hierarchy) | Sound shaders, sets, tables, audio pipeline |
| `structures/` | [Structures](./structures) | Building/structure definitions |
| `surfaces/` | [Surfaces](./surfaces) | Surface types, physics, clutter |
| `ui/` | [UI Config](./ui-config) | Video options, languages |
| `vehicles/` | [Vehicles](./vehicles-data) | Vehicle definitions |
| `weapons/` | [Weapons](./weapons) | Weapons and ammunition |
| `worlds/` | [Worlds](./worlds) | Per-world data, navmesh, CE config, terrain, skyboxes |

## Category Descriptor Files

Each category directory has a `.txt` descriptor with metadata:

```ini
prefix=DZ\gear\tools\
product=dayz
version=114856
```

These descriptors map logical modules to physical paths, used by the game's asset loading system.

## Navigation

- [Gear & Items](./gear-items) — All usable items
- [Weapons](./weapons) — Weapons and ammunition
- [Characters](./characters) — Clothing, backpacks, zombies
- [Vehicles](./vehicles-data) — Vehicle definitions
- [Structures](./structures) — Building definitions
- [Worlds](./worlds) — Per-world data
- [Surfaces](./surfaces) — Ground surface physics, clutter, and visibility
- [Animals](./animals) — Animal species definitions
- [Plants](./plants) — Trees, bushes, and harvesting
- [Rocks](./rocks) — Static rock and stone world objects
- [Animation Data](./animation-data) — Skeleton hierarchy and animation definitions
- [AI Config](./ai-config) — AI behaviour trees, noise, and damage configs
- [Sound Config](./sounds-config) — Sound shaders, sound sets, and audio pipeline
- [UI Config](./ui-config) — Video quality presets and supported languages
- [config.cpp Guide](./config-cpp-guide) — Config file format reference
