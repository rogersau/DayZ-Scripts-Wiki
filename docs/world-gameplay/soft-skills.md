# Soft Skills System

The soft skills system tracks player proficiency in various activities. Skills improve through repeated use and provide gameplay benefits at higher levels.

> **Important:** Many details in older documentation describe fabricated APIs (`SoftSkillType` enum, `SoftSkill` class with `m_Experience`/`AddExperience`/`CalculateLevel`/`GetEffectiveness`, etc.). This version documents only the verified API.

## Architecture

```
Soft Skills Manager (classes/softskillsmanager.c)
├── Skill specialization tracking
├── Rough/precise weight accumulation
└── Specialty level retrieval
```

## Verified API: `SoftSkillsManager`

```c
class SoftSkillsManager {
    // Add experience via linear precise weight (exact amount)
    void AddLinearPrecise(string specialty_name, float weight);

    // Add experience via linear rough weight (randomized amount)
    void AddLinearRough(string specialty_name, float weight);

    // Register a new specialty type
    void AddSpecialty(string specialty_name);

    // Get current level for a specialty (returns float: specialty_level)
    float GetSpecialtyLevel(string specialty_name);
};
```

### How It Works

1. Specialties are registered via `AddSpecialty("specialty_name")`.
2. Experience is added via `AddLinearPrecise` (exact) or `AddLinearRough` (randomized within a range around the given weight).
3. Current level is retrieved via `GetSpecialtyLevel()`, which returns a `specialty_level` float value.
4. Higher `specialty_level` values provide gameplay benefits (e.g., reduced stamina costs, faster crafting).

## XP Gain Triggers

> **Note:** The following trigger methods are inferred from gameplay behavior and are **not verified** in the actual source. The real `SoftSkillsManager` does not have `OnMedicalAction`, `OnSprintAction`, `OnCraftItem`, `OnFireWeapon`, or `GetSkill` methods.

Instead, other game systems likely call `AddLinearPrecise` / `AddLinearRough` on the `SoftSkillsManager` when relevant actions occur (e.g., after a medical action completes, after sprinting a certain distance, etc.).

## Skill Benefits

> **Note:** Specific per-skill benefit tables (Medical Level 1-5 giving faster bandaging, Fitness giving % stamina reduction, etc.) are **not verified** in the actual source and should be treated as speculative gameplay descriptions. The actual benefit calculations are internal to `SoftSkillsManager` and the systems that query `GetSpecialtyLevel()`.

## Integration with Other Systems

- **Player system**: Skills affect player capabilities via `GetSpecialtyLevel()`
- **Crafting system**: Crafting speed/quality may be affected by specialty level
- **Medical system**: Treatment effectiveness may use specialty level
- **Stamina system**: Fitness specialty may reduce stamina costs
- **Inventory**: Strength specialty may increase carry capacity
- **Weapon system**: Shooting specialty may improve accuracy
