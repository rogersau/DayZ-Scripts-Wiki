# Common APIs for Modding

This page documents the most frequently used APIs when developing DayZ mods. All examples are grounded in the actual source at `P:\`.

## GetGame() — The Global Game Singleton

`GetGame()` returns the global `DayZGame` (or `Game` base class) instance, which is the central access point for most engine services.

From `P:/scripts/2_gamelib/gamelib.c`:

```c
Game g_Game;

Game GetGame()
{
    return g_Game;
}

class Game
{
    ScriptModule GameScript;
    
    ScriptModule GetScriptModule() { return GameScript; }
    
    // Safe entity instantiation
    proto native IEntity SpawnEntity(typename typeName);
    
    // Spawn from template (with components)
    proto native IEntity SpawnEntityTemplate(vobject templateResource);
    
    // Find entity by name
    proto native IEntity FindEntity(string name);
    
    // Get build version string
    proto native owned string GetBuildVersion();
    
    // World entity when in-game
    proto native GenericWorldEntity GetWorldEntity();
    
    // Input and UI managers
    proto native InputManager GetInputManager();
    proto native MenuManager GetMenuManager();
    
    // High-resolution tick count
    proto native int GetTickCount();
    
    // Exit game
    proto native void RequestClose();
    
    // Reload game (Workbench only)
    proto native void RequestReload();
};
```

### Common GetGame() Usage

```c
// Get the local player
PlayerBase player = PlayerBase.Cast(GetGame().GetPlayer());

// Get current world
GenericWorldEntity world = GetGame().GetWorldEntity();

// Get a call queue for scheduling
ScriptCallQueue queue = GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY);

// Spawn an entity
IEntity myEntity = GetGame().SpawnEntity(MyCustomItem);

// Get build info
string version = GetGame().GetBuildVersion();
string buildTime = GetGame().GetBuildTime();
```

## CallQueue — Scheduled Execution

The `CallQueue` system allows scheduling functions to run after a delay or repeatedly. It lives in `2_gamelib`.

### CallQueue Methods

```c
ScriptCallQueue queue = GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY);

// Run once after a delay
queue.CallLater(MyFunction, 5000);           // 5 seconds

// Run repeatedly
queue.CallLater(MyFunction, 1000, true);     // Every 1 second

// Remove a scheduled callback
queue.Remove(MyFunction);
```

### Call Categories

| Category | Purpose |
|----------|---------|
| `CALL_CATEGORY_GAMEPLAY` | Game logic timers (default) |
| `CALL_CATEGORY_SYSTEM` | Engine system timers |
| `CALL_CATEGORY_GUI` | UI-related timers |

Real example from `P:/scripts/5_mission/mission/missionserver.c`:

```c
void MissionServer()
{
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY).CallLater(
        this.UpdatePlayersStats, 30000, true
    );
}

void ~MissionServer()
{
    GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY).Remove(
        this.UpdatePlayersStats
    );
}
```

## ScriptRPC — Network Communication

`ScriptRPC` enables sending data between client and server. Defined in `P:/scripts/3_game/gameplay.c`.

### RPC Structure

```c
// --- Sending ---
ScriptRPC rpc = new ScriptRPC();
rpc.Write(42);                          // int
rpc.Write(3.14f);                       // float
rpc.Write("hello world");               // string
rpc.Write(someArray);                   // array<T> (any type)
rpc.Write(someVector);                  // vector

// Send to server
rpc.Send(null, ERPCs.RPC_MY_EVENT, true);                     // Client→Server

// Send to specific player
rpc.Send(m_Player, ERPCs.RPC_MY_EVENT, true, identity);       // Server→Client

// Send to all
rpc.Send(null, ERPCs.RPC_MY_EVENT, true, null, true);         // Server→All
```

### Receiving RPCs

```c
// In a Mission class or Player class:
void OnRPC(ParamsReadContext ctx)
{
    int myInt;
    float myFloat;
    string myString;
    array<int> myArray;
    
    ctx.Read(myInt);
    ctx.Read(myFloat);
    ctx.Read(myString);
    ctx.Read(myArray);
    
    // Handle the RPC data
}
```

### Serializer — Data Serialization

`Serializer` (aliased as `ParamsReadContext` / `ParamsWriteContext`) is the base class for reading/writing RPC data:

```c
typedef Serializer ParamsReadContext;
typedef Serializer ParamsWriteContext;
```

## JsonSerializer — JSON Serialization

For structured data, `JsonSerializer` provides JSON↔script variable conversion. Defined in `P:/scripts/3_game/gameplay.c`:

```c
class JsonSerializer: Serializer
{
    // Serialize script object to JSON string
    proto bool WriteToString(void variable_out, bool nice, out string result);
    
    // Deserialize JSON string to script object
    proto bool ReadFromString(void variable_in, string jsonString, out string error);
};
```

### Usage

```c
JsonSerializer js = new JsonSerializer();

// Write to JSON
MyData data;
string jsonOut;
js.WriteToString(data, true, jsonOut);     // true = pretty-print

// Read from JSON
MyData dataIn;
string error;
bool ok = js.ReadFromString(dataIn, jsonString, error);
if (!ok)
{
    ErrorEx("Failed to parse JSON: " + error);
}
```

## ScriptInvoker — Event System

`ScriptInvoker` provides a decoupled publish/subscribe pattern for in-process events.

From `P:/scripts/3_game/client/clientdata.c`:

```c
// Create an invoker (usually static)
static ref ScriptInvoker OnPlayerListChanged = new ScriptInvoker();

// Subscribe
OnPlayerListChanged.Insert(MyCallback);

// Fire
OnPlayerListChanged.Invoke(arg1, arg2);

// Unsubscribe
OnPlayerListChanged.Remove(MyCallback);
```

## Print, Error, ErrorEx — Logging

Three levels of console output:

```c
Print("Hello from my mod");                 // Basic log message
Error("Something went wrong");              // Error message
ErrorEx("Detailed error info",              // Structured error with severity
    ErrorExSeverity.WARNING);
```

`ErrorEx` supports severity levels (from `P:/scripts/3_game/global/errormodulehandler/`):

| Severity | Description |
|----------|-------------|
| `WARNING` | Non-critical issue |
| `ERROR` | Recoverable error |
| `FATAL` | Unrecoverable — may crash |

## Config CPP — Runtime Data Access

Mods read config data at runtime using config lookup functions:

```c
// Get config value by path
float weight = GetGame().GetConfigFloat("CfgWeapons M4A1 weight");
string model = GetGame().GetConfigText("CfgVehicles Hatchback_02 model");

// Check if class exists
bool exists = GetGame().ConfigIsExisting("CfgMagazines Mag_STANAG_60Rnd");

// Iterate config children
void EnumerateWeapons()
{
    int count = GetGame().ConfigGetChildrenCount("CfgWeapons");
    for (int i = 0; i < count; i++)
    {
        string className;
        GetGame().ConfigGetChildName("CfgWeapons", i, className);
        Print(className);
    }
}
```

## SpawnEntity — Runtime Entity Creation

```c
// Spawn from class name
IEntity item = GetGame().SpawnEntity(M4A1);

// Spawn at a specific position
ItemBase myItem = ItemBase.Cast(GetGame().SpawnEntity(
    M4A1,
    "1.0 0.0 1.0",          // world position
    "0 0 0",                 // orientation
    "0 0 0"                  // velocity
));

// Spawn vehicle
Car vehicle = Car.Cast(GetGame().SpawnEntity(
    Hatchback_02,
    position, rotation, velocity
));
```

## Hive — Persistence API

From `P:/scripts/3_game/hive/hive.c`:

The hive system handles reading/writing persistent data to the database:

```c
// Create a hive request
HiveRequest request = new HiveRequest();

// Write player data
request.WritePlayerData(player);

// Read world data
request.ReadWorldData();

// Execute (server only)
request.Execute();
```

Key hive operations:
- **Player data**: inventory, health, position, stats
- **World data**: spawned items, vehicle states, base building
- **Character data**: equipped gear, appearance

## Timers — Frame-Based and Real-Time

```c
// Get current game time (in seconds)
float gameTime = GetGame().GetTime();

// Get delta time (in OnUpdate)
void OnUpdate(float timeslice)
{
    // timeslice = seconds since last frame
    float dt = timeslice;
}
```

## RPC Registration — Adding Custom RPCs

To add your own RPC type:

```c
// 1. Define your RPC ID in the ERPCs enum (or use a custom range)
enum ERPCs
{
    RPC_MY_MOD_EVENT = 1000,     // Use high numbers for custom RPCs
    RPC_MY_MOD_SYNC  = 1001,
    // ...
}

// 2. Register your RPC handler (in OnInit or constructor)
GetGame().RPCRegisterClient(RPC_MY_MOD_EVENT, this, "OnMyModEvent");

// 3. Implement the handler
void OnMyModEvent(ParamsReadContext ctx, PlayerIdentity sender)
{
    // Handle the RPC
}

// 4. Send the RPC
ScriptRPC rpc = new ScriptRPC();
rpc.Write(someData);
rpc.Send(null, ERPCs.RPC_MY_MOD_EVENT, true, targetIdentity);
```

## Summary

| API | Location | Purpose |
|-----|----------|---------|
| `GetGame()` | `2_gamelib/gamelib.c` | Central game singleton |
| `CallQueue` | `2_gamelib/` | Schedule delayed/repeating callbacks |
| `ScriptRPC` | `3_game/gameplay.c` | Network client↔server messaging |
| `JsonSerializer` | `3_game/gameplay.c` | JSON ↔ script serialization |
| `ScriptInvoker` | `2_gamelib/` | In-process pub/sub events |
| `Print`/`Error`/`ErrorEx` | Engine built-in | Console/error logging |
| Config functions | `Game` class | Read config.cpp at runtime |
| `SpawnEntity` | `Game` class | Create entities at runtime |
| Hive API | `3_game/hive/hive.c` | Database persistence |
