# Soft Skills System

The soft skills system tracks player proficiency in various activities. Skills improve through repeated use and provide gameplay benefits at higher levels.

## Architecture

```
Soft Skills Manager (classes/softskillsmanager.c)
├── Skill definitions
├── Experience tracking
├── Skill level calculation
└── Perk/benefit application
```

## Skill Categories

```c
enum SoftSkillType {
    MEDICAL,        // Bandaging, splinting, transfusions
    FITNESS,        // Running, climbing, melee
    STRENGTH,       // Carrying capacity, heavy attacks
    CRAFTING,       // Item crafting quality/speed
    COOKING,        // Food preparation quality
    SURVIVAL,       // Fire starting, water collection
    SHOOTING,       // Weapon accuracy, recoil control
    STEALTH,        // Movement noise reduction
};
```

## Experience System

Skills gain experience through use:

```c
class SoftSkill {
    float m_Experience;       // Current XP
    float m_Level;            // Current level (0.0 — 5.0)
    float m_MaxLevel;         // Maximum level
    
    // XP gain per action (varies by action quality/complexity)
    void AddExperience(float amount);
    
    // Level calculation
    float CalculateLevel() {
        // XP thresholds for each level
        return Math.Floor(m_Experience / 100.0);
    }
    
    // Get benefit multiplier
    float GetEffectiveness() {
        return 1.0 + (m_Level * 0.1); // 10% benefit per level
    }
};
```

## Skill Benefits

### Medical (Level 1-5)

| Level | Benefit |
|-------|---------|
| 1 | Faster bandaging |
| 2 | Better wound treatment |
| 3 | Faster transfusion |
| 4 | Better diagnostic |
| 5 | Maximum medical efficiency |

### Fitness

| Level | Benefit |
|-------|---------|
| 1 | 5% less stamina use |
| 2 | 10% less stamina use |
| 3 | 15% less stamina use |
| 4 | 20% less stamina use |
| 5 | 25% less stamina use |

### Strength

| Level | Benefit |
|-------|---------|
| 1 | +5% carry capacity |
| 2 | +10% carry capacity |
| 3 | +15% carry capacity |
| 4 | +20% carry capacity |
| 5 | +25% carry capacity |

### Crafting

| Level | Benefit |
|-------|---------|
| 1 | Craft items faster |
| 2 | Reduced material waste |
| 3 | Access to better recipes |
| 4 | Higher quality results |
| 5 | Maximum crafting efficiency |

### Cooking

| Level | Benefit |
|-------|---------|
| 1 | Less food burned |
| 2 | Better nutritional retention |
| 3 | Faster cooking |
| 4 | Access to advanced recipes |
| 5 | Maximum food quality |

### Shooting

| Level | Benefit |
|-------|---------|
| 1 | Reduced sway |
| 2 | Better recoil control |
| 3 | Faster aiming |
| 4 | Reduced weapon spread |
| 5 | Maximum accuracy |

## XP Gain Triggers

```c
class SoftSkillsManager {
    void OnMedicalAction(MedicalActionType action) {
        SoftSkill medical = GetSkill(MEDICAL);
        medical.AddExperience(action.GetXPValue());
    }
    
    void OnSprintAction(float distance) {
        SoftSkill fitness = GetSkill(FITNESS);
        fitness.AddExperience(distance * 0.01);
    }
    
    void OnCraftItem(CraftingRecipe recipe) {
        SoftSkill crafting = GetSkill(CRAFTING);
        crafting.AddExperience(recipe.GetComplexity() * 10);
    }
    
    void OnFireWeapon(Weapon weapon) {
        SoftSkill shooting = GetSkill(SHOOTING);
        shooting.AddExperience(weapon.GetRecoil() * 0.5);
    }
};
```

## Integration with Other Systems

- **Player system**: Skills affect player capabilities
- **Crafting system**: Crafting speed/quality affected by skill
- **Medical system**: Treatment effectiveness
- **Stamina system**: Fitness skill reduces stamina costs
- **Inventory**: Strength skill increases carry capacity
- **Weapon system**: Shooting skill improves accuracy
