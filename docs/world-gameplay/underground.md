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
    
    // Transition
    void OnEnterUnderground(string areaId, vector entrancePos);
    void OnExitUnderground(string areaId, vector exitPos);
    
    // Loading
    void RequestLoadUndergroundArea(string areaId);
    void RequestUnloadUndergroundArea(string areaId);
    
    // Queries
    bool IsUndergroundAtPosition(vector position);
    string GetUndergroundAreaAtPosition(vector position);
};
```

## Bunker System

Bunkers are a specific type of underground area with multiple rooms:

```c
class UndergroundBunkerHandlerClient {
    // Bunker state
    BunkerRoom m_CurrentRoom;
    int m_BunkerLevel;              // Sub-level (0 = top)
    
    // Room connection
    bool CanEnterRoom(BunkerRoom room);
    void EnterRoom(BunkerRoom room);
    
    // Navigation
    vector GetRoomEntrance(BunkerRoom room);
    vector GetRoomExit(BunkerRoom room);
};
```

## Area Loading

Underground areas are dynamically loaded to manage performance:

```c
class UndergroundAreaLoader {
    // Load/unload area
    void LoadArea(string areaId);
    void UnloadArea(string areaId);
    
    // Streaming
    bool IsAreaLoaded(string areaId);
    float GetAreaLoadProgress(string areaId);
    
    // Content
    void SpawnAreaObjects(string areaId);
    void DespawnAreaObjects(string areaId);
};
```

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
