# Weather & Environment System

The weather system manages atmospheric conditions that affect gameplay, visibility, sound propagation, and player status. It is one of the largest single files in the game at ~13,400 lines.

## Architecture

```
Weather (3_game/weather.c)
├── Rain
│   ├── Intensity
│   ├── Accumulation
│   └── Puddle formation
├── Fog
│   ├── Density
│   └── Height
├── Wind
│   ├── Speed
│   └── Direction
├── Clouds
│   ├── Overcast level
│   └── Cloud types
├── Temperature
│   ├── Ambient temperature
│   └── Seasonal variation
└── Transitions
    └── Weather change over time

WorldData (3_game/worlddata.c)
├── World state management
├── Time of day
└── World lighting

WorldLighting (3_game/worldlighting.c)
└── Lighting conditions
```

## Weather Components

### Rain

Rain affects:
- **Visibility**: Reduces viewing distance
- **Sound**: Rain noise masks other sounds
- **Player status**: Causes wetness, reduces body temperature
- **Audio**: Footstep sounds change in rain
- **Water collection**: Rain fills containers placed outside

```c
class Weather {
    float GetRainIntensity();       // 0.0 — 1.0
    float GetRainAccumulation();    // Accumulated rain amount
    bool IsRaining();
};
```

### Fog

Fog affects:
- **Visibility**: Drastically reduces sight distance
- **Atmosphere**: Creates mood and tension
- **Thermal**: Affects temperature modeling

```c
class Weather {
    float GetFogDensity();          // 0.0 — 1.0
    float GetFogHeight();           // Fog ceiling height
};
```

### Wind

Wind affects:
- **Sound propagation**: Wind noise, direction affects how sound travels
- **Visual**: Tree/grass movement
- **Player**: Wind chill factor for temperature
- **Environment**: Particle movement direction

```c
class Weather {
    float GetWindSpeed();           // Wind speed in m/s
    vector GetWindDirection();      // Wind direction vector
};
```

### Cloud Cover

Clouds affect:
- **Temperature**: Clouds insulate, preventing rapid temperature changes
- **Lighting**: Overcast reduces light levels
- **Rain probability**: Heavy clouds precede rain

```c
class Weather {
    float GetOvercast();            // 0.0 (clear) — 1.0 (full overcast)
};
```

## Temperature System

Player temperature is affected by multiple environmental factors:

```c
const float PLAYER_TEMPERATURE_HOT = 42.0;
const float PLAYER_TEMPERATURE_NORMAL = 36.5;
const float PLAYER_TEMPERATURE_COLD = 35.0;
const float PLAYER_TEMPERATURE_FREEZING = 30.0;
```

Factors affecting temperature:
- **Ambient temperature** (from weather/world data)
- **Wind chill** (wind speed × temperature offset)
- **Wetness** (being wet accelerates heat loss)
- **Clothing insulation** (from worn items)
- **Fire/heat sources** (nearby campfires, heat packs)
- **Shelter** (buildings block wind/precipitation)

## World Data

The `WorldData` class (~15,900 lines) manages the world state:

```c
class WorldData {
    // Time management
    float GetTimeOfDay();           // Current time (0.0 — 24.0)
    float GetDate();                // Current date
    
    // World queries
    float GetSeaLevel();            // Sea level for water simulation
    bool IsNight();                 // Check if night time
    float GetLighting();            // Current lighting level
    
    // Biome queries
    int GetBiome(vector position);  // Get biome at position
    float GetTreeCover(vector pos); // Tree cover density
};
```

## Weather Transitions

Weather changes smoothly over time:

```c
class Weather {
    void SetRainIntensity(float target, float transitionTime);
    void SetFogDensity(float target, float transitionTime);
    void SetOvercast(float target, float transitionTime);
    void SetWindParams(float speed, vector direction, float transitionTime);
};
```

Transitions are typically triggered by:
- **Overworld weather patterns**: Large-scale weather systems
- **Time of day**: Fog often forms at dawn/morning
- **Region**: Different biomes have different weather patterns
- **Script events**: Mission-triggered weather changes

## Effects on Gameplay

| Condition | Gameplay Effect |
|-----------|-----------------|
| Rain | Masks脚步声, reduces visibility, causes wetness |
| Fog | Severely limits sight range, creates tension |
| Night | Dramatically reduces visibility, requires light sources |
| Cold | Causes player to shiver (affects aim), requires warm clothing |
| Heat | Causes sweating/drying, water consumption |
| Wind | Affects sound propagation, wind chill factor |

## Integration with Other Systems

- **Player system**: Temperature affects player stats, shivering affects aiming
- **Sound system**: Weather affects sound propagation and ambient audio
- **Effect system**: Rain/snow particle effects, fog visual effects
- **World data**: Lighting affects visibility, AI detection ranges
- **PP effects**: Post-processing for rain, fog, overcast conditions
