# Sound System

The sound system manages audio playback, spatial audio, voice communication, and all game sounds from footsteps to gunfire.

## Architecture

```
Sound System
├── Sound Manager (3_game/sound.c)
│   ├── Sound playback control
│   ├── Sound object management
│   └── Audio parameter control
│
├── VON Manager (3_game/vonmanager.c)
│   ├── Voice-over-network (proximity chat)
│   ├── Radio communication
│   └── Voice effects
│
├── Sound Config Data (DZ/sounds/)
│   ├── ai/           — AI/creature sounds
│   ├── Characters/   — Character sounds
│   ├── environment/  — Ambient/environment sounds
│   ├── hpp/          — Sound headers
│   ├── music/        — Music tracks
│   ├── vehicles/     — Vehicle sounds
│   └── weapons/      — Weapon sounds
│
└── Sound Events (4_world/classes/soundevents/)
    └── Script-defined sound events
```

## Sound Manager

The core sound playback interface:

```c
class SoundManager {
    // Play a sound at a position
    SoundObject PlaySound(string soundName, vector position);
    
    // Play a sound on an entity
    SoundObject PlaySoundOnEntity(string soundName, EntityAI entity);
    
    // Play a looping ambient sound
    AmbientObject PlayAmbient(string soundName, vector position, float radius);
    
    // Stop sounds
    void StopSound(SoundObject sound);
    void StopAllSounds();
    
    // Audio parameters
    void SetMasterVolume(float volume);
    void SetSFXVolume(float volume);
    void SetMusicVolume(float volume);
    void SetVoiceVolume(float volume);
};
```

## Sound Objects

```c
class SoundObject {
    // Playback control
    void Play();
    void Stop();
    void Pause();
    void Resume();
    
    // Parameters
    void SetVolume(float volume);
    void SetPitch(float pitch);
    void SetPosition(vector position);
    void SetLoop(bool loop);
    
    // 3D audio
    void SetRolloff(float minDist, float maxDist);
    void SetOcclusion(float occlusion);
    
    // State
    bool IsPlaying();
    float GetDuration();
    float GetTime();
};
```

## Sound Config Data

Sounds are defined in `DZ/sounds/` organized by category:

```
DZ/sounds/
├── ai/             — Infected groans, animal calls
├── Characters/     — Footsteps, breathing, pain
├── environment/    — Wind, rain, thunder, insects
├── hpp/            — Sound config includes
├── music/          — Background music tracks
├── vehicles/       — Engine, horn, crash sounds
└── weapons/        — Fire, reload, mechanics
```

### Sound Config Format

```cpp
// DZ/sounds/weapons/config.cpp
class CfgSoundSets {
    class AK47_Fire_SoundSet {
        soundShaders[] = { "AK47_Fire_SoundShader" };
        volumeFactor = 1.0;
        frequencyFactor = 1.0;
        spatial = 1;
    };
};

class CfgSoundShaders {
    class AK47_Fire_SoundShader {
        samples[] = { { "DZ\sounds\weapons\ak47_fire", 1 } };
        volume = 0.9;
        range = 800;
    };
};
```

## VON (Voice Over Network)

The VON system (`vonmanager.c`, ~7,800 lines) handles voice communication:

```c
class VONManager {
    // Start/stop voice transmission
    void StartTransmitting();
    void StopTransmitting();
    bool IsTransmitting();
    
    // Radio communication
    void SetRadioFrequency(float frequency);
    bool IsRadioTransmitting();
    
    // Voice effects
    void SetVoiceEffect(VoiceEffectType effect);
    // VoiceEffectType: NORMAL, RADIO, DISTORTED, DISTANT
    
    // Volume/proximity
    float GetVoiceVolume();     // Based on distance
    void SetVoiceCone(float angle, float radius);
};
```

### Voice Channels

```c
enum VoiceChannel {
    PROXIMITY,      // Local chat (hears based on distance)
    RADIO,          // Radio communication (party/frequency based)
    MEGAPHONE       // Amplified voice (vehicle PA systems)
};
```

## Sound Occlusion

Sounds in DayZ use occlusion modeling:

```c
class SoundOcclusion {
    // Material-based sound propagation
    static float GetOcclusion(vector source, vector listener);
    static float GetMaterialAbsorption(string materialType);
    
    // Environment modifiers
    static float GetEnvironmentReverb(string environmentType);
};
```

Factors affecting sound propagation:
- **Distance**: Volume drops over distance (rolloff curve)
- **Obstructions**: Walls, buildings, terrain reduce sound
- **Materials**: Different materials transmit sound differently
- **Weather**: Wind direction, rain affect sound travel
- **Surfaces**: Sound reflection from different surfaces

## Sound Events

Script-defined sound events in `4_world/classes/soundevents/`:

```c
class SoundEvent {
    string m_SoundName;
    float m_Radius;
    float m_Duration;
    bool m_IsLooping;
    
    void OnPlay();
    void OnStop();
};
```

## Integration with Other Systems

- **Weapons system**: Fire, reload, mechanical sounds
- **Vehicle system**: Engine, horn, crash, tire sounds
- **Player system**: Footsteps, breathing, pain, voice
- **AI system**: Infected groans, animal calls
- **Weather system**: Wind, rain, thunder ambient
- **Animation system**: Footstep events trigger sounds
- **Effect system**: Combined particle + sound effects
- **Network**: VON voice data transmission
