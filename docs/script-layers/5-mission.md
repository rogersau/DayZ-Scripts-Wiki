# Layer 5: Mission (`5_mission/`)

**Directory**: `/p/scripts/5_mission/`

Layer 5 is the **top of the script stack**. It provides the mission entry point (factory function), mission lifecycle management, and the entire user interface — every screen, HUD element, menu, and tool the player sees or interacts with.

## Files

| File | Purpose |
|------|---------|
| `somemission.c` | Mission factory — `CreateMission(string path)` entry point |
| `dayzintroscene.c` | Intro cutscene (shared) |
| `dayzintroscenepc.c` | PC-specific intro cutscene |
| `dayzintroscenexbox.c` | Xbox-specific intro cutscene |

### `mission/` Directory

Mission lifecycle classes:

| File | Purpose |
|------|---------|
| `missionbase.c` | Core mission lifecycle (update, event handling, world management) |
| `missiongameplay.c` | In-game mission (the actual gameplay session) |
| `missionmainmenu.c` | Main menu mission |
| `missionserver.c` | Headless dedicated server mission |
| `missionbenchmark.c` | Benchmark/test mission |
| `dispatchercaller.c` | Dispatcher integration |
| `gameplayeffectwidgets/` | Gameplay effect widgets |

### `gui/` Directory

The entire UI layer — **70+ files** covering all player-facing screens.

#### HUD Elements

| File | Purpose |
|------|---------|
| `ingamehud.c` | Main in-game HUD |
| `ingamehudheatbuffer.c` | Heat buffer HUD display |
| `ingamehudvisibility.c` | Visibility indicator |
| `huddebug.c` | Debug HUD overlay |
| `crosshairselector.c` | Crosshair selector |
| `projectedcrosshair.c` | Projected crosshair for aiming |
| `objectfollower.c` | UI element following world objects |
| `watermark.c` | Server watermark |
| `stanceindicator.c` | Stance indicator |

#### Menus

| File | Purpose |
|------|---------|
| `actionmenu.c` | Context action menu |
| `bookmenu.c` | Book/item reading menu |
| `gesturesmenu.c` | Gesture/emote selection menu |
| `helpscreen.c` | Help/tutorial screen |
| `inspectmenunew.c` | Item inspection menu |
| `inventorymenu.c` | Inventory screen |
| `invitemenu.c` | Item interaction menu |
| `itemactionswidget.c` | Item action buttons |
| `itemdropwarningmenu.c` | Item drop confirmation |
| `loadingmenu.c` | Loading screen |
| `logoutmenu.c` | Logout confirmation |
| `maphandler.c` | Map interaction handling |
| `mapmarkersinfo.c` | Map marker information |
| `mapmenu.c` | Map screen |
| `notemenu.c` | Note viewing/writing |
| `presetsmenu.c` | Character preset selection |
| `profileoptionsui.c` | Profile/options screen |
| `radialquickbarmenu.c` | Radial quick bar |
| `respawndialogue.c` | Respawn screen |
| `startupmenu.c` | Startup/launch screen |
| `titlescreenmenu.c` | Title screen |
| `earlyaccessmenu.c` | Early access info |

#### Script Console

| File | Purpose |
|------|---------|
| `scriptconsole.c` | Developer script console (main) |
| `camera_tab.c` | Camera debugging tab |
| `config_tab.c` | Config inspection tab |
| `enfscript_tab.c` | Script execution tab |
| `general_tab.c` | General info tab |
| `items_tab.c` | Item spawning tab |
| `output_tab.c` | Console output tab |
| `presets_tab.c` | Console presets tab |
| `selector_tab.c` | Entity selector tab |
| `sounds_tab.c` | Sound testing tab |
| `vicinity_tab.c` | Vicinity browser tab |
| `weather_tab.c` | Weather control tab |

#### Other GUI

| File/Directory | Purpose |
|----------------|---------|
| `chat/` | Chat system UI |
| `connectiondialogue.c` | Connection status dialogue |
| `continuousactionprogress.c` | Action progress bar |
| `controlsxbox.c` / `controlsxboxnew.c` | Xbox controller layouts |
| `inputdevicedisconnectwarningmenu.c` | Input device disconnect warning |
| `dayzplayerdebug/` | Player debugging tools |
| `debugmonitor.c` | Debug statistics monitor |
| `ingamemenu.c` | In-game pause menu |
| `inventory/` | Inventory UI |
| `inventorynew/` | New inventory UI |
| `cameratools/` | Camera tools UI |
| `sceneeditormenu/` | Scene editor UI |
| `scriptedwindows/` | Scriptable window system |
| `scriptshuddebug/` | Script HUD debugging |
| `staticguiutils.c` | Shared GUI utility functions |
| `vehicles/` | Vehicle UI |
| `widgeteventhandler.c` | Widget event handling |
| `newui/` | New UI system directory |
| `actiontargetscursor.c` | Action target cursor |

## Mission Factory (`somemission.c`)

The entry point for the entire game mode system:

```c
Mission CreateMission(string path)
{
    if (!g_Game.IsMultiplayer() && !g_Game.IsServer())
    {
        // Single player — use main menu
        return new MissionMainMenu();
    }
    
    if (g_Game.IsServer() && g_Game.IsMultiplayer())
    {
        // Dedicated server
        return new MissionServer();
    }
    
    // Check for "NoCutscene" or "intro" in path
    if (path.Contains("NoCutscene"))
        return new MissionGameplay();
    
    if (path.Contains("intro"))
        return new MissionMainMenu();
    
    // Default: full mission
    return new MissionGameplay();
}
```

This factory function decides which mission class to instantiate:
- **MissionServer**: Headless server (no rendering, no UI)
- **MissionMainMenu**: Main menu with optional cutscene
- **MissionGameplay**: Full in-game mission
- **MissionDummy**: Fallback for edge cases

## How Layers 1-5 Fit Together

A file in `5_mission/gui/inventorymenu.c` can reference:
- `4_world/classes/playerstats/` for player stat data
- `3_game/dayzplayer.c` for the player entity
- `3_game/systems/inventory/` for inventory logic
- `2_gamelib/gamelib.c` to access `GetGame()`
- `1_core/param.c` for Param serialization
- `1_core/proto/enwidgets.c` for native widget functions

This layered dependency is what makes the architecture powerful — the UI can access anything below it, but the core doesn't know about the UI.
