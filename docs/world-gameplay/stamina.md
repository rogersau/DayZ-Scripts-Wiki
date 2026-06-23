# Stamina System

The stamina system manages player fatigue during physical activities like sprinting, jumping, and melee combat.

## Architecture

```
Stamina System
├── Stamina Handler (classes/staminahandler.c)
│   ├── Stamina pool management
│   ├── Consumption calculation
│   └── Regeneration
│
├── Stamina Modifier Data (classes/staminamodifierdata.c)
│   └── Per-activity stamina costs
│
└── Stamina Sound Handler (classes/staminasoundhandler.c)
    └── Heavy breathing sounds at low stamina
```

## Stamina Handler

```c
class StaminaHandler {
    float m_Stamina;              // Current stamina
    float m_MaxStamina;           // Maximum stamina capacity
    float m_StaminaRegenRate;     // Regeneration per second
    
    // Modify stamina
    void ConsumeStamina(float amount);
    void RegenerateStamina(float delta);
    
    // State queries
    float GetStaminaPercentage(); // 0.0 — 1.0
    bool IsExhausted();           // Stamina at/near zero
    bool IsRecovering();          // Stamina regenerating
    
    // Modifiers
    float GetCarryLoadModifier(); // Based on carried weight
};
```

## Stamina Costs

Different activities consume stamina at different rates:

```c
// Base stamina costs (modified by carry weight, soft skills, etc.)
const float STAMINA_COST_SPRINT = 15.0;     // Per second
const float STAMINA_COST_JUMP = 10.0;       // Per jump
const float STAMINA_COST_MELEE_HEAVY = 8.0; // Per heavy attack
const float STAMINA_COST_MELEE_LIGHT = 3.0; // Per light attack
const float STAMINA_COST_CLIMB = 12.0;      // Per climb action
```

## Factors Affecting Stamina

### Carry Weight

Carried weight significantly affects stamina:

```c
class StaminaHandler {
    float GetWeightModifier() {
        float totalWeight = GetPlayer().GetInventory().GetTotalWeight();
        // Above a threshold, stamina costs increase
        if (totalWeight > 20) { // 20kg threshold
            return 1.0 + (totalWeight - 20) * 0.05;
        }
        return 1.0;
    }
};
```

### Soft Skills

Higher skills reduce stamina consumption:
- **Fitness**: Reduces sprint/melee stamina costs
- **Strength**: Reduces carry weight penalty

### Health and Energy

- **Low health**: Slower stamina regeneration
- **Low energy**: Increased stamina consumption
- **Low blood**: Dizziness at low stamina

## Stamina Regeneration

Stamina regenerates when the player is not performing stamina-consuming actions:

```c
class StaminaHandler {
    void UpdateRegeneration(float delta) {
        if (!IsSprinting() && !IsJumping() && !IsMeleeAttacking()) {
            // Regen rate depends on:
            // - Base regen rate
            // - Health percentage
            // - Energy level
            // - Carry weight
            float regen = m_StaminaRegenRate * delta;
            if (GetPlayer().GetHealth() < 0.5) {
                regen *= 0.5; // Half regen at low health
            }
            m_Stamina = Math.Min(m_Stamina + regen, m_MaxStamina);
        }
    }
};
```

## Sound Feedback

At low stamina, the `StaminaSoundHandler` plays heavy breathing sounds, warning the player they need to rest.

## UI Display

Stamina is displayed as part of the HUD:
- **Stamina bar**: Shows current stamina percentage
- **Breathing indicator**: Visual cue when exhausted
- **Blur effect**: Screen blur at critical stamina levels

## Integration with Other Systems

- **Player system**: Movement speed affected by stamina
- **Soft skills**: Fitness skill reduces stamina costs
- **Player stats**: Energy level affects stamina regen
- **Carry weight**: Inventory weight affects stamina
- **Sound system**: Heavy breathing audio feedback
- **UI**: Stamina bar in HUD
