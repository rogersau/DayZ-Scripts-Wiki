# World Gameplay

This section documents the world-level gameplay systems that define the survival mechanics in DayZ. These systems operate in Layer 4 (`4_world/`) and manage player stats, crafting, base building, and environmental interactions.

## Systems Overview

| System | Key Files | Purpose |
|--------|-----------|---------|
| [Player Stats](./player-stats) | `classes/playerstats/`, `classes/playerstomach.c` | Health, blood, energy, water, temperature |
| [Stamina System](./stamina) | `classes/staminahandler.c`, `classes/staminamodifierdata.c` | Stamina consumption and regeneration |
| [Soft Skills](./soft-skills) | `classes/softskillsmanager.c` | Skill progression through use |
| [Crafting & Cooking](./crafting-cooking) | `classes/craftingmanager.c`, `classes/cooking/`, `classes/recipes/` | Item crafting and food preparation |
| [Base Building](./base-building) | `classes/basebuilding/` | Construction and base defense |
| [Emotes](./emotes) | `classes/emotemanager.c`, `classes/emoteclasses/` | Player gestures and expressions |
| [Contaminated Areas](./contaminated-areas) | `classes/contaminatedarea/` | Gas zones and contamination effects |
| [Underground System](./underground) | `classes/underground*.c` | Underground bunker/area management |

## How World Systems Interact

These gameplay systems operate on top of the core game systems (Layer 3), reading player state and applying modifiers through a unified pipeline:

```
Core Player State (Layer 3)
    ↓
Player Stats (health, blood, energy, water, temperature)
    ↓
Modifiers (playermodifiers/) ← Soft Skills
    ↓
Notifiers (playernotifiers/) → UI updates
    ↓
Symptoms (playersymptoms/) → Disease, poisoning
    ↓
Stamina → Movement capability
    ↓
Crafting/Cooking → Item transformation
```

### Integration with Core Systems

- All world gameplay systems interact with the **inventory system** for item management
- **Effects system** provides visual/audio feedback for gameplay actions
- **AI system** is affected by player stats (noise, visibility, scent)
- **Network** synchronizes gameplay state across clients
