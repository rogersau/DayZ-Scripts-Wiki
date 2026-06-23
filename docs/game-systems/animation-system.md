# Animation System

The animation system manages character animations, animation events, and the animation state machine. It bridges gameplay actions with visual character movement.

## Architecture

```
Animation System
├── Animation Commands (3_game/anim/animcommand.c)
│   ├── HumanCommandMove        — Locomotion
│   ├── HumanCommandMelee       — Melee attacks
│   ├── HumanCommandMelee2      — Power melee
│   ├── HumanCommandFall        — Falling
│   ├── HumanCommandDeath       — Death
│   └── HumanCommandUnconscious — Unconscious
│
├── Animation Physics (3_game/anim/animphysagent.c)
│   └── Physical animation blending
│
├── Animation Events (3_game/dayzanimevents.c)
│   ├── Event definitions
│   └── Event triggering
│
├── Animation Event Maps (3_game/dayzanimeventmaps.c)
│   └── Event-to-animation mapping
│
├── Animation Data (DZ/anims/)
│   ├── anm/         — Animation files
│   ├── cfg/         — Animation configs
│   └── workspaces/  — Animation workspaces
│
└── HumanAnimInterface (in 3_game/human.c)
    └── Animation state machine
```

## Animation Commands

Animation commands are the primary way scripts control character animation:

```c
class HumanCommandMove {
    // Movement parameters
    float m_Speed;              // Movement speed
    float m_Direction;          // Movement direction (degrees)
    int m_Stance;               // Current stance
    bool m_IsSprinting;         // Sprinting flag
    bool m_IsCrouching;         // Crouching flag
    
    // Movement types
    void SetMoveType(int type); // Walk, jog, sprint, crawl
    void SetStance(int stance); // Stand, crouch, prone
};

class HumanCommandMelee {
    // Melee parameters
    int m_AttackType;           // Light, heavy, combo
    int m_DamageType;           // Blunt, slash, stab
    bool m_IsHit;               // Whether attack connected
};
```

## HumanAnimInterface

The animation state machine that selects animations based on gameplay state:

```c
class HumanAnimInterface {
    // State management
    void SetAnimationPhase(string phase, float value);
    float GetAnimationPhase(string phase);
    
    // Override control
    void OverrideAnimation(string animSet);
    void ClearOverrides();
    
    // Event handling
    void OnAnimationEvent(string eventName);
    void AddAnimationEventHandler(string eventName, ScriptInvoker handler);
};
```

## Animation Events

Events are triggered at specific points in animations:

```c
// In 3_game/dayzanimevents.c
class DayZAnimationEvent {
    int m_EventType;
    float m_Time;               // Time in animation when event fires
    string m_Parameter;         // Event parameter
};

// Common animation events:
// "Fire"      — Weapon fired
// "Reload"    — Reload started/completed
// "Footstep"  — Foot planted
// "MeleeHit"  — Melee attack impact frame
// "Land"      — Landing after jump/fall
// "Pickup"    — Item pickup animation frame
```

### Event Maps

`DayZAnimEventMap` connects config-defined events to script handlers:

```c
class DayZAnimEventMap {
    void AddEvent(string animName, DayZAnimationEvent event);
    DayZAnimationEvent GetEvent(string animName, int index);
};
```

## Animation Command Flow

```
Player Input
    ↓
HumanInputController
    ↓
HumanCommandMove / HumanCommandMelee / etc.
    ↓
Animation State Machine (HumanAnimInterface)
    ↓
Skeletal Animation (engine)
    ↓
Animation Events trigger gameplay callbacks
```

## DZ Animation Data

Animation definitions are in `DZ/anims/`:

```
DZ/anims/
├── anm/          — Compiled animation files (.anm)
├── cfg/          — Animation configuration
│   ├── config.cpp
│   └── animset definitions
└── workspaces/   — Workbench animation workspaces
```

### Animation Sets

Config groups define animation sets:

```cpp
// DZ/anims/cfg/config.cpp
class CfgAnimSets {
    class Player_Standing {
        idle = "anim/player/idle.anm";
        walk = "anim/player/walk.anm";
        run = "anim/player/run.anm";
        sprint = "anim/player/sprint.anm";
    };
    
    class Player_Crouch {
        // Crouching animation variants
    };
};
```

## Integration with Other Systems

- **Player system**: Human commands drive player animation
- **Weapon system**: Weapon handling animations (raise, lower, fire, reload)
- **Vehicle system**: Enter/exit/ride animations
- **AI system**: AI behavior drives animation state
- **Sound system**: Animation events trigger footstep and other sounds
- **Effects system**: Animation events trigger particle effects
