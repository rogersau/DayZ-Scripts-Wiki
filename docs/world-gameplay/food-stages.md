# Food Stage System

The food system uses a **stage transition model** where each food item progresses through cooking states. From `P:/DZ/gear/food/config.cpp` (~14,600 lines).

## Stage Transition Classes

```
BaseFoodStageTransitions    — Raw → Baked/Boiled/Dried/Burned/Rotten
├── MeatStageTransitions    — All meat items
├── FruitStageTransitions   — Fruits and vegetables
├── MushroomsStageTransitions — Mushrooms
├── AnimalCorpsesStageTransitions — Whole animal corpses
└── NotCookable             — Canned goods, snacks, grains (only rot)
```

## Stage IDs

| ID | Stage | Description |
|----|-------|-------------|
| 1 | Raw | Uncooked, fresh state |
| 2 | Baked | Cooked by dry heat (fireplace, oven) |
| 3 | Boiled | Cooked in water (pot, cauldron) |
| 4 | Dried | Preserved by dehydration |
| 5 | Burned | Overcooked, reduced nutrition |
| 6 | Rotten | Spoiled, potentially harmful |

## Transition Definition

Each stage defines valid transitions with cooking methods:

```cpp
class BaseFoodStageTransitions
{
    class Raw
    {
        class ToBaked  { transition_to = 2; cooking_method = 1; };
        class ToBoiled { transition_to = 3; cooking_method = 2; };
        class ToDried  { transition_to = 4; cooking_method = 3; };
        class ToBurned { transition_to = 5; cooking_method = 3; };
        class ToRotten { transition_to = 6; cooking_method = 4; };
    };
    class Baked
    {
        class ToBurned { transition_to = 5; cooking_method = 3; };
        class ToRotten { transition_to = 6; cooking_method = 4; };
    };
    class Boiled { /* same pattern */ };
    class Dried  { /* same pattern */ };
    class Burned { /* only rots */ };
    class Rotten { class ToBurned { transition_to = 5; cooking_method = 1; }; };
};
```

### Cooking Methods

| Method ID | Meaning | Requires |
|-----------|---------|----------|
| 1 | Baking/Dry heat | Fireplace, oven, campfire |
| 2 | Boiling | Pot, cauldron with water |
| 3 | Drying/Burning | Extended heat exposure |
| 4 | Rotting | Time + temperature |

## Food Type Transition Tables

### MeatStageTransitions
Meats follow the full transition matrix: Raw → Baked/Boiled/Dried/Burned/Rotten. Cooking removes disease risk and improves nutrition.

### FruitStageTransitions
Fruits and vegetables: Raw → Baked/Dried/Rotten. No boiling (they'd turn to mush).

### MushroomsStageTransitions
Mushrooms: Raw → Baked/Dried/Rotten. Some mushrooms are toxic raw and safe when cooked.

### AnimalCorpsesStageTransitions
Whole animal corpses (dead chicken, rabbit, fox): Raw → Rotten only. Must be prepared (butchered) before cooking.

### NotCookable
Canned goods, snacks, grains, and dry goods: Raw → Rotten only. No cooking possible.

## Visual Stage Tracking

```cpp
class FoodAnimationSources
{
    // Drives visual appearance of food items
    // CS_Raw, CS_Rotten, CS_Baked, CS_Boiled, CS_Dried, CS_Burned
};
```

Each food item has hidden selections that change texture based on cooking stage, showing visual doneness.

## Nutrition Modifiers

Nutrition values change per stage through `NutritionModifiers`:

```cpp
class NutritionModifiers
{
    class General
    {
        base_stage = "Raw";
        class Raw    { energy = 100; water = 0; nutrition = 10; };
        class Baked  { energy = 120; water = 0; nutrition = 12; };
        class Boiled { energy = 80;  water = 20; nutrition = 8; };
        class Dried  { energy = 150; water = 0; nutrition = 5; };
        class Burned { energy = 40;  water = 0; nutrition = 2; };
        class Rotten { energy = 10;  water = 0; nutrition = -10; };
    };
};
```

## Related Documentation

- [Crafting & Cooking](./crafting-cooking) — Cooking mechanics and recipes
- [Gear & Items](/data-config/gear-items) — Food item definitions
- [Player Stats](./player-stats) — Hunger and nutrition system
