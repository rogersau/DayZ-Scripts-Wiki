# Rocks

The `DZ/rocks/` directory defines static rock and stone objects placed in the game world. From `P:/DZ/rocks/config.cpp` (~134 lines).

## Rock Categories

All rocks are defined in `CfgNonAIVehicles` inheriting from `StaticObject`:

| Category | Objects | Purpose |
|----------|---------|---------|
| `Static_stone` | `stone1` — `stone5` | Small loose stones (harvestable) |
| `Static_rock_apart` | `apart1`, `apart2` | Broken/cracked rock formations |
| `Static_rock_monolith` | `monolith1` — `monolith4` | Large standalone rocks (4 sizes) |
| `Static_rock_spike` | `spike1` — `spike3` | Sharp, pointed rock formations |
| `Static_rock_wallh` | `wallh1` — `wallh6` | Horizontal rock walls/cliffs |
| `Static_rock_wallv` | `wallv` | Vertical rock walls |
| `Static_rock_bright_monolith` | `monolith1` — `monolith4` | Bright-colored monoliths |
| `Static_rock_bright_spike` | `spike1` — `spike3` | Bright-colored spikes |
| `Static_rock_bright_wallh` | `wallh1` — `wallh3` | Bright horizontal walls |
| `Static_rock_bright_wallv` | `wallv` | Bright vertical wall |
| `Static_rock_bright_apart` | `apart1`, `apart2` | Bright broken rocks |
| Trail variants | `stone5_Trail_B/G/R/Y` | Colored marker stones |
| `Static_stones_erosion` | Erosion stones | Weather-damaged stones |

## Stone Count

Total: **32 static rock/stone objects**.

## Snow-Covered Variants

Additional snow-covered rock variants exist in `DZ/rocks/snow_rocks/` for Sakhal and winter regions.

## Related Documentation

- [Surfaces](./surfaces) — Ground surface types that include rock surfaces
- [Crafting & Cooking](/world-gameplay/crafting-cooking) — Stone harvesting for tools
- [Structures](./structures) — Building and structure definitions
