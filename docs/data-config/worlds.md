# Worlds

The `DZ/worlds/` directory defines per-world configuration data for each map in DayZ.

## Worlds Available

| World | Directory | Game Map |
|-------|-----------|----------|
| ChernarusPlus | `worlds/chernarusplus/` | Chernarus (original map) |
| Enoch | `worlds/enoch/` | Livonia |
| Sakhal | `worlds/sakhal/` | Sakhal |

## World Directory Structure

Each world has:

```
worlds/<worldname>/
├── ce/           — Configuration extensions
├── data/         — World-specific data
├── navmesh/      — AI navigation mesh
└── world/        — World layout files
```

### ChernarusPlus

```
worlds/chernarusplus/
├── ce/           — Chernarus configuration extensions
├── data/         — Terrain heightmap, satellite, config
├── navmesh/      — AI navigation mesh data
```

### Enoch (Livonia)

```
worlds/enoch/
├── ce/           — Livonia configuration extensions
├── data/         — Terrain data
├── navmesh/      — AI navigation mesh
```

### Sakhal

```
worlds/sakhal/
├── ce/           — Sakhal configuration extensions
├── data/         — Terrain data
├── navmesh/      — AI navigation mesh
```

## World Data Files

Each world's `data/` directory contains:

| File | Purpose |
|------|---------|
| `config.cpp` | World configuration (biomes, weather, ambient life) |
| Heightmap files | Terrain elevation data |
| Satellite texture | World satellite image |
| Mask files | Terrain type masks (grass, dirt, rock, etc.) |

## World Config Example

```cpp
// DZ/worlds/chernarusplus/data/config.cpp
class CfgWorlds {
    class ChernarusPlus {
        // Basic info
        description = "Chernarus+";
        worldSize = 15360;              // Map size in meters
        startTime = 8;                  // Default start hour
        startDate = "7/7/2022";         // Default start date
        
        // Climate
        climate = "continental";
        avgTemperature = 15;            // Average temperature (°C)
        rainfall = 0.6;                 // Annual rainfall (0-1)
        snowfall = 0.1;                 // Annual snowfall (0-1)
        
        // Biomes
        class Biome {
            class Forest {
                color[] = {0.1,0.5,0.1};
                treeDensity = 0.7;
                groundType = "forest_ground";
            };
            class Farmland {
                color[] = {0.6,0.7,0.2};
                treeDensity = 0.1;
                groundType = "farmland_ground";
            };
            class Urban {
                color[] = {0.5,0.5,0.5};
                treeDensity = 0.05;
                groundType = "urban_ground";
            };
        };
        
        // Ambient life
        class Ambient {
            class Birds {
                probability = 0.5;
                sounds[] = {"bird_chirp_1", "bird_chirp_2"};
            };
            class Insects {
                probability = 0.8;
                sounds[] = {"insect_buzz"};
            };
        };
    };
};
```

## Per-World Data Variants

Each world has corresponding Blended/Sakhal data in the root `DZ/` directory:

```
DZ/
├── data/                  — Shared data
├── data_bliss/            — Livonia-specific data
├── data_sakhal/           — Sakhal-specific data
├── plants/                — Universal plants
├── plants_bliss/          — Livonia-specific plants
├── plants_sakhal/         — Sakhal-specific plants
├── rocks/                 — Universal rocks
├── rocks_bliss/           — Livonia-specific rocks
├── rocks_sakhal/          — Sakhal-specific rocks
├── surfaces/              — Universal surfaces
├── surfaces_bliss/        — Livonia-specific surfaces
├── surfaces_sakhal/       — Sakhal-specific surfaces
├── structures/            — Universal structures
├── structures_bliss/      — Livonia-specific structures
├── structures_sakhal/     — Sakhal-specific structures
├── water/                 — Universal water
├── water_bliss/           — Livonia water
└── water_sakhal/          — Sakhal water
```

## Per-Map Terrain Properties

Each world has unique:

- **Heightmap**: Terrain elevation data
- **Satellite texture**: Aerial imagery
- **Surface types**: Ground cover (grass, dirt, gravel, concrete, etc.)
- **Vegetation**: Tree and plant placement
- **Water bodies**: Lake, river, and sea boundaries
- **Structure placement**: Building and road layouts
- **AI navigation mesh**: Pathfinding data for AI entities
- **Weather patterns**: Local climate and weather systems
- **Ambient life**: Birds, insects, ambient sounds

## How Scripts Use World Data

```c
// World queries in scripts
class WorldData {
    string GetWorldName();
    float GetWorldSize();
    float GetSeaLevel();
    
    // Biome queries
    int GetBiomeType(vector position);
    float GetTreeCover(vector position);
    
    // Terrain queries
    float GetSurfaceType(vector position);
    float GetElevation(vector position);
    bool IsInWater(vector position);
};
```
