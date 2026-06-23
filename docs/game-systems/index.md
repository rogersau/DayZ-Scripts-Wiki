# Game Systems

This section documents the major game systems in DayZ, their architecture, how they interact, and their implementation in the script layers.

## Systems Overview

| System | Primary Files | Layer | Purpose |
|--------|--------------|-------|---------|
| [Player System](./player-system) | `3_game/dayzgame.c`, `3_game/dayzplayer.c`, `3_game/human.c` | Layer 3 | Game singleton, player entity, input, camera |
| [Inventory System](./inventory-system) | `3_game/systems/inventory/`, `4_world/classes/inventoryactionhandler.c` | Layers 3-4 | Item management, storage, FSM |
| [Damage & Combat](./damage-combat) | `3_game/damagesystem.c`, `4_world/classes/*` | Layers 3-4 | Melee, firearms, explosions, injuries |
| [Effect System](./effect-system) | `3_game/effect.c`, `3_game/effectmanager.c` | Layer 3 | Particles, sounds, visual effects |
| [Weather & Environment](./weather-environment) | `3_game/weather.c`, `3_game/worlddata.c` | Layer 3 | Rain, fog, wind, world state |
| [AI System](./ai-system) | `3_game/ai/`, `3_game/aibehaviour.c`, `3_game/entities/dayzinfected.c` | Layer 3 | Zombies, animals, AI agents |
| [Vehicle System](./vehicle-system) | `3_game/vehicles/` | Layer 3 | Car, boat, helicopter simulation |
| [Animation System](./animation-system) | `3_game/anim/`, `3_game/dayzanimevents.c` | Layer 3 | Animation commands, events, state machines |
| [Sound System](./sound-system) | `3_game/sound.c`, `3_game/vonmanager.c`, `DZ/sounds/` | Layer 3 + DZ | Audio playback, VON, sound configs |
| [Networking & RPC](./networking) | `3_game/gameplay.c` (ScriptRPC), `3_game/vonmanager.c` | Layer 3 | Remote procedure calls, voice chat |
| [Persistence & Hive](./persistence-hive) | `3_game/hive/` | Layer 3 | Database persistence, player data |

## How Systems Interact

```
Player System ──→ Inventory System ──→ Damage & Combat
     │                    │                  │
     │                    │                  ↓
     │                    │           Effect System
     │                    │                  │
     │                    ↓                  │
     ├──→ Animation System ←────────────────┤
     │                                      │
     ↓                                      ↓
Weather System ←──────────────────── Sound System
     │
     ↓
World Data / Environment
```

### Key Interactions

1. **Player → Inventory**: The player interacts with items through the inventory system, which uses an FSM for hand/item state management
2. **Player → Damage → Effects**: Taking damage triggers the damage system, which spawns effects (particles, sounds) through the effect manager
3. **Weather → World → Player**: Weather affects world state, which affects player status (temperature, visibility, sound propagation)
4. **AI → Player → Combat**: AI entities (infected, animals) interact with players through the combat/damage system
5. **Player → Animation → Sound**: Player actions trigger animation commands which chain into sound events
6. **All → Networking**: State changes are synchronized via RPC and replicated across the network
7. **All → Persistence**: Critical state is saved/loaded through the hive persistence layer

## Cross-Cutting Concerns

- **Constants**: Game-wide constants (`3_game/constants.c`, `3_game/playerconstants.c`) define thresholds and parameters used by all systems
- **Config data**: `DZ/` configs define object properties that scripts read at runtime
- **Events**: `ScriptInvoker` (from `2_gamelib`) and RPC enable decoupled communication between systems
