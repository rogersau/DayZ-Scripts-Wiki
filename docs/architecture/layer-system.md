# The 5-Layer Script System

The DayZ Enforce Script code is organized into five numbered layers. This page provides an in-depth look at each layer, its contents, and how they interact.

## Layer Overview

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Mission (5_mission/)                          │
│  Mission lifecycle, GUI, HUD, menus                     │
├─────────────────────────────────────────────────────────┤
│  Layer 4: World (4_world/)                              │
│  Gameplay classes, world systems, plugins               │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Game (3_game/)                                │
│  DayZ-specific logic, entities, AI, effects, weather    │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Game Library (2_gamelib/)                     │
│  Reusable framework: Game base, input, menus, settings  │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Core (1_core/)                                │
│  Constants, Param system, proto native bindings         │
└─────────────────────────────────────────────────────────┘
```

## Layer 1: Core (`1_core/`)

**Purpose**: Provide the fundamental language-level primitives that everything else builds on.

**Key files**:
- `constants.c` — Global integer constants for input devices (KEYBOARD, MOUSE, STICK, XINPUT, GAMEPAD), input action types (STATE, DOWN_EVENT, UP_EVENT, HOLD, COMBO), and color constants
- `defines.c` — Documents preprocessor defines injected from C++: `DAYZ_X_XX` (version), `BULDOZER`, `WORKBENCH`, `NO_GUI`, `ENABLE_LOGGING`, `DEVELOPER`/`RELEASE`, etc.
- `param.c` — The `Param` class hierarchy (`Param1<T>` through `Param4<T1,T2,T3,T4>`) for typed serialization through generic APIs
- `workbenchapi.c` — Full Workbench IDE integration API
- `script.c` — Minimal test/reference material
- `proto/` — 18+ native engine function binding files: `enmath.c`, `enphysics.c`, `enentity.c`, `enaudio.c`, `envisual.c`, `enwidgets.c`, `enworld.c`, `enstring.c`, `ensystem.c`, `enscript.c`, `endebug.c`, `enprofiler.c`, `enserializer.c`, etc.

**What it provides**: Constants, preprocessor defines, the Param typed-parameter system, Workbench editor bindings, and all native engine function prototypes exposed to Enforce Script.

## Layer 2: Game Library (`2_gamelib/`)

**Purpose**: Provide a game-engine-agnostic reusable framework that any game project can inherit from.

**Key files**:
- `gamelib.c` — The `Game` placeholder (zero members at this layer). Engine globals `g_Game` / `GetGame()` are **not** members of `Game` — they are engine-provided accessor functions that return the `DayZGame` instance.
- `inputmanager.c` — `ActionManager` (register actions/contexts, query values, add listeners) and `InputManager` (reset actions, cursor position, register/unregister sub-managers)
- `menumanager.c` — `MenuManager` (open, find, close menus and dialogs), `DialogPriority` enum (INFORMATIVE/WARNING/CRITICAL), `DialogResult` enum, `MenuBindAttribute`
- `tools.c` — `ScriptCallQueue` (deferred/lazy function calls with delay, repeat, removal) and `ScriptInvoker` (callback list management)
- `settings.c` — Declarative settings system: `Settings` base class with `OnChange`, `OnLoad`, `OnSave`, `OnReset`, lifecycle hooks
- `entities/` — Script-managed entities: `rendertarget.c`, `scriptcamera.c`, `scriptlight.c`, `scriptmodel.c`, `worldsmenu.c`

**What it provides**: The `Game` placeholder, input abstraction, menu/dialog system, deferred call queue, declarative settings, and basic script entities. No DayZ-specific code lives here. The actual game lifecycle is in Layer 3's `CGame`/`DayZGame`.

## Layer 3: Game (`3_game/`)

**Purpose**: Implement DayZ-specific game logic. This is the largest layer.

**Key directories and files**:
- `dayzgame.c` (~3,900 lines) — `DayZGame` singleton (extends `CGame` from `3_game/global/game.c`), game state machine (MAIN_MENU, LOGIN, PLAYING), session management
- `dayzplayer.c` (~1,400 lines) — `DayZPlayer` (extends `Human`), camera system, weapon raising/aiming model, animation tables
- `human.c` (~1,700 lines) — `Human` (extends `Man`), `HumanInputController`, movement/melee/death/unconscious commands
- `gameplay.c` (~1,500 lines) — Serialization (`JsonSerializer`, `ScriptRPC`), geometry classes, world objects like `Plant`, UI widgets
- `constants.c` (~1,100 lines) — Game enums: chat channels, voice levels, object intersection types, hit direction constants
- `playerconstants.c` (~270 lines) — Player stat thresholds and metabolic rates
- `damagesystem.c` — Static damage utilities (melee, explosion, firearm damage)
- `effect.c` / `effectmanager.c` — Effect system (particles and sounds)
- `weather.c` (~13,400 lines) — Weather simulation (rain, fog, wind, clouds)
- `worlddata.c` (~15,900 lines) — World state management
- `ppeffects.c` (~20,300 lines) — Post-processing effects
- `entities/` — Core entity classes: `Object`, `Entity`, `EntityAI`, `Pawn`, `Man`, `Human`, `DayZPlayer`, `DayZInfected`, `DayZAnimal`, `Transport`, `Car`, `Boat`, `Helicopter`, `Building`, `InventoryItem`
- `ai/` — AI agents, groups, and behaviors
- `vehicles/` — Vehicle physics and simulation
- `systems/inventory/` — The FSM-driven inventory system (~30 files)
- `anim/` — Animation commands and physics agents
- `gui/` — GUI widgets (containers, effects, hints)

## Layer 4: World (`4_world/`)

**Purpose**: Implement the world simulation — all gameplay classes and systems that operate on the game objects.

**Key directories**:
- `classes/` — 77+ gameplay class files and directories covering:
  - **Combat**: `areadamage/`, `arrowmanager/`, `bleedingindication/`, `bleedingsources/`, `bullethitreaction/`, `destructioneffects/`, `explosion.c`, `hitindication/`, `shockhandler.c`, `recoilbase/`
  - **Player systems**: `playergearspawn/`, `playerlightmanager.c`, `playermodifiers/`, `playernotifiers/`, `playerstats/`, `playerstomach.c`, `playersymptoms/`, `staminahandler.c`, `softskillsmanager.c`
  - **Interaction**: `inventoryactionhandler.c`, `useractionscomponent/`, `craftingmanager.c`, `cooking/`, `recipes/`, `writtennotedata.c`, `contextmenu.c`
  - **Environment**: `contaminatedarea/`, `environment/`, `foodstage/`, `rainprocurement*.c`, `soundevents/`, `soundhandlers/`, `transmissionagents/`
  - **Utilities**: `debugmonitorvalues.c`, `keybinding.c`, `mousebinding.c`, `stanceindicator.c`, `camerashake.c`, `emotemanager.c`
- `systems/` — Four world systems: `animalcatchingsystem/`, `bot/`, `inventory/`, `universaltemperaturesource/`
- `plugins/` — `PluginBase` and `PluginManager` for modular feature registration
- `static/` — Static data/utility classes: `bloodtype.c`, `liquid.c`, `quantityconversions.c`, `surface.c`, `soundsetmap.c`, `miscgameplayfunctions.c`, `paintitem.c`, `openitem.c`

## Layer 5: Mission (`5_mission/`)

**Purpose**: Provide the mission entry point and the entire user interface.

**Key files**:
- `mission/` — Mission base classes: `missionbase.c` (root), `missiongameplay.c`, `missionmainmenu.c`, `missionserver.c`, `missionbenchmark.c`. The engine instantiates the appropriate subclass directly (no factory function in script).
- `dayzintroscene.c` / `dayzintroscenepc.c` / `dayzintroscenexbox.c` — Platform-specific intro cutscenes
- `gui/` — 70+ UI files covering all screens and HUD elements:
  - **HUD**: `ingamehud.c`, `crosshairselector.c`, `projectedcrosshair.c`, `objectfollower.c`, `watermark.c`, `stanceindicator.c`
  - **Menus**: `actionmenu.c`, `inventorymenu.c`, `bookmenu.c`, `helpscreen.c`, `inspectmenunew.c`, `mapmenu.c`, `notemenu.c`, `presetsmenu.c`, `startupmenu.c`, `titlescreenmenu.c`, `logoutmenu.c`, `respawndialogue.c`
  - **Tools**: `scriptconsole.c` + 9 tab files (camera, config, enfscript, general, items, output, presets, selector, sounds, vicinity, weather)
  - **Chat**: `chat/` directory
  - **New UI**: `newui/` directory

## Layer Dependency Rules

- A file in any layer can reference anything from a **lower-numbered** layer
- No layer may reference a **higher-numbered** layer
- Cross-layer references use the directory path convention, e.g.:
  - `5_mission/gui/` can reference `4_world/classes/playerstats/`, `3_game/dayzplayer.c`, `2_gamelib/gamelib.c`, and `1_core/param.c`
- The compilation order respects the layer numbering: 1 → 2 → 3 → 4 → 5

## Why Five Layers?

This separation provides several benefits:

1. **Testability**: Lower layers can be tested independently
2. **Reusability**: Layer 2 could be used by a different game project
3. **Separation of concerns**: UI code (Layer 5) is cleanly separated from game logic (Layer 3) and world simulation (Layer 4)
4. **Clear dependencies**: The numbered layers make dependency relationships explicit and prevent circular dependencies
