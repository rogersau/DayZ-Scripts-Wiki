# Sound Pipeline Hierarchy

The `DZ/sounds/hpp/config.cpp` file (~448,495 lines) defines the entire DayZ audio pipeline through a layered class hierarchy. This page documents that hierarchy.

## Pipeline Architecture

Audio flows through these config layers in order:

```
Source Audio Files (.wav/.ogg)
        ↓
CfgSoundCurves        — Volume attenuation over distance
        ↓
CfgSoundEffects       — DSP effects (EQ, reverb, echo)
        ↓
CfgDistanceFilters    — Distance-based frequency filtering
        ↓
CfgSound3DProcessors  — Spatial audio positioning
        ↓
CfgSoundShaders       — Individual sound definitions (9,554 classes)
        ↓
CfgSoundSets          — Logical sound groupings (6,045 classes)
        ↓
CfgSoundTables        — Surface/context-specific sound selection
        ↓
CfgEnvSounds          — Environmental/procedural audio
        ↓
CfgWorlds / CfgVehicles / cfgWeapons / CfgActionSounds / CfgSounds / CfgRadio
```

## Section Breakdown

| Section | Lines | Classes | Purpose |
|---------|-------|---------|---------|
| `CfgSoundCurves` | 59–2,078 | ~20 | Distance attenuation curves |
| `CfgSoundEffects` | 2,079–2,339 | ~30 | Reverb/EQ/DSP effects |
| `CfgDistanceFilters` | 2,340–2,504 | ~15 | Frequency filters per distance |
| `CfgSound3DProcessors` | 2,505–2,989 | ~20 | 3D audio processor configs |
| `CfgSoundShaders` | 2,990–277,378 | **9,554** | Individual sound sources |
| `CfgSoundSets` | 277,379–337,616 | **6,045** | Logical sound groupings |
| `CfgSoundTables` | 337,617–433,042 | **95,000+** | Surface and variant selection |
| `CfgEnvSounds` | 433,043–438,178 | ~500 | Environmental ambience |
| `CfgWorlds` | 438,179–443,341 | ~200 | World-specific sound params |
| `CfgVehicles` | 443,342–443,677 | ~50 | Vehicle engine sounds |
| `cfgWeapons` | 443,678–444,413 | ~100 | Weapon fire variants |
| `CfgSFX` | 444,414–444,431 | ~10 | Special effects |
| `CfgActionSounds` | 444,432–445,694 | ~300 | Action-triggered sounds |
| `CfgSounds` | 445,695–448,492 | ~1,500 | Legacy sound definitions |
| `CfgRadio` | 448,493–448,495 | ~5 | Radio communication |

## CfgSoundCurves — Attenuation

Defines how sound volume decreases over distance using point-based curves:

```cpp
class CfgSoundCurves
{
    class defaultAmpAttenuationCurve
    {
        points[] = {
            {0.0, 1.0},           // Full volume at origin
            {0.01, 0.7},          // 70% at 1% max distance
            {0.035, 0.45},        // 45% at 3.5%
            {0.085, 0.25},        // 25% at 8.5%
            {0.14, 0.15},         // 15% at 14%
            {0.22, 0.09},         // 9% at 22%
            {0.325, 0.05},        // 5% at 32.5%
            {0.45, 0.02},         // 2% at 45%
            {0.7, 0.01},          // 1% at 70%
            {1.0, 0.0}            // Silent at max distance
        };
    };
    class defaultWeaponAmpAttenuationCurve { /* sharper falloff */ };
    class defaultAnimalAttenuationCurve { /* longer range */ };
    class characterAttenuationCurve { /* character voice range */ };
    class footstepsAttenuationCurve { /* footstep range */ };
    class vehicleAttenuationCurve { /* engine range */ };
    // ... ~15 total curves
};
```

Key curves:
- `defaultAmpAttenuationCurve` — General sounds (smooth rolloff)
- `defaultWeaponAmpAttenuationCurve` — Gunfire (sharp close falloff, long tail)
- `defaultAnimalAttenuationCurve` — Animal calls (extended range)
- `characterAttenuationCurve` — Voice/damage sounds (short range)
- `footstepsAttenuationCurve` — Movement sounds (medium range)
- `vehicleAttenuationCurve` — Engine/vehicle (long range)

## CfgSoundEffects — DSP Processing

Defines reverb, equalization, and echo effects for different environments:

```cpp
class CfgSoundEffects
{
    class AttenuationsEffects
    {
        class HouseAttenuation
        {
            // EQ: Interior dampening (high-frequency reduction)
            class Equalizer0 {
                center[] = {98, 1568, 6272, 12544};
                bandwidth[] = {2, 2, 1.8, 2};
                gain[] = {0.71, 0.56, 0.40, 0.40};  // Reduced highs
            };
            class Echo {
                WetDryMix = 0.1;
                Feedback = 0.1;
                Delay = 50;                         // 50ms reflection
            };
        };
        class CarAttenuation {
            // Interior car sound (engine rumble, road noise shaping)
            class Equalizer0 { /* boosted lows */ };
            class Echo { /* short delay, low wet */ };
        };
        class ForestAttenuation { /* open-air ambience */ };
        class InteriorLarge { /* hall reverb */ };
        class InteriorSmall { /* room reverb */ };
        class Underwater { /* heavily muffled */ };
    };
};
```

## CfgDistanceFilters — Frequency Rolloff

Applies frequency filtering based on distance:

```cpp
class CfgDistanceFilters
{
    class BaseCharacter_AttenuationFilter
    {
        type = "lowpass";
        minDistance = 30;
        maxDistance = 300;
        // Rolloff curve for frequency cutoff
    };
    class Weapon_AttenuationFilter
    {
        type = "bandpass";
        minDistance = 50;
        maxDistance = 2000;
        // High frequencies attenuate faster than lows (distant shots sound like thumps)
    };
};
```

## CfgSound3DProcessors — Spatial Audio

Controls 3D positioning, doppler, and spatial blending:

```cpp
class CfgSound3DProcessors
{
    class character3DProcessingType
    {
        spatial = 1;           // Full 3D positioning
        doppler = 0;           // No doppler
    };
    class weapon3DProcessingType
    {
        spatial = 1;
        doppler = 1;           // Doppler shift for moving shots
    };
    class ambient3DProcessingType
    {
        spatial = 0;           // Non-positional (ambient)
    };
};
```

## CfgSoundShaders — Sound Sources (9,554 classes)

Each SoundShader defines a single sound source with audio files, volume, pitch, and filtering.

```cpp
class CfgSoundShaders
{
    // Base shader classes define defaults
    class baseCharacter_SoundShader
    {
        range = 35;                    // Audible range (meters)
        // Inherited by all character sounds
    };
    class baseCharacterLoud_SoundShader { range = 60; };
    class baseCharacterFootsteps_SoundShader { range = 40; };
    class baseCharacterSprintFootsteps_SoundShader { range = 60; };

    // Concrete shaders inherit from bases
    class Char_Attack_knife_light1_SoundShader: baseCharacter_SoundShader
    {
        samples[] = {
            {"DZ\\sounds\\Characters\\attacks\\knife\\knife_Attack_light1_1", 1},
            {"DZ\\sounds\\Characters\\attacks\\knife\\knife_Attack_light1_2", 1},
            {"DZ\\sounds\\Characters\\attacks\\knife\\knife_Attack_light1_3", 1},
            {"DZ\\sounds\\Characters\\attacks\\knife\\knife_Attack_light1_4", 1}
        };
        volume = 0.25;
    };
};
```

### Shader Properties

| Property | Type | Purpose |
|----------|------|---------|
| `samples[]` | array | Audio file paths + selection weights |
| `volume` | float | Base volume (0.0–1.0+) |
| `range` | float | Max audible distance (meters) |
| `pitch` | float | Playback pitch multiplier |
| `loop` | bool | Looping sound |
| `randomization` | float | Random pitch variation (±) |
| `occlusion` | bool | Wall penetration filtering |
| `occlusionFactor` | float | Occlusion strength |
| `reverbSend` | float | Wet/dry reverb mix |

### Shader Naming Conventions

Shaders follow consistent naming patterns:
- `Char_*_SoundShader` — Character sounds (damage, voice, footsteps)
- `Weap_*_SoundShader` — Weapon sounds (fire, mech, tail)
- `Zmb_*_SoundShader` — Infected sounds
- `Amb_*_SoundShader` — Ambient/environmental sounds
- `Vehicle_*_SoundShader` — Vehicle engine/component sounds
- `Action_*_SoundShader` — Interaction sounds
- `Surface_*_SoundShader` — Per-surface impacts

## CfgSoundSets — Sound Groups (6,045 classes)

SoundSets bundle multiple sound shaders into a logical game sound:

```cpp
class CfgSoundSets
{
    // Base set classes define processing pipeline
    class baseCharacter_SoundSet
    {
        sound3DProcessingType = "character3DProcessingType";
        distanceFilter = "BaseCharacter_AttenuationFilter";
        volumeCurve = "characterAttenuationCurve";
        spatial = 1;
        doppler = 0;
        loop = 0;
    };
    class baseFootsteps_SoundSet
    {
        sound3DProcessingType = "character3DProcessingType";
        distanceFilter = "BaseFootsteps_AttenuationFilter";
        volumeCurve = "footstepsAttenuationCurve";
        spatial = 1;
    };
    class baseSmallItem_SoundSet
    {
        sound3DProcessingType = "smallItem3DProcessingType";
        volumeCurve = "characterAttenuationCurve";
        spatial = 1;
    };
};
```

### Set Properties

| Property | Purpose |
|----------|---------|
| `sound3DProcessingType` | References a CfgSound3DProcessors entry |
| `distanceFilter` | References a CfgDistanceFilters entry |
| `volumeCurve` | References a CfgSoundCurves entry |
| `spatial` | 3D positional audio (0/1) |
| `doppler` | Doppler effect (0/1) |
| `loop` | Looping (0/1) |
| `soundShaders[]` | Array of shader class names to play |

### Set Organization

SoundSets are organized by category:

| Prefix | Count | Examples |
|--------|-------|----------|
| `Char_*` | ~1,500 | Damage, voice, footsteps, breathing |
| `Weap_*` | ~1,000 | Fire, reload, mech, tail |
| `Zmb_*` | ~500 | Idle, alert, attack, death |
| `Amb_*` | ~800 | Wind, rain, birds, insects, fire |
| `Vehicle_*` | ~400 | Engine start/run/stop, doors, components |
| `Item_*` | ~600 | Crafting, opening, using, dropping |
| `Surface_*` | ~200 | Footstep impacts, bullet impacts |
| `Action_*` | ~300 | Interaction feedback |
| `Music_*` | ~100 | Menu, location, event music |
| `UI_*` | ~100 | Menu clicks, notifications |

## CfgSoundTables — Variant Selection

SoundTables map game contexts (surfaces, actions) to specific SoundSets. The largest section contains per-surface step sound tables:

```
CfgStepSoundTables
├── BirdWalk_LookupTable        — 50+ surfaces → BirdWalk_*_SoundSet
├── CharacterWalk_LookupTable   — 50+ surfaces → CharacterWalk_*_SoundSet
├── CharacterSprint_LookupTable — 50+ surfaces → CharacterSprint_*_SoundSet
├── InfectedWalk_LookupTable    — 50+ surfaces → InfectedWalk_*_SoundSet
├── AnimalWalk_LookupTable      — 50+ surfaces → AnimalWalk_*_SoundSet
└── ... (per-creature-type tables)
```

```cpp
class BirdWalkstepSound_asphalt_ext
{
    surface = "asphalt_ext";
    soundSets[] = { "BirdWalk_Road_SoundSet" };
};
class BirdWalkstepSound_concrete_ext
{
    surface = "concrete_ext";
    soundSets[] = { "BirdWalk_Road_SoundSet" };
};
```

Each table covers all 50+ surface types with the appropriate SoundSet for that surface.

## CfgEnvSounds — Environmental Audio

Procedural ambient sound profiles for different locations and weather conditions:

```cpp
class CfgEnvSounds
{
    class Rain
    {
        sound = "Amb_Rain_SoundSet";
        volume = 0.5;
        // Intensity-based volume curve
    };
    class Wind
    {
        sound = "Amb_Wind_SoundSet";
        volume = 0.3;
    };
    class ForestAmbience
    {
        // Birds, insects, rustling
        sounds[] = { "Amb_Forest_Birds", "Amb_Forest_Insects" };
    };
};
```

## CfgActionSounds — Contextual Audio

Action-triggered sounds referenced by game code:

```cpp
class CfgActionSounds
{
    class craft_rounds
    {
        sounds[] = {
            {"DZ\\sounds\\weapons\\crafting\\craft_rounds_1", 1.0, 0.9, 30},
            {"DZ\\sounds\\weapons\\crafting\\craft_rounds_2", 1.0, 1.0, 30},
            {"DZ\\sounds\\weapons\\crafting\\craft_rounds_3", 1.0, 1.1, 30}
        };
        distance = 30;  // Audible range
    };
};
```

## CfgSounds — Legacy Definitions

Individual WAV/OGG file references with volume, pitch, and max distance:

```cpp
class CfgSounds
{
    class craft_rounds_1
    {
        sound[] = {"DZ\\sounds\\weapons\\crafting\\craft_rounds_1", 1.0, 0.9, 30};
        titles[] = {};
    };
};
```

## Sound File Organization

Audio source files are stored in `DZ/sounds/` subdirectories:

| Directory | Subdirectories | File Count |
|-----------|---------------|------------|
| `Characters/` | actions, attacks, crafting, gestures, impacts, injuries, movement, ui, unconscious, voice | ~1,000+ |
| `ai/` | animals, infected | ~500+ |
| `environment/` | ambients, artillery, birds, buildings, events, helicrash, insects, objects, water, weather | ~800+ |
| `vehicles/` | Per-vehicle directories | ~400+ |
| `weapons/` | firearms, shotguns, grenades, launchers, meleehits, hits, projectiles, shells | ~2,000+ |
| `music/` | Menu, location ambience | ~100+ |

## How Scripts Reference Sounds

Game scripts reference sound sets by name:

```c
// From P:/scripts/3_game/sound.c
SEffectManager.PlayOnObject(
    "AK15_Shot_SoundSet",      // SoundSet name
    weapon,                     // Source object
    5,                          // Radius
    10                          // Max distance
);
```

## Related Documentation

- [Sound System](/game-systems/sound-system) — Script-side audio management
- [Surfaces](./surfaces) — Surface types that drive SoundTable selections
- [Weapons](./weapons) — Weapon sound references in config
