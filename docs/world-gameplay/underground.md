# Underground System

The underground system manages subterranean areas including bunkers, tunnels, and other underground locations.

## Architecture

```
Underground System
├── Underground Handler (classes/undergroundhandlerclient.c)
│   ├── Underground area detection
│   ├── Transition management
│   └── State synchronization
│
├── Underground Bunker Handler (classes/undergroundbunkerhandlerclient.c)
│   ├── Bunker-specific logic
│   ├── Interior management
│   └── Exit handling
│
└── Area Loader (3_game/undergroundarealoader.c)
    └── Dynamic area loading/unloading
```

## Underground Area System

Manages the transition between surface and underground spaces:

```c
class UndergroundHandlerClient {
    // State
    bool m_IsUnderground;              // Currently underground?
    string m_CurrentUndergroundArea;   // Which area
    
    // Trigger detection
    void OnTriggerEnter(Trigger trigger);
    void OnTriggerLeave(Trigger trigger);
    
    // Visual/audio processing
    void ProcessEyeAcco(float delta);
    void ProcessLighting(float delta);
    void ProcessSound(float delta);
    
    // Per-frame update
    void Tick(float delta);
};
```

> **Note:** Methods like `OnEnterUnderground`, `OnExitUnderground`, `RequestLoadUndergroundArea`, `IsUndergroundAtPosition`, `GetUndergroundAreaAtPosition` are **not verified** in the actual source. Use `OnTriggerEnter`/`OnTriggerLeave` for transition detection.

## Bunker System

Bunkers are a specific type of underground area. The `UndergroundBunkerHandlerClient` class handles bunker-specific logic:

```c
class UndergroundBunkerHandlerClient {
    // Door animation state
    bool m_IsDoorOpening;
    float m_AnimPhasePrev;
};
```

> **Note:** This class has only the two members shown above in the verified source. Concepts like `BunkerRoom`, `CanEnterRoom()`, `EnterRoom()`, `GetRoomEntrance()`, `GetRoomExit()` are **not verified** and should be treated as speculative.

## Area Loading

Underground areas are dynamically loaded to manage performance. The `UndergroundAreaLoader` handles trigger carrier spawning:

```c
class UndergroundAreaLoader {
    // Trigger carrier management
    void SpawnAllTriggerCarriers();
    void SpawnTriggerCarrier(/* ... */);
    
    // ... other loading methods ...
};
```

> **Note:** Methods like `LoadArea()`, `UnloadArea()`, `SpawnAreaObjects()`, `DespawnAreaObjects()`, `IsAreaLoaded()`, `GetAreaLoadProgress()` are **not verified** in the actual source. The loader's primary verified role is trigger carrier spawning.

## Transition Flow

```
Player approaches underground entrance
    ↓
UndergroundHandler detects entrance
    ↓
UndergroundAreaLoader loads area content
    ↓
Player triggers transition (door, ladder, cave)
    ↓
Screen fade / loading screen
    ↓
Player appears at underground interior point
    ↓
Handler sets m_IsUnderground = true
    ↓
Area loaded, gameplay continues
    ↓
Player finds exit → reverse transition
```

## Types of Underground Areas

| Type | Description | Example |
|------|-------------|---------|
| **Bunkers** | Multi-room military structures | Military bunker complex |
| **Tunnels** | Connecting passageways | Metro tunnels, sewers |
| **Caves** | Natural underground formations | Rock cave systems |
| **Cellars** | Building basements | House cellar, wine cellar |

## Integration with Other Systems

- **World data**: Underground areas have separate world data
- **Lighting**: Different lighting model underground
- **Weather**: Weather effects don't apply underground
- **Sound**: Acoustics change underground (reverb)
- **Radar/compass**: GPS doesn't work underground
- **Network**: Underground state synced to players in the same area
