# Mod Project Structure

A DayZ mod is a self-contained project that the game client and server load at startup. This page documents the standard structure using real mods from `P:\` as reference.

## Mod Anatomy

```
MyMod/
├── mod.cpp            — Mod metadata (required)
├── meta.cpp           — Workshop metadata (optional)
├── Addons/            — Packaged content (PBO files)
│   ├── mymod_data.pbo
│   ├── mymod_scripts.pbo
│   └── mymod_core.pbo
├── Keys/              — Public key for signed PBOs (optional)
├── Extras/            — Extra configs (optional, server-side)
│   ├── Hardcore/
│   └── Regular/
└── README.txt         — Optional documentation
```

## mod.cpp — Mod Manifest

Every mod **must** have a `mod.cpp` in its root directory. It defines the metadata displayed in the DayZ launcher and workshop.

### Generic Example: mod.cpp

```cpp
name = "My Mod Name";
picture = "myMod/data/gui/imagesets/logo_co.edds";
logoSmall = "myMod/data/gui/imagesets/logo_small_co.edds";
logo = "myMod/data/gui/imagesets/logo_co.edds";
logoOver = "myMod/data/gui/imagesets/logo_hover_co.edds";
action = "https://example.com/";
tooltip = "My Mod Tooltip";
overview = "My Mod Overview Description";
author = "AuthorName";
hidePicture = 0;
```

### mod.cpp Fields Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Mod display name. Can be a `$STR_xxx` string table reference |
| `author` | Yes | Author name |
| `picture` | No | 512x256 preview image (EDDS/PAA) displayed in launcher |
| `logoSmall` | No | Small logo icon |
| `logo` | No | Large logo image shown in mod list |
| `logoOver` | No | Hover state for the logo |
| `action` | No | URL the launcher opens on click |
| `tooltip` | No | Tooltip text (shown on hover) |
| `overview` | No | Description text in launcher detail view |
| `hidePicture` | No | Set to `1` to hide the picture |
| `dir` | No | Mod directory name override |

### String Tables

The `$STR_xxx` references in mod.cpp resolve to string table entries. String tables are `.c` files that provide localization. They look like:

```c
class STR_nam_mod_surv_name
{
    // ... translation entries
};
```

## meta.cpp — Workshop Metadata

`meta.cpp` stores Steam Workshop identifiers. It is **auto-generated** when you upload via the DayZ Workshop tool.

### Generic Example: meta.cpp

```cpp
protocol = 1;
publishedid = 1234567890;
name = "My Mod Name";
timestamp = 5250000000000000000;
```

### meta.cpp Fields

| Field | Description |
|-------|-------------|
| `protocol` | Workshop protocol version (always `1`) |
| `publishedid` | Steam Workshop item ID. Generated on first upload |
| `name` | Mod name (should match mod.cpp) |
| `timestamp` | Last-updated timestamp |

## Addons/ — PBO Packages

The `Addons/` folder contains one or more `.pbo` files. Each PBO bundles related assets — scripts, configs, models, textures, sounds.

### Common PBO Patterns

**Small gameplay mod:**

| PBO | Purpose |
|-----|---------|
| `mymod_scripts.pbo` | Main gameplay scripts and configs |

**Large terrain/map mod:**

| PBO | Purpose |
|-----|---------|
| `mymap_data.pbo` | Map data, world config, item placements |
| `mymap_scripts.pbo` | Map-specific scripts |
| `mymap_terrain.pbo` | Terrain meshes, heightmaps, satellite imagery |
| `mymap_navmesh.pbo` | AI navigation mesh |
| `mymap_models.pbo` | Map models and assets |
| `mymap_plants.pbo` | Map-specific vegetation |
| `mymap_sounds.pbo` | Map-specific sounds |

### PBO Contents

Each PBO contains a `config.cpp` at minimum (for the addon registry) plus any associated assets:

```
mymod_scripts.pbo/
├── config.cpp              — CfgPatches entry
├── scripts/
│   ├── 4_world/
│   │   └── classes/
│   │       └── mymod_file.c
│   └── 5_mission/
│       └── mission/
│           └── mymod_mission.c
└── ...
```

### PBO Naming Conventions

- Use a **unique prefix** to avoid collisions: `mymod_scripts.pbo`, `mymod_data.pbo`
- Separate concerns: scripts in one PBO, data in another, terrain in another
- Keep PBO sizes reasonable for download — split large mods into multiple PBOs

## Keys/ — PBO Signing (Optional)

The `Keys/` folder stores the `.bikey` public key file corresponding to a `.bisign` signature file inside signed PBOs. This is used for:

- **Server-side enforcement**: servers can require signed PBOs to prevent tampering
- **Verification**: clients verify PBO signatures against the server's allowed keys

Example: `MyMod/Keys/mykey.bikey`

## Extras/ — Server-Side Configurations

The `Extras/` folder stores additional server configurations that ship with a mod. Players can copy these to their server config as needed.

Example structure:
```
Extras/
├── Hardcore/
└── Regular/
```

## Script Structure Inside a Mod

Your mod scripts follow the same **5-layer architecture** as the core game scripts at `P:/scripts/`. The game loads mod scripts after core scripts, so your mod can:

- **Override** existing classes by redeclaring them (same class name)
- **Extend** existing classes by subclassing
- **Add** new classes that integrate with the game

### Script Loading Order

```
1_core (game)  →  2_gamelib (game)  →  3_game (game)  →  4_world (game)  →  5_mission (game)
     ↓                    ↓                    ↓                  ↓                    ↓
1_core (mod)   →  2_gamelib (mod)   →  3_game (mod)   →  4_world (mod)   →  5_mission (mod)
```

Within your PBO, scripts are organized into the same numbered directories:

```
mymod_scripts.pbo/
├── config.cpp
├── scripts/
│   ├── 3_game/
│   │   └── mymod_dayzplayer.c           — Override or extend DayZPlayer
│   ├── 4_world/
│   │   ├── classes/
│   │   │   └── mymod_custom_item.c      — New item class
│   │   └── systems/
│   │       └── mymod_custom_system.c    — New gameplay system
│   └── 5_mission/
│       └── mission/
│           └── mymod_mission.c          — Mission override
```

## Config Inside a Mod

Mods add `config.cpp` entries to register new objects. The structure mirrors `P:/DZ/`:

```
mymod_data.pbo/
├── config.cpp              — CfgPatches + all new item definitions
├── mymod_item_east_gun.p3d — Model file
└── ...
```

### CfgPatches — Addon Registration

Every PBO **must** have a `CfgPatches` class in its `config.cpp`. This is how the game discovers and loads your addon. Model after the game's own pattern from `P:/scripts/config.cpp`:

```cpp
class CfgPatches
{
    class MyMod_Scripts
    {
        units[] = {};
        weapons[] = {};
        requiredVersion = 0.1;
        requiredAddons[] = {};       // Dependencies: "DZ_Data", "DZ_Weapons", etc.
    };
};
```

- `units[]` / `weapons[]` — List of exported types (can be empty)
- `requiredVersion` — Minimum DayZ version
- `requiredAddons[]` — Dependencies that must load before this one

## Workbench Setup

Workbench is Bohemia Interactive's IDE for Enforce Script development. To set up a mod project:

1. Create your mod folder with `mod.cpp` and `Addons/`
2. In Workbench: **File → New → Project** and point to your mod folder
3. Add the game's scripts as a reference: **Project → Properties → Script Search Paths** → add `P:/scripts/`
4. Organize your scripts into the layer directories (1_core..5_mission)

Workbench provides:
- Syntax highlighting and code completion
- Proto-native function signatures
- Debug stepping and breakpoints
- Real-time script reloading in play mode
