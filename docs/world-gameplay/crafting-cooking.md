# Crafting & Cooking

The crafting and cooking systems allow players to transform raw materials into useful items and prepare food for consumption.

## Architecture

```
Crafting System
├── Crafting Manager (classes/craftingmanager.c)
│   ├── Recipe management
│   ├── Crafting process
│   └── Result generation
│
├── Recipes (classes/recipes/)
│   └── Individual recipe definitions
│
├── Cooking (classes/cooking/)
│   ├── Cooking process
│   ├── Heat sources
│   └── Food quality
│
└── Config Data (DZ/gear/crafting/, DZ/gear/cooking/)
    └── Item interaction definitions
```

## Crafting Manager

```c
class CraftingManager {
    // Check if a recipe is valid
    bool CanCraft(array<EntityAI> ingredients);
    
    // Execute crafting
    EntityAI Craft(array<EntityAI> ingredients);
    
    // Get available recipes
    array<CraftingRecipe> GetAvailableRecipes(EntityAI player);
    
    // Get recipe by ID
    CraftingRecipe FindRecipe(string recipeName);
};
```

## Recipe Definitions

Recipes define what ingredients produce what result:

```c
class CraftingRecipe {
    string m_DisplayName;
    string m_Description;
    
    // Ingredients required
    array<Ingredient> m_Ingredients;
    // Ingredient: { string itemClass, int quantity, bool consumed }
    
    // Result produced
    array<Result> m_Results;
    // Result: { string itemClass, int quantity, float quality }
    
    // Requirements
    float m_RequiredSkill;       // Minimum crafting skill
    bool m_RequiresWorkbench;    // Needs a workbench
    float m_CraftTime;           // Time to craft in seconds
    
    // Tools needed (if not consumed)
    array<string> m_RequiredTools;
};
```

### Recipe Example

```c
// Improvised fishing rod recipe
class ImprovisedFishingRodRecipe : CraftingRecipe {
    void ImprovisedFishingRodRecipe() {
        m_DisplayName = "Improvised Fishing Rod";
        m_Ingredients = {
            { "LongWoodenStick", 1, true },
            { "Rope", 1, true }
        };
        m_Results = {
            { "ImprovisedFishingRod", 1, 1.0 }
        };
        m_CraftTime = 5.0;
        m_RequiresWorkbench = false;
    }
};
```

## Cooking System

The cooking system (`classes/cooking/`) manages food preparation:

```c
class CookingManager {
    // Check if food can be cooked
    bool CanCook(EntityAI food, EntityAI heatSource);
    
    // Start cooking
    void StartCooking(EntityAI food, EntityAI heatSource);
    
    // Get cooking progress
    float GetCookingProgress(EntityAI food);
    
    // Get cook state
    CookState GetCookState(EntityAI food);
};

enum CookState {
    RAW,                // Uncooked
    BAKED,              // Baked (optimal)
    BOILED,             // Boiled (optimal)
    BURNT,              // Overcooked (reduced nutrition)
    ROTTEN              // Spoiled (inedible)
};
```

### Heat Sources

Food can be cooked over:
- **Campfire**: Wood-fired cooking (baking, boiling)
- **Gas stove**: Portable cooking
- **Indoor stove/oven**: Found in buildings
- **Barrel fire**: Makeshift fire barrel

### Cooking Quality

```c
class CookedFood {
    float m_NutritionalValue;     // Energy retained
    float m_WaterContent;         // Water retained
    float m_TasteQuality;         // Taste bonus
    bool m_IsSafe;                // Safe from disease
};
```

Food quality depends on:
- **Cooking time**: Perfect timing yields optimal nutrition
- **Cooking method**: Different methods suit different foods
- **Cookware**: Pot, pan, or direct heat
- **Soft skill**: Cooking skill improves results
- **Heat level**: Right temperature matters

## Categories of Craftable Items

| Category | Examples |
|----------|----------|
| **Tools** | Stone knife, improvised fishing rod, hand drill kit |
| **Weapons** | Improvised bow, sharpened stick |
| **Clothing** | Improvised bag, burlap sack mask, leather clothes |
| **Medical** | Improvised splint, charcoal tablets |
| **Shelter** | Shelter kit, fence kit, watchtower kit |
| **Fire** | Hand drill kit, fireplace, fire barrel |

## Integration with Other Systems

- **Inventory system**: Ingredients taken from and results placed in inventory
- **Player system**: Crafting is a player action
- **Soft skills**: Crafting/cooking skill affects quality and speed
- **Player stats**: Cooked food restores more energy/water
- **Effects system**: Cooking fire particles and sounds
- **Base building**: Crafted items used in construction
