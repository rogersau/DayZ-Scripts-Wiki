---
layout: home

hero:
  name: "DayZ Scripts Wiki"
  text: "Comprehensive documentation of DayZ game scripts"
  tagline: "Explore the architecture, systems, and data that power the DayZ survival experience"
  image:
    src: /images/hero.png
    alt: DayZ Scripts
  actions:
    - theme: brand
      text: Get Started
      link: /architecture/
    - theme: alt
      text: Script Layers Overview
      link: /script-layers/
    - theme: alt
      text: Game Systems
      link: /game-systems/

features:
  - title: 🏗️ Architecture
    details: Understand the 5-layer script system, entity hierarchy, and separation of logic from config data.
    link: /architecture/
  - title: 📜 Script Layers
    details: Deep dive into each layer from core engine bindings up to mission and UI code.
    link: /script-layers/
  - title: ⚙️ Game Systems
    details: Player controller, inventory, damage, effects, weather, AI, vehicles, and more.
    link: /game-systems/
  - title: 🌍 World Gameplay
    details: Player stats, stamina, crafting, emotes, base building, and world interaction systems.
    link: /world-gameplay/
  - title: 📋 Data & Config
    details: The config.cpp definitions for gear, weapons, characters, structures, and worlds.
    link: /data-config/
  - title: 🔧 Modding
    details: Project structure, client/server logic, key APIs, debugging, safe patterns, and the complete Enforce Script language reference for DayZ mod development.
    link: /modding/
  - title: 🔗 Cross-Referenced
    details: Every page links to related systems so you can trace how components interact.
---

## About This Wiki

This wiki documents the **DayZ game scripts** found in the DayZ game installation. It covers:

- **Enforce Script source code** (`scripts/`) — the 5-layer runtime architecture from core engine bindings to mission/game-mode logic (see [Language Reference](/modding/enforce-syntax) for the complete syntax guide)
- **Configuration data** (`DZ/`, `Core/`) — the config.cpp definitions for all items, weapons, vehicles, characters, structures, and world data
- **System interactions** — how the various subsystems (inventory, damage, effects, weather, AI, persistence) communicate and depend on each other
- **Modding guidance** — project structure, client/server logic, APIs, and best practices for DayZ mod development, using real mod examples from `P:\`

### Source Location

The documented scripts are located at `P:\` in a standard DayZ installation, comprising:

| Path | Contents |
|------|----------|
| `scripts/1_core/` | Core engine definitions and native bindings |
| `scripts/2_gamelib/` | Reusable game framework |
| `scripts/3_game/` | DayZ game-specific logic |
| `scripts/4_world/` | World gameplay classes and systems |
| `scripts/5_mission/` | Mission lifecycle and UI code |
| `DZ/` | Static config data for all game objects |
| `Core/` | Core system resources |

### How to Use This Wiki

- **Start with [Architecture](/architecture/)** for a high-level understanding
- **Browse [Script Layers](/script-layers/)** to understand the code organization
- **Explore [Game Systems](/game-systems/)** for deep dives into specific subsystems
- **Check [Data Config](/data-config/)** for item and world definitions
- **See the [Modding Guide](/modding/)** for developing DayZ modifications
