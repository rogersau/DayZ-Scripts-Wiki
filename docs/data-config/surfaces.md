# Surfaces

The `DZ/surfaces/` directory defines all ground surface types in the game world. Surfaces control physics (friction, restitution), footstep sounds, bullet impacts, vehicle handling, vegetation, digging, farming, and player visibility.

From `P:/DZ/surfaces/config.cpp` (~1,759 lines).

## Surface Categories

DayZ defines 50+ surface types, each with interior and exterior variants:

| Surface Type | Variants | Typical Locations |
|-------------|----------|-------------------|
| Asphalt | `asphalt_ext`, `asphalt_int`, `asphalt_destroyed_ext/int` | Roads, pavements |
| Concrete | `concrete_ext`, `concrete_int` | Buildings, foundations |
| Dirt | `dirt_ext`, `dirt_int` | Trails, fields |
| Grass | `grass_dry_ext`, `grass_dry_int` | Meadows, clearings |
| Gravel | `gravel_large_ext/int`, `gravel_small_ext/int` | Roads, parking lots |
| Sand | `sand_ext`, `sand_int` | Beaches, dunes |
| Stone | `stone_ext`, `stone_int` | Rocky terrain |
| Rubble | `rubble_large_ext/int`, `rubble_small_ext/int` | Destroyed buildings |
| Water | `fresh_water`, `still_water`, `clean_water` | Lakes, ponds, rivers |
| Metal | `metal_thick_ext/int`, `metal_thin_ext/int`, `metal_thin_mesh_ext/int` | Industrial, vehicles |
| Wood | `wood_parquet_ext/int`, `wood_planks_ext/int` | Floors, decks |
| Textile | `textile_carpet_ext/int` | Interior carpets |
| Ceramic | `ceramic_tiles_ext/int`, `ceramic_tiles_roof_ext/int` | Bathrooms, roofs |
| Asphalt Felt | `asphalt_felt_ext/int` | Roofs |
| Lino | `lino_ext/int` | Kitchen/bathroom floors |
| Trash | `trash_ext/int` | Dump sites, landfills |
| Stairs | `stairs_ext/int`, `stairs_wood_int`, `stairs_stone_int`, `stairs_metal_int` | Building stairs |
| Water | `fresh_water`, `still_water`, `clean_water` | Bodies of water |

### Interior vs Exterior

Every surface type has paired `_ext` (exterior) and `_int` (interior) variants. The game uses cell-based interior detection to switch between them when entering buildings.

## Surface Properties

Each surface defines these properties (from `CfgSurfaces`):

```cpp
class DZ_SurfacesExt
{
    interior = 0;                    // 1 = interior cell surface
    deflection = 0;                  // Projectile deflection chance
    friction = 0.8;                  // Movement friction (0-1)
    restitution = 0.2;               // Bounciness
    footDamage = 0;                  // Damage to bare feet
    isDigable = 0;                   // Can player dig here?
    isFertile = 0;                   // Can plants grow here?
    chanceForCatch = 0;              // Chance of catching fire spread
    windModifier = 0;               // Wind speed modifier
    audibility = 1.0;               // Footstep noise multiplier
    soundEnviron = "";              // Ambient footstep sound
    soundHit = "";                   // Bullet/melee impact sound
    impact = "";                     // Impact particle effect
    wheelParticle = "";             // Vehicle wheel particle effect
    vpSurface = "";                 // CfgVehicleSurfaces reference
    character = "";                  // CfgSurfaceCharacters reference
    toolDamage = 0;                  // Tool wear multiplier
};
```

### Key Properties Explained

| Property | Effect | Example Values |
|----------|--------|----------------|
| `friction` | Player/vehicle grip | Concrete: 0.8, Ice: 0.15, Grass: 0.45 |
| `restitution` | Bounciness (grenades, objects) | Concrete: 0.5, Dirt: 0.1, Water: 0 |
| `footDamage` | Damage to bare feet walking on this | Stone: 0.1, Grass: 0, Asphalt: 0.05 |
| `isDigable` | Can use shovel here | Dirt: 1, Concrete: 0, Grass: 1 |
| `isFertile` | Can plant crops here | Dirt: 1, Gravel: 0, Grass: 0 |
| `windModifier` | Wind noise reduction for AI hearing | Forest: 0.5, Open: 0, Building: 0.8 |
| `audibility` | Footstep noise multiplier (AI detection) | Concrete: 1.5, Grass: 0.8, Water: 0.3 |
| `toolDamage` | Tool wear multiplier | Concrete: 2.0, Dirt: 1.0, Wood: 1.5 |

## Vehicle Surfaces

`CfgVehicleSurfaces` maps surface types to vehicle handling physics:

```cpp
class Asphalt
{
    noiseSteer = 0.01;       // Steering noise
    noiseFrequency = 0.1;    // Vibration frequency
    roughness = 0.01;        // Surface roughness
    drag = 0.02;             // Rolling drag
    friction = 0.95;         // Tire grip
};

class Dirt
{
    noiseSteer = 0.03;
    noiseFrequency = 0.2;
    roughness = 0.05;
    drag = 0.08;
    friction = 0.65;
};

class Ice
{
    noiseSteer = 0.01;
    noiseFrequency = 0.05;
    roughness = 0.0;
    drag = 0.01;
    friction = 0.15;         // Very slippery
};
```

### Vehicle Surface Parameters

| Surface | Friction | Drag | Roughness | Typical Feel |
|---------|----------|------|-----------|--------------|
| Asphalt | 0.95 | 0.02 | 0.00 | Smooth, high grip |
| Dirt | 0.65 | 0.08 | 0.05 | Loose, lower grip |
| Gravel | 0.55 | 0.06 | 0.08 | Loose, noisy |
| Grass | 0.50 | 0.10 | 0.06 | Soft, drag |
| Forest | 0.45 | 0.12 | 0.10 | Rough, slow |
| Snow | 0.35 | 0.15 | 0.04 | Slippery |
| Ice | 0.15 | 0.01 | 0.00 | Extremely slippery |

## Surface Characters (Clutter)

`CfgSurfaceCharacters` defines vegetation clutter probability for each biome:

```cpp
class cp_grass
{
    probability[] = {0.3, 0.2, 0.1, 0.1, 0.1, 0.2};
    names[] = {
        "Anthoxanthum", "Calamagrostis", "Carduus",
        "Elytrigia", "Taraxacum", "ConcreteGrass"
    };
};
```

Surface character sets define which clutter objects (grass tufts, flowers, rocks) appear on a surface. Each clutter type has its own model and scale range.

### Clutter Classes

From `CfgWorlds` > `class Clutter`:

| Clutter Type | Description |
|-------------|-------------|
| `Anthoxanthum` | Sweet vernal grass |
| `Calamagrostis` | Reed grass |
| `Carduus` | Thistle |
| `Elytrigia` | Couch grass |
| `Taraxacum` | Dandelion |
| `ConcreteGrass` | Urban grass variant |
| `Broadleaf_Undergrowth` | Forest floor vegetation |
| `SmallPicea` | Small spruce saplings |
| `Polypodiophyta` | Ferns |
| `Vaccinium` | Blueberry/low shrub |
| `Twigs` | Ground debris |

Each clutter class defines:
```cpp
class Anthoxanthum
{
    model = "\dz\plants\clutter\Anthoxanthum.p3d";
    scaleMin = 0.7;
    scaleMax = 1.2;
    noSatColor = 1;          // Use vertex color instead of satellite texture
};
```

## Surface Character Biomes

| Character Set | Used In | Clutter Types |
|---------------|---------|---------------|
| `cp_grass` | Open fields | Mixed grasses |
| `cp_grass_tall` | Untended meadows | Tall grasses |
| `cp_broadleaf_sparse1` | Open forest | Sparse undergrowth |
| `cp_broadleaf_sparse2` | Forest edge | Mixed vegetation |
| `cp_broadleaf_dense1` | Dense forest | Thick undergrowth |
| `cp_broadleaf_dense2` | Deep forest | Very dense vegetation |
| `cp_conifer_common1` | Pine forest | Conifer floor plants |
| `cp_conifer_common2` | Pine forest edge | Mixed conifer/broadleaf |
| `cp_conifer_moss1` | Mossy pine | Moss-heavy ground |
| `cp_conifer_moss2` | Old pine | Heavy moss |
| `cp_concrete_grass` | Urban | Sparse urban grass |
| `cp_dirt_grass` | Disturbed ground | Weed transition |

## Player Visibility by Surface

Each surface defines how visible a player is in different stances:

```cpp
class cp_grass
{
    class Visible
    {
        prone = 0.0;        // Nearly invisible prone
        kneel = 0.3;        // Partially visible kneeling
        stand = 0.7;        // Mostly visible standing
    };
};
```

Visibility values range from 0.0 (invisible) to 1.0 (fully visible). This affects AI detection ranges and player stealth.

## Surface-Specific Behavior

| Behavior | Controlled By | Example Surfaces |
|----------|--------------|------------------|
| **Digging** | `isDigable` | Dirt, Grass, Sand — NOT Concrete, Asphalt |
| **Farming** | `isFertile` | Dirt only — NOT Gravel, Grass |
| **Fire spread** | `chanceForCatch` | Grass: 0.3, Forest: 0.5, Concrete: 0 |
| **Barefoot damage** | `footDamage` | Stone: 0.1, Metal: 0.05, Grass: 0 |
| **Bullet impacts** | `soundHit`, `impact` | Different particles/sounds per surface |
| **Tool wear** | `toolDamage` | Concrete: 2x, Dirt: 1x |
| **Stairs** | `isStairs` | Stairs variants only |
| **Liquid** | `isLiquid`, `liquidType` | Water surfaces only |
| **Stealth** | `audibility` | Grass: quiet, Concrete: loud |

## World-Specific Surface Extensions

Per-world surface variants exist in:
- `DZ/surfaces_bliss/` — Livonia (Enoch) surface extensions
- `DZ/surfaces_sakhal/` — Sakhal surface extensions (snow, ice, volcanic)

These override or extend the base surface definitions for world-specific terrain.

## Surface Impact Sounds

Each surface type maps to a `soundHit` property that determines the sound played when bullets or melee weapons impact that surface. The actual sound files are defined in `DZ/sounds/` with per-surface impact sound sets.

## Related Documentation

- [Config System Guide](./config-cpp-guide) — General config file format reference
- [Weather & Environment](/game-systems/weather-environment) — Weather effects on surfaces
- [Damage & Combat](/game-systems/damage-combat) — Bullet penetration by surface
