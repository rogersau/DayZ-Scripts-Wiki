# Layer 1: Core (`1_core/`)

**Directory**: `/p/scripts/1_core/`

Layer 1 is the foundation of the entire script stack. It provides the language-level primitives that every other layer depends on: constants, preprocessor defines, the `Param` serialization system, Workbench editor integration, and prototype bindings to all native engine functions.

## Files

| File | Contents |
|------|----------|
| `constants.c` | Global integer constants for input devices, input action types, and colors |
| `defines.c` | Documents preprocessor defines injected from C++ |
| `staticdefinesdoc.c` | Doxygen documentation listing all preprocessor defines and their build contexts (DEVELOPER, RELEASE, SERVER, WORKBENCH, etc.) |
| `param.c` | The `Param` typed-parameter serialization hierarchy |
| `script.c` | Minimal example/reference material for the material editor |
| `workbenchapi.c` | Full Workbench IDE integration API |

### `proto/` Directory

The `proto/` directory contains **native engine function prototypes** — the bridge between Enforce Script and the C++ Enfusion engine. These are `proto native` function declarations that expose engine subsystems to script code.

| File | Engine Subsystem |
|------|-----------------|
| `dbgui.c` | Debug GUI rendering |
| `enaudio.c` | Audio system (sound playback, mixing, spatial audio) |
| `enconvert.c` | Type conversion utilities |
| `endebug.c` | Debug logging and visualization |
| `enentity.c` | Entity manipulation (create, destroy, query) |
| `enmath.c` | Math functions (vectors, matrices, quaternions) |
| `enmath2d.c` | 2D math utilities |
| `enmath3d.c` | 3D math utilities |
| `enphysics.c` | Physics simulation (raycasts, collisions) |
| `enprofiler.c` | Performance profiling |
| `enscript.c` | Script runtime introspection |
| `enstring.c` | String manipulation utilities |
| `ensystem.c` | System-level functions (file I/O, time) |
| `envisual.c` | Visual/rendering system |
| `envrdevice.c` | VR device integration |
| `enwidgets.c` | UI widget system |
| `enworld.c` | World queries and manipulation |
| `proto.c` | Proto system base |
| `serializer.c` | Binary serialization |

## Key Details

### Constants (`constants.c`)

Defines `const int` globals used throughout the entire codebase:

**Input Device IDs**:
```c
const int INPUT_DEVICE_KEYBOARD = 0;
const int INPUT_DEVICE_MOUSE = 1;
const int INPUT_DEVICE_STICK = 2;
const int INPUT_DEVICE_XINPUT = 3;
const int INPUT_DEVICE_GAMEPAD = 4;
```

**Input Action Types**:
```c
const int INPUT_STATE = 0;
const int INPUT_DOWN_EVENT = 1;
const int INPUT_UP_EVENT = 2;
const int INPUT_HOLD = 3;
const int INPUT_COMBO = 4;
```

**Color Constants**: WHITE, RED, GREEN, BLUE, YELLOW, and their `*_A` alpha variants.

### Param System (`param.c`)

The `Param` class hierarchy provides typed serialization for passing parameters through generic APIs (event system, callbacks, RPC):

```
Param (abstract base — Managed, serializable)
├── Param1<T1>
├── Param2<T1,T2>
├── Param3<T1,T2,T3>
└── Param4<T1,T2,T3,T4>
```

Used extensively for:
- Event system callbacks
- RPC parameter passing
- UI widget data binding
- Generic function delegates

### Defines (`defines.c`)

Documents the preprocessor defines injected from the C++ build system:

| Define | Purpose |
|--------|---------|
| `DAYZ_X_XX` | DayZ version number |
| `BULDOZER` | Built for the terrain editor |
| `WORKBENCH` | Built for the Enfusion Workbench |
| `NO_GUI` | Headless server build (no UI) |
| `NO_GUI_INGAME` | Server build (no in-game UI) |
| `ENABLE_LOGGING` | Logging enabled |
| `LOG_TO_FILE` | Log to file |
| `LOG_TO_SCRIPT` | Log to script console |
| `LOG_TO_RPT` | Log to .rpt file |
| `DEVELOPER` | Developer build |
| `RELEASE` | Release build |

### Workbench API (`workbenchapi.c`)

Provides the `Workbench` static class with methods for:
- Module management (load, unload, query)
- Dialog display
- Resource search
- Command execution

Sub-classes include `ScriptEditor`, `ResourceBrowser`, `WorldEditor` (with selection, entity CRUD, and terrain editing), and `WorldEditorAPI`.
