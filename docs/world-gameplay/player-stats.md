# Player Stats

Player stats define the core survival mechanics in DayZ. They are managed in `4_world/classes/playerstats/` and configured via thresholds in `3_game/playerconstants.c`.

## Stat System

```
Player Stats
├── Health (playerstats/health.c)
│   └── Overall physical condition
├── Blood (playerstats/blood.c)
│   └── Blood volume and transfusion
├── Energy (playerstats/energy.c)
│   └── Caloric intake and expenditure
├── Water (playerstats/water.c)
│   └── Hydration
├── Temperature (playerstats/temperature.c)
│   └── Body temperature regulation
└── Health Regeneration (playerstats/healthregen.c)
    └── Natural healing
```

## Stat Thresholds (from `playerconstants.c`)

All thresholds are `static const float` members inside `class PlayerConstants`:

### Health

```c
static const float SL_HEALTH_CRITICAL = 15;
static const float SL_HEALTH_LOW = 30;
static const float SL_HEALTH_HIGH = 80;
```

### Blood

```c
static const float SL_BLOOD_CRITICAL = 3000;
static const float SL_BLOOD_LOW = 3500;
static const float SL_BLOOD_NORMAL = 4000;
static const float SL_BLOOD_HIGH = 4500;
```

### Energy

```c
static const float SL_ENERGY_LOW = 300;
static const float SL_ENERGY_NORMAL = 800;
static const float SL_ENERGY_HIGH = 3500;
static const float SL_ENERGY_MAX = 5000;
```

### Water

```c
static const float SL_WATER_LOW = 300;
static const float SL_WATER_NORMAL = 800;
static const float SL_WATER_HIGH = 3500;
static const float SL_WATER_MAX = 5000;
```

### Temperature

```c
static const float NORMAL_TEMPERATURE_L = 36.0;
static const float NORMAL_TEMPERATURE_H = 36.5;
static const float HIGH_TEMPERATURE_L = 38.5;
```

> **Note:** Only the above constants are verified in `PlayerConstants`. Other temperature thresholds (HIGH_TEMPERATURE_H, freezing, etc.) may exist but are not confirmed and should be treated as speculative.

## Stomach System (`playerstomach.c`)

The stomach system manages digestion. It stores consumed items as a list of `StomachItem` objects:

```c
class PlayerStomach {
    ref array<ref StomachItem> m_StomachContents;
    // ...digestion processing...
};
```

Each `StomachItem` tracks the individual food/drink item being digested, its remaining nutritional values, and its digestion progress.

**Digestion process**:
1. Player eats/drinks → a `StomachItem` is added to `m_StomachContents`
2. Over time, items digest → energy and water are absorbed
3. Different foods have different absorption rates
4. Overeating causes vomiting

## Modifiers (`playermodifiers/`)

Modifiers are temporary effects that alter player stats. The modifier system uses classes in the `playermodifiers/` directory.

> **Note:** The exact `PlayerModifier` class API (fields like `m_Duration`, `m_Strength`, `m_IsPositive`, `m_Source`) is not verified and should be treated as speculative. Refer to the actual source in `4_world/classes/playermodifiers/` for the authoritative API.

### Modifier Types

- **Restrained**: Handcuffed, tied up
- **Sickness**: Cold, flu, food poisoning, cholera
- **Injured**: Limping from leg damage
- **Medicated**: Effects of medicine
- **Energized**: Recent food consumption bonus
- **Hydrated**: Recent water consumption bonus

## Notifiers (`playernotifiers/`)

Notifiers provide UI feedback for stat changes. The notifier system uses classes in the `playernotifiers/` directory.

> **Note:** The `PlayerNotifier` class shown below is not verified in the actual source code and should be treated as speculative. Refer to the actual source in `4_world/classes/playernotifiers/` for the authoritative API.

## Symptoms (`playersymptoms/`)

Symptoms are the visible/mechanical effects of poor stats:

| Symptom | Cause | Effect |
|---------|-------|--------|
| Low health | Damage | Darkened screen, pain sounds |
| Low blood | Bleeding | Pale screen, weakness |
| Low energy | Starvation | Fatigue, shaking |
| Low water | Dehydration | Thirst sounds, weakness |
| Fever | Infection | Shivering, blurred vision |
| Cold | Hypothermia | Shivering, damage over time |
| Heat | Hyperthermia | Sweating, damage over time |
| Poisoning | Bad food/water | Vomiting, damage |
| Kuru | Cannibalism | Uncontrollable laughter |

## Integration with Other Systems

- **Temperature**: Interacts with weather system and clothing
- **Inventory**: Food/water items affect stats when consumed
- **Medical system**: Treatment items restore stats
- **UI**: Stat levels displayed in HUD
- **Soft skills**: Stats affect skill gain rates
- **Stamina**: Energy level affects stamina regeneration
