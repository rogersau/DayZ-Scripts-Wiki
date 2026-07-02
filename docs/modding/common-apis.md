# Common APIs for Modding

This page documents the most frequently used APIs when developing DayZ mods. All examples are grounded in the actual source at `P:\`.

> **Language primer:** See the [Enforce Script Language Reference](/modding/enforce-syntax) if you need a refresher on syntax, types, or keywords used in the code examples below.

## GetGame() — The Global Game Singleton

`GetGame()` returns the global `DayZGame` instance, which is the central access point for most engine services.

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
};
```

> **Important:** The `Game` class in `2_gamelib/gamelib.c` has **zero additional members**. All engine-level methods (`SpawnEntity`, `GetWorldEntity`, `GetInputManager`, `GetPlayer`, etc.) live on `CGame` / `DayZGame` in `3_game/global/game.c`. Since `GetGame()` returns the `DayZGame` singleton at runtime, calling `GetGame().SomeMethod()` still works — but the methods are defined on `DayZGame`, not on the base `Game` class shown above.

### Common GetGame() Usage

```c
// Get the local player (returns DayZPlayer, not IEntity)
DayZPlayer player = DayZPlayer.Cast(GetGame().GetPlayer());

// Get current world entity
World world = World.Cast(GetGame().GetWorldEntity());

// Get a call queue for scheduling
ScriptCallQueue queue = GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY);

// Get build info
string version = GetGame().GetBuildVersion();
string buildTime = GetGame().GetBuildTime();
```

## CallQueue — Scheduled Execution

The `CallQueue` system allows scheduling functions to run after a delay or repeatedly. It lives in `2_gamelib`.

### CallQueue Methods

```c
ScriptCallQueue queue = GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY);

// Run once after a delay (delay in milliseconds — int, NOT float)
queue.CallLater(MyFunction, 5000);           // 5000 ms = 5 seconds

// Run repeatedly
queue.CallLater(MyFunction, 1000, true);     // 1000 ms = 1 second

// For string-named functions, use CallLaterByName:
// CallLaterByName(obj, "functionName", delayMs, ...)

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

> **Note:** `ErrorExSeverity` only defines `WARNING` and `ERROR`. There is no `FATAL` severity level.

## Config CPP — Runtime Data Access

Mods read config data at runtime using standalone config lookup functions:

```c
// Get config value by path
float weight = ConfigGetFloat("CfgWeapons M4A1 weight");

string model;
ConfigGetText("CfgVehicles Hatchback_02 model", model);

// Iterate config children
void EnumerateWeapons()
{
    int count = ConfigGetChildrenCount("CfgWeapons");
    for (int i = 0; i < count; i++)
    {
        string className;
        ConfigGetChildName("CfgWeapons", i, className);
        Print(className);
    }
}
```

> **Note:** These are standalone functions — NOT methods on `GetGame()`. The signatures are `ConfigGetFloat(string path)`, `ConfigGetText(string path, out string value)`, `ConfigGetChildrenCount(string path)`, and `ConfigGetChildName(string path, int index, out string name)`.

## SpawnEntity — Runtime Entity Creation

```c
// GetGame().SpawnEntity(...) requires an InventoryLocation parameter.
// To spawn entities in the world at a position, use CreateObjectEx instead.

// Spawn an entity in the world at a position:
EntityAI item = EntityAI.Cast(
    GetGame().CreateObjectEx("M4A1", "5.0 0.0 5.0", ECE_PLACE_ON_SURFACE)
);
```

> **Note:** There is no `SpawnEntity(type, position)` signature that takes a position string directly. `SpawnEntity` requires `InventoryLocation` for inventory-based spawning. Use `CreateObjectEx` for world-position spawning.

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
| `GetGame()` | `2_gamelib/gamelib.c` | Central game singleton (returns `DayZGame`) |
| `CallQueue` | `2_gamelib/` | Schedule delayed/repeating callbacks |
| `ScriptRPC` | `3_game/gameplay.c` | Network client↔server messaging |
| `JsonSerializer` | `3_game/gameplay.c` | JSON ↔ script serialization |
| `ScriptInvoker` | `2_gamelib/` | In-process pub/sub events |
| `Print`/`Error`/`ErrorEx` | Engine built-in | Console/error logging |
| `ConfigGetFloat` / `ConfigGetText` / etc. | Standalone functions | Read config.cpp at runtime |
| `CreateObjectEx` | `DayZGame` | Create entities at world position |
