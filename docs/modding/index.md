# Modding Guide

This section covers everything you need to know to develop DayZ mods. It draws on the actual game scripts at `P:\` and real mod examples (Namalsk Survival, Namalsk Island) as authoritative references.

## Prerequisites

Before diving into modding, you should understand the foundational concepts documented elsewhere in this wiki:

- **[Script Layers](/script-layers/)** — The 5-layer architecture that Enforce Script code is organized into
- **[Scripts vs Config](/architecture/script-vs-config)** — The critical separation between runtime logic and static data
- **[Entity Hierarchy](/architecture/entity-hierarchy)** — The class hierarchy all game objects inherit from

## What Can You Mod?

DayZ modding operates at three levels, from simplest to most complex:

| Level | What You Change | Tools Needed | Complexity |
|-------|----------------|-------------|------------|
| **Config only** | Add/modify items, weapons, vehicles, characters via `config.cpp` | Text editor, PBO tool | Low |
| **Script override** | Override or extend Enforce Script (`.c`) files | Workbench or Enforce Script IDE, PBO tool | Medium |
| **Full mod** | New items, scripts, world data, UI, mission logic | Workbench, PBO tool, image editor, model tools | High |

This guide focuses on the **script and config** side — the files found at `P:\` and how to build on them.

## Navigation

| Page | Description |
|------|-------------|
| [Mod Project Structure](./mod-structure) | How a DayZ mod is organized — mod.cpp, PBOs, scripts, configs |
| [Client/Server Logic](./client-server-logic) | Understanding the server/client split, RPC, and sync |
| [Common APIs](./common-apis) | Key APIs every modder should know |
| [Debugging](./debugging) | Script console, error handling, and debugging tools |
| [Safe Modding Patterns](./safe-patterns) | Best practices for compatible, maintainable mods |
| [Real Mod Examples](./real-mod-examples) | DMOverrides scaffold and NamalskBlizzard built mod |

## Source of Truth: `P:\`

All documentation in this section references the **actual game and mod files** at `P:\`:

- **Game scripts**: `P:/scripts/` (the 5-layer architecture)
- **Game config data**: `P:/DZ/` (all items, weapons, characters, structures)
- **Real mod examples**: `P:/NBH_NamalskSurvival/`, `P:/NBH_NamalskIsland/`, `P:/NBH_Mod/`

These real-world files serve as the authoritative reference for structure, patterns, and best practices.
