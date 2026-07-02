# Entity Class Hierarchy

All objects in the DayZ world inherit from a shared class hierarchy defined across Layers 2-4. The root types are engine-level (C++), with script classes extending them.

## Full Hierarchy

```
IEntity [C++ engine]
  |
  +-- Object (entities/object.c)
       |   Base world object: transform, geometry, rendering
       |
       +-- ObjectTyped (entities/objecttyped.c)
            |   Typed object with config-based type system
            |
            ├── Entity (entities/entity.c)
            |   |   Animation phases, simulation control, bone access, invisibility
            |   |
            |   +-- EntityAI (entities/entityai.c)
            |   |   |   AI-aware entity: damage zones, inventory slots, hit components
            |   |   |
            |   |   +-- DayZCreature (entities/dayzcreature.c)
            |   |   |   Base creature class
            |   |   |
            |   |   +-- DayZCreatureAI (entities/dayzcreatureai.c)
            |   |   |   AI-driven creature
            |   |   |   |
            |   |   |   +-- DayZAnimal (entities/dayzanimal.c)
            |   |   |   |   Wildlife: deer, cows, chickens, etc.
            |   |   |   |
            |   |   |   +-- DayZInfected (entities/dayzinfected.c)
            |   |   |       Zombies/infected NPCs
            |   |   |
            |   |   +-- Pawn (entities/pawn.c)
            |   |   |   |   Animated character with physics, owner/move state
            |   |   |   |
            |   |   |   +-- Person (entities/man.c)
            |   |   |       Humanoid base (unused — separate from the Man branch)
            |   |   |
            |   |   +-- Man (entities/man.c)
            |   |   |   |   Base humanoid (direct child of EntityAI)
            |   |   |   |
            |   |   |   +-- Human (human.c)
            |   |   |   |   Humanoid with input controller, movement commands,
            |   |   |   |   melee combat, death, unconscious state
            |   |   |   |
            |   |   |   +-- DayZPlayer (dayzplayer.c)
            |   |   |       Player avatar: camera system, weapon raising,
            |   |   |       aiming model, animation tables
            |   |   |
            |   |   +-- Transport (vehicles/transport.c)
            |   |   |   Base vehicle class
            |   |   |   |
            |   |   |   +-- Car (vehicles/car.c)
            |   |   |   |   Wheeled ground vehicles
            |   |   |   |
            |   |   |   +-- Boat (vehicles/boat.c)
            |   |   |   |   Water vehicles
            |   |   |   |
            |   |   |   +-- Helicopter (vehicles/helicopter.c)
            |   |   |       Rotary-wing aircraft
            |   |   |
            |   |   +-- Building (entities/building.c)
            |   |   |   Static building structures
            |   |   |
            |   |   +-- InventoryItem (entities/inventoryitem.c)
            |   |   |   All items that can be carried in inventory
            |   |   |
            |   |   +-- ScriptedEntity (entities/scriptedentity.c)
            |   |       User-defined scripted entities
            |   |
            |   +-- Camera (entities/camera.c)
            |       Camera objects (player camera, debug camera)
            |
            ├── ProxySubpart
            |   Proxy geometry sub-parts
            |
            └── ProxyInventory
                Proxy inventory containers
```

## Key Inheritance Chains

### Player Chain
```
Object → ObjectTyped → Entity → EntityAI → Man → Human → DayZPlayer
```

Each step adds functionality:
- **EntityAI**: Damage zones, inventory slots
- **Man**: Humanoid base
- **Human**: Input controller, movement commands, melee, death, unconscious
- **DayZPlayer**: Camera system (1st/3rd person), weapon handling, aiming

### Vehicle Chain
```
Object → ObjectTyped → Entity → EntityAI → Transport → Car/Boat/Helicopter
```

### Creature Chain
```
Object → ObjectTyped → Entity → EntityAI → DayZCreature → DayZCreatureAI → DayZAnimal/DayZInfected
```

## Important Entity Types

### Pawn (`entities/pawn.c`)
The base class for any animated character with physics. Provides:
- Owner state management
- Movement state tracking
- Physics integration
- Position/orientation interpolation

### Human (`human.c`)
The primary humanoid class. Key systems:
- **HumanInputController**: Translates raw input → movement, aiming, stance, melee, weapon actions
- **Animation commands**: `HumanCommandMove`, `HumanCommandMelee`, `HumanCommandFall`, `HumanCommandDeath`, `HumanCommandUnconscious`
- **HumanAnimInterface**: Animation state machine

### DayZPlayer (`dayzplayer.c`)
The player avatar. Adds:
- `DayZPlayerCamera` — Camera hierarchy (1st person, 3rd person, ironsights, free-look)
- `SDayZPlayerAimingModel` — Weapon aiming mechanics
- `SDayZPlayerHeadingModel` — Character heading/rotation
- `DayZPlayerTypeAnimTable` — Animation type tables per player state

### DayZInfected (`entities/dayzinfected.c`)
Zombie NPC. Has its own input controller (`DayZInfectedInputController`) and type definition (`DayZInfectedType`).

### DayZAnimal (`entities/dayzanimal.c`)
Wildlife NPC. Has animal-specific input controller and type definition.

### Transport (`vehicles/transport.c`)
Base vehicle simulation. Subclasses:
- **Car** (`vehicles/car.c`): Wheeled vehicle physics
- **Boat** (`vehicles/boat.c`): Water vehicle physics
- **Helicopter** (`vehicles/helicopter.c`): Aircraft physics

## Entity Type Files

Each entity type has a corresponding `Type` class and `InputController`:

| Entity | Type Class | Input Controller | Source |
|--------|-----------|------------------|--------|
| DayZAnimal | `DayZAnimalType` | `DayZAnimalInputController` | `entities/dayzanimal*.c` |
| DayZInfected | `DayZInfectedType` | `DayZInfectedInputController` | `entities/dayzinfected*.c` |
| DayZCreatureAI | `DayZCreatureAIType` | `DayZCreatureAIInputController` | `entities/dayzcreatureai*.c` |
| DayZPlayer | — (special) | `HumanInputController` | `dayzplayer.c` |

## Config Integration

Entity properties (hit zones, inventory slots, model paths) are defined in config files under `DZ/` rather than hardcoded. The `EntityAI` base class reads from `CfgVehicles` config entries to set up:
- Damage zones and health
- Inventory slots and cargo dimensions
- Attachment points
- Animation sources
