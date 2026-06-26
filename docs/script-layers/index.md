# Script Layers Overview

The DayZ Enforce Script codebase is organized into five numbered layers. This section provides detailed documentation for each layer.

> **New to Enforce Script?** See the [Enforce Script Language Reference](/modding/enforce-syntax) for the language syntax, types, and keywords used throughout these layers.

## The Layers at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  5_mission/    Mission lifecycle, UI, HUD, menus           │
├─────────────────────────────────────────────────────────────┤
│  4_world/      Gameplay classes, systems, plugins           │
├─────────────────────────────────────────────────────────────┤
│  3_game/       DayZ game logic, entities, AI, effects       │
├─────────────────────────────────────────────────────────────┤
│  2_gamelib/    Reusable framework (Game base, input, etc.)  │
├─────────────────────────────────────────────────────────────┤
│  1_core/       Constants, Param, native proto bindings      │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Directory | File Count | Primary Purpose |
|-------|-----------|------------|-----------------|
| **1** | `1_core/` | ~25 files | Language primitives, engine bindings |
| **2** | `2_gamelib/` | ~15 files | Game-agnostic framework |
| **3** | `3_game/` | ~250+ files | DayZ-specific game logic |
| **4** | `4_world/` | ~120+ files | World simulation, gameplay classes |
| **5** | `5_mission/` | ~100+ files | Mission lifecycle, UI |

## Navigation

- [Layer 1: Core](./1-core) — Constants, defines, Param system, Workbench API, proto native bindings
- [Layer 2: Game Library](./2-gamelib) — Game base class, input manager, menu/dialog system, settings, utilities
- [Layer 3: Game Logic](./3-game) — DayZGame, DayZPlayer, entity hierarchy, damage, effects, weather, AI, vehicles, inventory
- [Layer 4: World](./4-world) — World gameplay classes, combat, player stats, crafting, emotes, systems, plugins
- [Layer 5: Mission](./5-mission) — Mission entry point, all GUI/HUD/menus, script console
