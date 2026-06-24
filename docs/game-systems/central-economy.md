# Central Economy System

The Central Economy (CE) is DayZ's server-authoritative loot and entity management system. It controls what items spawn, where, when, how many, and for how long — across every world.

From `P:/scripts/3_game/ce/centraleconomy.c` (~768 lines) and per-world CE configs.

## Architecture Overview

The CE is a config-driven system with three layers:

```
Layer 1: CE Config XMLs    (per-world cfgeconomycore.xml, cfgspawnabletypes.xml, ...)
Layer 2: Economy Database   (per-world db/types.xml, db/events.xml, db/globals.xml)
Layer 3: CE Script API      (centraleconomy.c — CEApi class)
```

The CE runs on the **server only** (`#ifdef SERVER` guards). Clients receive economy state through network synchronization.

## CE Config Files

Each world stores CE configuration in `worlds/<world>/ce/`:

| File | Purpose |
|------|---------|
| `cfgeconomycore.xml` | Root class definitions and economy defaults |
| `cfgspawnabletypes.xml` | Spawnable item types with behavior tags |
| `cfglimitsdefinition.xml` | Category/tag loot limits |
| `cfgrandompresets.xml` | Random loot presets |
| `cfgeventgroups.xml` | Dynamic event group definitions |
| `cfgeventspawns.xml` | Event spawn positions |
| `cfgplayerspawnpoints.xml` | Player spawn locations |
| `cfgignorelist.xml` | Items excluded from economy |
| `cfgundergroundtriggers.json` | Underground area triggers |
| `cfggameplay.json` | Gameplay configuration |
| `cfgeffectarea.json` | Effect area definitions |
| `cfgenvironment.xml` | Environment/weather configuration |
| `cfgweather.xml` | Weather definitions |
| `areaflags.map` | 80MB binary area flag map |
| `mapgrouppos.xml` | Loot group positions |
| `mapgroupcluster.xml` | Loot cluster definitions |
| `mapgroupproto.xml` | Loot prototype definitions |
| `db/economy.xml` | Economy database state |
| `db/types.xml` | Type definitions with lifetimes |
| `db/events.xml` | Event state |
| `db/globals.xml` | Global economy variables |
| `env/` | Animal/infected territory definitions |

### Root Economy Classes (`cfgeconomycore.xml`)

Maps game config classes to economy categories:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<economycore>
    <classes>
        <class name="Weapons"     drop="0" />
        <class name="Magazines"   drop="0" />
        <class name="Inventory"   drop="0" />
        <class name="Houses"      drop="0" />
        <class name="Players"     drop="0" />
        <class name="AI"          drop="0" />
        <class name="Cars"        drop="0" />
        <class name="Boats"       drop="0" />
    </classes>

    <defaults>
        <default name="lifetime">7200</default>         <!-- Default lifetime (seconds) -->
        <default name="restock">0</default>             <!-- Restock type -->
        <default name="min">1</default>                 <!-- Min items per spawn point -->
        <default name="max">1</default>                 <!-- Max items per spawn point -->
        <default name="nominal">1</default>             <!-- Nominal count -->
        <default name="cost">100</default>              <!-- Spawn cost -->
        <default name="flags">0</default>               <!-- Spawn flags -->
        <default name="limit">200</default>             <!-- Server-wide quantity limit -->
        <default name="limitType">0</default>            <!-- Limit type -->
    </defaults>
</economycore>
```

### Spawnable Types (`cfgspawnabletypes.xml`)

Defines which items can spawn and their behavior:

```xml
<types>
    <type name="M4A1">
        <nominal>5</nominal>                <!-- Desired count on server -->
        <lifetime>86400</lifetime>           <!-- Lifetime in seconds (24h) -->
        <restock>1</restock>                 <!-- Restock after cleanup -->
        <min>1</min>
        <max>1</max>
        <cost>10000</cost>                  <!-- Spawn "cost" relative to other items -->
        <flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" />
        <category name="weapons" />
        <tag name="rifle" />
        <usage name="military" />
        <usage name="heli" />
    </type>
    ...
</types>
```

Key type properties:

| Property | Description | Example |
|----------|-------------|---------|
| `nominal` | Target count maintained on server | 5 |
| `lifetime` | Seconds before cleanup | 86400 (24h) |
| `restock` | Whether to respawn after looted | 0/1 |
| `min`/`max` | Quantity per spawn point | 1/1 |
| `cost` | Relative spawn weight (higher = rarer) | 10000 |
| `category` | Economy category filter | weapons, food, medical |
| `tag` | Sub-category tag | rifle, pistol, melee |
| `usage` | Where it spawns | military, civilian, farm, industrial, heli |
| `flags` | Where to count toward limit | count_in_cargo, count_in_map, count_in_player |

### Spawn Flags

```xml
<flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" />
```

| Flag | Meaning |
|------|---------|
| `count_in_cargo` | Count toward limit when inside a container |
| `count_in_hoarder` | Count when stashed (base-building storage) |
| `count_in_map` | Count when spawned in the world |
| `count_in_player` | Count when carried by a player |

### Loot Limits (`cfglimitsdefinition.xml`)

Controls how many items of each category/tag can exist simultaneously:

```xml
<limits>
    <category name="weapons" limit="400" type="0" />
    <category name="food" limit="500" type="0" />
    <tag name="rifle" limit="50" type="0" />
    <tag name="pistol" limit="100" type="0" />
    <tag name="knife" limit="80" type="1" />
    ...
</limits>
```

### Random Presets (`cfgrandompresets.xml`)

Defines loot bundles for containers:

```xml
<presets>
    <preset name="Food":
        <item name="Rice" chance="0.3" />
        <item name="Beans" chance="0.3" />
        <item name="Soda" chance="0.2" />
        <item name="WaterBottle" chance="0.2" />
    </preset>
</presets>
```

### Event Groups and Spawns (`cfgeventgroups.xml`, `cfgeventspawns.xml`)

Dynamic world events like helicopter crashes and convoys:

```xml
<eventgroups>
    <group name="CrashSite"                min="2" max="3" />
    <group name="PoliceCar"                min="1" max="2" />
    <group name="Convoy"                   min="0" max="1" />
</eventgroups>
```

### Player Spawn Points (`cfgplayerspawnpoints.xml`)

Defines where players can spawn:

```xml
<spawnpoints>
    <spawnpoint name="coast_spawn" type="coast">
        <pos x="6537.65" z="2482.22" />
        <pos x="8428.00" z="12767.1" />
        ...
    </spawnpoint>
</spawnpoints>
```

Spawn types: `coast` (fresh spawn), `coastal` (coastal), `debug` (debug)

### Animal and Infected Territories

Located in `ce/env/` per world. Each creature type has territory definitions:

```
ce/env/
├── bear_territories.xml
├── cattle_territories.xml
├── domestic_animals_territories.xml
├── fox_territories.xml
├── hare_territories.xml
├── hen_territories.xml
├── pig_territories.xml
├── red_deer_territories.xml
├── roe_deer_territories.xml
├── sheep_goat_territories.xml
├── wild_boar_territories.xml
├── wolf_territories.xml
└── zombie_territories.xml
```

Territory definitions vary per world:
- **ChernarusPlus**: Full set of all territories
- **Enoch (Livonia)**: Similar set, omits some domestic
- **Sakhal**: Has reindeer, no pigs/cattle/red_deer/domestic — arctic ecosystem

## CE Economy Database

The `db/` directory stores the live economy state:

| File | Purpose |
|------|---------|
| `types.xml` | Master type definitions with lifetimes (858KB on ChernarusPlus) |
| `events.xml` | Event state tracking |
| `globals.xml` | Global economy variables |
| `economy.xml` | Economy configuration |

### types.xml Structure

```xml
<types>
    <type name="M4A1">
        <nominal>5</nominal>
        <lifetime>86400</lifetime>
        <restock>1</restock>
        <min>0</min>
        <max>3</max>
        <flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" />
        <category name="weapons" />
        <tag name="rifle" />
        <usage name="military" />
    </type>
</types>
```

## CE Script API (`CEApi`)

From `P:/scripts/3_game/ce/centraleconomy.c`, the `CEApi` class provides developer/diagnostic tools:

```c
class CEApi
{
    // Export/Import
    static void ExportSpawnData();        // Regenerate spawn points
    static void ExportProxyData();        // Generate proxy position XML
    static void ExportClusterData();      // Generate cluster XML
    
    // Spawn management
    static void MarkCloseProxy();         // Mark spawn point as too close
    static void RemoveCloseProxy();       // Remove proximity marker
    static void ListCloseProxy();         // List close proxy points
    
    // Diagnostics
    static void SpawnAnalyze();           // Simulate spawning for analysis
    static void TimeShift();              // Time travel for testing
    static void OverrideLifeTime();       // Override cleanup timer
    
    // Force spawning (debug only)
    static void SpawnGroup();             // Force-spawn a loot group
    static void SpawnLoot();              // Force-spawn loot at position
    static void SpawnVehicles();          // Force-spawn vehicles
    static void SpawnBuilding();          // Force-spawn buildings
    static void SpawnEntity();            // Force-spawn an entity
    
    // Query
    static string EconomyMap();           // Query economy map data
    static string EconomyLog();           // Query economy logs
    static string EconomyOutput();        // Query economy diagnostics
};
```

### Economy Map Filter Constants

```c
class EconomyMapStrings
{
    static string ALL_ALL = "";
    static string ALL_LOOT = "loot";
    static string ALL_VEHICLE = "vehicle";
    static string ALL_INFECTED = "infected";
    static string ALL_ANIMAL = "animal";
    static string ALL_PLAYER = "player";
    static string ALL_PROXY = "proxy";
    static string ALL_PROXY_STATIC = "proxyStatic";
    static string ALL_PROXY_DYNAMIC = "proxyDynamic";
    static string ALL_PROXY_ABANDONED = "proxyAbandoned";
};
```

### Economy Log Categories

```c
class EconomyLogCategories
{
    static string ECONOMY = "economy";
    static string RESPAWN = "economy_respawn";
    static string RESPAWN_QUEUE = "respawn_queue";
    static string CONTAINER = "container";
    static string MATRIX = "matrix";
    static string UNIQUE_LOOT = "uniqueloot";
    static string BIND = "bind";
    static string SETUP_FAIL = "setupfail";
    static string STORAGE = "storage";
    // ... per-category logging
};
```

## Per-World CE Variation

### ChernarusPlus

- Full loot ecosystem with all categories
- Large event system (crashes, convoys, police cars)
- All animal territories present
- `areaflags.map` ~80MB (largest map)
- 4 map cluster files

### Enoch (Livonia)

- Same structural layout as ChernarusPlus
- 5 map cluster files
- Non-empty `cfgundergroundtriggers.json` (underground bunkers)
- Slightly different territory set

### Sakhal

- Simplified event groups (very small `cfgeventgroups.xml` — 322 bytes)
- Arctic ecosystem: reindeer instead of cattle/pigs
- Additional `pra/` directory with `warheadstorage.json` for restricted areas
- Volcanic/geothermal features
- Ice sea and volcanic water physics
- 1-2 map cluster files
- No underground area triggers

## Spawn Cycle

The CE spawn cycle works as follows:

1. **Server start**: Loads all config XMLs and economy database
2. **Lifetime tracking**: Each spawned item has a lifetime (seconds)
3. **Cleanup**: Expired items are removed
4. **Restock**: Items with `restock=1` are re-spawned if below `nominal`
5. **Spawn weight**: Rarity is controlled by `cost` — higher cost = less frequent
6. **Category limits**: Server-wide caps per category/tag prevent oversaturation
7. **Proxy system**: Nearby items block new spawns within a radius

## Related Documentation

- [Persistence & Hive](./persistence-hive) — Database persistence layer used alongside CE
- [Worlds](/data-config/worlds) — Per-world CE configuration files
- [Data Config Overview](/data-config/) — Object definitions that CE manages
- [Server Configuration](/modding/debugging) — Server-side CE testing
