# Contaminated Areas

Contaminated areas are zones in the world where hazardous conditions (typically gas) pose a danger to players and require protective equipment to survive.

## Architecture

```
Contaminated Area System
├── Contaminated Area Class (classes/contaminatedarea/)
│   ├── Zone definition
│   ├── Contamination effects
│   └── Zone lifecycle
│
├── Transmission Agents (classes/transmissionagents/)
│   └── How contamination spreads/affects players
│
└── Player Symptoms (classes/playersymptoms/)
    └── Negative effects on unprotected players
```

## Contaminated Area Definition

```c
class ContaminatedArea {
    // Area boundaries
    vector m_Center;               // Center of the zone
    float m_Radius;                // Radius of contamination
    float m_InnerRadius;           // Safe inner radius (if any)
    
    // Contamination properties
    string m_ContaminationType;    // "Gas", "Radiation", etc.
    float m_ContaminationLevel;    // 0.0 — 1.0 intensity
    
    // Visual effects
    string m_ParticleEffect;       // Visible gas particles
    string m_SoundEffect;          // Ambient zone sound
    string m_ScreenEffect;         // Screen overlay effect
    
    // Lifecycle
    float m_ActiveTime;            // How long the zone persists
    float m_ExpandTime;            // Time to reach full size
    float m_ContractTime;          // Time to shrink/disappear
};
```

## Gas Contamination

The primary contaminated area type in DayZ (found at certain dynamic events):

### Effect on Players

```c
class ContaminatedZoneEffect {
    // Effects per second based on exposure level
    float m_HealthDamage;           // HP loss per second
    float m_ShockDamage;            // Shock increase per second
    float m_DamageToClothing;       // Clothing degradation
    
    // Protection
    bool m_RequiresFullProtection;  // Full NBC gear needed
    float m_ProtectionThreshold;    // Minimum protection level
};
```

### Protection Requirements

To survive in contaminated areas, players need:

- **NBC mask**: Filters contaminated air
- **NBC hood**: Head protection
- **NBC suit**: Body protection
- **NBC gloves**: Hand protection
- **NBC boots**: Foot protection

Each piece provides a protection level; all pieces are needed for full protection.

## Visual Indicators

```c
class ContaminatedAreaVisuals {
    // Visual effects
    Effect m_GasParticles;          // Floating gas particles
    Effect m_GroundFog;             // Ground-level gas
    LightSource m_AreaLighting;     // Zone lighting
    
    // Screen effects when inside
    string m_ScreenOverlay;         // Green tint when unprotected
    float m_ScreenBlur;             // Blur level
    float m_HearingMuffle;          // Muffled sound
};
```

## Zone Lifecycle

```
Zone spawns (dynamic event)
    ↓
Expansion phase (gas spreads outward)
    ↓
Peak contamination (zone at maximum size)
    ↓
Contraction phase (gas dissipates)
    ↓
Zone disappears
```

Total duration: configurable, typically several minutes.

## Warning Systems

Players receive warnings when approaching contaminated areas:

1. **Visual**: Gas particles visible from distance
2. **Audio**: Hissing/ambient sound of the zone
3. **HUD**: Warning indicator when near zone boundary
4. **Screen effects**: Tinting, blur when inside unprotected
5. **Character**: Coughing animation when exposed

## Integration with Other Systems

- **Player stats**: Health damage over time from exposure
- **Effect system**: Gas particles, screen overlays
- **Sound system**: Zone ambient sounds, muffled audio
- **Symptoms**: Coughing, choking, damage
- **Inventory**: NBC gear check for protection
- **World events**: Dynamic contaminated zone spawns
