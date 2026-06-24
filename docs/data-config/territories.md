# Creature Territories

Each world defines animal and infected spawn territories in XML files under `ce/env/`. From `P:/DZ/worlds/*/ce/env/`.

## Territory File Format

All territory files share a common XML schema:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<territory-type>
    <territory color="4294923520">           <!-- RGBA color for debug rendering -->
        <zone name="Graze"                    <!-- Zone type (behavior context) -->
              smin="0" smax="0"               <!-- Min/max simultaneous spawns -->
              dmin="6" dmax="8"               <!-- Min/max density (creatures per zone) -->
              x="7971.43" z="14642.8"         <!-- Center position (world coords) -->
              r="110"/>                        <!-- Zone radius (meters) -->
    </territory>
</territory-type>
```

### Zone Properties

| Attribute | Type | Purpose | Animal Example | Infected Example |
|-----------|------|---------|---------------|-----------------|
| `name` | string | Zone behavior type | `Graze`, `Rest` | `InfectedArmy`, `InfectedArmyHard` |
| `smin`/`smax` | int | Simultaneous spawn count range | `0`/`0` (unlimited) | `0`–`10` |
| `dmin`/`dmax` | int | Density range (creatures per zone) | `0`/`0` (fixed) | `4`–`14` |
| `x`/`z` | float | Zone center (world coordinates) | World position | World position |
| `r` | float | Zone radius in meters | `50`–`300` | `50`–`160` |

### Zone Name Types

| Animal Zones | Infected Zones |
|-------------|----------------|
| `Graze` — Feeding area | `InfectedArmy` — Standard military infected |
| `Rest` — Resting/sleeping | `InfectedArmyHard` — Elite/hard infected |
| `Drink` — Water access | `Zmb_Clinic` — Medical building infected |
| `Travel` — Movement corridor | `Zmb_School` — School infected |

## Territory Files Per World

### ChernarusPlus — 13 territory files

| File | Zones | Creature Type |
|------|-------|---------------|
| `bear_territories.xml` | ~80 zones | Bear spawn and wandering |
| `cattle_territories.xml` | ~60 zones | Cow herds |
| `domestic_animals_territories.xml` | ~30 zones | Mixed farm animals |
| `fox_territories.xml` | ~40 zones | Fox dens and hunting grounds |
| `hare_territories.xml` | ~50 zones | Hare habitat |
| `hen_territories.xml` | ~30 zones | Chicken coops and ranges |
| `pig_territories.xml` | ~20 zones | Pig enclosures |
| `red_deer_territories.xml` | ~40 zones | Red deer habitat |
| `roe_deer_territories.xml` | ~50 zones | Roe deer habitat |
| `sheep_goat_territories.xml` | ~30 zones | Sheep and goat pastures |
| `wild_boar_territories.xml` | ~30 zones | Wild boar habitat |
| `wolf_territories.xml` | ~40 zones | Wolf pack territories |
| `zombie_territories.xml` | ~200+ zones | Infected spawn points |

### Enoch (Livonia) — 13 files

Same set as ChernarusPlus plus an additional `wildboar_territories.xml` variant. Slightly different zone counts reflecting the smaller map size (12,800 m vs 15,360 m).

### Sakhal — 8 files

Arctic ecosystem with reduced biodiversity:

| File | Creature Type | Compared to ChernarusPlus |
|------|---------------|--------------------------|
| `bear_territories.xml` | Bear | ✅ |
| `fox_territories.xml` | Fox | ✅ |
| `hare_territories.xml` | Hare | ✅ |
| `hen_territories.xml` | Chicken | ✅ |
| `reindeer_territories.xml` | Reindeer | 🆕 Arctic exclusive |
| `sheep_goat_territories.xml` | Sheep/goat | ✅ (reduced count) |
| `wolf_territories.xml` | Wolf | ✅ |
| `zombie_territories.xml` | Infected | ✅ |

**Missing from Sakhal**: Cattle, pig, red deer, roe deer, wild boar, domestic animals — arctic climate doesn't support them.

## Territory Distribution Example

Bear territories on ChernarusPlus cluster in forested regions:

| Territory | Zone Count | Locations |
|-----------|-----------|-----------|
| Northwest forest | ~15 zones | Black Forest, northwest mountains |
| Central woods | ~10 zones | Around Stary Sobor, Vybor |
| Northeast forest | ~12 zones | North of Krasnostav |
| Southwest woodland | ~8 zones | South of Zelenogorsk |
| Eastern forest | ~6 zones | East of Gorka |

Zones within each territory use `Graze` behavior with radii of 100–300m.

## Infected Zone Example

Infected territories use density ranges to control zombie populations at key locations:

```xml
<zone name="InfectedArmyHard" smin="6" smax="8" dmin="8" dmax="12"
      x="1684.51" z="14254.8" r="160"/>
```

- `InfectedArmyHard` zones have higher density (`dmin=8, dmax=12`) and allow simultaneous spawns (`smin=6, smax=8`)
- Military bases, airfields, and major cities use `InfectedArmyHard`
- Smaller towns use `InfectedArmy` with lower density ranges
- `smin`/`smax` of `0` means no limit on simultaneous spawns

## How Territories Work

1. CE loads territory XMLs on server start
2. Each zone defines a circular area where creatures can spawn
3. Density (`dmin`/`dmax`) controls how many creatures exist per zone
4. Simultaneous (`smin`/`smax`) limits how many can be alive at once (0 = unlimited)
5. Creatures spawned within zone radius `r` of center `(x, z)`
6. Zone `name` drives behavior selection (Graze=feeding, Rest=sleeping, etc.)
7. Game world data itself must match the terrain type for spawning (bears need forest, not open field)

## Related Documentation

- [Worlds](./worlds) — Per-world configuration, territory file differences
- [AI Config](./ai-config) — AI behaviour trees that run inside these territories
- [Central Economy](/game-systems/central-economy) — CE territory XML loading
