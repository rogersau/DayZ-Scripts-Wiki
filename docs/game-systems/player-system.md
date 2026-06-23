# Player System

The player system is the central actor in DayZ. It spans from the `DayZGame` singleton that manages game state, through the `DayZPlayer` entity that represents the player in the world, down to the `HumanInputController` that processes user input.

## Architecture

```
DayZGame (dayzgame.c)
  └── Manages game state, sessions, login
       │
       └── DayZPlayer (dayzplayer.c)
            └── Player avatar in the world
                 │
                 ├── DayZPlayerCamera
                 │    ├── First-person camera
                 │    ├── Third-person camera
                 │    ├── Ironsights camera
                 │    └── Free-look camera
                 │
                 ├── SDayZPlayerAimingModel
                 │    └── Weapon aiming mechanics
                 │
                 ├── SDayZPlayerHeadingModel
                 │    └── Character rotation/heading
                 │
                 └── HumanInputController (in Human)
                      ├── Movement
                      ├── Aiming / Stance
                      ├── Melee
                      ├── Weapon raise / ADS
                      └── Free-look
```

## DayZGame (`dayzgame.c`)

The singleton game instance (`g_Game`), extending `CGame` (from `2_gamelib`).

### Game States

```c
enum DayZGameState {
    MAIN_MENU,
    LOGIN,
    PLAYING,
    // ... additional states
};
```

### Responsibilities

- **Session management**: Connect/disconnect to servers, login queue handling
- **Load states**: Manages loading phase progression
- **Collision/projectile info**: Handles `ProjectileStoppedInfo`, `ObjectCollisionInfo`, `TerrainCollisionInfo`
- **Crash sound sets**: Manages vehicle crash audio configurations

### Key Methods

```c
class DayZGame {
    // State management
    void StartGame();                 // Start a game session
    void EndGame();                   // End current session
    void Login();                     // Initiate login
    void Logout();                    // Initiate logout
    
    // World access
    ScriptedWorld GetWorld();         // Get current world
    DayZPlayer GetPlayer();           // Get local player
    
    // Config access
    float GetConfigFloat(int id, string path);
    string GetConfigString(int id, string path);
};
```

## DayZPlayer (`dayzplayer.c`)

The player avatar, extending `Human`. Located at `3_game/dayzplayer.c` (~1,400 lines).

### Camera System

The camera system handles all player viewpoint management:

```c
class DayZPlayerCamera {
    CameraResult Evaluate(float pDt, int pCameraMode);
};

// Camera modes
enum DayZPlayerCameraMode {
    EXTERNAL,       // Third person
    INTERNAL,       // First person
    IRONSIGHTS,     // Weapon ironsights
    FREELOOK,       // Free-look camera
};
```

The `DayZPlayerCameraResult` struct contains:
- Camera position and orientation
- Field of view
- Weapon model visibility
- Head/body pose overrides

### Weapon Handling

```c
class SDayZPlayerAimingModel {
    float m_fWeaponRaiseTime;       // Time to raise weapon
    float m_fWeaponLowerTime;       // Time to lower weapon
    float m_fHandsAimAnimSpeed;     // Aim animation speed
    float m_fDefaultHandsAimBlend;  // Default aim blend
};
```

### Animation Type Tables

`DayZPlayerTypeAnimTable` maps player states to animation sets:
- Idle / walking / running / sprinting
- Armed / unarmed
- Injured limping
- Swimming
- Climbing

## Human (`human.c`)

Extends `Man`. Provides shared humanoid functionality (~1,700 lines).

### HumanInputController

The input controller translates raw input into game actions:

```c
class HumanInputController {
    // Movement
    void OnMovement(float forward, float right);
    void OnStance(int stance);
    void OnSprint(bool active);
    
    // Combat
    void OnMelee();
    void OnWeaponRaise();
    void OnAim(bool active);
    
    // Interaction
    void OnFreeLook(bool active);
    void OnUse();
    void OnInteract();
};
```

### Animation Commands

```c
enum HumanCommand {
    HumanCommandMove,       // Locomotion (walk, run, sprint)
    HumanCommandMelee,      // Melee attacks
    HumanCommandMelee2,     // Power melee attacks
    HumanCommandFall,       // Falling
    HumanCommandDeath,      // Death animation
    HumanCommandUnconscious // Unconscious state
};
```

### Player Constants (`playerconstants.c`)

Defines all player stat thresholds and rates:

**Health thresholds**:
```c
const float PLAYER_HEALTH_CRITICAL = 1000;
const float PLAYER_HEALTH_LOW = 3000;
const float PLAYER_HEALTH_NORMAL = 5000;
const float PLAYER_HEALTH_HIGH = 7000;
const float PLAYER_MAX_HEALTH = 10000;
```

**Metabolic rates** (energy/water loss per second):
```c
const float PLAYER_METABOLISM_IDLE_ENERGY = 0.018;
const float PLAYER_METABOLISM_WALK_ENERGY = 0.036;
const float PLAYER_METABOLISM_JOG_ENERGY = 0.072;
const float PLAYER_METABOLISM_SPRINT_ENERGY = 0.144;
```

## Data Flow

```
User Input
    ↓
HumanInputController
    ↓
Human / DayZPlayer
    ↓
Animation Commands ←→ Animation System
    ↓
Pawn Physics ←→ Vehicle System (if in vehicle)
    ↓
World Simulation
```

## Related Systems

- **Camera system** interacts with the animation system for head/body positioning
- **Inventory** is accessed through the `EntityAI` base class
- **Damage** is handled via `HumanCommandDeath`, `HumanCommandUnconscious`, and the `DamageSystem`
- **Effects** spawn on the player entity through `SEffectManager`
- **Network synchronization** uses `ScriptRPC` for player state replication
