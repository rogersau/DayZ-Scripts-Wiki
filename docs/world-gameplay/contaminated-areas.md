# Contaminated Areas

Contaminated areas are zones in the world where hazardous conditions (typically gas) pose a danger to players and require protective equipment to survive.

## Architecture

```
Contaminated Area System
├── ContaminatedArea_Base (base class)
│   └── Shared zone properties and logic
│
├── ContaminatedArea_Static (static zones)
│   └── Fixed-location contamination zones
│
├── ContaminatedArea_Dynamic (dynamic zones)
│   └── Event-spawned contamination zones
│
├── Transmission Agents (classes/transmissionagents/)
│   └── How contamination spreads/affects players
│
└── Player Symptoms (classes/playersymptoms/)
    └── Negative effects on unprotected players
```

## Contaminated Area Definition

Contaminated areas use a class hierarchy:

```c
// Base class for all contaminated areas
class ContaminatedArea_Base {
    // Shared zone properties...
};

// Static (fixed-location) contaminated areas
class ContaminatedArea_Static : ContaminatedArea_Base {
    // ... fixed zone configuration ...
};

// Dynamic (event-spawned) contaminated areas
class ContaminatedArea_Dynamic : ContaminatedArea_Base {
    // ... dynamic zone lifecycle ...
};
```

> **Note:** The `ContaminatedArea` class (without suffix) with fields like `m_Center`, `m_Radius`, `m_ContaminationType`, `m_ContaminationLevel`, `m_ParticleEffect`, `m_SoundEffect`, `m_ScreenEffect`, `m_ActiveTime`, `m_ExpandTime`, `m_ContractTime` is **not verified**. The real classes are `ContaminatedArea_Base`, `ContaminatedArea_Static`, and `ContaminatedArea_Dynamic`.

## Gas Contamination

The primary contaminated area type in DayZ (found at certain dynamic events):

### Effect on Players

> **Note:** The `ContaminatedZoneEffect` class with `m_HealthDamage`, `m_ShockDamage`, `m_DamageToClothing`, `m_RequiresFullProtection`, `m_ProtectionThreshold` is **not verified** in the actual source. Player effects from contamination are likely handled by the transmission agent and symptom systems rather than a standalone effect class.

### Protection Requirements

To survive in contaminated areas, players need:

- **NBC mask**: Filters contaminated air
- **NBC hood**: Head protection
- **NBC suit**: Body protection
- **NBC gloves**: Hand protection
- **NBC boots**: Foot protection

Each piece provides a protection level; all pieces are needed for full protection.

## Visual Indicators

> **Note:** The `ContaminatedAreaVisuals` class with `m_GasParticles`, `m_GroundFog`, `m_AreaLighting`, `m_ScreenOverlay`, `m_ScreenBlur`, `m_HearingMuffle` is **not verified** in the actual source. Visual indicators are more likely integrated directly into the contaminated area classes and the effect system.

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
