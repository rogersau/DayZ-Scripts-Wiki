# Sound System

The sound system manages audio playback, spatial audio, voice communication, and all game sounds from footsteps to gunfire. It spans Layer 3 core logic (`3_game/sound.c`, `3_game/vonmanager.c`) and Layer 4 script events (`4_world/classes/soundevents/`), with config data in `DZ/sounds/`.

## Architecture

```mermaid
flowchart TD
    subgraph Manager["Sound Playback (SEffectManager)"]
        PLAY[Sound Playback]
        OBJ[Sound Object Management]
        PARAM[Audio Parameters]
    end
    
    subgraph VON["VON Manager (3_game/vonmanager.c — 7,800 lines)"]
        VOICE[Voice-over-Network]
        RADIO[Radio Communication]
        FX[Voice Effects]
    end
    
    subgraph Config["Sound Config Data (DZ/sounds/)"]
        AI_SND[ai/ - Infected & animals]
        CHAR[Characters/ - Footsteps, voice]
        ENV[environment/ - Wind, rain, ambience]
        HPP[hpp/ - Sound headers/includes]
        MUSIC[music/ - Background tracks]
        VEH[vehicles/ - Engine, horn, crash]
        WEAP[weapons/ - Fire, reload, mechanics]
    end
    
    subgraph Events["Script Sound Events (4_world/classes/soundevents/)"]
        PLAYER_EV[Player Sound Events]
        INFECT_EV[Infected Sound Events]
        REPLACE_EV[Replace Sound Events]
    end
    
    subgraph Occlusion["Sound Occlusion Model"]
        DIST[Distance Rolloff]
        OBS[Obstruction / Walls]
        MAT[Material Absorption]
        WEATHER_O[Weather Effects]
        SURFACE[Surface Reflection]
    end
    
    Manager --> Config
    Manager --> Events
    Manager --> Occlusion
    VON --> Occlusion
```

## Sound Playback

The primary script interface for sound playback is `SEffectManager`. It handles playing sounds at positions or on entities in the world. Sound playback parameters are configured via the `CfgSoundShaders` / `CfgSoundSets` / `CfgSound3DProcessors` pipeline.

Sound events defined in `4_world/classes/soundevents/` provide a higher-level interface for gameplay sound triggers.

## Sound Config Data

Sounds are organized by category in `DZ/sounds/`:

```
DZ/sounds/
├── ai/             — Infected groans, screams, animal calls
├── Characters/     — Footsteps (per surface), breathing, pain, voice
├── environment/    — Wind, rain, thunder, insects, birds, ambience
├── hpp/            — Sound config includes and macros
├── music/          — Background music tracks, stingers
├── vehicles/       — Engine (start/idle/rev/stop), horn, crash, tires
└── weapons/        — Fire (per weapon), reload, bolt, mechanics
```

### Sound Config Format

Sounds are defined using a three-layer config system:

```cpp
// SoundShader — defines the audio sample and basic properties
class CfgSoundShaders {
    class AK47_Fire_SoundShader {
        samples[] = { { "DZ\sounds\weapons\ak47_fire", 1 } };
        volume = 0.9;
        range = 800;              // Max audible distance in meters
    };
};

// SoundSet — groups shaders with playback parameters
class CfgSoundSets {
    class AK47_Fire_SoundSet {
        soundShaders[] = { "AK47_Fire_SoundShader" };
        volumeFactor = 1.0;
        frequencyFactor = 1.0;
        spatial = 1;              // 3D spatialization enabled
    };
};
```

## VON (Voice Over Network)

The VON system (`vonmanager.c`, ~7,800 lines) handles real-time voice communication. See the full [Voice Communication](./voice-communication) page for the complete pipeline, player state integration, and radio equipment details.

The script-side `VONManager` class provides a thin static wrapper; the real work happens in `VONManagerBase`. Core functionality includes start/stop transmission, radio frequency tuning, and voice effect management.

| Channel | Range | Quality | Use Case |
|---------|-------|---------|----------|
| PROXIMITY | ~50m (configurable) | High, direct | Face-to-face communication |
| RADIO | Unlimited (frequency) | Reduced, compressed | Squad coordination |
| MEGAPHONE | ~200m | Amplified, distorted | Vehicle announcements, crowd control |

## Sound Occlusion

Sounds in DayZ use a multi-factor occlusion model for realistic audio propagation:

### Occlusion Factors

| Factor | Effect | Implementation |
|--------|--------|----------------|
| **Distance** | Volume drops over distance via configurable rolloff curve | Config-driven rolloff via `CfgSound3DProcessors` |
| **Obstructions** | Walls, buildings, terrain block/interfere with sound | Raycast-based occlusion check (engine-level) |
| **Materials** | Different materials transmit sound differently (concrete vs wood vs dirt) | Per surface type in config |
| **Weather** | Wind direction carries sound further downwind; rain adds noise floor | Wind vector × distance, rain intensity |
| **Surfaces** | Sound reflection/echo from different surfaces (indoor reverb, outdoor open) | Environment reverb type |

```c
// Example: Sound propagation calculation
float CalculateAudibility(vector source, vector listener) {
    float baseVolume = 1.0;
    
    // Distance falloff
    float dist = vector.Distance(source, listener);
    baseVolume *= GetRolloffFactor(dist, minDist, maxDist);
    
    // Occlusion from obstacles (engine-level)
    float occlusion = GetOcclusionFactor(source, listener);
    baseVolume *= (1.0 - occlusion);
    
    // Weather modifier
    baseVolume *= GetWeatherSoundModifier(windSpeed, rainIntensity);
    
    return baseVolume;
}
```

## Sound Events (`4_world/classes/soundevents/`)

Script-defined sound events in Layer 4 provide a higher-level interface to the sound system. The base `SoundEvent` class is defined in `1_core/proto/proto.c`.

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

Sound event categories:

| Category | Directory | Examples |
|----------|-----------|---------|
| **Player** | `playersoundevents/` | Damage, drowning, heat comfort, hold breath, injury, jump, melee, stamina, symptoms |
| **Infected** | `infectedsoundevents/` | Mind state sounds (idle, alert, combat) |
| **Replace** | `replacesoundevents/` | Surface-based sound replacement (footsteps on different surfaces) |

### Sound Handlers

Additional sound management classes in Layer 4:

| Handler | Purpose |
|---------|---------|
| `FreezingSoundHandlerBase` / `FreezingSoundHandlerClient` / `FreezingSoundHandlerServer` | Shivering and cold-related sounds |
| `HungerSoundHandler` | Stomach growling sounds |
| `InjurySoundHandler` | Pain and injury vocalizations |
| `ItemSoundHandler` | Item interaction sounds (picking up, dropping, equip) |
| `PlayerSoundManager` | Central player sound management |
| `ThirstSoundHandler` | Dehydration-related sounds |

## Integration with Other Systems

- **Weapons system**: Fire, reload, mechanical, bullet impact sounds — see [Damage & Combat](./damage-combat)
- **Vehicle system**: Engine (start/idle/stop), horn, crash, tire screech — see [Vehicle System](./vehicle-system)
- **Player system**: Footsteps, breathing, pain, weather exposure sounds — see [Player System](./player-system)
- **AI system**: Infected groans, screams, animal calls; AI hearing uses sound events — see [AI System](./ai-system)
- **Weather system**: Wind, rain, thunder ambient sounds affect gameplay — see [Weather & Environment](./weather-environment)
- **Animation system**: Footstep events trigger surface-specific sound playback — see [Animation System](./animation-system)
- **Effect system**: Combined particle + sound effects via `EffectSound` — see [Effect System](./effect-system)
- **Voice Communication**: Full VoIP pipeline, voice channels, player state integration — see [Voice Communication](./voice-communication)
- **Network**: VON voice data transmission over UDP, sound event synchronization — see [Networking & RPC](./networking)
