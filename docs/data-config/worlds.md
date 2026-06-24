# Worlds

The `DZ/worlds/` directory defines per-world configuration data for each map in DayZ. Each world has its own terrain, economy, navigation mesh, and environmental configuration.

## Worlds Available

| World | Directory | Game Map | Release | Size |
|-------|-----------|----------|---------|------|
| ChernarusPlus | `worlds/chernarusplus/` | Chernarus (original) | 2013 (Arma 2), 2018 (DayZ) | 15,360 m |
| Enoch | `worlds/enoch/` | Livonia | 2019 | 12,800 m |
| Sakhal | `worlds/sakhal/` | Sakhal | 2024 (Frostline DLC) | 15,360 m |

## World Directory Structure

```
worlds/<worldname>/
├── ce/                  — Central Economy configuration
│   ├── cfgeconomycore.xml       — Root economy classes and defaults
│   ├── cfgspawnabletypes.xml    — Item spawn definitions
│   ├── cfglimitsdefinition.xml  — Loot category/tag limits
│   ├── cfgrandompresets.xml     — Random loot presets
│   ├── cfgeventgroups.xml       — Dynamic event groups
│   ├── cfgeventspawns.xml       — Event spawn positions
│   ├── cfgplayerspawnpoints.xml — Player spawn locations
│   ├── cfgignorelist.xml        — Excluded items
│   ├── cfgundergroundtriggers.json — Underground area triggers
│   ├── cfggameplay.json         — Gameplay configuration
│   ├── cfgeffectarea.json       — Effect area config
│   ├── cfgenvironment.xml       — Environment/weather config
│   ├── cfgweather.xml           — Weather definitions
│   ├── areaflags.map            — Area flag binary map (~80MB)
│   ├── mapgrouppos.xml          — Loot group positions
│   ├── mapgroupcluster.xml      — Loot cluster definitions
│   ├── mapgroupproto.xml        — Loot prototype definitions
│   ├── db/                      — Live economy database
│   │   ├── economy.xml
│   │   ├── types.xml            — Type definitions with lifetimes
│   │   ├── events.xml
│   │   └── globals.xml
│   └── env/                     — Animal/infected territories
│       ├── bear_territories.xml
│       ├── wolf_territories.xml
│       ├── zombie_territories.xml
│       └── ... (per-world creature set)
├── data/                 — Terrain, skyboxes, textures
│   ├── config.cpp               — World stub config
│   ├── layers/                  — Tiled satellite terrain textures
│   ├── <world>_global_nohq.paa  — Global terrain texture (low-res)
│   ├── <world>_middle_mco.paa   — Terrain medium resolution
│   ├── <world>_satout_co.paa    — Satellite out texture
│   ├── cloud_stage*.paa         — Skybox cloud layers
│   ├── sky_stage*.paa           — Sky dome textures
│   ├── horizon_stage*.paa       — Horizon textures
│   └── ... (world-specific textures)
├── navmesh/              — AI navigation mesh
│   ├── navmesh.nm               — Binary navmesh (363-513 MB)
│   └── config.cpp               — Navmesh patch registration
└── world/                — World layout files (optional)
```

## Per-World Details

### ChernarusPlus

The original map — largest CE configuration and most complex loot ecosystem.

**CE specifics:**
- Full loot ecosystem with all categories
- Large event system: crash sites, police cars, convoys
- All animal territories present (bear, cattle, deer, wolf, etc.)
- `areaflags.map` ~80MB
- 4 map cluster files (`mapgroupcluster01-04.xml`)
- Non-empty event groups and event spawns

**Navmesh:**
- `navmesh.nm`: ~513 MB (largest navmesh)
- No `config.cpp` in navmesh directory

**Data:**
- No world config.cpp in data directory
- Sky textures: `cloud_stage00-31_*`, `horizont_stage01-02_*`, `sky_stage01-30_*`
- Terrain: `global_nohq.paa`, `middle_sat_mco.paa`, `outside_sat_co.paa`
- Hundreds of satellite layer tiles in `layers/`

### Enoch (Livonia)

The first DLC map (Livonia), added in 2019.

**CE specifics:**
- Same structure as ChernarusPlus
- Has underground bunker triggers (`cfgundergroundtriggers.json` is non-empty)
- 5 map cluster files
- Slightly different animal set

**Navmesh:**
- `navmesh.nm`: ~363 MB
- `config.cpp`: Patch `DZ_Worlds_Enoch_Navmesh` registration

**Data:**
- `config.cpp`: Minimal stub (143 B)
- Sky: `cloud_stage10-16_cumulus_en_*`, `sky_stage10_cirrus_en_sky.paa`
- Terrain: `enoch_global_nohq.paa`, `enoch_middle_mco.paa`, `enoch_satout_co.paa`
- Map: `enoch_deepmap_co.edds`

### Sakhal

The Frostline DLC map, added in 2024. Arctic volcanic island environment.

**CE specifics:**
- Simplified event groups (`cfgeventgroups.xml` is only 322 B)
- Arctic ecosystem: reindeer, no cattle/pigs/roe_deer
- Additional `pra/` directory: `warheadstorage.json` for player-restricted areas
- No underground area triggers
- 1-2 map cluster files

**Navmesh:**
- `navmesh.nm`: ~472 MB
- `config.cpp`: Patch `DZ_Worlds_Sakhal_Navmesh` registration

**Data:**
- `config.cpp`: Minimal stub (144 B)
- Sky: `cloud_stage01_transparent_sky.paa`, `sky_stage10-30_sakhal_*`, `horizon_stage01_volcanoes_sky.paa`
- Terrain: `sakhal_global_nohq.paa`, `sakhal_middle_mco.paa`, `sakhal_sea_deepmap_co.edds`
- Water: `sakhal_sea.emat`, `sakhal_sea_clear.emat`, `sakhal_sea_overcast.emat`
- Map textures: `map_folded_sakhal_co.paa`, `map_unfolded_sakhal_co.paa`, `map_legend_sakhal_co.paa`
- Lighting directory: world-specific lighting configs

## Per-World Config Variants (`_bliss` and `_sakhal`)

Each world has corresponding overlay data in root `DZ/` using variant suffixes. These provide world-specific assets and override configs.

### Variant System Architecture

The game uses a **patch overlay pattern**:

```
Base directories:        DZ/data, DZ/AI, DZ/plants, DZ/rocks, DZ/surfaces, DZ/structures, DZ/sounds, DZ/water
Frostline overlay:       DZ/data_bliss, DZ/AI_bliss, DZ/plants_bliss, ...
Sakhal overlay:          DZ/data_sakhal, DZ/plants_sakhal, ...
```

Each variant directory:
1. Declares its own `CfgPatches` class with `requiredAddons[]` linking back to the base
2. Provides override configs and new assets
3. Is loaded automatically when the corresponding world is active

### Variant Directories

```
DZ/
├── data/                  — Shared game data
├── data_bliss/            — Frostline DLC data (Sakhal support)
├── data_sakhal/           — Sakhal-specific data (+ scripts!)
├── AI/                    — AI behaviour trees (all creatures)
├── AI_bliss/              — Frostline bear AI overrides
├── plants/                — Universal plants
├── plants_bliss/          — Livonia-specific plants
├── plants_sakhal/         — Sakhal plants (winter, frozen variants)
├── rocks/                 — Universal rocks
├── rocks_bliss/           — Frostline rock assets
├── rocks_sakhal/          — Volcanic/lava rocks for Sakhal
├── surfaces/              — Universal surfaces
├── surfaces_bliss/        — Livonia surface extensions
├── surfaces_sakhal/       — Sakhal surfaces (snow, volcanic)
├── structures/            — All structures
├── structures_bliss/      — Livonia structure assets
├── structures_sakhal/     — Sakhal structures (~285KB config)
├── sounds/                — Universal sounds
├── sounds_bliss/          — Frostline sound assets
├── sounds_sakhal/         — (not present)
├── water/                 — Universal water
├── water_bliss/           — Frostline water assets
├── water_sakhal/          — Sakhal water (ice sea, volcanic)
├── animals/               — Animal species definitions
├── animals_bliss/         — Frostline bear models/textures
└── anims/                 — Animation data
```

### Key Difference: Data vs Assets

| Variant | Config Override | Asset Override | Script Files |
|---------|----------------|----------------|--------------|
| `_bliss` (Frostline) | Minimal (bear AI override, surface extensions) | Models, textures, sounds | **None** |
| `_sakhal` | Moderate (structures, plants, surfaces) | Extensive models/textures | **Yes** (in `data_sakhal/scripts/`) |

### data_sakhal Scripts

Sakhal is unique in including Enforce Script files in its data variant:

```
data_sakhal/
└── scripts/
    └── 4_World/
        └── entities/
            ├── rockbase_sakhal.c              — Sakhal rock base class
            ├── staticobj_waterspring_sakhal.c — Water spring object
            └── woodbase/
                ├── bushes_sakhal.c            — Sakhal bush behavior
                └── trees_sakhal.c             — Sakhal tree behavior
```

These are registered via `CfgMods` in `data_sakhal/config.cpp` as a DLC mod module (appId `2968040`).

### Animal Territory Differences

| Animal | ChernarusPlus | Enoch (Livonia) | Sakhal |
|--------|---------------|-----------------|--------|
| Bear | ✅ | ✅ | ✅ |
| Wolf | ✅ | ✅ | ✅ |
| Fox | ✅ | ✅ | ✅ |
| Hare | ✅ | ✅ | ✅ |
| Hen | ✅ | ✅ | ✅ |
| Roe Deer | ✅ | ✅ | ❌ |
| Red Deer | ✅ | ✅ | ❌ |
| Wild Boar | ✅ | ✅ | ❌ |
| Cattle | ✅ | ✅ | ❌ |
| Pig | ✅ | ❌ | ❌ |
| Sheep/Goat | ✅ | ✅ | ❌ |
| Reindeer | ❌ | ❌ | ✅ |

## Navmesh Comparison

| World | File Size | Config |
|-------|-----------|--------|
| ChernarusPlus | ~513 MB | None |
| Enoch (Livonia) | ~363 MB | `DZ_Worlds_Enoch_Navmesh` |
| Sakhal | ~472 MB | `DZ_Worlds_Sakhal_Navmesh` |

Navmeshes store:
- Walkable surface polygons
- Jump-over links at various heights (0.5m, 1.1m, 1.6m, 2.1m) for different agent types
- Climb links for vertical transitions
- Agent-specific pathfinding data (zombies, deer, hens use different navmesh parameters)

## World Size Comparison

| World | Size (m) | Environment | Season |
|-------|----------|-------------|--------|
| ChernarusPlus | 15,360 × 15,360 | Temperate forest, farmland, coastal | Summer |
| Enoch (Livonia) | 12,800 × 12,800 | Wooded hills, bogs, fields | Autumn |
| Sakhal | 15,360 × 15,360 | Arctic volcanic island, taiga, tundra | Winter |

## World-Specific Script Classes

Each world has a world class in `P:/scripts/4_world/classes/worlds/`:

| File | World |
|------|-------|
| `chernarusplus.c` | ChernarusPlus world class |
| `enoch.c` | Enoch/Livonia world class |
| `sakhal.c` | Sakhal world class |

These extend the base world class with world-specific logic (weather patterns, ambient life, underground areas).

## Related Documentation

- [Central Economy](/game-systems/central-economy) — Loot/economy management system
- [Surfaces](./surfaces) — Surface types per world
- [Plants](./plants) — World-specific vegetation
- [Data Config Overview](./) — All config categories by world variant
