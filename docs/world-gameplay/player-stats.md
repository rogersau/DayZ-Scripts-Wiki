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

### Health

```c
const float PLAYER_HEALTH_CRITICAL = 1000;
const float PLAYER_HEALTH_LOW = 3000;
const float PLAYER_HEALTH_NORMAL = 5000;
const float PLAYER_HEALTH_HIGH = 7000;
const float PLAYER_MAX_HEALTH = 10000;
```

### Blood

```c
const float PLAYER_BLOOD_CRITICAL = 1000;
const float PLAYER_BLOOD_LOW = 3000;
const float PLAYER_BLOOD_NORMAL = 5000;
const float PLAYER_BLOOD_HIGH = 7000;
const float PLAYER_MAX_BLOOD = 10000;
```

### Energy

```c
const float PLAYER_ENERGY_CRITICAL = 0;
const float PLAYER_ENERGY_LOW = 1000;
const float PLAYER_ENERGY_NORMAL = 2000;
const float PLAYER_ENERGY_HIGH = 3000;
const float PLAYER_MAX_ENERGY = 4000;
```

### Water

```c
const float PLAYER_WATER_CRITICAL = 0;
const float PLAYER_WATER_LOW = 1000;
const float PLAYER_WATER_NORMAL = 2000;
const float PLAYER_WATER_HIGH = 3000;
const float PLAYER_MAX_WATER = 4000;
```

### Temperature

```c
const float PLAYER_TEMPERATURE_HOT = 42.0;
const float PLAYER_TEMPERATURE_HIGH = 38.0;
const float PLAYER_TEMPERATURE_NORMAL = 36.5;
const float PLAYER_TEMPERATURE_COLD = 35.0;
const float PLAYER_TEMPERATURE_FREEZING = 30.0;
```

## Metabolic Rates

Energy and water are consumed at different rates based on activity:

```c
// Energy loss per second
const float PLAYER_METABOLISM_IDLE_ENERGY = 0.018;
const float PLAYER_METABOLISM_WALK_ENERGY = 0.036;
const float PLAYER_METABOLISM_JOG_ENERGY = 0.072;
const float PLAYER_METABOLISM_SPRINT_ENERGY = 0.144;

// Water loss per second
const float PLAYER_METABOLISM_IDLE_WATER = 0.036;
const float PLAYER_METABOLISM_WALK_WATER = 0.054;
const float PLAYER_METABOLISM_JOG_WATER = 0.072;
const float PLAYER_METABOLISM_SPRINT_WATER = 0.108;
```

## Stomach System (`playerstomach.c`)

The stomach system manages digestion:

```c
class PlayerStomach {
    float m_StomachContent;       // Current stomach contents
    float m_DigestionRate;        // How fast food digests
    float m_EnergyAbsorption;     // Energy absorbed per unit
    float m_WaterAbsorption;      // Water absorbed per unit
    
    // Food properties (from config)
    float GetEnergyValue();
    float GetWaterValue();
    float GetNutritionalValue();
};
```

**Digestion process**:
1. Player eats/drinks → stomach content increases
2. Over time, food digests → energy and water are absorbed
3. Different foods have different absorption rates
4. Overeating causes vomiting

## Modifiers (`playermodifiers/`)

Modifiers are temporary effects that alter player stats:

```c
class PlayerModifier {
    float m_Duration;           // How long the modifier lasts
    float m_Strength;           // Effect strength
    bool m_IsPositive;          // Buff or debuff
    string m_Source;            // What caused this modifier
};
```

### Modifier Types

- **Restrained**: Handcuffed, tied up
- **Sickness**: Cold, flu, food poisoning, cholera
- **Injured**: Limping from leg damage
- **Medicated**: Effects of medicine
- **Energized**: Recent food consumption bonus
- **Hydrated**: Recent water consumption bonus

## Notifiers (`playernotifiers/`)

Notifiers provide UI feedback for stat changes:

```c
class PlayerNotifier {
    void OnHealthChange(float oldHealth, float newHealth);
    void OnBloodChange(float oldBlood, float newBlood);
    void OnEnergyChange(float oldEnergy, float newEnergy);
    void OnWaterChange(float oldWater, float newWater);
    void OnTemperatureChange(float oldTemp, float newTemp);
    void OnStomachChange(float oldContent, float newContent);
};
```

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
