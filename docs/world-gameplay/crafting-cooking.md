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
    // Recipe selection
    void SetRecipeID(int id);
    int GetRecipeID();
    
    // Craft type queries
    bool IsInventoryCraft();     // Crafting from inventory screen
    bool IsWorldCraft();         // Crafting in-world (e.g., fireplace)
    
    // Recipe count
    int GetRecipesCount();
};
```

> **Note:** Methods like `CanCraft`, `Craft`, `GetAvailableRecipes`, `FindRecipe` are **not verified** in the actual source. Use the real API above.

## Recipe Definitions

The real recipe base class is `RecipeBase`, not `CraftingRecipe`:

```c
class RecipeBase {
    // Check if recipe can be executed
    bool CanDo(/* ... */);
    
    // Execute the recipe
    void Do(/* ... */);
    
    // Initialize recipe data
    void Init();
    
    // ... ingredient/result data from config ...
};
```

Recipes are typically defined in config data (`DZ/gear/crafting/`) and instantiated from those definitions rather than coded as individual classes.

> **Note:** The `CraftingRecipe` class with `m_DisplayName`, `m_Ingredients`, `m_Results`, `m_CraftTime`, `m_RequiredTools` fields is **not verified**. The real base class is `RecipeBase`.

## Cooking System

The cooking system is handled by the `Cooking` class in `classes/cooking/cooking.c`:

```c
class Cooking {
    // ... cooking logic ...
};
```

> **Note:** The `CookingManager` class, `CookState` enum (`RAW`, `BAKED`, `BOILED`, `BURNT`, `ROTTEN`), and `CookedFood` class with `m_NutritionalValue`, `m_WaterContent`, `m_TasteQuality`, `m_IsSafe` are **not verified** in the actual source. The real cooking class is simply `Cooking` in `classes/cooking/cooking.c`.
```

### Heat Sources

Food can be cooked over:
- **Campfire**: Wood-fired cooking (baking, boiling)
- **Gas stove**: Portable cooking
- **Indoor stove/oven**: Found in buildings
- **Barrel fire**: Makeshift fire barrel

### Cooking Quality

Food quality depends on:
- **Cooking time**: Perfect timing yields optimal nutrition
- **Cooking method**: Different methods suit different foods
- **Cookware**: Pot, pan, or direct heat
- **Soft skill**: Cooking skill improves results
- **Heat level**: Right temperature matters

> **Note:** The `CookedFood` class with `m_NutritionalValue`, `m_WaterContent`, `m_TasteQuality`, `m_IsSafe` fields is **not verified** in the source.

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
