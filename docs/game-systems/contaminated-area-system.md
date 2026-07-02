# Contaminated Area System

DayZ's Contaminated Area system defines hazardous world zones — toxic gas clouds, hot springs, volcanic vents, geysers, and ambient "spooky" areas. Each zone is a networked `House`-derived entity that owns a cylindrical trigger; the trigger fires enter/leave/stay events that either **deal direct damage** (heat/geyser) or **inject agents into the player's agent pool** (gas) which then escalate through a staged modifier chain to coughing, vomiting, unconsciousness, and death.

The gas mechanic is the deepest: it's a three-way bridge between the **trigger system** (area detection), the **agent/disease system** (`eAgents.CHEMICAL_POISON`), and the **modifier system** (`MDF_AREAEXPOSURE` → `MDF_CONTAMINATION1/2/3`).

**Primary locations**:
- `P:/scripts/4_world/classes/contaminatedarea/` — area entities (`EffectArea`, `ContaminatedArea_*`, `HotSpringArea`, `VolcanicArea`, `GeyserArea`, `SpookyArea`)
- `P:/scripts/4_world/entities/scriptedentities/triggers/` — `EffectTrigger`, `ContaminatedTrigger`, `VolcanicTrigger`, `HotSpringTrigger`, `GeyserTrigger`, `SpookyTrigger`, `TriggerEffectManager`
- `P:/scripts/4_world/classes/playermodifiers/modifiers/` — `areaexposure.c`, `contamination.c`/`2`/`3`, `mask.c`
- `P:/scripts/3_game/enums/eagents.c`, `econtaminationtypes.c`

> **See also**: [Player Modifiers & Symptoms](./modifiers-symptoms-system) (agent/disease system), [Damage System](./damage-system) (`ProcessDirectDamage`), [Environment System](./environment-system), [Contaminated Areas](/world-gameplay/contaminated-areas) (gameplay overview).

---

## Mental Model

```
EffectArea (House entity, JSON-placed or CE-spawned)
  │ owns
  ▼
EffectTrigger (cylinder volume)
  │  EOnEnter / EOnLeave / EOnFrame
  ▼
TriggerEffectManager (deduplicates overlapping triggers)
  │
  ▼
Two damage paradigms, by trigger type:
  │
  ├─ GAS (ContaminatedTrigger): no direct damage → IncreaseContaminatedAreaCount
  │     → ActivateModifier(MDF_AREAEXPOSURE)
  │       → inject eAgents.CHEMICAL_POISON (5/sec)
  │         → agent count crosses thresholds
  │           → MDF_CONTAMINATION1/2/3 activate
  │             → cough, vomit, shock→unconscious, health drain
  │
  └─ HEAT (Volcanic/HotSpring/Geyser Triggers): direct ProcessDirectDamage("HeatDamage")
        → health damage (scaled by water depth / eruption state)
```

---

## Class Hierarchy

Base class: `EffectArea : House` (`effectarea.c:48`). All areas inherit `House` (a networked map object) so they persist as world entities.

```
EffectArea (effectarea.c:48)
├── ContaminatedArea_Base (contaminatedarea.c:1)
│   ├── ContaminatedArea_Static (contaminatedarea.c:33)      — JSON-placed, permanent
│   └── ContaminatedArea_DynamicBase (contaminatedarea_dynamicbase.c:10)
│       ├── ContaminatedArea_Dynamic (contaminatedarea_dynamic.c:22)  — artillery shell, 5-stage decay
│       └── ContaminatedArea_Local (contaminatedarea_local.c:1)       — gas-grenade cloud, short-lived
├── HotSpringArea (hotspringarea.c:2)
├── VolcanicArea (volcanicarea.c:2)
├── GeyserArea (geyserarea.c:9)                              — state machine, erupts
└── SpookyArea (spookyarea.c:2) → SpookyArea23 (spookyarea.c:43)
```

Two enums (`effectarea.c`):
- `eZoneType { STATIC=1, DYNAMIC=2 }` (`:4`)
- `EEffectAreaType { UNDEFINED=1, HOT_SPRING=2, VOLCANIC=4 }` (`:10`) — bitmask set on the player

### Area definition (member fields, `effectarea.c:50-90`)

| Field | Purpose |
|-------|---------|
| `m_Position` / `m_PositionTrigger` | World position (snapped to ground) / pivot-corrected cylinder center (`:201-203`) |
| `m_Radius` (default 100), `m_PositiveHeight` (25), `m_NegativeHeight` (10) | Cylinder volume |
| `m_InnerRings`, `m_InnerSpacing`, `m_OuterRingToggle`, `m_OuterSpacing`, `m_OuterRingOffset`, `m_VerticalLayers`, `m_VerticalOffset` | Particle ring params |
| `m_ParticleID`, `m_AroundParticleID`, `m_TinyParticleID` | Particle IDs |
| `m_PPERequesterType` / `m_PPERequesterIdx` | Post-process tint |
| `m_TriggerType` (default `"ContaminatedTrigger"`) / `m_Trigger` | Trigger classname + instance |
| `m_EffectsPriority` (`:82`) | Resolves which overlapping area wins the visual effect |

Setup: `SetupZoneData(EffectAreaParams)` (`:123`) copies params; `InitZone()` (`:196`) computes positions then `InitZoneServer()` (creates trigger) + `InitZoneClient()` (spawns particles).

---

## Trigger Lifecycle (enter/leave/stay)

**Class chain:** `TriggerEvents` → `Trigger` (`trigger.c:39`) → `CylinderTrigger` → `EffectTrigger` (`effecttrigger.c:4`) → specific triggers.

### Volume definition

`Trigger` sets `EntityFlags.TRIGGER` + event mask `INIT|FRAME|ENTER|LEAVE` (`trigger.c:55-56`). `CylinderTrigger` defaults to a 1m two-way cylinder. The area resizes it in `EffectArea.CreateTrigger()` (`effectarea.c:497`):

```c
m_Trigger.SetCollisionCylinderTwoWay(radius,
    -(m_NegativeHeight + centerHeightCorrection),
    (m_PositiveHeight - centerHeightCorrection));
```

### Event dispatch

`Trigger` overrides `EOnEnter`/`EOnLeave`/`EOnFrame` (`trigger.c:88-107`). Frame calls `UpdateInsiders()` (`:297`) which, per insider, calls `Stay(insider, deltaTime)` → `OnStayServerEvent`/`OnStayClientEvent`. Enter/Leave call `Enter()`/`Leave()`. The events API splits each into `OnEnter*Event` / `OnStay*Event` (Start/loop/Finish) / `OnLeave*Event` — each with Begin/Server/Client/End.

### `EffectTrigger` base (`effecttrigger.c`)

- Registers with singleton `TriggerEffectManager` in ctor (`:27-28`)
- `CanAddObjectAsInsider` (`:90`): server accepts players + non-resistant creatures; client accepts only the controlled player
- `ShouldRemoveInsider` (`:191`): removes dead entities
- `OnEnterServerEvent` (`:117`) → `m_Manager.OnPlayerEnter(player, this)`
- `OnLeaveServerEvent` (`:155`) → `m_Manager.OnPlayerExit`
- `OnEnterClientEvent` (`:136`) / `OnStayClientEvent` (`:109`) → `m_Manager.OnPlayerEnter` / `player.RequestTriggerEffect(...)` (visuals only for controlled player)
- `Init(EffectArea area, int priority)` (`:49`) links back to owning area

### `TriggerEffectManager` (`triggereffectmanager.c`)

Deduplicates overlapping triggers. On the **first** entry for a trigger type it calls `trigger.GetEffectArea().OnPlayerEnterServer(player, trigger)` (`:60-61`); overlapping triggers tracked via a per-type `PlayerBase → count` map (`:49-64`).

---

## Effect/Trigger Types & Damage

All four concrete effect triggers extend `EffectTrigger` and share the cylinder detection. Differences are in **what they do on enter/tick**:

### ContaminatedTrigger (gas) — `contaminatedtrigger.c`

The "poison" area. **Does NOT deal direct damage to players** — instead sets the player up for agent-based contamination. It only deals direct health damage to **AI creatures** on a 10s tick:

```c
const float DAMAGE_TICK_RATE = 10;                              // contaminatedtrigger.c:4
override void OnStayServerEvent(TriggerInsider insider, float deltaTime) {  // :74
    if (m_DealDamageFlag) {
        DayZCreatureAI creature = ...;
        if (creature && creature.m_EffectTriggerCount != 0)
            creature.DecreaseHealth("", "",
                GameConstants.AI_CONTAMINATION_DMG_PER_SEC * m_TimeAccuStay / creature.m_EffectTriggerCount);
    }
}
```

On enter/leave it increments/decrements `creature.m_EffectTriggerCount` (overlapping-trigger normalization). Ambient sound: `"ContaminatedArea_SoundSet"` (`:86`).

Three sub-classes: `ContaminatedTrigger` (static), `ContaminatedTrigger_Dynamic` (`:92`, syncs `m_AreaState` for decay-stage particle scaling), `ContaminatedTrigger_Local` (`:176`, no ambient sound).

### VolcanicTrigger — `volcanictrigger.c`

Sets `EEffectAreaType.VOLCANIC` flag on the player (enter `:35-45`, unset on leave). On the **player's own server tick** (`PlayerBase.OnUpdateEffectAreaServer`, `playerbase.c:742`), every `HEAT_DAMAGE_TICK_TIME` (2s):

```c
static void ApplyEffects(PlayerBase player) {                  // volcanictrigger.c:98
    player.ProcessDirectDamage(DamageType.CUSTOM, m_SourceDamageInstance,
        "", "HeatDamage", "0 0 0", HEAT_DAMAGE_MULTIPLIER);    // :100, multiplier=5
}
```

Spawns `ParticleList.VOLCANO` vapor on client (`:88`).

### HotSpringTrigger — `hotspringtrigger.c`

Sets `EEffectAreaType.HOT_SPRING` flag. Same 2s tick via `OnUpdateEffectAreaServer` (`playerbase.c:746-760`), but **damage scales with water depth** — only applies if `waterLevel > 0.5`:

```c
static void ApplyEffects(PlayerBase player) {                  // hotspringtrigger.c:97
    float waterLevel = player.GetCurrentWaterLevel();
    if (waterLevel > 0.5)
        player.ProcessDirectDamage(DamageType.CUSTOM, m_SourceDamageInstance,
            "", "HeatDamage", "0 0 0", HEAT_DAMAGE_MULTIPLIER * waterLevel);  // :101
}
```

Particle: `ParticleList.HOTPSRING_WATERVAPOR`.

### GeyserTrigger — `geysertrigger.c`

A **state-machine** trigger (no player flag). `EGeyserState { DORMANT, ERUPTION_SOON, ERUPTING_PRIMARY, ERUPTING_SECONDARY }`. The `GeyserArea` (`geyserarea.c:54 TickState`) drives state on a 1s timer; on entering `ERUPTING_PRIMARY` it calls `KillEntitiesInArea()` (`geyserarea.c:141`) which damages **everything** in radius with a huge multiplier:

```c
entity.ProcessDirectDamage(DamageType.CUSTOM, this, "", "HeatDamage", "0 0 0", 1000);  // geyserarea.c:150
```

The trigger also applies `HeatDamage`×1000 on `OnEnterServerEvent` if already erupting (`geysertrigger.c:69`).

### SpookyTrigger — `spookytrigger.c`

No damage — purely ambient. `SpookyTrigger23` (`:6`) attaches a `SpookyPlayerStalker` entity (emits a cold `-20°` temperature source) and runs surface-aware random sound events via `SpookyTriggerEventsHandler` (`spookyareamisc.c:197`): Wind, Whisper, Steps, Rustle.

### Damage summary

All heat damage uses `ProcessDirectDamage(..., "HeatDamage", ...)` with `DamageType.CUSTOM`:

| Trigger | Multiplier | Cadence | Target |
|---------|-----------|---------|--------|
| Volcanic | 5 | every 2s (player tick) | player |
| HotSpring | 5 × waterLevel | every 2s, only if in water | player |
| Geyser | 1000 | instant, on eruption | all entities in radius |
| Gas | — (no `ProcessDirectDamage` for players) | uses agent system instead | player + AI |

---

## Particles / Visualization

Gas cloud particles are **config-driven** (JSON `ParticleName`) with procedural generation (concentric rings / circle-packing):

| Method | Algorithm | Used by |
|--------|-----------|---------|
| `EffectArea.FillWithParticles(pos, radius, ...)` (`effectarea.c:334`) | Circle-packing in a circle | Static areas (`contaminatedarea.c:70`) |
| `EffectArea.PlaceParticles(pos, radius, nbRings, ...)` (`effectarea.c:246`) | Ring/angle method | Dynamic areas (`contaminatedarea_dynamicbase.c:73`) |

Each emitter snapped to surface, optionally layered vertically via `SpawnParticles` (`effectarea.c:411`), respecting trigger height bounds (`:421`). Capped at `PARTICLES_MAX = 1000` (`:84`).

**Player-local effects** (haze around player, PPE tint) are separate — set via `EffectTrigger.SetLocalEffects(...)` (`effecttrigger.c:35`), then `player.SetContaminatedEffectEx(...)` / `player.RequestTriggerEffect(...)` on client.

Particle IDs (`3_game/particles/particlelist.c`): `CONTAMINATED_AREA_GAS_BIGASS` (303), `_AROUND` (302), `_TINY` (301), `_GROUND/SHELL/DEBUG` (304-306), `HOTPSRING_WATERVAPOR` (347), `GEYSER_*` (348-351), `VOLCANO` (352). PPE default: `"PPERequester_ContaminatedAreaTint"` (`effectarea.c:44`).

---

## The Gas Mechanic: Area-Exposure → Agent → Modifier → Stat Drain

This is the core of the system — a three-way bridge between triggers, agents, and modifiers.

### Step A — Player enters trigger

`EffectTrigger.OnEnterServerEvent` (`effecttrigger.c:117`) → `TriggerEffectManager.OnPlayerEnter` (`triggereffectmanager.c:41`) → `ContaminatedArea_Base.OnPlayerEnterServer` (`contaminatedarea.c:3`).

### Step B — Area raises player counts

`OnPlayerEnterServer` calls `super` (which calls `player.IncreaseEffectAreaCount()`, `effectarea.c:566` — gates visuals) **then** `player.IncreaseContaminatedAreaCount()` (`contaminatedarea.c:7`).

### Step C — Counts flip the modifier

`IncreaseContaminatedAreaCount` (`playerbase.c:669`): when count goes 0→1 → `OnContaminatedAreaEnterServer()` → **`GetModifiersManager().ActivateModifier(eModifiers.MDF_AREAEXPOSURE)`** (`playerbase.c:779`). On full exit (`DecreaseContaminatedAreaCount`, `:676`) → `DeactivateModifier(MDF_AREAEXPOSURE)` (`:785`).

### Step D — `AreaExposureMdfr` injects the agent

`areaexposure.c`, `MDF_AREAEXPOSURE`. Per-tick `OnTick` (`areaexposure.c:65`):

```c
float transmitted = TransmitAgents(player, AGENTS_PER_SEC * deltaT);   // :72, AGENTS_PER_SEC=5
// every 3-5s: queue SYMPTOM_COUGH (lines 78-93)
// every 13-18s: attempt contaminated bleeding source (line 116)
ApplyAgentsToBleedingSources(player, deltaT);                          // :103
```

`TransmitAgents` (`:141`) → `PluginTransmissionAgents.TransmitAgentsEx(null, player, AGT_AIRBOURNE_CHEMICAL, count, eAgents.CHEMICAL_POISON)`. `ApplyAgentsToBleedingSources` (`:107`) injects extra `eAgents.CHEMICAL_POISON` scaled by active bleeding sources. `OnActivate` (`:39`) teleports-checks against `SafePositions` (anti-grief) and queues an immediate cough.

**The agent is `eAgents.CHEMICAL_POISON = 32`** (`eagents.c:10`). `NERVE_AGENT` (128) and `HEAVYMETAL` (256) exist in the enum but are **not** used by the standard gas flow — available for mods/other items.

### Step E — Contamination stages activate on agent count

Three threshold modifiers keyed on `player.GetSingleAgentCount(eAgents.CHEMICAL_POISON)`:

| Stage | Modifier | ID | Activate | Deactivate | Effects (`OnTick`) |
|-------|----------|----|----------|------------|--------------------|
| 1 | `ContaminationStage1Mdfr` | `MDF_CONTAMINATION1` | ≥1 (`contamination.c:28`) | ≥100 (`:4`) | `OnActivate` queues cough once (`:33`). No tick logic |
| 2 | `ContaminationStage2Mdfr` | `MDF_CONTAMINATION2` | ≥100 & <400 (`contamination2.c:35`) | same | Cough every 20-40s (`:64`), vomit every 200-400s (`:70`). `IncreaseDiseaseCount` |
| 3 | `ContaminationStage3Mdfr` | `MDF_CONTAMINATION3` | ≥400 (`contamination3.c:25`) | <400 | After 4s, if not vomiting: **`player.AddHealth("","Shock", -100)`** → unconscious (`:49`); while unconscious **`player.AddHealth("","", -3 * deltaT)`** (`:54`). Queues vomit on activate |

### Step F — Agent natural die-off

`ChemicalAgent.Init` (`chemicalagent.c:3`): `m_DieOffSpeed = 0.1`, `m_MaxCount = 500`, `m_Potency = EStatLevels.CRITICAL`. Crucially `GetDieOffSpeedEx` (`:16`) returns **0 while stage 2 or 3 is active** — so contamination won't naturally clear once severe; it requires treatment.

Symptoms (cough/vomit) dispatched via `player.GetSymptomManager().QueueUpPrimarySymptom(SYMPTOM_COUGH / SYMPTOM_VOMIT)`.

---

## Mask Protection

`MaskMdfr` (`mask.c`), `MDF_MASK`. Activates whenever a mask is in the MASK slot:

```c
override bool ActivateCondition(PlayerBase player) {                   // mask.c:26
    return MaskBase.Cast(player.GetInventory().FindAttachment(InventorySlots.MASK)) != null;
}
```

The mask modifier **does not itself block agents** — it consumes filter quantity and applies stamina penalties. Actual protection from `CHEMICAL_POISON` is computed inside `PluginTransmissionAgents` via `GetProtectionLevelEx(DEF_CHEMICAL, location, player, ...)`, invoked in `AreaExposureMdfr.BleedingSourceCreateCheck` (`areaexposure.c:123`).

Filter consumption (`mask.c:36 OnTick`):

| Constant | Value |
|----------|-------|
| `OUT_AREA_CONSUME_FILTER_QUANTITY_PER_SEC` | 0.03 |
| `IN_AREA_CONSUME_FILTER_QUANTITY_PER_SEC` | 0.3 (10× faster inside an active area) |

`inside_area = m_Manager.IsModifierActive(eModifiers.MDF_AREAEXPOSURE)` (`:42`). `mask.HasValidFilter()` (`:54`) gates stamina modifiers (recovery ×0.5, depletion ×1.25). Low-filter breathing sounds below `LOW_FILTER_SOUND_THRESHOLD = 0.2` (`HandleSounds`, `:69`).

---

## Dynamic vs Static & Runtime State

### Static (`ContaminatedArea_Static`, `contaminatedarea.c:33`)

`m_Type = STATIC`. Spawned at mission start from JSON by `EffectAreaLoader`. Trigger type `ContaminatedTrigger`. Created via `DeferredInit` → `InitZone`. Permanent for the mission.

### Dynamic (`ContaminatedArea_Dynamic`, `contaminatedarea_dynamic.c:22`)

`m_Type = DYNAMIC`. Has a **5-stage state machine** `eAreaDecayStage` (`contaminatedarea_dynamicbase.c:1`): `INIT → START → LIVE → DECAY_START → DECAY_END`. A CE (Central Economy) object — lifecycle launched via `EEOnCECreate` (`contaminatedarea_dynamic.c:42`):

1. Computes artillery firing point, RPCs `RPC_SOUND_ARTILLERY_SINGLE` to all clients, schedules shell travel-delay timer → `PlayFX()` (`:205`)
2. `PlayFX` sets state `START`, plays explosion sound/light (`ShellLight`, `:223`)
3. After `AREA_SETUP_DELAY` (10s) → `InitZone()` flips state to `LIVE` (`dynamicbase.c:63`), spawns trigger, server `SpawnItems()` drops 2-5 `Grenade_ChemGas` (`contaminatedarea_dynamic.c:37-40, 170`)
4. `Tick()` (`:106`) monitors `GetLifetime()` against `START_DECAY_LIFETIME` (900s) and `FINISH_DECAY_LIFETIME` (300s) → `SetDecayState(DECAY_START)` then `DECAY_END`, which reduce particle birth-rate/size (`dynamicbase.c:128-158`), mirrored to clients via `ContaminatedTrigger_Dynamic.SetAreaState`

### Local (`ContaminatedArea_Local`, `contaminatedarea_local.c:1`)

Smallest, runtime-only (gas-grenade cloud). `m_EffectsPriority = -10`. Self-managed lifetime (`m_Lifetime = 360`, decremented by its own 1s timer, `:73-78`) then `Delete()`. Trigger `ContaminatedTrigger_Local`. Shorter decay thresholds (20s/10s). Created by the `Grenade_ChemGas` item.

> **Runtime activation:** Static areas cannot be deactivated (delete = `EEDelete` removes trigger, `effectarea.c:545`). Dynamic/Local areas are CE/spawn-event-created and self-delete on lifetime expiry. No per-area enable/disable toggle beyond creation/deletion.

---

## Decontamination

There is **no dedicated "decontamination" modifier** for chemical poison beyond the agent's natural die-off. Clearing happens through:

- **Natural die-off** (`ChemicalAgent.m_DieOffSpeed = 0.1`, `chemicalagent.c:13`) — but forced to 0 during stages 2/3 (`GetDieOffSpeedEx`, `:18`), so severe contamination won't self-clear
- **`DisinfectionMdfr`** (`disinfectmdfr.c`) — `MDF_DISINFECTION`, lifetime 100s. Drains `eAgents.WOUND_AGENT` (not chemical), so relates to wound infection, **not** gas poisoning
- **AntiChemInjector** (`anticheminjector.c:11 OnApply`): **the real cure**. If stage 3 active, resets count to `ContaminationStage2Mdfr.AGENT_THRESHOLD_ACTIVATE` (100); otherwise sets `eAgents.CHEMICAL_POISON` to **0** (`anticheminjector.c:24`). Also `GiveShock(100)` to wake from unconsciousness

So decontamination of gas is via the **anti-chem injector item** (force-clearing the agent count), after which the stage modifiers drop off. Water/bleeding do not decontaminate — standing in a hot spring adds heat damage, and bleeding sources *add* chemical-poison dose (`areaexposure.c:107-113`).

---

## Config / Data Loading

Static & dynamic area placement is JSON-driven and **per-world**: `EffectAreaLoader` (`contaminatedarealoader.c`).

| Aspect | Detail |
|--------|--------|
| Path | `m_Path = "$mission:cfgeffectarea.json"` (`:4`); if missing falls back to `dz/worlds/<worldName>/ce/cfgeffectarea.json` (`:17-18`) |
| Loader | `CreateZones()` (`:6`) uses `JsonFileLoader<JsonDataContaminatedAreas>`, iterates `Areas`, builds `EffectAreaParams`, instantiates the class in `Type` (e.g. `ContaminatedArea_Static`, `HotSpringArea`) via `CreateObjectEx`, calls `SetupZoneData` |
| Particle name → ID | `ParticleList.GetParticleID(particleName)` (`:77`) |

### JSON schema (`jsondatacontaminatedarea.c`)

```
JsonDataContaminatedAreas { Areas[], SafePositions[][] }
JsonDataContaminatedArea  { AreaName, Type, TriggerType, Data, PlayerData }
JsonDataAreaData          { Pos[3], Radius, PosHeight, NegHeight, InnerRingCount,
                            InnerPartDist, OuterRingToggle, OuterPartDist, OuterOffset,
                            VerticalLayers, VerticalOffset, ParticleName,
                            EffectInterval, EffectDuration, EffectModifier }
JsonDataPlayerData        { AroundPartName, TinyPartName, PPERequesterType }
```

`SafePositions` used by `AreaExposureMdfr.OnActivate` (`areaexposure.c:44`, `MiscGameplayFunctions.TeleportCheck`) to bounce players who logged in inside a banned area.

**Dynamic areas** (`ContaminatedArea_Dynamic`) are **not** in the JSON — they are CE-spawned objects (`EEOnCECreate`), so positions governed by Central Economy `events.xml`/`globals.xml` (artillery/gas strike events).

> **Note:** Underground triggers are a separate, parallel system (`UndergroundAreaLoader` at `3_game/undergroundarealoader.c:50` loads `cfgundergroundtriggers.json`, spawning `UndergroundTriggerCarrier` → `UndergroundTrigger : ManTrigger`). These are **not** EffectAreas — they drive eye-accommodation/ambient-sound via `UndergroundHandlerClient` and have no damage/contamination. See [Underground System](/world-gameplay/underground).

---

## End-to-End: Player Walks Into a Toxic Gas Zone

```
1. TRIGGER DETECTION
   ContaminatedArea_Static (JSON-placed at mission load) owns ContaminatedTrigger cylinder
   player physics overlap fires EOnEnter → Trigger.AddInsider → Enter()
      → EffectTrigger.OnEnterServerEvent                         effecttrigger.c:117

2. MANAGER DEDUP
   TriggerEffectManager.OnPlayerEnter registers player for trigger type   triggereffectmanager.c:41

3. AREA CALLBACK
   first entry → ContaminatedArea_Base.OnPlayerEnterServer               contaminatedarea.c:3
      → player.IncreaseEffectAreaCount()   (visual gate)
      → player.IncreaseContaminatedAreaCount()                            contaminatedarea.c:7

4. MODIFIER ACTIVATION
   count 0→1 → OnContaminatedAreaEnterServer                              playerbase.c:777
      → ActivateModifier(MDF_AREAEXPOSURE)                                playerbase.c:779

5. VISUALS (CLIENT)
   OnEnterClientEvent/OnStayClientEvent → player.RequestTriggerEffect     effecttrigger.c:136/109
      → SetContaminatedEffectEx(true, ppeIdx, aroundId, tinyId, soundset) playerbase.c:5621
      (PPE tint + around-player particles + ambient sound, gated by m_InsideEffectArea)

6. AGENT GROWTH
   AreaExposureMdfr.OnTick injects 5*deltaT units of eAgents.CHEMICAL_POISON/sec
      via TransmitAgentsEx(...,AGT_AIRBOURNE_CHEMICAL,...,eAgents.CHEMICAL_POISON)  areaexposure.c:144
      + 0.33/s per bleeding source. Coughs every 3-5s.

7. STAGE ESCALATION (as CHEMICAL_POISON count rises)
   MDF_CONTAMINATION1 fires at ≥1 (cough)                                 contamination.c:28
   MDF_CONTAMINATION2 fires at ≥100 (cough+vomit, IncreaseDiseaseCount)   contamination2.c:35
   MDF_CONTAMINATION3 fires at ≥400                                       contamination3.c:25
   At stage 2+, ChemicalAgent.GetDieOffSpeedEx returns 0 — agent no longer decays  chemicalagent.c:18

8. HEALTH DAMAGE (stage 3)
   OnTick: after 4s, AddHealth("","Shock",-100) → unconscious            contamination3.c:49
   while unconscious: AddHealth("","", -3*deltaT) → death if untreated   contamination3.c:54

9. EXIT
   leaving trigger → EffectTrigger.OnLeaveServerEvent                     effecttrigger.c:155
      → TriggerEffectManager.OnPlayerExit → OnPlayerExitServer
      → DecreaseContaminatedAreaCount                                     playerbase.c:676
      → at 0 → DeactivateModifier(MDF_AREAEXPOSURE)                       playerbase.c:785
      (stops further agent injection)
   client: RemoveCurrentEffectTrigger clears visuals                      playerbase.c:806

10. RECOVERY
   remaining CHEMICAL_POISON decays at 0.1/s (unless stage 2/3 still active)
   AntiChemInjector forces count to 0                                     anticheminjector.c:24
      → stages deactivate → health recovers
```

### Key chain (cited)

- Agent: `eAgents.CHEMICAL_POISON = 32` (`eagents.c:10`)
- Injection: `AreaExposureMdfr.TransmitAgents` → `TransmitAgentsEx(...,eAgents.CHEMICAL_POISON)` (`areaexposure.c:144`)
- Stage thresholds: `contamination.c:4` (100), `contamination2.c:3-4` (100/400), `contamination3.c:3-6` (400)
- Stat drain: `AddHealth("","Shock",-100)` & `AddHealth("","",-3*deltaT)` (`contamination3.c:49,54`)
- Die-off: `m_DieOffSpeed = 0.1` (`chemicalagent.c:13`), zeroed at stage 2+ (`chemicalagent.c:18`)

---

## Extras

- **`EContaminationTypes`** (`econtaminationtypes.c`) is a bitmask of **item badges** (`ITEM_BADGE_CONTAMINATED/POISONED/NERVE_GAS/DIRTY` = 1/2/4/8) for UI labeling of items — unrelated to the area/agent mechanic
- **Dynamic music**: `ContaminatedArea_Base.InitZoneClient` (`contaminatedarea.c:17`) registers with the DynamicMusicPlayer as `CONTAMINATED_ZONE`, so ambient music changes inside gas
- **Overlap resolution**: same-type triggers deduped by `TriggerEffectManager`; different-priority triggers resolve via `EffectTrigger.GetEffectsPriority` / `RequestTriggerEffect` (`playerbase.c:636`)

---

## Directory Structure

```
classes/contaminatedarea/
├── effectarea.c                  EffectArea : House (base) + enums + EffectAreaParams
├── contaminatedarea.c            ContaminatedArea_Base, ContaminatedArea_Static
├── contaminatedarea_dynamicbase.c  ContaminatedArea_DynamicBase + eAreaDecayStage enum
├── contaminatedarea_dynamic.c    ContaminatedArea_Dynamic (artillery shell lifecycle)
├── contaminatedarea_local.c      ContaminatedArea_Local (gas-grenade cloud)
├── dynamicarea_flare.c           DynamicArea_Flare, ShellLight (announcement VFX)
├── hotspringarea.c               HotSpringArea
├── volcanicarea.c                VolcanicArea
├── geyserarea.c                  GeyserArea + EGeyserState (eruption state machine)
├── spookyarea.c / spookyareamisc.c  SpookyArea / SpookyArea23 (ambient)
├── contaminatedarealoader.c      EffectAreaLoader (JSON spawn)
└── jsondatacontaminatedarea.c    JSON DTO classes

entities/scriptedentities/triggers/
├── trigger.c / triggerevents.c   Trigger + TriggerEvents base
├── cylindertrigger.c             CylinderTrigger (volume)
├── effecttrigger.c               EffectTrigger base
├── contaminatedtrigger.c         ContaminatedTrigger (+ Dynamic/Local)
├── volcanictrigger.c             VolcanicTrigger (HeatDamage×5)
├── hotspringtrigger.c            HotSpringTrigger (HeatDamage×5×waterLevel)
├── geysertrigger.c               GeyserTrigger (HeatDamage×1000 on eruption)
├── spookytrigger.c               SpookyTrigger (ambient)
└── triggereffectmanager.c        TriggerEffectManager (overlap dedup)

classes/playermodifiers/modifiers/
├── conditions/areaexposure.c     MDF_AREAEXPOSURE (agent injector)
├── diseases/contamination.c      MDF_CONTAMINATION1
├── diseases/contamination2.c     MDF_CONTAMINATION2
├── diseases/contamination3.c     MDF_CONTAMINATION3
├── mask.c                        MDF_MASK (filter consumption + stamina)
└── disinfectmdfr.c               MDF_DISINFECTION (wound agent, not chemical)
```

---

## Related Documentation

- [Player Modifiers & Symptoms](./modifiers-symptoms-system) — agent/disease system, the staged modifier framework this builds on
- [Damage System](./damage-system) — `ProcessDirectDamage` used by heat/geyser triggers
- [Environment System](./environment-system) — temperature sources (SpookyArea's stalker)
- [Central Economy](./central-economy) — dynamic area CE spawning
- [Contaminated Areas](/world-gameplay/contaminated-areas) — gameplay-facing overview
- [Underground System](/world-gameplay/underground) — separate trigger system
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
