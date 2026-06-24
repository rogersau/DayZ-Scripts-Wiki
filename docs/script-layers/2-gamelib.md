# Layer 2: Game Library (`2_gamelib/`)

**Directory**: `/p/scripts/2_gamelib/`

Layer 2 provides a **game-engine-agnostic reusable framework**. It defines the `Game` base class that `DayZGame` inherits from, along with input abstraction, menu/dialog management, deferred call execution, declarative settings, and basic script-managed entities. No DayZ-specific concepts exist at this layer.

## Files

| File | Contents |
|------|----------|
| `gamelib.c` | `Game` base class with lifecycle hooks, world management, singleton accessor |
| `inputmanager.c` | `ActionManager` and `InputManager` for input action abstraction |
| `menumanager.c` | `MenuManager` for dialog and menu management |
| `tools.c` | `ScriptCallQueue` and `ScriptInvoker` utility classes |
| `settings.c` | Declarative settings framework |

### Directories

| Directory | Contents |
|-----------|----------|
| `components/` | Shared component definitions (`gamelibcomponents.c`) |
| `entities/` | Script-managed entities: render targets, cameras, lights, models, world menu, and generic entity base (`gamelibentities.c`) |
| `tests/` | Unit test framework (`testingframework.c`) |

## Key Details

### Game Base Class (`gamelib.c`)

The `Game` class (defined in a `#ifdef GAME_TEMPLATE` block) provides the fundamental game lifecycle:

**Lifecycle hooks**:
```c
class Game {
    void OnEvent(EventType type, Param params);  // Event handling
    void OnAfterInit();                            // Post-initialization
    void OnUpdate(float delta);                    // Per-frame update
    void OnGameStart();                            // Game session start
    void OnGameEnd();                              // Game session end
};
```

**World management**:
- `SetWorldFile(string file)` / `GetWorldFile()` — World file path management
- Entity instantiation helpers

**Global singleton**:
- `g_Game` / `GetGame()` — Global accessor for the game instance (used throughout all layers)

### Input Manager (`inputmanager.c`)

Provides a flexible input abstraction layer:

**ActionManager**:
- Register action contexts and actions
- Query action values (digital/analog)
- Add/remove input listeners
- Supports multiple input devices (keyboard, mouse, gamepad)

**InputManager** (extends ActionManager):
- Reset actions
- Cursor position management
- Register/unregister input sub-managers

**InputTrigger enum**: UP, DOWN, PRESSED, VALUE

### Menu Manager (`menumanager.c`)

Centralized dialog and menu management:

**MenuManager**:
- `OpenMenu(int preset, ...)` — Open a menu by preset enum
- `FindMenu(int preset)` — Find an open menu
- `CloseMenu(int preset)` — Close a menu
- Dialog registration and lifecycle

**DialogPriority**: INFORMATIVE, WARNING, CRITICAL

**DialogResult**: PENDING, OK, YES, NO, CANCEL

### Tools (`tools.c`)

**ScriptCallQueue** — Deferred function execution:
```c
// Schedule a function to run later
ScriptCallQueue callQueue;
callQueue.CallLater(MyFunction, delayMs, repeat);

// Remove from queue
callQueue.Remove(MyFunction);
callQueue.RemoveByName("FunctionName");
```

**ScriptInvoker** — Callback management:
- `Insert(function)` / `Remove(function)` — Manage callback list
- `Invoke(...)` — Fire all registered callbacks

### Settings System (`settings.c`)

Declarative settings with lifecycle hooks:

```c
class Settings {
    void OnChange();    // Called when a setting changes
    void OnLoad();      // Called when settings are loaded
    void OnSave();      // Called when settings are saved
    void OnReset();     // Called when settings are reset to defaults
    void OnRevert();    // Called when changes are reverted
    void OnApply();     // Called when settings are applied
};

class GameSettings : Settings {
    // Uses [Attribute] decorators for auto-binding
    [Attribute("100", "0", "1000")]
    static float MouseSensitivity;
};
```

**SettingsMenu**: Add, save, reset, revert, and apply settings classes within a menu.

### Entities (`entities/`)

Contains script-managed versions of engine entities:
- `rendertarget.c` — Render target management
- `scriptcamera.c` — Script-controlled cameras
- `scriptlight.c` — Script-controlled lights
- `scriptmodel.c` — Script-controlled models
- `worldsmenu.c` — World selection menu base
