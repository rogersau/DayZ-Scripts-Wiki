# Effect System

The effect system manages particle effects and sounds, providing a unified API for spawning, managing, and cleaning up visual and audio effects in the world.

## Architecture

```
SEffectManager (3_game/effectmanager.c)
│   Singleton effect lifecycle manager
│
├── Effect (3_game/effect.c)
│   │   Base class for all effects
│   │
│   ├── EffectParticle
│   │   └── Particle-based visual effects
│   │
│   └── EffectSound
│       └── Sound-based audio effects
│
├── effects/effectparticle/
│   ├── Bullet impact effects
│   ├── Player effects (blood, sweat)
│   └── Vehicle effects (smoke, fire)
│
├── effects/backlit/
│   └── Backlit visual effects
│
└── effects/destructioneffects/
    └── Destruction/debris effects
```

## Effect Base Class

### Properties

```c
class Effect {
    EffectParticle m_Particle;     // Attached particle system
    EffectSound m_Sound;           // Attached sound
    bool m_AutoDestroy;            // Auto-remove when finished
    float m_Lifetime;              // Effect lifetime (-1 = infinite)
    
    // Event invokers
    ScriptInvoker OnStarted;       // Called when effect starts
    ScriptInvoker OnStopped;       // Called when effect stops
};
```

### Lifecycle

```c
class Effect {
    void Start();                  // Begin playing the effect
    void Stop();                   // Stop the effect
    void SetObject(Object obj);    // Attach to an object
    void SetPosition(vector pos);  // Position in world space
    bool IsPlaying();              // Check if effect is active
};
```

## SEffectManager

The static singleton that manages all effects:

```c
class SEffectManager {
    // Play an effect in the world
    static Effect PlayInWorld(
        string effectName,
        vector position,
        float lifetime = -1
    );
    
    // Play an effect on an object
    static Effect PlayOnObject(
        string effectName,
        Object target,
        string memoryPoint = "",
        float lifetime = -1
    );
    
    // Register/query effects
    static void RegisterEffect(string name, Effect effect);
    static Effect FindEffect(int id);
    static void RemoveEffect(int id);
    
    // Bulk operations
    static void RemoveAllEffects();
};
```

## Effect Types

### EffectParticle

Particle-based visual effects:

- **Bullet impacts**: Sparks, dust, blood particles on hit
- **Player effects**: Blood spray, sweat, breath vapor
- **Vehicle effects**: Engine smoke, exhaust, fire, tire dust
- **Weather effects**: Rain splashes, fog particles
- **Environmental**: Fire, smoke, explosion debris

### EffectSound

Sound-based audio effects:

- **Footsteps**: Different surfaces
- **Weapon sounds**: Fire, reload, mechanics
- **Environmental**: Wind, rain, ambient
- **Character**: Voice, pain, breathing
- **Vehicle**: Engine, horn, crash

## Effect Parameters

Effects can be configured with parameters:

```c
// Example: Creating a bullet impact effect
Effect impact = SEffectManager.PlayOnObject(
    "BulletImpact_Concrete",   // Effect name (from config)
    targetObject,              // Hit object
    hitMemoryPoint,            // Memory point on object
    2.0                        // Lifetime in seconds
);

if (impact) {
    impact.OnStopped.Insert(OnImpactDone);
}
```

## Effect Config Data

Effects are defined in config:

```cpp
// In DZ/sounds/ or via script-defined effects
class CfgEffects {
    class BulletImpact_Concrete {
        particle = "bullet_impact_concrete";
        sound = "bullet_impact_concrete";
        lifetime = 2.0;
    };
};
```

## Integration with Other Systems

- **Damage system**: Spawns blood/impact effects on hit
- **Weather system**: Controls rain/snow particle effects
- **Vehicle system**: Engine smoke, tire effects
- **Player system**: Breath vapor, headlamp effects
- **Environment**: Ambient particle effects (dust, insects)
- **Destruction**: Building/object destruction effects
