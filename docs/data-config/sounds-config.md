# Sound Configuration

The `DZ/sounds/` directory defines the entire audio pipeline. From `P:/DZ/sounds/hpp/config.cpp` (~448,495 lines — the single largest config file in the game).

## Sound System Architecture

The sound pipeline flows through these config layers:

```
CfgSoundCurves      → Volume attenuation over distance
CfgSoundEffects     → Reverb and DSP effects
CfgDistanceFilters  → Distance-based frequency filters
CfgSound3DProcessors → Spatial audio processing
CfgSoundShaders     → Individual sound source definitions (volume, pitch, filters)
CfgSoundSets        → Logical sound groupings (footsteps, weapons, etc.)
CfgSoundTables      → Random/variant selection tables
CfgEnvSounds        → Environmental/procedural audio
```

## Sound Categories

The `DZ/sounds/` directory is organized into subdirectories:

| Directory | Contents | Config Size |
|-----------|----------|-------------|
| `Characters/` | Character sounds (actions, attacks, crafting, gestures, impacts, injuries, movement, voice, unconscious) | Stub |
| `ai/` | AI sounds (animals, infected) | Stub |
| `environment/` | Environmental sounds (ambients, birds, buildings, events, heli crash, insects, objects, weather, water) | Stub |
| `hpp/` | **Main sound config** — all SoundShaders, SoundSets, SoundTables | 448,495 lines |
| `vehicles/` | Vehicle engine and component sounds | Stub |
| `weapons/` | Weapon action sounds (crafting, reloads, impacts, explosions) | 316 lines |
| `music/` | Ambient music OGG files (menu, location ambience) | (in hpp/) |

> **Note**: Most subdirectory configs are stubs (<10 lines). The actual sound definitions all live in `hpp/config.cpp`.

## Sound Curves

`CfgSoundCurves` defines volume attenuation over distance:

```cpp
class defaultAmpAttenuationCurve
{
    points[] = {
        {0.0, 1.0},   // Max volume at distance 0
        {0.5, 0.7},   // 70% at halfway
        {0.8, 0.3},   // 30% at 80% distance
        {1.0, 0.0}    // Silent at max distance
    };
};

class defaultWeaponAmpAttenuationCurve
{
    // Sharper drop-off for weapons (louder up close, quieter far)
    points[] = {
        {0.0, 1.0},
        {0.3, 0.8},
        {0.6, 0.4},
        {1.0, 0.0}
    };
};
```

| Curve | Used For | Characteristic |
|-------|----------|---------------|
| `defaultAmpAttenuationCurve` | General sounds | Smooth rolloff |
| `defaultAnimalAttenuationCurve` | Animal calls | Longer range |
| `defaultWeaponAmpAttenuationCurve` | Gunshots | Sharp close-range falloff |
| Per-surface curves | Footsteps | Varies by surface type |

## Sound Shaders

`CfgSoundShaders` (~2,800 definitions) defines individual sound sources. Each shader specifies:

```cpp
class AK15_Shot_SoundShader
{
    // Source audio file
    samples[] = {
        { "\dz\sounds\weapons\firearms\AK15\ak15_shot_1", 1.0 },
        { "\dz\sounds\weapons\firearms\AK15\ak15_shot_2", 1.0 },
        { "\dz\sounds\weapons\firearms\AK15\ak15_shot_3", 1.0 },
        { "\dz\sounds\weapons\firearms\AK15\ak15_shot_4", 1.0 }
    };
    
    // Volume and pitch
    volume = 1.0;
    pitch = 1.0;
    
    // Attenuation curve
    attenuationCurve = "defaultWeaponAmpAttenuationCurve";
    
    // DSP chain
    class DSP
    {
        // Effect processors applied to this sound
    };
    
    // Occlusion
    occlusion = 1;
    occlusionFactor = 0.5;
    
    // Reverb send
    reverbSend = 0.3;
    
    // Distance filter
    distanceFilter = "defaultWeaponDistanceFilter";
    
    // 3D processor
    processor = "defaultWeapon3DProcessor";
};
```

### Sound Shader Properties

| Property | Purpose | Typical Values |
|----------|---------|----------------|
| `samples[]` | Audio file paths + selection weights | WAV/OGG paths |
| `volume` | Base volume level | 0.0 — 1.0 |
| `pitch` | Playback pitch multiplier | 0.5 — 2.0 |
| `attenuationCurve` | Distance rolloff | Curve reference |
| `occlusion` | Wall penetration filtering | 0 or 1 |
| `occlusionFactor` | How much walls muffle sound | 0.0 — 1.0 |
| `reverbSend` | Wet/dry reverb mix | 0.0 — 1.0 |
| `loop` | Looping sound | 0 or 1 |
| `randomization` | Random pitch/offset | {0.9, 1.1} |

## Sound Sets

`CfgSoundSets` (~60,000 definitions) bundles multiple sound shaders into a logical game sound:

```cpp
class AK15_Shot_SoundSet
{
    soundShaders[] = {
        "AK15_Shot_SoundShader",     // Primary shot
        "AK15_Shot_Tail_SoundShader", // Distant tail
        "AK15_Shot_Near_SoundShader", // Near-field crack
        "AK15_Shot_Far_SoundShader"  // Far-field thump
    };
    
    volumeFactor = 1.0;
    pitchFactor = 1.0;
    
    // Randomization
    randomization = 0.05;           // 5% random pitch variation
    
    // Spatial blend
    spatial = 1;                     // 3D positional audio
};
```

### Sound Set Categories

| Category | Examples | Count |
|----------|----------|-------|
| Weapon fire | Per-weapon shot, tail, mech sounds | ~500 |
| Footsteps | Per-surface, per-stance | ~200 |
| Character | Breathing, damage, death, voice | ~800 |
| Environment | Weather, ambience, birds, insects | ~1,000 |
| Vehicles | Engines, doors, components | ~400 |
| Items | Crafting, opening, using | ~600 |
| UI | Menu clicks, notifications | ~100 |

## Sound Tables

`CfgSoundTables` (~95,000 entries) provides random/variant selection:

```cpp
class AK15_Shot_SoundTable
{
    items[] = {
        { "AK15_Shot_SoundSet", 1.0, 1.0 },  // SoundSet, volume, pitch
        { "AK15_Shot_SoundSet", 0.9, 1.05 },
        { "AK15_Shot_SoundSet", 1.1, 0.95 }
    };
};
```

## Sound Categories by Directory

### Weapon Sounds (`sounds/weapons/`)

`CfgActionSounds` defines weapon-related sound hooks:

```cpp
class craft_rounds
{
    sounds[] = {
        { "\dz\sounds\weapons\crafting\craft_rounds_1", 1.0, 0.9, 30 },
        { "\dz\sounds\weapons\crafting\craft_rounds_2", 1.0, 1.0, 30 },
        { "\dz\sounds\weapons\crafting\craft_rounds_3", 1.0, 1.1, 30 }
    };
    distance = 30;  // Max hearing distance (meters)
};
```

| Sound Category | Contents |
|---------------|----------|
| `crafting/` | Bullet crafting, magazine loading |
| `firearms/` | Per-weapon shot sounds (AK, M4, etc.) |
| `shotguns/` | Shotgun-specific sounds |
| `grenades/` | Explosion sounds |
| `launchers/` | RPG/grenade launcher sounds |
| `meleehits/` | Melee impact sounds |
| `hits/` | Bullet impact sounds |
| `shells/` | Shell casing sounds |
| `projectiles/` | Bullet pass-by sounds |

### Character Sounds (`sounds/Characters/`)

| Subdirectory | Contents |
|-------------|----------|
| `actions/` | Interaction sounds |
| `attacks/` | Melee swing/hit sounds |
| `crafting/` | Crafting feedback sounds |
| `gestures/` | Emote sounds |
| `impacts/` | Damage impact sounds |
| `injuries/` | Pain/injury vocalizations |
| `movement/` | Footstep surfaces |
| `ui/` | Inventory menu sounds |
| `voice/` | Player character voices |
| `unconscious/` | Unconsciousness sounds |

### Environmental Sounds (`sounds/environment/`)

| Subdirectory | Contents |
|-------------|----------|
| `ambients/` | Location-based ambient soundscapes |
| `artillery/` | Off-map artillery sounds |
| `birds/` | Bird species calls |
| `buildings/` | Building interior ambience |
| `events/` | Global event sounds |
| `helicrash/` | Helicopter crash sounds |
| `insects/` | Insect ambient sounds |
| `objects/` | Object interaction sounds |
| `water/` | Water movement sounds |
| `weather/` | Rain, wind, thunder sounds |

## Per-World Sound Variations

- `DZ/sounds_bliss/` — Livonia-specific sound extensions
- `DZ/sounds_sakhal/` — Sakhal-specific sounds (blizzard, volcanic)

## Related Documentation

- [Sound System](/game-systems/sound-system) — Script-side audio system management
- [Surfaces](./surfaces) — Surface impact sound mapping
- [Weapons](./weapons) — Weapon config with sound references
- [Vehicles](./vehicles-data) — Vehicle config with engine sounds
