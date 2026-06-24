# AI Configuration

The `DZ/AI/` directory defines all AI behaviour trees, noise parameters, and damage types for creatures in the game. From `P:/DZ/AI/config.cpp` (~6,863 lines).

## AI Behaviour System Overview

The AI behaviour system uses a **slot-based state machine** architecture. Each AI type (animal, infected) has a behaviour tree defined in `CfgAIBehaviours` with the following state progression:

```
Calm → NonSpecificThreat → SpecificThreat → Alerted
     ↘                    ↘                ↘
    (idle, moving,      (investigate)    (flee/attack)
     eating, resting)
```

## Behaviour Teams

`CfgAIBehaviours` defines behaviour teams by creature type:

| Team | Types | Behaviour Focus |
|------|-------|-----------------|
| `AmbientLife` | Base animal AI | Non-hostile wildlife with threat response |
| `AmbientLife_Gallus_Gallus_Domesticus` | Chickens | Simple path agent, sounds |
| `AmbientLife_Lepus_Europaeus` | Hares/Rabbits | Instant alert, high speed flee |
| `AmbientLife_Vulpes_Vulpes` | Foxes | High sniff weight, vision detection |
| `Herbivores` | Base herbivore | Resting, grazing, travelling, drinking, flee |
| `Herbivores_BosTaurus` | Cattle | Domestic group template, injured states |
| `Herbivores_CapreolusCapreolus` | Roe deer | Extensive sound definitions (barks, ambush calls) |
| `Herbivores_CapraHircus` | Goats | NoJumping path filter |
| `Herbivores_SusDomesticus` | Pigs | Travelling behaviour |
| `Herbivores_OvisAries` | Sheep | Referenced in events |
| `Herbivores_RangiferTarandus` | Reindeer | Cold-climate herbivore |
| `Predators` | Base predator | Wolf AI base |
| `Predators_CanisLupus` | Wolves | Pack hunting behaviour |
| `Predators_UrsusArctos` | Bears | Large predator with charge |
| `Zombies` | Infected base | Zombie AI root |
| `Zombies_InfectedMBase` | Male infected | Male zombie variants |
| `Zombies_InfectedFBase` | Female infected | Female zombie variants |
| `Weapons` | Weapon handling | Armed NPC weapon behaviour |
| `DZGunGroupBeh` | Gun groups | Group combat behaviour |
| `DZMeleeGroupBeh` | Melee groups | Melee group behaviour |
| `DZDeerGroupBeh` | Deer groups | Social herd templates |
| `DZSheepGroupBeh` | Sheep groups | Flock templates |
| `DZDomesticGroupBeh` | Domestic groups | Farm animal templates |
| `DZWolfGroupBeh` | Wolf groups | Pack structure |

## Behaviour Slot Structure

Each behaviour team defines slots for each behaviour state:

```cpp
class Herbivores
{
    teamName = "BigGame";
    
    class Calm
    {
        // Ticked every 10-15 seconds in calm state
        class CalmResting
        {
            weight = 0.3;
            // Rest and idle behaviour
        };
        class CalmGrazing
        {
            weight = 0.5;
            // Eating behaviour (most common)
        };
        class CalmTravelling
        {
            weight = 0.2;
            // Moving between locations
        };
        class Drinking
        {
            weight = 0.1;
            // Water source seeking
        };
    };
    
    class NonSpecificThreat
    {
        // Ticked every 5-8 seconds
        // Suspicious, investigating
    };
    
    class SpecificThreat
    {
        // Ticked every 2-3 seconds
        // Identified threat, preparing response
    };
    
    class Alerted
    {
        // Ticked every 1-2 seconds
        class Flee
        {
            weight = 0.7;
            // Default response for herbivores
        };
    };
};
```

## AI Movement Profiles

Each behaviour team specifies movement parameters:

```cpp
class Herbivores_CapreolusCapreolus
{
    maxSpeed = 11.76;           // Maximum movement speed (m/s)
    pathFilter = "RoeDeerOnRun"; // Navigation path filter
    acceleration = 4.0;         // Acceleration rate
    
    // ... behaviour slots, sound definitions, alert system
};
```

### Movement Parameters by Creature

| Creature | maxSpeed (m/s) | maxSpeed (km/h) | Path Filter |
|----------|---------------|-----------------|-------------|
| Chicken | ~3 | ~11 | ChickenOnRun |
| Hare | 5 | 18 | (default) |
| Fox | ~8 | ~29 | (default) |
| Roe Deer | 11.76 | 42.3 | RoeDeerOnRun |
| Cattle | 11 | 39.6 | CowOnRun |
| Goat | ~8 | ~29 | NoJumping |
| Pig | ~8 | ~29 | (default) |
| Wolf | ~12 | ~43 | (default) |
| Bear | ~10 | ~36 | (default) |
| Infected | ~6 | ~22 | (default) |

## Alert System

Each behaviour team configures how creature detect threats:

```cpp
class AlertSystem
{
    // Vision detection
    visionRangeMin = 10;        // Minimum vision range (meters)
    visionRangeMax = 25;        // Maximum vision range
    visionFOV = 180;            // Field of view (degrees)
    visionNightMultiplier = 0.3; // Reduced vision at night
    visionRainMultiplier = 0.7; // Reduced vision in rain
    visionFogMultiplier = 0.5;  // Reduced vision in fog
    
    // Alert levels
    class InstantAlert
    {
        // Immediate full alert on threat detection
    };
    
    class AlertLevel1
    {
        dropSpeed = 0.05;       // Alert decay per second
        dropDelay = 10;         // Seconds before decay starts
    };
    
    class AlertLevel2
    {
        dropSpeed = 0.02;
        dropDelay = 30;
    };
};
```

### Alert Systems by Creature

| Creature | Vision Range | FOV | Special |
|----------|-------------|-----|---------|
| Chicken | ~15m | 180° | Quick to calm |
| Hare | 7-25m | 180° | InstantAlert, fast flee |
| Fox | 10-25m | 180° | 70% sniff weight |
| Roe Deer | 15-30m | 210° | Sensitive to movement |
| Wolf | 20-40m | 200° | Persistent tracking |
| Bear | 15-35m | 190° | Aggressive response |
| Infected | 8-20m | 160° | Sound-priority detection |

## Noise System

`CfgNoises` defines AI-detectable noise types:

```cpp
class CfgNoises
{
    class DeerStepNoise
    {
        type = "sound";
        continuousRange = 100;    // Max detection range (m)
        strength = 10;            // Noise intensity
    };
    
    class DeerRoarNoise
    {
        type = "sound";
        continuousRange = 100;
        strength = 10;
    };
    
    class WolfStepNoise  { continuousRange = 100; strength = 10; };
    class WolfRoarNoise  { continuousRange = 100; strength = 10; };
    class ZombieStepNoise { continuousRange = 100; strength = 10; };
    class ZombieRoarNoise { continuousRange = 100; strength = 10; };
};
```

## Damage Types

`CfgDamages` defines creature attack damage parameters:

```cpp
class CfgDamages
{
    class DeerBiteDamage
    {
        // Empty placeholder — deer don't attack
    };
    
    class WolfBiteDamage
    {
        bone = "tongue3";        // Hit bone
        ammo = "MeleeWolf";      // Ammo type (damage/effects)
        radius = 0.4;            // Hit radius (meters)
        duration = 0.2;          // Contact duration (seconds)
    };
    
    class WolfLowBiteDamage
    {
        bone = "chest";
        ammo = "MeleeWolf";
        radius = 0.7;
        duration = 0.2;
    };
};
```

## Zombie/Infected Behaviour Highlights

The `Zombies` behaviour team defines:

- **Detection**: Primarily sound-based, with visual confirmation
- **Chase**: Sustained pursuit with speed matching
- **Combat**: Melee attacks with grab/scratch/bite variants
- **Group aggro**: Nearby infected alerted when one engages
- **Leash**: Return to spawn area if target escapes beyond leash range
- **Day/night**: Some behaviour variations based on time of day

## AI Weapon Behaviour

The `Weapons` and `DZGunGroupBeh`/`DZMeleeGroupBeh` teams define:

- Weapon selection and switching logic
- Engagement range preferences
- Suppression fire behaviour
- Group coordination (flanking, covering fire)
- Ammo conservation

## Related Documentation

- [AI System](/game-systems/ai-system) — Script-side AI logic for infected, animals, and agents
- [Animals](./animals) — Config definitions for animal species
- [Damage & Combat](/game-systems/damage-combat) — How AI applies damage to players
- [Sound System](/game-systems/sound-system) — Audio integration with AI detection
