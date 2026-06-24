# Debugging

DayZ provides several powerful debugging tools built into the game client. This page documents how to use them when developing mods.

## Script Console

The script console is accessible **in-game** by pressing the **Left Shift + NumPad -** key. It provides extensive debugging capabilities through multiple tabs.

From `P:/scripts/5_mission/gui/scriptconsole.c` and its companion tab files.

### Available Tabs

| Tab | File | Purpose |
|-----|------|---------|
| **General** | `scriptconsolegeneraltab.c` | Run arbitrary Enforce Script, inspect variables |
| **Items** | `scriptconsoleitemstab.c` | Browse and spawn any item from config |
| **Camera** | `scriptconsolecameratab.c` | Control camera, teleport, fly mode |
| **Weather** | `scriptconsoleweathertab.c` | Override weather: rain, fog, wind, temperature, time |
| **Sounds** | `scriptconsolesoundstab.c` | List/play sounds, inspect audio sources |
| **Config** | `scriptconsoleconfigtab.c` | Browse config.cpp data at runtime |
| **Vicinity** | `scriptconsolevicinitytab.c` | Inspect entities near the player |
| **Output** | `scriptconsoleoutputtab.c` | View log output, filter by log level |

### General Tab — Running Scripts

The General tab (`P:/scripts/5_mission/gui/scriptconsolegeneraltab.c`) lets you execute arbitrary Enforce Script at runtime:

```c
// Inspect the player
PlayerBase player = PlayerBase.Cast(GetGame().GetPlayer());
Print(player.GetPosition());

// List inventory
array<EntityAI> items = player.GetInventory().GetItems();
foreach (EntityAI item : items)
{
    Print(item.GetType());
}

// Spawn an item nearby
EntityAI myItem = EntityAI.Cast(GetGame().SpawnEntity(
    "M4A1",
    player.GetPosition() + "1.0 0.0 0.0"
));
```

### Items Tab — Spawning Items

The Items tab reads from all `CfgWeapons`, `CfgMagazines`, `CfgVehicles`, etc. defined in configs — including items added by your mod. You can search, filter, and spawn items with one click.

### Camera Tab — Navigation

The Camera tab provides:
- **Free cam**: Detach camera for fly-around inspection
- **Teleport**: Move your character to a specific position
- **Speed multiplier**: Increase/decrease movement speed

### Weather Tab — Environment Debugging

The Weather tab (`P:/scripts/5_mission/gui/scriptconsoleweathertab.c`, ~56KB — the largest tab) lets you override:

```c
// What you can control:
- Rain intensity (0–1)
- Fog density (0–1)
- Wind speed and direction
- Temperature override
- Time of day
- Weather forecast snapshot
```

Useful for testing how your mod handles different weather conditions.

## Debug Monitor

The debug monitor shows real-time player stats as an overlay. From `P:/scripts/5_mission/gui/debugmonitor.c`:

```
Health:    10000/10000
Blood:     5000/5000
Shock:     0
Energy:    2500/2500
Water:     2500/2500
Temperature: 36.5
Wetness:   0
Stamina:   100/100
```

To enable: press **NumPad -** (without Shift).

You can also create custom debug monitors by subclassing or extending `DebugMonitor`:

```c
class MyModDebugMonitor : DebugMonitor
{
    override void Render()
    {
        super.Render();
        
        // Add custom stats
        DebugMonitor.AddLine("My Mod Value: " + GetMyModValue());
    }
}
```

## Console Presets (Server Config)

From `P:/scripts/profile_fixed.cfg`, the DayZ server defines console presets — character loadouts used for debugging:

```cpp
console_presets={
    "FreshSpawn","Farmer","Fisherman","Hunter",
    "Military_East","Military_USMC","Medic","Knight"
};

FreshSpawn={{cmd="clear_inv"},
    {name="TShirt_Beige"},{name="CanvasPantsMidi_Grey"},
    {name="AthleticShoes_Blue"},{name="Chemlight_White"},
    {name="Apple"},{name="BandageDressing"}
};
```

You can add your own presets to your mod's configuration for testing specific scenarios.

## Error Handling Modules

DayZ has a comprehensive error handling system in `P:/scripts/3_game/global/errormodulehandler/`. Key files:

| File | Purpose |
|------|---------|
| `errormodulehandler.c` | Core error routing and dispatching |
| `errorhandlermodule.c` | Base error handling logic |
| `errorproperties.c` | Error property definitions |
| `bioserrormodule.c` | Low-level BIOS/engine error capture |
| `clientkickedmodule.c` | Client disconnected/kicked handling |
| `connecterrorclientmodule.c` | Client connection error display |
| `connecterrorscriptmodule.c` | Script-side connection errors |
| `connecterrorservermodule.c` | Server connection errors |

### Using ErrorEx for Structured Logging

```c
ErrorEx("Mod initialization failed", ErrorExSeverity.ERROR);
ErrorEx("Non-critical config value missing", ErrorExSeverity.WARNING);
ErrorEx("Fatal: cannot continue", ErrorExSeverity.FATAL);
```

Errors appear in the script console's Output tab and the game's `.rpt` log file.

## Print vs ErrorEx

| Method | When to Use | Visible In |
|--------|------------|------------|
| `Print(x)` | General debug info, variable inspection | Script console Output tab, `.rpt` logs |
| `Error(msg)` | Something went wrong but recoverable | Script console, `.rpt`, in-game alerts |
| `ErrorEx(msg, severity)` | Structured error with severity level | Script console with severity filtering |

## Workbench Debugging

When developing in Workbench (the Enforce Script IDE), you get additional debugging capabilities:

### Breakpoints

Set breakpoints by clicking the gutter in the script editor. When execution hits a breakpoint:

- **Call stack**: Shows the chain of function calls that led to the breakpoint
- **Variable watch**: Inspect local, class, and global variables
- **Step over/into/out**: Control execution flow

### Real-Time Script Reloading

In Workbench play mode, you can:
1. Edit a script file
2. Press **Ctrl+R** to reload scripts without restarting
3. Your changes take effect immediately

> **Note**: This only works for script logic changes. Config changes still require a full restart.

### Proto-Native Function Inspection

Workbench provides signature documentation for all `proto native` functions. This is invaluable when calling engine-level APIs — you can see parameter types, return types, and documentation inline.

## Debug Weather RPC

From `P:/scripts/3_game/debugweatherrpcdata.c`:

The debug weather system allows overriding weather on a running server via RPC. This is useful for testing weather-dependent mod features:

```c
// Client sends weather override request
ScriptRPC rpc = new ScriptRPC();
rpc.Write(0.8f);    // Rain
rpc.Write(0.3f);    // Fog
rpc.Write(0.5f);    // Wind
rpc.Write(25.0f);   // Temperature
rpc.Send(null, ERPCs.RPC_DEBUG_WEATHER, true, null);
```

## Common Debugging Workflows

### 1. Testing Item Spawning

```c
// In script console, General tab:
EntityAI item = EntityAI.Cast(GetGame().SpawnEntity(
    "MyMod_MyCustomWeapon",
    GetGame().GetPlayer().GetPosition() + "0 2 0"  // 2m above ground
));
```

### 2. Testing Config Data

```c
// Check if your config loaded correctly:
float weight = GetGame().GetConfigFloat(
    "CfgWeapons MyMod_MyCustomWeapon weight"
);
Print("Weight: " + weight);
```

### 3. Testing RPC Communication

```c
// On the server side:
void OnMyModRPC(ParamsReadContext ctx, PlayerIdentity sender)
{
    string data;
    ctx.Read(data);
    Print("Received from " + sender.GetPlainName() + ": " + data);
}

// Client-side sending (in script console):
ScriptRPC rpc = new ScriptRPC();
rpc.Write("Test message from " + GetGame().GetPlayer().GetIdentity().GetPlainName());
rpc.Send(null, ERPCs.RPC_MY_MOD_EVENT, true);
```

### 4. Inspecting Entity State

```c
// Get all entities near the player
array<IEntity> nearby = new array<IEntity>;
GetGame().GetWorldEntity().GetEntitiesInSphere(
    GetGame().GetPlayer().GetPosition(), 10.0, nearby
);

foreach (IEntity entity : nearby)
{
    Print(entity.GetType() + " at " + entity.GetPosition());
}
```

## RPT Log Files

The DayZ client and server write `.rpt` log files to:

- **Client**: `%USERPROFILE%\AppData\Local\DayZ\*.rpt`
- **Server**: In the server installation directory

These logs contain:
- All `Print()` / `Error()` / `ErrorEx()` output
- Script compilation errors with file and line number
- Config loading errors
- Network synchronization warnings
- Crash diagnostics

> When debugging a mod, always check the `.rpt` file first — it often provides the exact error message and stack trace.
