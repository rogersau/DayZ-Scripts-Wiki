# Animals

The `DZ/animals/` directory defines all animal species, their base classes, and insect finite state machines. From `P:/DZ/animals/config.cpp` (~1,177 lines).

## Animal Class Hierarchy

Animals inherit from a shared hierarchy defined in `CfgVehicles`:

```
AnimalBase (extends DZ_LightAI)
├── AnimalsHoofsMedium  (medium hoofed mammals)
│   ├── Sheep
│   ├── Goat
│   └── Pig
├── AnimalsHoofsBig     (large hoofed mammals)
│   ├── Cow
│   ├── Deer
│   └── Reindeer
├── AnimalsCarnivore    (predators)
│   ├── Wolf
│   ├── Bear
│   └── Fox
└── AnimalBaseSmall     (small animals)
    ├── Hare/Rabbit
    ├── Chicken
    └── (other small fauna)
```

## Animal Base Class (`AnimalBase`)

All animals share these base properties:

```cpp
class AnimalBase : DZ_LightAI
{
    simulation = "animal";
    vehicleClass = "Animals";
    storageCategory = 2;               // Storage type for inventory
    
    accuracy = 0.25;                    // AI accuracy modifier
    
    // Agent tasks
    agentTasks[] = { "AnimalMainTask" };
    
    // Temperature
    varTemperatureInit = 38;            // Initial body temperature (°C)
    varTemperatureMin = 30;
    varTemperatureMax = 42;
    freezeThreshold = -2;               // Below this: freezing
    thawThreshold = 2;                  // Above this: thawing
    
    // Behaviour
    _threatMaxRadius = 50;              // Max threat detection range (m)
    _runDistanceMax = 100;              // Max flee distance (m)
    _scareLimit = 0.2;                  // Scare threshold
    _sprintDistance = 30;               // Sprint (fast flee) range (m)
    
    // Lifecycle
    htMin = 60;                         // Minimum lifetime (seconds)
    htMax = 1800;                       // Maximum lifetime (seconds)
    afMax = 30;                         // Maximum age (days)
};
```

## Animal Species

| Species | Class Example | Type | Special Properties |
|---------|--------------|------|--------------------|
| Chicken | `GallusGallusDomesticus` | Small | Fast reproduction, simple AI |
| Hare | `LepusEuropaeus` | Small | Instant alert, very fast sprint |
| Fox | `VulpesVulpes` | Carnivore | Stealthy, opportunistic |
| Roe Deer | `CapreolusCapreolus` | HoofsMedium | Skittish, seasonal antlers |
| Red Deer | `CervusElaphus` | HoofsBig | Herd behaviour, vocal |
| Cow | `BosTaurus` | HoofsBig | Domestic, slow, group-oriented |
| Goat | `CapraHircus` | HoofsMedium | Mountain terrain, agile |
| Sheep | `OvisAries` | HoofsMedium | Flock behaviour, flee together |
| Pig | `SusDomesticus` | HoofsMedium | Wanders, forages |
| Wild Boar | `SusScrofa` | HoofsBig | Aggressive when threatened |
| Wolf | `CanisLupus` | Carnivore | Pack hunter, howls |
| Bear | `UrsusArctos` | Carnivore | Large, aggressive territory |
| Reindeer | `RangiferTarandus` | HoofsBig | Cold climate, migration |

### Species Data Directory

Each species has its own subdirectory with model and texture data:

```
dz/animals/
├── bos_taurus/           — Cow
├── canis_lupus/          — Wolf
├── capra_hircus/         — Goat
├── capreolus_capreolus/  — Roe deer
├── cervus_elaphus/       — Red deer
├── gallus_gallus_domesticus/ — Chicken
├── lepus_europaeus/      — Hare
├── ovis_aries/           — Sheep
├── rangifer_tarandus/    — Reindeer
├── sus_domesticus/       — Pig
├── sus_scrofa/           — Wild boar
├── vulpes_vulpes/        — Fox
└── data/                 — Shared animation data
```

Each contains:
- `speciesname.p3d` — 3D model
- `data/` — Texture files
- `animations/` — Animation XML files
- `animconfig/` — Animation configuration

## Animal Task System

`CfgTasks` defines the main animal AI task:

```cpp
class AnimalMainTask
{
    fsm = "\dz\animals\Data\scripts\main.fsm";       // FSM definition
    condition = "createSingleTask.sqf";               // Task creation condition
};
```

Animals use a Finite State Machine (FSM) from the `.fsm` file for behaviour selection, with the `.sqf` script as the entry condition.

## Insect FSMs

`CfgFSMs` defines Finite State Machines for ambient insects:

```cpp
class Dragonfly
{
    class States
    {
        class Random_Move { /* fly to random point */ };
        class ShortWait   { /* hover briefly */ };
        class LongWait    { /* land */ };
        class LongMove    { /* relocate to new area */ };
    };
};

class Butterfly
{
    class States
    {
        class Move        { /* flutter */ };
        class MoveLand    { /* descend */ };
        class Land        { /* rest on surface */ };
        class Wait        { /* stationary */ };
    };
};

class HoneyBee
{
    class States
    {
        class ShortMove   { /* quick flight */ };
        class LongMove    { /* relocation */ };
        class Break       { /* rest */ };
    };
};
```

Insect FSMs use script functions:
| Function | Purpose |
|----------|---------|
| `randomMove` | Move to random position |
| `wait` | Pause for random duration |
| `setNoBackwards` | Prevent reverse movement |
| `setTimer` | Set state transition timer |
| `moveCompleted` | Check if movement finished |
| `timeElapsed` | Check timer expiry |
| `switchAction` | Change animation state |

## Related Documentation

- [AI Configuration](./ai-config) — AI behaviour trees, noise, and damage configs
- [AI System](/game-systems/ai-system) — Script-side AI logic
- [Data Config Overview](./) — Other configuration categories
