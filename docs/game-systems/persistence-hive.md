# Persistence & Hive System

The hive system is DayZ's persistence layer, connecting the game server to a backend database for saving and loading persistent game state.

## Architecture

```
Persistence System
├── Hive (3_game/hive/)
│   ├── Database connection management
│   ├── Request/response protocol
│   └── Data serialization
│
├── Persistent Objects
│   ├── Player data (inventory, stats, position)
│   ├── World state (items on ground, building damage)
│   ├── Vehicle state (position, health, inventory)
│   └── Base building (constructed objects, caches)
│
├── Save/Load Cycle
│   ├── Periodic auto-save
│   ├── Player disconnect save
│   ├── Server shutdown save
│   └── Server startup load
│
└── Hive Backend
    ├── Local (file-based) — for development/singleplayer
    └── Remote (HTTP) — for production servers
```

## Hive Protocol

The hive uses a request/response protocol:

```c
class Hive {
    // Send a request to the hive backend
    bool Request(int requestType, Param params);
    
    // Check for response
    bool GetResponse(out Param response);
    
    // Common request types
    const int REQUEST_LOGIN = 0;
    const int REQUEST_LOGOUT = 1;
    const int REQUEST_SAVE_PLAYER = 2;
    const int REQUEST_LOAD_PLAYER = 3;
    const int REQUEST_SAVE_WORLD = 4;
    const int REQUEST_LOAD_WORLD = 5;
    const int REQUEST_SAVE_VEHICLE = 6;
    const int REQUEST_LOAD_VEHICLE = 7;
    const int REQUEST_DELETE_OBJECT = 8;
};
```

## Persistent Data

### Player Persistence

When a player connects/disconnects:

```c
// Save on disconnect
class DayZPlayer {
    void Save() {
        // Serialize and save:
        // - Position (world, coordinates)
        // - Health, blood, energy, water
        // - Inventory (all items, quantities)
        // - Equipment (worn items)
        // - Skills and soft skills
        // - Quick bar configuration
    }
    
    void Load() {
        // Deserialize and restore:
        // - Position
        // - Vitals
        // - Inventory
        // - Equipment
        // - Skills
    }
};
```

### World Persistence

The world state is periodically saved:

```c
class WorldData {
    void SaveWorld() {
        // Save all persistent objects:
        // - Ground items
        // - Container contents
        // - Building damage states
        // - Door/open states
        // - Base building objects
        // - Vehicle positions and state
    }
    
    void LoadWorld() {
        // Load and spawn all persistent objects
    }
};
```

### Persistent Object Interface

Objects that should persist implement the persistent interface:

```c
class PersistentObject {
    // Serialization methods
    void OnStoreSave(ParamsSerializer serializer);
    void OnStoreLoad(ParamsSerializer serializer);
    
    // Lifecycle
    bool IsPersistent();
    int GetPersistentID();
};
```

## Save Triggers

| Event | What Saves | Frequency |
|-------|-----------|-----------|
| Player disconnect | Player data | On disconnect |
| Periodic auto-save | World state | Configurable interval (default ~5 min) |
| Server shutdown | Everything | On shutdown |
| Player death | Player inventory → corpse | On death |
| Item dropped | Item position | On drop |
| Building constructed | Construction | On place |

## Data Flow

```
Game Server
    ↓
Hive.Request(SAVE_PLAYER, params)
    ↓
[Network — for remote hive]
    ↓
Hive Backend
    ├── File-based: JSON/binary files on disk
    └── Remote: HTTP API to database
    ↓
Response returned to server
    ↓
Server confirms persistence or handles error
```

## Hive Backends

### Local (File-based)

```
Server directory structure:
storage_1/
├── players/
│   ├── <steam_id>.json       — Player data
│   └── <steam_id>.vars       — Player variables
├── world/
│   ├── objects.bin           — World object state
│   ├── vehicles.bin          — Vehicle state
│   └── building.bin          — Building damage state
└── global/
    └── economy.bin           — Global economy data
```

### Remote (HTTP Database)

For production servers, the hive connects via HTTP to a database backend:

```c
class HTTPHive : Hive {
    string m_APIEndpoint;       // Database API URL
    string m_APIToken;          // Authentication token
    
    bool SendRequest(string endpoint, string data);
    string GetResponse();
};
```

## Integration with Other Systems

- **Player system**: Player data persistence
- **Inventory system**: Item state persistence
- **Vehicle system**: Vehicle state persistence
- **Base building**: Construction persistence
- **Economy**: Global loot economy persistence
- **Server**: Save/load cycle management
