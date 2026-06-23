# Networking & RPC

The networking system handles multiplayer synchronization, remote procedure calls, and voice communication. It is primarily built on the `ScriptRPC` system defined in `3_game/gameplay.c`.

## Architecture

```
Networking
├── ScriptRPC (3_game/gameplay.c)
│   ├── Remote Procedure Calls
│   ├── Client-to-server
│   ├── Server-to-client
│   └── Server-to-all
│
├── ScriptInputUserData (3_game/gameplay.c)
│   └── Client input over network
│
├── VON Manager (3_game/vonmanager.c)
│   └── Voice communication
│
├── PlayerIdentity (3_game/gameplay.c)
│   └── Player identification
│
└── Hive (3_game/hive/)
    └── Server-to-database persistence
```

## ScriptRPC

ScriptRPC is the primary mechanism for script-level network communication:

```c
class ScriptRPC {
    // Send RPC
    void Send(Param params, bool reliable);
    void SendToServer(Param params, bool reliable);
    void SendToClient(int playerId, Param params, bool reliable);
    
    // Receive RPC
    void OnReceive(Param params, int sourcePlayerId);
    
    // Serialization
    void Write(ParamSerializer serializer);
    void Read(ParamSerializer serializer);
    
    // Registration
    static int RegisterRPC(string name);
    static ScriptRPC FindRPC(int rpcId);
};
```

### RPC Types

```c
enum RPCDestination {
    SERVER,         // Client → Server
    CLIENT,         // Server → Single client
    ALL_CLIENTS,    // Server → All clients
    ALL_EXCEPT_SOURCE, // Server → All except sender
};
```

### RPC Flow

```
Client Action
    ↓
ScriptRPC.SendToServer(params)
    ↓
[Network transmission]
    ↓
Server receives → OnReceive()
    ↓
Process/validate
    ↓
ScriptRPC.SendToClient(respondent, params)
    ↓
[Network transmission]
    ↓
Client receives → OnReceive()
    ↓
Update game state
```

## ScriptInputUserData

Handles client input over the network:

```c
class ScriptInputUserData {
    // Input serialization
    void WriteInput(int actionId, float value);
    void WriteInputVector(int actionId, vector value);
    
    // Input reading (server side)
    float ReadInput(int actionId);
    vector ReadInputVector(int actionId);
    
    // Send input to server
    void SendToServer();
};
```

## Player Identity

Players are identified by `PlayerIdentity`:

```c
class PlayerIdentity {
    int GetPlayerId();              // Unique player ID
    string GetName();               // Player name
    string GetSteamId();            // Steam ID
    string GetIPAddress();          // IP address
    int GetPing();                  // Current ping
};
```

## Network Synchronization

### Entity Replication

Entity state is synchronized through:
- **Position/rotation**: Interpolated for smooth movement
- **Health/damage**: Event-based updates
- **Inventory changes**: RPC-based updates
- **Animation state**: Periodic snapshot + interpolation

### Ownership

```c
class EntityAI {
    bool IsOwnedByClient();         // Is this entity owned by local client?
    int GetOwner();                 // Owner player ID
    void SetOwner(int playerId);    // Transfer ownership
};
```

### Relevancy

Not all entities are replicated to all clients:
- **Distance-based**: Entities far away aren't replicated
- **Line of sight**: Behind-walls optimization
- **Priority**: Important entities (players) get higher update frequency

## Bandwidth Considerations

- **RPC reliability**: Critical actions use reliable delivery, frequent state uses unreliable
- **Update rate**: Position updates at 10-30 Hz, less critical state at lower rates
- **Compression**: Vectors quantized, floats reduced precision
- **Delta compression**: Only changed state sent

## Integration with Other Systems

- **All game state changes**: Inventory, health, position, animation all use RPC
- **VON**: Voice chat uses UDP for low-latency transmission
- **Persistence**: Hive system uses network (server → database)
- **HTTP**: Backend communication for analytics, server lists
