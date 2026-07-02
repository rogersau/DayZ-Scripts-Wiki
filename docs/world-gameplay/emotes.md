# Emotes

The emote system allows players to express themselves through character animations and gestures beyond gameplay actions.

## Architecture

```
Emote System
├── Emote Manager (classes/emotemanager.c)
│   ├── Emote registration
│   ├── Emote execution
│   └── Cooldown management
│
├── Emote Classes (classes/emoteclasses/)
│   └── Individual emote definitions
│
├── Emote Constructor (classes/emoteconstructor.c)
│   └── Emote creation helpers
│
└── Gestures Menu (5_mission/gui/gesturesmenu.c)
    └── UI emote selection
```

## Emote Manager

```c
class EmoteManager {
    // Emote manager methods...
};
```

> **Note:** Methods like `PlayEmote`, `PlayEmoteByName`, `StopEmote`, `IsPlayingEmote`, `GetCurrentEmote`, `GetEmoteProgress`, `GetAvailableEmotes` are **not verified** in the actual source. The `EmoteManager` class may have a different API — consult the source in `classes/emotemanager.c` for the authoritative interface.

## Emote Classes

Emotes are defined as classes with animation and audio data:

```c
class EmoteBase {
    // Verified API
    int GetID();                          // Emote identifier
    string GetInputActionName();          // Input action binding name
    int GetStanceMaskAdditive();          // Stance mask for additive blending
    
    // ... other members ...
};
```

> **Note:** Fields like `m_DisplayName`, `m_AnimationName`, `m_Duration`, `m_Cooldown`, `m_OverrideMovement` are **not verified** in the actual source. Only `GetID()`, `GetInputActionName()`, and `GetStanceMaskAdditive()` are confirmed.

### Available Emotes

| Emote | Type | Description |
|-------|------|-------------|
| Wave | Gesture | Hand wave |
| Dance | Gesture | Character dances |
| Point | Gesture | Point in a direction |
| Salute | Gesture | Military salute |
| Surrender | Gesture | Hands up |
| Thumbs Up | Gesture | Positive gesture |
| Middle Finger | Gesture | Negative gesture |
| Clap | Gesture | Clapping hands |
| Shrug | Gesture | Shrug shoulders |
| Meditate | Pose | Sitting meditation |

## Emote Execution

Emotes are constructed and registered at initialization time:

```c
class EmoteConstructor {
    // Constructs all emote definitions
    void ConstructEmotes();
    
    // Registers emotes with the emote manager
    void RegisterEmotes();
};
```

> **Note:** The `CreateEmote()` method with a switch on `EMOTE_WAVE`, `EMOTE_DANCE`, etc. is **not verified**. The real constructor uses `ConstructEmotes()` and `RegisterEmotes()` to build and register emote instances.

## Gestures Menu

The gesture menu (`5_mission/gui/gesturesmenu.c`) provides the UI for selecting emotes:

```c
class GesturesMenu {
    void OpenMenu();
    void CloseMenu();
    
    // Wheel/radial menu display
    void OnSelection(int emoteIndex);
};
```

## Integration with Other Systems

- **Animation system**: Emotes trigger specific animations
- **Sound system**: Some emotes have accompanying sounds
- **Network**: Emotes are synced to nearby players
- **GUI**: Gesture menu in the UI
- **Player state**: Some emotes override movement/weapon state
