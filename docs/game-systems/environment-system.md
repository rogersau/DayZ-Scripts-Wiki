# Environment System

The Environment system simulates the **per-player heat-comfort and wetness** that drive DayZ's survival loop. It is a single class — `Environment` (`environment.c`, ~2039 lines) — owned by each `PlayerBase`, that takes inputs from the weather system, world data, equipped clothing, nearby heat sources (fires, car heaters), and the player's activity, and produces two outputs that the rest of the game reacts to: the **HeatComfort** stat (a normalized -1..+1 comfort index) and the **Wet** flag.

Crucially, `Environment` is the **sole writer** of `StatHeatComfort` and the wetness flag on `StatWet`. The [Player Modifiers](./modifiers-symptoms-system) (`HeatComfortMdfr`, `WetMdfr`, `HeatBufferMdfr`) *consume* those values to drain water/energy/health and toggle notifiers — they do not compute them.

**Primary location**: `P:/scripts/4_world/classes/environment/environment.c`

> **See also**: [Player Modifiers & Symptoms](./modifiers-symptoms-system), [Weather & Environment](./weather-environment) (world/weather layer), [Player Stats](/world-gameplay/player-stats), [Player System](./player-system).

---

## Mental Model

```
Weather (rain/wind/fog/overcast)     World data (base temp, wind chill, altitude)
        │                                          │
        ▼                                          ▼
   ┌─────────────────────────────────────────────────────┐
   │  Environment.Update(pDelta)   owned by PlayerBase    │
   │                                                       │
   │  CollectAndSetEnvironmentData ◄── weather reads       │
   │  SetEnvironmentTemperature   ◄── worlddata + wind chill + sources
   │  GatherTemperatureSources    ◄── fire proximity       │
   │  ProcessItemsTemperature     ◄── warm/cool items       │
   │  ProcessHeatComfort ─────────► GetStatHeatComfort.Set  │  ◄── SOLE WRITER
   │  ProcessItemsWetness/Dryness ─► GetStatWet              │  ◄── SOLE WRITER
   └─────────────────────────────────────────────────────┘
        │ writes stats
        ▼
   HeatComfortMdfr reads GetStatHeatComfort() → drains water (hot) / energy (cold) / health (extreme)
   WetMdfr reads GetStatWet() → toggles NTF_WETNESS notifier
   HeatComfortAnimHandler reads GetStatHeatComfort() → queues shiver/sweat symptoms
```

`Environment` is **config-driven** through `WorldData` (per-world subclass) and `GameConstants` tuning values, not `cfggameplay.json`.

---

## HeatComfort vs Temperature

| Field | Meaning |
|-------|---------|
| `m_EnvironmentTemperature` | Air temperature in °C around the player |
| `m_HeatComfort` | Buffered normalized comfort index (-1..+1) written to `GetStatHeatComfort()`. **This is what drives symptoms and stat drain.** |
| `m_TargetHeatComfort` | Non-buffered target (before smoothing) |

The doc comment on the class (`:22-25`) says "temperature and wetness" but the player-facing value is HeatComfort. The legacy `m_PlayerTemperature` field exists but is not actively computed.

---

## The `Environment` Class

`class Environment` (`environment.c:26`). Constructor (`:106`) stores the player; `Init()` (`:111`) pulls `m_WorldData = g_Game.GetMission().GetWorldData()` (`:118`), seeds the environment temperature, and builds arrays of inventory slot IDs split by body zone:
- `m_SlotIdsComplete` (whole body), `m_SlotIdsUpper`, `m_SlotIdsBottom`, `m_SlotIdsLower` (`:134-146`)
- Heat-comfort body parts: `m_HeadParts`, `m_BodyParts`, `m_FeetParts` (`:174-195`)
- Moving-average buffers: `m_UTSAverageTemperatureBuffer` (size 10), `m_AverageHeatComfortBuffer` (size 20) (`:129-130`)

### What it owns (member fields, `:38-104`)

| Group | Fields |
|-------|--------|
| Player state | `m_Player`, `m_PlayerHeightPos`, `m_PlayerSpeed`, `m_PlayerHeat`, `m_HeatComfort` (buffered), `m_TargetHeatComfort` |
| Environment state | `m_Rain`, `m_Snowfall`, `m_Wind`, `m_Fog`, `m_DayOrNight`, `m_Clouds`, `m_EnvironmentTemperature`, `m_SurfaceType`, `m_LiquidType` |
| Situation flags | `m_WaterLevel`, `m_IsUnderRoof`, `m_IsUnderRoofBuilding`, `m_IsInWater`, `m_IsTempSet` |
| Temperature sources | `m_HasTemperatureSources`, `m_UTSAverageTemperature`, `m_UTemperatureSources`, `m_UTSAverageTemperatureBuffer` |
| Heat buffer | `m_HeatBufferTimer`, `m_HeatBufferCapPrevious`, `m_ItemsWetnessMax` |

### The Update loop — `Update(float pDelta)` (`:208`)

Gated by `GameConstants.ENVIRO_TICK_RATE`. Structure:

```
every ENVIRO_TICK_ROOF_RC_CHECK seconds: roof raycast (:212-220)
once m_Time >= ENVIRO_TICK_RATE:
  increment m_WetDryTick (:229-277)
  CheckWaterContact() → CollectAndSetPlayerData() → CollectAndSetEnvironmentData()
  GatherTemperatureSources() → ProcessTemperatureSources()
  ProcessItemsTemperature()  (head/body/feet/hands)
  DetermineHeatcomfortBehavior() → SetHeatcomfortDirectly() (car engine) OR ProcessHeatComfort()
  every ENVIRO_TICKS_TO_WETNESS_CALCULATION:
     wetness OR dryness processing → sync GetStatWet()
```

---

## Air Temperature Computation

### `GetEnvironmentTemperature()` (`:517`)

```c
temperature = m_WorldData.GetTemperature(m_Player, ALTITUDE | OVERCAST)   // :519
```

Then branched by situation:
- **In water** (`:521`): `waterBodyTemperature - m_WorldData.m_WaterContactTemperatureModifier` (liquid temp minus 20°C base, `worlddata.c:81`)
- **Inside building / under roof-building** (`:529`): `+= m_TemperatureInsideBuildingsModifier` (default 1.0)
- **In vehicle** (`:533`): `+= Abs(temperature * ENVIRO_TEMPERATURE_INSIDE_VEHICLE_COEF)`
- **Under roof (non-building)** (`:538`): adds reduced `WindEffectTemperatureValue * GetWindModifierPerSurface * ENVIRO_TEMPERATURE_UNDERROOF_COEF`
- **Outside** (`:543`): adds full wind+overcast+fog components via `GetTemperatureComponentValue * GetWindModifierPerSurface`
- **Temperature sources** (`:550`): if buffered UTS average > current temp, use the source temperature instead

### Wind chill — `WindEffectTemperatureValue()` (`worlddata.c:344`)

```c
temperatureOutput = (temperatureInput - ENVIRO_WIND_CHILL_LIMIT)
                  / (ENVIRO_WIND_EFFECT_SLOPE - ENVIRO_WIND_CHILL_LIMIT);
temperatureOutput = temperatureOutput * GetWindMagnitude().GetActual() * GetWindCoef();
return -temperatureOutput;   // always a cooling effect
```

`GetWindModifierPerSurface()` (`environment.c:489`) reads `CfgSurfaces <surface> windModifier` from config (returns 0 inside buildings).

### The base temperature — `CalcBaseEnvironmentTemperature(monthday, daytime)` (`worlddata.c:122`)

Computed from in-game date/time (month+day fraction, hour+minute fraction), refreshed every 30s in `UpdateBaseEnvTemperature()` (`worlddata.c:164`), called from `missiongameplay.c:697`. Default `m_EnvironmentTemperature = 12.0` (`worlddata.c:65`). Altitude correction in `GetBaseEnvTemperatureAtPosition()` (`worlddata.c:216`): `terrainHeight * m_TemperaturePerHeightReductionModifier` (0.02 °C/m, `:78`).

---

## The HeatComfort Formula — `ProcessHeatComfort()` (`:970`)

The master player-comfort index. Assembly:

### 1. Per-body-part clothing heat isolation

Calls `BodyPartHeatProperties(slot, weight, hcBodyPart, hBodyPart)` for 9 slots (HEADGEAR, MASK, VEST, BODY, BACK, GLOVES, LEGS, FEET, HIPS; `:984-1001`). Each returns `pHeatComfort = MiscGameplayFunctions.GetCurrentItemHeatIsolation(item) * pCoef` (`:1429`). These accumulate into `hcBodyPartTotal` (clothing comfort) and `hBodyPartTotal` (heat from held/cargo items like hot drinks).

### 2. Naked-body penalties — `NakedBodyPartHeatComfortPenalty()` (`:1448`)

Adds `ENVIRO_ISOLATION_WETFACTOR_DRENCHED * weight` when exposed to rain/snow outside.

### 3. Stomach content temperature (`:1015-1043`)

If stomach non-empty, remaps `stomachContentTemperature` outside the neutral zone (±`ITEM_TEMPERATURE_NEUTRAL_ZONE` limits) into a `-ENVIRO_STOMACH_WEIGHT..+ENVIRO_STOMACH_WEIGHT` contribution.

### 4. The master combination (`:1046`)

```c
float targetHeatComfort = (heatComfortSum + heatItems + (GetPlayerHeat() / 100))
                        + EnvTempToCoef(m_EnvironmentTemperature);
```

Where:
- `EnvTempToCoef(pTemp)` (`:1341`): `(pTemp - ENVIRO_PLAYER_COMFORT_TEMP) / ENVIRO_TEMP_EFFECT_ON_PLAYER`
- `GetPlayerHeat()` (`:295`): `m_PlayerSpeed * ENVIRO_DEFAULT_ENTITY_HEAT` (movement-generated heat)

### 5. Heat buffer — `ProcessHeatBuffer()` (`:1102`)

Adjusts `StatHeatBuffer` based on clothing-derived capacity, with per-stage rate limits (`HeatBufferMdfr.STAGE_THRESHOLDS`), and a water multiplier when in water.

### 6. Clamping + smoothing (`:1053-1078`)

Clamps to stat min/max, rounds, then if the step from current `m_HeatComfort` exceeds `ENVIRO_HEATCOMFORT_MAX_STEP_SIZE`, it's rate-limited and run through the 20-sample moving-average buffer. Final value written to stat: `m_Player.GetStatHeatComfort().Set(m_HeatComfort)` (`:1078`).

---

## Clothing Insulation

`MiscGameplayFunctions.GetCurrentItemHeatIsolation(ItemBase pItem)` (`miscgameplayfunctions.c:1218`):

1. `heatIsolation = pItem.GetHeatIsolation()` — read from config (`heatIsolation`), ItemBase init at `itembase.c:3621`
2. **Wet factor** selection by item wetness band (`:1228-1247`): DRY/DAMP/WET/SOAKED each pick a different `ENVIRO_ISOLATION_WETFACTOR_*` constant; DRENCHED short-circuits and returns `ENVIRO_ISOLATION_WETFACTOR_DRENCHED`
3. **Health factor** selection by damage state (`:1250+`): PRISTINE/WORN/DAMAGED pick `ENVIRO_ISOLATION_HEALTHFACTOR_*`
4. Returns `heatIsolation * wetFactor * healthFactor` (degraded insulation when wet/damaged)

Called per-slot in `Environment.BodyPartHeatProperties()`. Each clothing piece's isolation is multiplied by its body-part weight (`ENVIRO_HEATCOMFORT_*_WEIGHT`) and summed into `hcBodyPartTotal`. BACK and VEST get additional multipliers (`ENVIRO_HEATISOLATION_BACK_WEIGHT = 0.3`, `ENVIRO_HEATISOLATION_VEST_WEIGHT = 0.5`, `:1817-1820`).

---

## Temperature Sources (Fire Proximity) — `GatherTemperatureSources()` (`:1469`)

Box-lookup of entities within `ENVIRO_TEMP_SOURCES_LOOKUP_RADIUS`, filtering `IsUniversalTemperatureSource()` entities whose lambda `AffectsPlayer()` and are within `GetMaxRange()`. The held item is also checked (`:1497`).

`ProcessTemperatureSources()` (`:1504`) computes per-source temp via `CalcTemperatureFromTemperatureSource()` (`:1569`): interpolates between `GetFullRange()` (full effect) and `GetMaxRange()` (zero effect) using `GetTemperatureCap()`. Averages into the 10-sample buffer. Also feeds `m_ItemTemperatureCoef` (used for cooking/heating items).

---

## Wetness / Rain Cycle

### Wetness delta — `GetWetDelta()` (`:563`)

Three branches:
- **In water** (`:566`): fixed by water level — HIGH→1.0, MID→0.66, LOW→0.66, NONE→0.33
- **Raining/snowing outside, no roof, not in car** (`:586-593`):
  - Rain: `ENVIRO_WET_INCREMENT * ENVIRO_TICKS_TO_WETNESS_CALCULATION * m_Rain * (1 + ENVIRO_WIND_EFFECT * m_Wind)`
  - Snow (if combined value > `SNOWFALL_WIND_COMBINED_THRESHOLD`): similar with `ENVIRO_SNOW_WET_COEF`
- **Drying** (`:596`): `wetDelta = -(ENVIRO_DRY_INCREMENT * weatherEffect * tempEffect)` where `weatherEffect` reduces drying in fog/clouds, `tempEffect = Max(playerHeat + envTemp, 1.0)`, multiplied by wind if outside

### Applying wetness to items

The Update loop (`:249-276`), every `ENVIRO_TICKS_TO_WETNESS_CALCULATION` ticks, picks:
- `ProcessWetnessByWaterLevel(m_WaterLevel)` (`:676`) → soaks different slot sets by depth (HIGH=all, MID=upper, LOW=bottom, NONE=lower)
- OR `ProcessItemsWetness(m_SlotIdsComplete)` if raining outside (`:257`)
- OR `ProcessItemsDryness()` (`:261`)

`ProcessItemsWetness()` (`:694`) iterates player attachments and calls `ApplyWetnessToItem()` (`:732`), which recurses through cargo and nested attachments. Soaking coefficient depends on whether the parent is wet or contains liquid (`:763-790`). `pItem.AddWet(soakingCoef)` accumulates.

`ProcessItemsDryness()` (`:822`) → `ApplyDrynessToItemEx()` (`:872`): drying increment from `pItem.GetDryingIncrement("player")` or `"playerHeatSource"` near a fire, divided by distance to the heat source. Negative `AddWet` dries the item.

### Player wetness stat sync (`:265-272`)

`m_ItemsWetnessMax` (wettest worn item) gates the binary `GetStatWet()`: if max item wetness < `STATE_WET` and stat==1, set 0; if >= `STATE_WET` and stat==0, set 1. **The player's "wet" boolean notifier is derived from item wetness, not a continuous value.**

---

## Rain Procurement (collecting rainwater)

A **separate** system from player wetness — fills containers (barrels, pots) with rainwater.

| Component | File | Role |
|-----------|------|------|
| `RainProcurementComponentBase` | `rainprocurementcomponent.c:1` | Per-item component; `StartRainProcurement`/`StopRainProcurement` queue to handler (server-only). `OnUpdate(deltaTime, amount)` (`:39`) does a roof check every 3 updates, then `ProcureLiquid(amount)` (`:55`) → `Liquid.FillContainerEnviro(item, LIQUID_CLEANWATER, amount * GetBaseLiquidAmount())` only if not under roof |
| `RainProcurementHandler` | `rainprocurementhandler.c:1` | Mission-owned; `UPDATE_TIME = 10`s, `UPDATE_BATCH_SIZE = 20`. Processes components in batches. `DetermineAmountCoef()` (`:161`) returns `rain + snowfall` actual (can exceed 1.0). Skips entirely if coef==0 |
| `RainProcurementManager` | `rainprocurementmanager.c:1` | **DEPRECATED** (`:1`) — old timer-based approach, replaced by the handler/component pair |

---

## Adjacent Components

### `HeatComfortAnimHandler` (`heatcomfortanimhandler.c`)

Drives **shivering/sweating symptoms** based on heat comfort.

- `TICK_INTERVAL = 2`s (`:3`); `Update(delta, hms)` (`:26`) accumulates and calls `Process()` every 2s
- `Process(delta_time)` (`:47`), server-only, reads `hc = m_Player.GetStatHeatComfort().Get()`:
  - `hc <= THRESHOLD_HEAT_COMFORT_MINUS_CRITICAL` (deep blue, `:53`): fires `SYMPTOM_FREEZE_RATTLE` (teeth chattering)
  - `hc <= THRESHOLD_HEAT_COMFORT_MINUS_WARNING` (light blue, `:68`): fires `SYMPTOM_FREEZE` (shivering)
  - `hc >= THRESHOLD_HEAT_COMFORT_PLUS_WARNING` (yellow, `:84`): fires `SYMPTOM_HOT` (sweating)
- `GetEventTime()` (`:37`) randomizes the interval, lerped by severity. Symptoms queued via `m_Player.GetSymptomManager().QueueUpPrimarySymptom(...)`. Created in `PlayerBase` at `:364`.

### `PlayerLightManager` (`playerlightmanager.c`)

Marked `//WIP` (`:6`). Not a runtime light-toggle system — it's a **target-selection helper** for light-handling actions (e.g. helmet lights). Maintains `m_ValidLightItems` of `ActionTargetLighSource` (a subclass of `ActionTarget` with a `m_Remove` flag, `:1`). `AddLightSource`/`RemoveLightSource`/`GetLightSourceList`/`SelectLightSourceTarget`. Actual flashlight state lives on the items themselves.

### `ObjectTemperatureState` (`objecttemperaturestatedata.c`)

`EObjectTemperatureState` enum (`:1`): `HOT_LVL_FOUR` → `NEUTRAL` → `COLD_LVL_FOUR` (9 states). `GetStateData(int temperature)` (`:20`) buckets a numeric temperature into a state with a color + localized name (`"#inv_inspect_hot_lvl_four"`). This is the **display/inspect layer** for item temperature — used to show "Hot"/"Scalding"/"Cold" labels. The actual item temperatures are computed by `Environment.ProcessItemsTemperature()` (`environment.c:1312`) → `item.SetTemperatureEx()` targeting `ITEM_TEMPERATURE_NEUTRAL_ZONE_MIDDLE`.

---

## The Tick Loop Integration

The full call chain:

```
MissionServer.TickScheduler(timeslice)          missionserver.c:707
  (SCHEDULER_PLAYERS_PER_TICK = 5, :711)
  └─ currentPlayer.OnTick()                      missionserver.c:723
       └─ PlayerBase.OnTick()                     playerbase.c:2798
            (computes deltaT from GetGame().GetTime())
            └─ OnScheduledTick(deltaT)            playerbase.c:2687, :2806
                 ├─ ModifiersManager.OnScheduledTick  (:2692)
                 ├─ NotifiersManager.OnScheduledTick  (:2694)
                 └─ m_Environment.Update(deltaTime)   (:2702)   ◄── here
```

`Environment` is constructed in `PlayerBase` at `:374` (`m_Environment = new Environment(this)`). The internal tick rate is `GameConstants.ENVIRO_TICK_RATE` (the Update loop accumulates `m_Time` and only runs the heavy work once per interval). Roof checks run on a separate `ENVIRO_TICK_ROOF_RC_CHECK` cadence.

---

## Integration with Modifiers & Stats

**Environment is the source of truth. The modifiers read the stat; they do not compute it.**

`Environment.ProcessHeatComfort()` writes: `m_Player.GetStatHeatComfort().Set(m_HeatComfort)` — **`environment.c:1078`**.

| Modifier | ID | Behavior |
|----------|----|----------|
| `HeatComfortMdfr` | `MDF_TEMPERATURE` (`emodifiers.c:3`) — note the misleading name | Always-on. `OnTick()` (`heatcomfortmdfr.c:38`) **reads** `GetStatHeatComfort().Get()`. HC too high → drains `GetStatWater()` (sweating→thirst); extreme → drains health (`:44-56`). HC too low → drains `GetStatEnergy()` (shivering burns calories); extreme → drains health (`:58-71`). **The bridge from comfort → water/energy/health.** |
| `WetMdfr` | `MDF_WETNESS` | Condition modifier that activates `NTF_WETNESS` when `GetStatWet()` reaches max and deactivates at min. Does not change wetness — Environment sets the stat |
| `HeatBufferMdfr` | `MDF_HEATBUFFER` | Tracks `GetStatHeatBuffer()` normalized into 4 stages via `STAGE_THRESHOLDS = {0.0, 0.60, 0.85, 1.0}` (`:4`). Toggles `HeatBufferVisibility` UI and grants 300s influenza resistance on deactivate (`:47-48`). The buffer *value* is managed inside `Environment.ProcessHeatBuffer()` (`environment.c:1102`) |

Stat accessors (playerbase.c): `GetStatHeatComfort()` (`:7623`) fetches `EPlayerStats_current.HEATCOMFORT`. Net-sync vars: `m_HeatBufferStage`, `m_HeatBufferDynamicMax`, `m_HasHeatBuffer` (`:525-526`).

---

## Config / Data Driven

| Source | Contents |
|--------|----------|
| `WorldData` (per-world subclass) | Base temperature & climate modifiers (`worlddata.c:78-81`): `m_TemperaturePerHeightReductionModifier = 0.02`, `m_CloudsTemperatureEffectModifier = 3.0`, `m_TemperatureInsideBuildingsModifier = 1.0`, `m_WaterContactTemperatureModifier = 20.0`. Per-world overrides: `chernarusplus.c:91`, `enoch.c:138`, `sakhal.c:135` override `WeatherOnBeforeChange()` |
| Liquid temperatures | `SetupLiquidTemperatures()` (`worlddata.c:374`): saltwater 23°C, fresh/river/still 15°C, clean 10°C, snow -5°C |
| Surface wind modifiers | `CfgSurfaces <type> windModifier` config (`environment.c:494`) |
| Item config | Clothing `heatIsolation`, `EnvironmentWetnessIncrements` (Drying/Soaking, `itembase.c:3629-3643`), `heatPermeabilityCoef` |
| Tuning constants | All in `GameConstants` (`constants.c`): `ENVIRO_TICK_RATE`, `ENVIRO_WET_INCREMENT`, `ENVIRO_DRY_INCREMENT`, `ENVIRO_WIND_EFFECT`, `ENVIRO_PLAYER_COMFORT_TEMP`, `ENVIRO_TEMP_EFFECT_ON_PLAYER`, `STATE_*` thresholds |
| `cfggameplay.json` | **No direct `weather`/`environment` block.** Weather/environment data path is the per-world `WorldData` subclass, not the global gameplay JSON. Weather settings (storm/fog limits) configured at engine/world layer (`m_WeatherDefaultSettings`, `worlddata.c:371`) |

The per-frame weather drive: `dayzgame.c:2912` calls `worldData.UpdateWeatherEffects(GetWeather(), timeslice)` (client/SP only).

---

## End-to-End Data Flow

```
missionserver.TickScheduler (5 players/frame)
  └─ PlayerBase.OnTick (computes deltaT)
       └─ PlayerBase.OnScheduledTick
            ├─ ModifiersManager.OnScheduledTick  (HeatComfortMdfr reads stat → drains water/energy/health)
            └─ Environment.Update(pDelta)        ─── environment.c:208
                 ├─ every ENVIRO_TICK_RATE:
                 │    ├─ CollectAndSetEnvironmentData → weather.GetRain/Snowfall/Wind/Fog/Overcast
                 │    ├─ SetEnvironmentTemperature → GetEnvironmentTemperature (worlddata + wind chill + sources)
                 │    ├─ GatherTemperatureSources / ProcessTemperatureSources (fire proximity)
                 │    ├─ ProcessItemsTemperature (cook/warm/cool items toward neutral)
                 │    ├─ ProcessHeatComfort → writes GetStatHeatComfort  ─── environment.c:1078
                 │    │    (formula: clothing isolation + item heat + player heat + stomach + EnvTempToCoef, smoothed)
                 │    └─ every ENVIRO_TICKS_TO_WETNESS_CALCULATION: wetness/dryness → GetStatWet
                 └─ HeatComfortAnimHandler.Update (separate, 2s) → shiver/sweat symptoms
```

---

## Directory Structure

```
classes/
├── environment/
│   └── environment.c            Environment class (sole file, ~2039 lines)
├── playerlightmanager.c         PlayerLightManager (WIP — light-source action target helper)
├── rainprocurementcomponent.c   RainProcurementComponentBase (+ Barrel subclass)
├── rainprocurementhandler.c     RainProcurementHandler (mission-owned, batched)
├── rainprocurementmanager.c     DEPRECATED — old timer-based approach
├── objecttemperaturestatedata.c EObjectTemperatureState enum + ObjectTemperatureState class
└── heatcomfortanimhandler.c     HeatComfortAnimHandler (shiver/sweat symptom trigger)
```

---

## Related Documentation

- [Player Modifiers & Symptoms](./modifiers-symptoms-system) — `HeatComfortMdfr`/`WetMdfr`/`HeatBufferMdfr` consume the stats Environment writes
- [Weather & Environment](./weather-environment) — the world/weather layer (`WorldData`, `weather.c`) that feeds Environment
- [Player Stats](/world-gameplay/player-stats) — stat thresholds & values
- [Player System](./player-system) — `PlayerBase` lifecycle that owns the Environment
- [Effect System](./effect-system) — post-processing effects triggered by heat/cold symptoms
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
