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
├── Stamina Modifier Data (classes/smdata*.c)
│   ├── SMDataBase — base modifier class
│   ├── SMDataExponential — exponential modifier
│   ├── SMDataHoldBreath — hold-breath modifier
│   └── Other SMData variants
│
└── Stamina Sound Handler (classes/staminasoundhandlerbase/client/server.c)
    └── Heavy breathing sounds at low stamina
```

## Stamina Handler

```c
class StaminaHandler {
    float m_Stamina;              // Current stamina
    float m_MaxStamina;           // Maximum stamina capacity
    float m_StaminaRegenRate;     // Regeneration per second
    
    // Core stamina access
    float GetStamina();                     // Current stamina value
    float GetStaminaNormalized();           // 0.0 — 1.0
    void SetStamina(float value);           // Set stamina to exact value
    
    // Checks
    bool HasEnoughStaminaFor(float amount); // Enough stamina for action
    
    // Modifiers
    float GetTotalWeight(EntityAI item);    // Weight with item context
};
```

> **Note:** Methods like `ConsumeStamina`, `RegenerateStamina`, `GetStaminaPercentage`, `IsExhausted`, `IsRecovering`, `GetCarryLoadModifier`, `IsSprinting()`, `IsJumping()`, `IsMeleeAttacking()` are **not verified** in the actual source. Use `GetStamina()`, `GetStaminaNormalized()`, `SetStamina()`, and `HasEnoughStaminaFor()` instead.

## Stamina Costs

Stamina costs for activities are not defined as simple named constants in the verified source. Instead, costs are likely calculated per-activity using the `SMData*` modifier classes which define cost curves and modifiers.

> **Note:** Named constants like `STAMINA_COST_SPRINT`, `STAMINA_COST_JUMP`, `STAMINA_COST_MELEE_HEAVY`, etc. are **not verified** in the actual source and should not be referenced.

## Factors Affecting Stamina

### Carry Weight

Carried weight significantly affects stamina. The `GetTotalWeight(EntityAI item)` method on `StaminaHandler` calculates weight with an item context:

```c
// GetTotalWeight takes an EntityAI parameter for context
float weight = staminaHandler.GetTotalWeight(player);
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

Stamina regenerates when the player is not performing stamina-consuming actions. The regeneration rate is affected by health, energy, and carry weight.

> **Note:** The exact regeneration formula and conditions (e.g., checking `IsSprinting()`, `IsJumping()`, `IsMeleeAttacking()`) are **not verified** in the actual source. Consult `staminahandler.c` for the authoritative implementation.

## Sound Feedback

At low stamina, the `StaminaSoundHandlerBase`/`StaminaSoundHandlerClient`/`StaminaSoundHandlerServer` classes play heavy breathing sounds, warning the player they need to rest.

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
