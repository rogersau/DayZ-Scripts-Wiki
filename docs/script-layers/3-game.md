# Layer 3: Game Logic (`3_game/`)

**Directory**: `/p/scripts/3_game/`

Layer 3 is the **heart of DayZ's game logic**. It contains the DayZ-specific implementation of the `Game` base class, the player entity, AI, damage systems, effects, weather, vehicles, inventory, and all core gameplay mechanics. This is the largest layer, containing ~250+ files.

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `dayzgame.c` | ~3,900 | `DayZGame` singleton, game state machine, session management |
| `dayzplayer.c` | ~1,400 | `DayZPlayer`, camera system, weapon handling, aiming model |
| `human.c` | ~1,700 | `Human` class, input controller, movement/combat/death commands |
| `gameplay.c` | ~1,500 | Serialization, RPC, world objects, UI widgets |
| `constants.c` | ~1,100 | Game enums (chat, voice, hit direction, object intersection) |
| `playerconstants.c` | ~270 | Player stat thresholds, metabolic rates |
| `effect.c` | ~650 | `Effect` base class (particle and sound effects) |
| `effectmanager.c` | ~875 | `SEffectManager` — effect lifecycle management |
| `damagesystem.c` | ~160 | Static damage utilities (melee, explosion, firearm) |
| `weather.c` | ~13,400 | Weather simulation (rain, fog, wind, cloud cover) |
| `worlddata.c` | ~15,900 | World state management |
| `ppeffects.c` | ~20,300 | Post-processing effects (bloom, color grading) |

## Entity Files (`entities/`)

| File | Class |
|------|-------|
| `object.c` | `Object` — Base world object (transform, geometry, rendering) |
| `objecttyped.c` | `ObjectTyped` — Typed object with config type system |
| `entity.c` | `Entity` — Animation phases, simulation control, bone access |
| `entityai.c` | `EntityAI` — Damage zones, inventory slots, AI awareness |
| `pawn.c` | `Pawn` — Animated character with physics |
| `man.c` | `Man` / `Person` — Humanoid base |
| `dayzplayer.c` | `DayZPlayer` — Player avatar (at top level, not in entities/) |
| `dayzcreature.c` | `DayZCreature` — Creature base |
| `dayzcreatureai.c` | `DayZCreatureAI` — AI-driven creature |
| `dayzanimal.c` | `DayZAnimal` — Wildlife |
| `dayzinfected.c` | `DayZInfected` — Zombies |
| `building.c` | `Building` — Static buildings |
| `inventoryitem.c` | `InventoryItem` — Carryable items |
| `scriptedentity.c` | `ScriptedEntity` — User-defined entities |
| `camera.c` | `Camera` — Camera objects |
| `transport.c` | `Transport` — Base vehicles |

## Main Systems

### DayZGame (`dayzgame.c`)

The singleton game instance, extending `Game` (from `2_gamelib`). Manages:

- **Game states**: `DayZGameState` enum — MAIN_MENU, LOGIN, PLAYING, etc.
- **Load states**: `DayZLoadState` enum — loading phase progression
- **Session management**: Connect/disconnect, login queue
- **Collision/projectile info**: ProjectileStoppedInfo, ObjectCollisionInfo, TerrainCollisionInfo
- **Crash sound sets**: Vehicle crash sound management

### DayZPlayer (`dayzplayer.c`)

The player avatar, extending `Human`. Key systems:

- **Camera system** (`DayZPlayerCamera`, `DayZPlayerCameraResult`): First person, third person, ironsights, free-look cameras
- **Aiming model** (`SDayZPlayerAimingModel`): Weapon handling and aiming mechanics
- **Heading model** (`SDayZPlayerHeadingModel`): Character rotation and heading
- **Animation type tables**: Player state to animation mapping

### Human (`human.c`)

Extends `Man`. Provides shared humanoid functionality:

- **HumanInputController**: Input abstraction for movement, aiming, stance, melee, weapon raise/ADS, freelook
- **Animation commands**: `HumanCommandMove`, `HumanCommandMelee`, `HumanCommandMelee2`, `HumanCommandFall`, `HumanCommandDeath`, `HumanCommandUnconscious`
- **HumanAnimInterface**: Animation state machine

### Inventory System (`systems/inventory/`)

A comprehensive FSM-driven inventory system (~30 files):

| File | Lines | Purpose |
|------|-------|---------|
| `inventory.c` | ~54,600 | Main inventory logic |
| `humaninventory.c` | ~23,250 | Human-specific inventory |
| `inventorylocation.c` | ~19,400 | Inventory location abstraction |
| `hand_fsm.c` | — | Hand state machine |
| `hand_actions.c` | — | Hand action definitions |
| `hand_states.c` | — | Hand state definitions |
| `cargo.c` | — | Cargo container logic |
| `inventoryslots.c` | — | Slot management |

### Effect System

- **`Effect`** base class (wraps `EffectParticle` and `EffectSound`): Autodestroy, event invokers (OnStarted, OnStopped)
- **`SEffectManager`**: Static singleton that registers, plays, and cleans up effects. Supports `PlayInWorld` and `PlayOnObject`
- **Effect subdirectories**: `effects/effectparticle/` (bullet impacts, player effects, vehicle smoke), `backlit/`, `destructioneffects/`

### AI System

- **`ai/`**: `aiagent.c`, `aigroup.c`, `aigroupbehaviour.c`, `aiworld.c`
- **`systems/ai/`**: Additional AI behavior definitions
- **`aibehaviour.c`**: Top-level AI behavior definitions

### Weather System (`weather.c`, ~13,400 lines)

Comprehensive weather simulation:
- Rain (intensity, accumulation)
- Fog (density, height)
- Wind (speed, direction)
- Cloud cover (overcast levels)
- Weather transitions

### Vehicle System

- **Transport** (`vehicles/transport.c`): Base vehicle simulation
- **Car** (`vehicles/car.c`): Wheeled vehicle physics
- **Boat** (`vehicles/boat.c`): Water vehicle physics
- **Helicopter** (`vehicles/helicopter.c`): Rotary-wing aircraft physics

### GUI System (`gui/`)

- `containers/` — Scrollbar, size-to-child containers
- `credits/` — Credits screen
- `dlcs/` — DLC-specific UI
- `effects/` — Bouncer, hover, radial menu, radial progress bar, rotator effects
- `hints/` — Hint panel system
- `spacers/` — Layout spacers

### Other Notable Systems

| System | Files | Purpose |
|--------|-------|---------|
| **VON** | `vonmanager.c` (~7,800) | Voice-over-network (proximity chat, radio) |
| **PP Effects** | `ppemanager/` + `ppeffects.c` | Post-processing (bloom, color grading) |
| **Particles** | `particles/` | Particle system management |
| **Hive** | `hive/` | DayZ persistence layer (database sync) |
| **HTTP** | `http/` | HTTP networking for backend communication |
| **Input API** | `inputapi/` | Raw input device handling |
| **Analytics** | `analytics/` | Telemetry and analytics |
| **Services** | `services/` | Game services |

## Layer 3 Dependencies

Layer 3 depends on:
- **Layer 1** (`1_core/`): Constants, Param types, proto native functions (enmath, enphysics, etc.)
- **Layer 2** (`2_gamelib/`): `Game` base class, input manager, menu manager, ScriptCallQueue

Higher layers (4_world, 5_mission) depend on Layer 3.
