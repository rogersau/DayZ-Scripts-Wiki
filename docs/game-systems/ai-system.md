# AI System

The AI system controls non-player entities including zombies (infected) and wildlife (animals). It manages agent behavior, group coordination, and world-level AI concerns.

## Architecture

```
AI System
├── AI Agents (3_game/ai/aiagent.c)
│   └── Individual AI entity behavior
├── AI Groups (3_game/ai/aigroup.c)
│   └── Group coordination
├── AI Group Behavior (3_game/ai/aigroupbehaviour.c)
│   └── Group-level behaviors
├── AI World (3_game/ai/aiworld.c)
│   └── World-level AI management
├── AI Behavior (3_game/aibehaviour.c)
│   └── Behavior definitions
├── systems/ai/ (3_game/systems/ai/)
│   └── Additional AI behavior implementations
│
├── DayZInfected (3_game/entities/dayzinfected.c)
│   ├── DayZInfectedInputController
│   └── DayZInfectedType
├── DayZAnimal (3_game/entities/dayzanimal.c)
│   ├── DayZAnimalInputController
│   └── DayZAnimalType
└── Entity AI (3_game/entities/entityai.c)
    └── Base AI-aware entity (damage zones, inventory)
```

## Entity Hierarchy

```
EntityAI (entities/entityai.c)
├── Damage zones
├── Inventory slots
└── AI awareness
    │
    ├── DayZCreature (entities/dayzcreature.c)
    │   └── Base creature
    │       │
    │       └── DayZCreatureAI (entities/dayzcreatureai.c)
    │           ├── AI-driven creature
    │           ├── DayZCreatureAIType
    │           ├── DayZCreatureAIInputController
    │           │
    │           ├── DayZInfected (entities/dayzinfected.c)
    │           │   ├── Zombie NPC
    │           │   ├── DayZInfectedType
    │           │   └── DayZInfectedInputController
    │           │
    │           └── DayZAnimal (entities/dayzanimal.c)
    │               ├── Wildlife NPC
    │               ├── DayZAnimalType
    │               └── DayZAnimalInputController
    │
    └── Pawn (entities/pawn.c)
        └── Animated character (humans, transports)
```

## AI Agent

Individual AI entities are managed by `AIAgent`:

```c
class AIAgent {
    // Current behavior state
    AIBehaviorState m_State;
    // Target information
    EntityAI m_Target;
    vector m_TargetPosition;
    // Awareness
    float m_Awareness;        // 0.0 — 1.0 detection level
    float m_ThreatLevel;      // Perceived threat
};
```

### Behavior States

```c
enum AIBehaviorState {
    IDLE,           // Standing around, no target
    PATROL,         // Following patrol path
    INVESTIGATE,    // Investigating a stimulus
    COMBAT,         // Engaged with target
    FLEE,           // Running from threat
    ALERT,          // Alert but no direct target
};
```

## AI Group

Groups coordinate multiple AI agents:

```c
class AIGroup {
    // Group members
    ref array<AIAgent> m_Members;
    // Group behavior
    AIGroupBehaviour m_Behaviour;
    // Group tactics
    int m_FormationType;
    vector m_GroupCenter;
};
```

### Group Behaviors

```c
class AIGroupBehaviour {
    void OnCombat(AIAgent caller, EntityAI target);
    void OnMemberKilled(AIAgent victim);
    void OnInvestigate(AIAgent caller, vector position);
    void OnAlert(AIAgent caller);
    
    // Tactical coordination
    void FlankTarget();
    void SurroundTarget();
    void Retreat();
};
```

## Infected (Zombies)

`DayZInfected` manages zombie NPC behavior:

### Sensory System

```c
class DayZInfectedInputController {
    // Detection ranges (config-defined)
    float m_SightRange;
    float m_HearingRange;
    float m_SmellRange;
    
    // Detection modifiers
    float m_DetectionSpeed;      // How fast detection increases
    float m_DetectionDropoff;    // How fast detection decreases
    
    // Current state
    float m_DetectionLevel;      // 0.0 — 1.0
    EntityAI m_SuspectedTarget;
};
```

### Behavior

- **Idle**: Wandering, random animations
- **Alert**: Investigating sounds or visual stimuli
- **Chase**: Pursuing detected target
- **Combat**: Melee attacking target
- **Search**: Looking for lost target
- **Return**: Going back to spawn area after losing target

### Types (`DayZInfectedType`)

Different infected types have different properties:
- Speed (walker, runner)
- Toughness (health, armor)
- Detection ability (range, sensitivity)
- Damage output

## Animals

`DayZAnimal` manages wildlife behavior:

```c
class DayZAnimalInputController {
    // Movement
    void SetWanderTarget();
    void SetFleeTarget(vector awayFrom);
    
    // State
    EAnimalState m_AnimalState;
};

enum EAnimalState {
    IDLE, WANDER, FLEE, ATTACK, EATING, DRINKING
};
```

### Animal Behaviors

- **Flee**: Primary response to threats
- **Wander**: Random movement within home range
- **Grazing**: Eating/drinking animations
- **Rare aggression**: Some animals (bears, wolves) may attack
- **Flock/herd**: Group coordination for social animals

## AI World Management

```c
class AIWorld {
    // World-level AI management
    void RegisterAgent(AIAgent agent);
    void UnregisterAgent(AIAgent agent);
    
    // World queries
    AIAgent FindNearestAgent(vector position, float radius);
    bool IsPositionSafe(vector position);
    float GetAmbientThreat(vector position);
};
```

## AI Config Data

AI entity properties are defined in config:

```cpp
// DZ/AI/config.cpp (for infected)
// DZ/animals/config.cpp (for animals)
// DZ/characters/zombies/
```

Properties include:
- Detection ranges (sight, hearing, smell)
- Movement speeds (walk, run, sprint)
- Health and damage values
- Behavior parameters (aggression, fear, curiosity)
- Spawn rules and populations

## Combat Flow (Infected)

```
Player detected (sight/sound/smell)
    ↓
Detection level increases over time
    ↓
Alert → Investigate
    ↓
Line of sight established → Chase
    ↓
In range → Melee combat
    ↓
Player escapes → Search mode
    ↓
Target lost → Return to spawn
```

## Integration with Other Systems

- **Entity hierarchy**: AI entities share the `Pawn` base with players
- **Damage system**: AI entities take damage and die
- **Sound system**: AI hearing detection uses sound events
- **Animation system**: AI behavior drives animation selection
- **Effects system**: Death effects, blood particles on hit
- **Network**: AI state synchronization in multiplayer
