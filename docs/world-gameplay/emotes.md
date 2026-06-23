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
    // Play an emote
    void PlayEmote(int emoteId);
    void PlayEmoteByName(string emoteName);
    
    // Stop current emote
    void StopEmote();
    
    // Query
    bool IsPlayingEmote();
    int GetCurrentEmote();
    float GetEmoteProgress();
    
    // Available emotes
    array<int> GetAvailableEmotes();
};
```

## Emote Classes

Emotes are defined as classes with animation and audio data:

```c
class EmoteBase {
    string m_DisplayName;        // "Wave", "Dance", etc.
    string m_AnimationName;      // Animation to play
    string m_SoundName;          // Optional accompanying sound
    float m_Duration;            // Emote duration in seconds
    bool m_IsLooping;            // Loops until cancelled
    float m_Cooldown;            // Seconds before can use again
    
    // Animation settings
    bool m_OverrideMovement;    // Blocks movement during emote
    bool m_OverrideWeapon;      // Lowers weapon during emote
    bool m_SyncInMultiplayer;   // Visible to other players
    
    void OnStart();
    void OnEnd();
};
```

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

```c
class EmoteConstructor {
    static EmoteBase CreateEmote(int type) {
        switch (type) {
            case EMOTE_WAVE:
                return new EmoteWave();
            case EMOTE_DANCE:
                return new EmoteDance();
            case EMOTE_POINT:
                return new EmotePoint();
            // ...
        }
    }
};
```

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
