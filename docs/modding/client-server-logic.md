# Client/Server Logic

DayZ runs two separate code paths: a **server** and multiple **clients**. Understanding how scripts are split between these contexts is essential for writing mods that work correctly in multiplayer.

## Preprocessor Defines

The Enforce Script compiler uses preprocessor defines to conditionally compile code for server or client. These are defined at build time based on how the game binary was compiled.

### Key Defines

From `P:/scripts/staticdefinesdoc.c`:

| Define | Available On | Description |
|--------|-------------|-------------|
| `SERVER` | Server (all PC builds with `-server` flag) | Game runs as server |
| `RELEASE` | Retail builds | Retail client and server |
| `DEVELOPER` | Dev builds | Binarize, debug, releaseAsserts, releaseNoOpt, Workbench |
| `PLATFORM_WINDOWS` | Windows | Windows PC builds |
| `PLATFORM_CONSOLE` | Console | Xbox and PS4 builds |
| `WORKBENCH` | Workbench | Game runs from Workbench IDE |
| `NO_GUI` | Server | Server has no GUI subsystem |

### Build Configurations

From the game's documented defines:

| Build | Defines Active |
|-------|---------------|
| **Release (dev)** | `DEVELOPER`, `PLATFORM_WINDOWS` (+ `SERVER`, `NO_GUI`, `NO_GUI_INGAME` if `-server`) |
| **Retail client** | `RELEASE`, `PLATFORM_WINDOWS` |
| **Retail server** | `RELEASE`, `PLATFORM_WINDOWS`, `SERVER`, `NO_GUI`, `NO_GUI_INGAME` |
| **Workbench** | `DEVELOPER`, `PLATFORM_WINDOWS`, `WORKBENCH` |

### Using Defines in Mod Code

```c
// Code here runs on both client and server

#ifdef SERVER
    // Code here runs ONLY on the server
    // Database writes, AI spawning, world persistence
#endif

#ifndef SERVER
    // Code here runs ONLY on the client
    // UI updates, camera effects, HUD elements
#endif
```

> **Important**: `#ifdef SERVER` means "if SERVER is defined" — it's true on the server. `#ifndef SERVER` means "if SERVER is NOT defined" — it's true on clients and Workbench.

## Client-Side Code

Client-side code handles rendering, input, audio, and UI — anything that only a specific player should see or hear.

### ClientData — Synchronized Client State

The `ClientData` class in `P:/scripts/3_game/client/clientdata.c` manages per-client state that is synchronized from the server:

```c
class ClientData
{
    static ref ScriptInvoker SyncEvent_OnPlayerListUpdate = new ScriptInvoker();
    static ref ScriptInvoker SyncEvent_OnEntityKilled = new ScriptInvoker();
    static ref ScriptInvoker SyncEvent_OnPlayerIgnitedFireplace = new ScriptInvoker();
    
    static ref array<Man> m_PlayerBaseList = new array<Man>;
    static ref SyncPlayerList m_PlayerList;
    static ref OnlineServices m_OnlineServices;
    
    static void AddPlayerBase( Man player )
    {
        if ( m_PlayerBaseList && player != GetGame().GetPlayer() )
            m_PlayerBaseList.Insert( player );
    }
    
    static void RemovePlayerBase( Man player )
    {
        if ( m_PlayerBaseList )
            m_PlayerBaseList.RemoveItem( player );
    }
};
```

Key patterns in `ClientData`:
- Static ScriptInvoker events for synchronized state updates
- Player list management (tracking other players)
- Entity kill notifications for client-side effects

### Client Notifications

From `P:/scripts/3_game/client/notifications/`:

Client notifications display messages to the local player. They are typically triggered via `ScriptRPC` from the server and rendered only on the receiving client.

### Client Sync Data

From `P:/scripts/3_game/client/syncdata.c`:

Client receives synchronized game state from the server and applies it locally. This includes:
- Player position and orientation
- Inventory state
- Health and status effects
- World state (weather, time)

## Server-Side Code

Server-side code handles authoritative game logic: spawning, persistence, AI, damage calculation, and state validation.

### MissionServer

The `MissionServer` class in `P:/scripts/5_mission/mission/missionserver.c` is the entry point for server-side mission logic:

```c
class MissionServer extends MissionBase
{
    ref array<Man> m_Players;
    ref array<ref CorpseData> m_DeadPlayersArray;
    ref map<PlayerBase, ref LogoutInfo> m_LogoutPlayers;
    ref RainProcurementHandler m_RainProcHandler;
    
    void MissionServer()
    {
        GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY).CallLater(
            this.UpdatePlayersStats, 30000, true
        );
        m_DeadPlayersArray = new array<ref CorpseData>;
        m_Players = new array<Man>;
        m_LogoutPlayers = new map<PlayerBase, ref LogoutInfo>;
        m_RainProcHandler = new RainProcurementHandler(this);
    }
    
    override void OnInit()
    {
        super.OnInit();
        CfgGameplayHandler.LoadData();
        PlayerSpawnHandler.LoadData();
    }
}
```

Server responsibilities:
- **Player tracking**: join/leave/logout management
- **Scheduled updates**: periodic callbacks (e.g., `UpdatePlayersStats` every 30s)
- **World persistence**: saving/loading world state
- **Rain/sound systems**: server-side environmental systems
- **Spawn configuration**: reading `CfgGameplayHandler` data

### Server Config Profiles

From `P:/scripts/profile_fixed.cfg` — the server defines console presets (predefined gear sets for testing):

```cpp
console_presets={
    "FreshSpawn","Farmer","Fisherman","Hunter","Medic",
    "Military_East","Military_USMC","Military_Sniper",
    "Mechanic","Bob_The_Builder","Policeman","Knight"
};

FreshSpawn={{cmd="clear_inv"},
    {name="TShirt_Beige"},{name="CanvasPantsMidi_Grey"},
    {name="AthleticShoes_Blue"},{name="Chemlight_White"},
    {name="Apple"},{name="BandageDressing"}
};
```

These presets are used by the server console and script console for quickly spawning with specific gear loads.

## Client/Server Communication

### ScriptRPC

Remote Procedure Calls (RPCs) are the primary mechanism for client↔server communication. The `ScriptRPC` class is defined in `P:/scripts/3_game/gameplay.c`:

```c
// Sending
ScriptRPC rpc = new ScriptRPC();
rpc.Write(645);                    // int
rpc.Write("hello");                // string
array<float> farray = {1.2, 5.6, 8.1};
rpc.Write(farray);                 // array<float>
rpc.Send(m_Player, ERPCs.RPC_TEST, true, m_Player.GetIdentity());

// Receiving
void OnRPC(ParamsReadContext ctx)
{
    int num;
    string text;
    array<float> farray;
    ctx.Read(num);
    ctx.Read(text);
    ctx.Read(farray);
}
```

### RPC Direction

| Direction | Typical Use Cases |
|-----------|------------------|
| **Client → Server** | Player actions: use item, fire weapon, move inventory |
| **Server → Client** | State updates: damage taken, inventory changes, effects |
| **Server → All Clients** | Broadcast: entity killed, global event, weather change |
| **Client → All Clients (via server)** | Chat messages, emotes |

### SyncPlayerList

The `SyncPlayerList` system (referenced in `ClientData`) synchronizes the list of connected players between server and all clients:

```c
// Server updates the player list and broadcasts it
SyncPlayerList playerList = new SyncPlayerList();
// ... populate player data
ClientData.SyncEvent_OnPlayerListUpdate.Invoke(playerList);
```

> **Note:** The pattern above shows invoking `SyncEvent_OnPlayerListUpdate` with a locally created `SyncPlayerList`. In practice, the actual sync pattern in DayZ may differ — the server typically sends a serialized player list via RPC, and `ClientData` deserializes it on the client side before firing this event. Invoking with a locally constructed list may not replicate the actual sync behavior.

## ScriptInvoker Pattern

`ScriptInvoker` provides event-based communication within the same process (client or server). From `P:/scripts/3_game/client/clientdata.c`:

```c
static ref ScriptInvoker SyncEvent_OnPlayerListUpdate = new ScriptInvoker();
```

Other systems subscribe to these events:

```c
// Subscribe
ClientData.SyncEvent_OnPlayerListUpdate.Insert(MyHandler);

// Handler
void MyHandler(SyncPlayerList list)
{
    // React to updated player list
}

// Unsubscribe when done
ClientData.SyncEvent_OnPlayerListUpdate.Remove(MyHandler);
```

## Global Code

Code outside `#ifdef SERVER` / `#ifndef SERVER` blocks runs on **both** client and server. From `P:/scripts/3_game/global/game.c`:

```c
// game.c — runs everywhere
// Note: The Game class in 2_gamelib/gamelib.c has zero members.
// These methods are on CGame / DayZGame in 3_game/global/game.c
class CGame
{
    proto native IEntity SpawnEntity(typename typeName);
    proto native IEntity SpawnEntityTemplate(vobject templateResource);
    proto native owned string GetBuildVersion();
    proto native owned string GetBuildTime();
    proto native GenericWorldEntity GetWorldEntity();
    proto native InputManager GetInputManager();
    proto native MenuManager GetMenuManager();
    proto native int GetTickCount();
};
```

The global directory (`P:/scripts/3_game/global/`) contains:
- `game.c` — Core game class with all engine-level methods
- `world.c` — World entity methods
- `dayzphysics.c` — Physics helpers
- `pboapi.c` — PBO file system API
- `uuid.c` — UUID generation
- `errormodulehandler/` — Error reporting modules

## Modding Guidance for Client/Server

### Do's

- ✅ Wrap server-only logic (spawning, persistence) in `#ifdef SERVER`
- ✅ Wrap client-only logic (UI, HUD, camera effects) in `#ifndef SERVER`
- ✅ Use ScriptRPC for client→server and server→client communication
- ✅ Use ScriptInvoker for same-process event communication
- ✅ Keep synchronized data structures shared between client/server in global scope

### Don'ts

- ❌ Don't call client-side rendering APIs from server code
- ❌ Don't perform authoritative game logic on the client
- ❌ Don't use `#ifdef SERVER` when `#ifndef SERVER` would be more readable
- ❌ Don't hardcode player-specific state in server-only classes
