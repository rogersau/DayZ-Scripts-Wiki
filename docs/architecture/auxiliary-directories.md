# Auxiliary Directories

Several directories at `P:\` contain support files, configuration stubs, and runtime data that don't fit into the main script/config categories.

## Server Runtime Profile (`NBHProfile/`)

The `NBHProfile/` directory is a DayZ server runtime profile containing live server data:

| Path | Purpose |
|------|---------|
| `DataCache/` | Cached data from the Central Economy |
| `Users/` | Per-user storage (player data) |
| `*.ADM` / `*.RPT` | Admin logs and server reports |
| `script_*.log` | Script error/output logs |

These files are generated at runtime and contain server-specific state.

## Server Binaries & Input Config (`bin/`)

The `bin/` directory stores input binding configuration:

| File | Purpose |
|------|---------|
| `config.cpp` | Input system config (201 KB) |
| `constants.xml` | Input constant definitions |
| `core.xml` | Core input bindings |
| `preset_*.xml` | Platform-specific input presets (PS4, Xbox, mouse+keyboard) |
| `specific.xml` | Platform-specific overrides |

## GUI Assets (`gui/`)

The `gui/` directory contains UI framework assets:

| Directory | Contents |
|-----------|----------|
| `fonts/` | Font files used in the UI system |
| `imagesets/` | Image set definitions (sprite sheets) |
| `layouts/` | UI layout XML files |
| `looknfeel/` | Look-and-feel style definitions |
| `textures/` | UI textures |

These are referenced by the script-side UI system at runtime.

## Graphics Configuration (`graphics/`)

| Directory | Contents |
|-----------|----------|
| `materials/` | Material definitions |
| `particles/` | Particle system configs |
| `textures/` | Graphic textures |

## Localization (`languagecore/`)

Contains `stringtable.csv` (~4.5 MB) — the master localization database containing all translatable strings in every supported language.

The stringtable format matches the CSV used by workshop mods:
```csv
Original,English,Czech,German,Russian,Polish,Spanish,French,Italian,...
"$STR_cfgVehicles_AKM0","AKM",...
```

See the [UI Config](/data-config/ui-config) page for the list of supported languages.

## System Files (`system/`)

Engine-level font and rendering resources:

| File | Purpose |
|------|---------|
| `system.edds`, `systemsmall.edds` | System font textures |
| `system.fnt`, `systemsmall.fnt` | Font metric definitions |
| `system_unicode.ttf` | Unicode font (TrueType) |
| `wbdata/` | Workbench data files |
| `shadercachedx11/` | Compiled shader cache |
| `textures/` | Additional UI textures |

## Signing Keys (`keys/`)

Mod signing key pair for PBO signature verification:

| File | Purpose |
|------|---------|
| `rogersau.bikey` | Public key (distributed with mod) |
| `rogersau.biprivatekey` | Private key (kept secret, used to sign PBOs) |
| `rogersau.txt` | Key metadata |

## DZ Data Support (`DZ/data/`)

Core data directory with shared configuration and assets:

| Path | Contents |
|------|----------|
| `config.cpp` | Main data config (CfgPatches `DZ_Data`) |
| `aiconfigs/` | AI configuration data |
| `lighting/` | World lighting definitions |
| `proxies/` | Proxy model definitions |
| `trackingconfigs/` | Tracking/analytics configs |
| `cl_*.p3d`, `cr_*.p3d` | Clutter and crop 3D models |
| `weather.seq` | Weather sequence data |
| `basicdefines.hpp` | Preprocessor defines for config system |

## DZ Weapon Support Directories

### `weapons/data/`

Shared weapon texture data — damage and destruction material states per material type (generic, metal, wood).

### `weapons/animations/`

Weapon-specific animation graph configurations (stub).

### `weapons/misc/`

Miscellaneous weapon item definitions (stub).

### `weapons/nonlethal/`

Non-lethal weapons defined in `CfgWeapons`. Only `Nonlethal_Base` (in `3_game\entities\bullettypes.c`) has been verified to exist. Specific weapon classes and the hierarchy shown in earlier versions have not been confirmed against source.

> **Note:** Classes such as `DefaultWeapon`, `NonlethalCore`, `NonlethalPistol`, `NonlethalRifle`, `Dart`, and `ShockPistol` could not be verified. Treat any nonlethal weapon references as speculative.

### `weapons/proxies/`

Proxy 3D models for weapon visual representation:
- Muzzle flash models (pistol, rifle, silenced)
- NVG proxy models
- Magazine and dummy weapon proxies
- `zasleh_*` muzzle flash models

## Config Stubs

Several directories exist as **patch registration stubs** — they contain only a minimal `CfgPatches` entry with no actual content:

| Directory | Config Size | Patch Name |
|-----------|-------------|------------|
| `DZ/server/` | 10 lines | `DZ_Server_Data` |
| `DZ/modulesDayz/` | 13 lines | `DZ_ModuleZ` |
| `DZ/anims/cfg/` | 10 lines | `DZ_Anims_Cfg` |
| `DZ/weapons/animations/` | ~10 lines | (patch only) |
| `DZ/weapons/misc/` | ~10 lines | (patch only) |

These exist for addon registration purposes and contain no gameplay-affecting data.

## Related Documentation

- [Config System Guide](/data-config/config-cpp-guide) — Config file format reference
- [Core Resources](./core-resources) — Engine resource primitives
- [Data Config Overview](/data-config/) — All DZ/ configuration categories
