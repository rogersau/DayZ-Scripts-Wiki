# Player Modifiers & Symptoms System

DayZ's survival simulation is driven by four cooperating per-player subsystems: **Modifiers** (the always-ticking stat/disease engine), **Symptoms** (the visible animations & overlay effects), **Notifiers** (the HUD badges & tendency arrows), and the **Agent/Disease pool** (the immune-system simulation). Together they turn abstract `PlayerStat` values (health, energy, water, temperature, …) into gameplay — hunger drains energy, cholera grows in the agent pool, a modifier activates at a threshold, queues a vomit symptom, the symptom plays the animation, the notifier flashes the sick badge.

**Primary location**: `P:/scripts/4_world/classes/`

| Subsystem | Directory | Manager | Ticks On |
|-----------|-----------|---------|----------|
| Modifiers | `playermodifiers/` | `ModifiersManager` | Scheduled gameplay tick |
| Symptoms | `playersymptoms/` | `SymptomManager` | Command-handler (animation) tick |
| Notifiers | `playernotifiers/` | `NotifiersManager` | Scheduled gameplay tick |
| Agents | `transmissionagents/` | `PlayerAgentPool` (driven by `ImmuneSystemMdfr`) | Via modifier tick |
| Stats | `playerstats/` | (per-stat `PlayerStat<T>`) | On `Set`/`Add` calls |

> **See also**: [Player Stats](/world-gameplay/player-stats) (gameplay-facing thresholds & values), [Damage & Combat](./damage-combat), [Player System](./player-system), [Effect System](./effect-system).

---

## Mental Model

```
                         ┌─────────────────────────────────────────┐
                         │  PlayerStat<T>  (health, energy, water…) │
                         │  Get() / Set() / Add()                   │
                         └──────────────▲──────────────┬───────────┘
                                        │              │
              drain/gain                │              │ read
                                        │              │
   ┌─────────────────────┐    ┌─────────┴──────┐   ┌───┴──────────────┐
   │  AgentPool          │    │  ModifierBase  │   │  NotifierBase    │
   │  (disease counts)   ├───►│  (per-tick     │   │  (HUD badge +    │
   │  grows/dies off     │    │   logic)       │──►│   tendency arrow)│
   └─────────────────────┘    └────────┬───────┘   └──────────────────┘
                                     │ queue
                                     ▼
                              ┌──────────────────┐
                              │  SymptomBase     │
                              │  (animations +   │
                              │   overlay FX)    │
                              └──────────────────┘
```

- **Modifiers** are the *cause*: they tick every few seconds, drain/restore stats, and queue symptoms.
- **Symptoms** are the *visible effect*: full-body animations (vomit, cough) and overlay effects (blindness, fever blur).
- **Notifiers** are the *UI*: they observe stats and drive HUD badges. Mostly decoupled (read stats directly), except `NTF_SICK`/`NTF_PILLS` which `ImmuneSystemMdfr` toggles explicitly.
- **Agents** are the *pathogens*: bit-flag counts per disease, grown/die-off by the immune system.

---

## PlayerStats — The Values Being Manipulated

`PlayerStatBase` (abstract, `playerstats/playerstatbase.c`) + generic `PlayerStat<Class T>` (`:32`). This is the API every modifier and notifier uses:

```c
float Get();                       // read current value
void  Set(T value, system="");     // clamp to [min,max]; RPC to client if SYNCED & delta>0.05
void  Add(T value, system="");     // Set(m_Value + value)  ← primary drain/gain call
float GetNormalized();             // 0..1 within range
```

Registered in `playerstats/playerstatspco.c` (versioned PCO `PlayerStatsPCO_current` extends v115). Stats include: **HeatComfort**, **Tremor**, **Wet** (int), **Energy** (0..SL_ENERGY_MAX, init 600), **Water** (0..SL_WATER_MAX, init 600), StomachSolid/Energy/Water, Diet, Stamina, Specialty, BloodType (int), **Toxicity** (0..100).

> Core **Health/Blood** are handled via the engine health system (`PlayerBase.AddHealth` / `GetHealth`), not as `PlayerStat` entries — see [Damage & Combat](./damage-combat).

Threshold constants live in `3_game/playerconstants.c` — see [Player Stats](/world-gameplay/player-stats) for the values.

---

## Modifiers — The Per-Tick Engine

### `ModifierBase` contract (`modifierbase.c`)

The manager calls `Tick(delta_time)` (`:91`) every scheduled tick; everything else is internal. Concrete subclasses override:

| Hook | When it fires |
|------|---------------|
| `Init()` `:45` | Once — set `m_ID`, tick intervals, flags |
| `bool ActivateCondition(PlayerBase player)` `:176` | Polled while inactive (default `false`) |
| `bool DeactivateCondition(PlayerBase player)` `:181` | Polled while active (default `false`) |
| `void OnActivate(PlayerBase player)` `:187` | Once on activation during gameplay |
| `void OnReconnect(PlayerBase player)` `:190` | Once on activation upon server reconnect (load) |
| `void OnDeactivate(PlayerBase player)` `:191` | Once on deactivation |
| `void OnTick(PlayerBase player, float deltaT)` `:236` | Main per-tick gameplay logic |
| `OnStoreSave / OnStoreLoad` `:234` | Persistence |

Key state fields: `m_ID`, `m_IsActive`, `m_ShouldBeActive`, `m_ActivatedTime`, `m_TrackActivatedTime`, `m_IsPersistent`, `m_IsLocked`, `m_SyncID` (bitmask), `m_TickType`.

### The tick state machine (`Tick`, `modifierbase.c:91`)

Driven by `eModifiersTickType` flags (`TICK`, `ACTIVATE_CHECK`, `DEACTIVATE_CHECK`; default = all three, `:24`):

```
INACTIVE state
  │  (if ACTIVATE_CHECK)
  │  accumulate time; at m_TickIntervalInactive:
  ▼
  ActivateCondition(player)?  ──no──►  stay inactive
  │ yes
  ▼  ActivateRequest()  → m_ShouldBeActive = true
TRANSITION
  │  Activate() (:193)
  │    m_IsActive = true
  │    OR m_SyncID into m_Player.m_SyncedModifiers
  │    OnActivate(player)   [or OnReconnect on load]
  ▼
ACTIVE state
  │  accumulate time; at m_TickIntervalActive:
  │  (if DEACTIVATE_CHECK)
  │    DeactivateCondition(player)?  ──yes (not locked)──► Deactivate() → OnDeactivate
  │  otherwise:
  ▼
  OnTick(player, deltaT)  +  bump m_ActivatedTime
```

Tick-interval constants (`modifiersmanager.c:27-30`):

| Constant | Value |
|----------|-------|
| `DEFAULT_TICK_TIME_ACTIVE` | 3 s |
| `DEFAULT_TICK_TIME_ACTIVE_SHORT` | 1 s |
| `DEFAULT_TICK_TIME_INACTIVE` | 3 s |
| `DEFAULT_TICK_TIME_INACTIVE_LONG` | 10 s |

`DisableActivateCheck()` / `DisableDeactivateCheck()` (`:81-89`) clear the flag bits — used by always-on modifiers (`ImmuneSystemMdfr`, `HungerMdfr`, `ThirstMdfr`, …).

### Activation paths

- **Auto** — the manager's tick poll of `ActivateCondition`.
- **Forced** — `ModifiersManager.ActivateModifier(id, trigger)` (`manager :219`) → `ActivateRequest(trigger)`. Used for drug effects (`MDF_IMMUNITYBOOST`), persistence load (`OnStoreLoad`, `manager :289` with `TRIGGER_EVENT_ON_CONNECT`).

### The `eModifiers` ID enum (`emodifiers.c`)

Every modifier has a unique numeric ID. Full list (IDs start at 1):

| ID | Name | ID | Name |
|----|------|----|------|
| 1 | `MDF_TEMPERATURE` | 31 | `MDF_SHOCK_DAMAGE` |
| 2 | `MDF_BLOOD_REGEN` | 32 | `MDF_UNCONSCIOUSNESS` |
| 3 | `MDF_BURNING` | 33 | `MDF_WETNESS` |
| 4 | `MDF_HEALTH_REGEN` | 34 | `MDF_IMMUNITYBOOST` |
| 5 | `MDF_TREMOR` | 35 | `MDF_ANTIBIOTICS` |
| 6 | `MDF_HUNGER` | 36 | `MDF_TOXICITY` |
| 7 | `MDF_FEVER` | 37 | `MDF_BREATH_VAPOUR` |
| 8 | `MDF_COMMON_COLD` | 38 | `MDF_WOUND_INFECTION` (legacy) |
| 9 | `MDF_THIRST` | 39-40 | `MDF_WOUND_INFECTION1` / `2` |
| 10 | `MDF_BLEEDING` | 41 | `MDF_DISINFECTION` |
| 11 | `MDF_BLINDED` | 42 | `MDF_CHARCOAL` |
| 12 | `MDF_HEART_ATTACK` | 43 | `MDF_MORPHINE` |
| 13 | `MDF_STUFFED` | 44 | `MDF_PAINKILLERS` |
| 14 | `MDF_BONE_REGEN` | 45 | `MDF_EPINEPHRINE` |
| 15 | `MDF_HEALTH` | 46 | `MDF_HEATBUFFER` |
| 16 | `MDF_POISONING` | 47 | `MDF_FATIGUE` |
| 17 | `MDF_HEMOLYTIC_REACTION` | 48-50 | `MDF_CONTAMINATION1` / `2` / `3` |
| 18 | `MDF_STOMACH` | 51 | `MDF_AREAEXPOSURE` |
| 19 | `MDF_STAMINACALC` | 52 | `MDF_MASK` |
| 20 | `MDF_IMMUNE_SYSTEM` | 53 | `MDF_FLIES` |
| 21 | `MDF_INFLUENZA` | 54 | `MDF_DROWNING` |
| 22 | `MDF_SHOCK` | 55-57 | `MDF_HEAVYMETAL1` / `2` / `3` |
| 23 | `MDF_BROKEN_LEGS` | 58 | `MDF_PNEUMONIA` |
| 24 | `MDF_BROKEN_ARMS` | 59 | `MDF_CHELATION` |
| 25 | `MDF_CHOLERA` | | |
| 26 | `MDF_TESTING` | | |
| 27-30 | `MDF_SALMONELLA`, `MDF_BRAIN`, `MDF_VOMITSTUFFED`, `MDF_SALINE` | | |

**Sync bitmasks** (`eModifierSyncIDs`, `modifiersmanager.c:2-18`) — modifiers that need client-visible state set a bit (`WOUND_INFECT_1=0x1`, `WOUND_INFECT_2=0x2`, `CONTAMINATION=0x4`, `CONTAMINATION2=0x8`, `ZONE_EXPOSURE=0x10`, `DROWNING=0x20`, `FEVER=0x40`, …; max 32 synced) OR'd into `m_Player.m_SyncedModifiers` on activation.

### Complete concrete modifier list

Registered in `ModifiersManager.Init()` (`modifiersmanager.c:90-146`).

**Metabolism / vitals (always-on):**

| Class | File | Purpose |
|-------|------|---------|
| `HungerMdfr` | `hunger.c` | Drains energy; damages health when starving |
| `ThirstMdfr` | `thirst.c` | Drains water; damages health when dehydrated |
| `StomachMdfr` | `stomach.c` | Processes stomach contents into stats |
| `HealthRegenMdfr` | `healthregen.c` | Regenerates global health |
| `BloodRegenMdfr` | `bloodregen.c` | Regenerates blood over time |
| `ImmuneSystemMdfr` | `immunesystem.c` | Always-on; drives agent growth/die-off + sick/pills notifiers |
| `HeatComfortMdfr` | `heatcomfortmdfr.c` | Heat-comfort / temperature simulation |
| `WetMdfr` | `conditions/wet.c` | Wetness stat simulation |
| `ShockMdfr` | `shock.c` | Shock stat regeneration |
| `StaminaCalcMdfr` | (`MDF_STAMINACALC`) | Stamina calculation |

**Conditions (stat-driven states):**

| Class | File | Purpose |
|-------|------|---------|
| `BleedingCheckMdfr` | `conditions/bleeding.c` | Checks for bleeding sources |
| `BrokenLegsMdfr` | `conditions/brokenlegs.c` | Broken-legs state |
| `VomitStuffedMdfr` | `conditions/vomitstuffed.c` | Overeat → forced vomit |
| `StuffedStomachMdfr` | `conditions/stuffedstomach.c` | Overfull stomach |
| `BurningMdfr` | `conditions/burning.c` | On-fire damage |
| `FeverMdfr` | `conditions/fever.c` | Fever (temperature up) |
| `HeartAttackMdfr` | `conditions/heartattack.c` | Heart attack from low health/shock |
| `HemolyticReactionMdfr` | `conditions/hemolyticreaction.c` | Wrong blood-type transfusion |
| `PoisoningMdfr` | `conditions/poisoning.c` | Food poisoning |
| `ShockDamageMdfr` | `shockdamage.c` | Shock accumulation damage |
| `UnconsciousnessMdfr` | `unconsciousness.c` | Knock-out logic |
| `HeatBufferMdfr` | `conditions/heatbuffer.c` | Heat buffer |
| `FatigueMdfr` | `conditions/fatigue.c` | Fatigue simulation |
| `AreaExposureMdfr` | `conditions/areaexposure.c` | Contaminated-zone exposure |

**Diseases (`modifiers/diseases/`):**

| Class | File | Disease |
|-------|------|---------|
| `CholeraMdfr` | `cholera.c` | Cholera (from contaminated water) |
| `InfluenzaMdfr` | `influenza.c` | Influenza |
| `SalmonellaMdfr` | `salmonella.c` | Salmonella |
| `CommonColdMdfr` | `commoncold.c` | Common cold |
| `BrainDiseaseMdfr` | `braindisease.c` | Kuru (cannibalism) |
| `WoundInfectStage1Mdfr` / `Stage2Mdfr` | `woundinfection.c`, `woundinfection2.c` | Wound infection stages |
| `ContaminationStage1Mdfr` / `2` / `3` | `contamination.c`, `contamination2.c`, `contamination3.c` | Poison-gas stages |
| `HeavyMetalPhase1Mdfr` / `2` / `3` | `heavymetal.c` | Heavy-metal poisoning stages |
| `PneumoniaMdfr` | `pneumonia.c` | Pneumonia |

**Drugs / treatments:**

| Class | File | Purpose |
|-------|------|---------|
| `AntibioticsMdfr` | `antibiotics.c` | Antibiotics (bacterial diseases) |
| `CharcoalMdfr` | `charcoalmdfr.c` | Charcoal tablets (poison treatment) |
| `MorphineMdfr` | `morphinemdfr.c` | Morphine painkiller |
| `PainKillersMdfr` | `painkillersmdfr.c` | Painkiller drug |
| `EpinephrineMdfr` | `epinephrinemdfr.c` | Epi-pen stimulant |
| `SalineMdfr` | `saline.c` | IV saline bag |
| `DisinfectionMdfr` | `disinfenctmdfr.c` | Disinfect wounds |
| `ChelationMdfr` | `chelation.c` | Chelation therapy (heavy-metal treatment) |
| `ImmunityBoost` | `immunityboost.c` | Temporary immunity boost |

**Environment / misc:**

| Class | File | Purpose |
|-------|------|---------|
| `ToxicityMdfr` | `toxicity.c` | Toxicity stat |
| `BreathVapourMdfr` | `breathvapourmdfr.c` | Cold-breath visual |
| `MaskMdfr` | `mask.c` | Gas-mask protection |
| `FliesMdfr` | `flies.c` | Corpse-flies effect |
| `DrowningMdfr` | `drowning.c` | Underwater drowning |

---

## Symptoms — The Visible Effects

### `SymptomBase` contract (`statebase.c`)

> Note: the class is `SymptomBase`; the file is named `statebase.c`.

| Hook | When it fires |
|------|---------------|
| `OnInit()` `:344` | Once — set `m_SymptomType` (PRIMARY/SECONDARY), `m_Priority`, `m_ID`, `m_Duration`, `m_MaxCount`, `m_SyncToClient` |
| `bool CanActivate()` `:348` | Server gate (e.g. vomit only when in MOVE/ACTION command) |
| `OnGetActivatedServer/Client` `:352-353` | Once on activation |
| `OnUpdateServer(player, dt)` `:347` | Server tick (throttled by `m_ServerUpdateInterval`) |
| `OnUpdateClient(player, dt)` `:350` | Client tick |
| `OnGetDeactivatedServer/Client` `:355-356` | Once on deactivation |
| `OnAnimationStart/Finish/PlayFailed` `:338-340` | Animation lifecycle |
| `SpawnAnimMetaObject()` `:301` | Returns `SmptAnimMetaBase` to drive the animation |
| `SetParam(Param p)` `:105` | Receive params from the queuer (e.g. vomit content %) |

Helper predicates: `IsPrimary()` `:141`, `GetPriority()` `:159`, `CanBeInterupted()` `:64` (false once anim requested), `AllowInUnconscious()` `:149` (default false).

Lifecycle: `SpawnSymptom` → `Init` → queued → `Activate` (fires `OnGetActivatedServer/Client`, syncs RPC if `m_SyncToClient`) → `Update` each frame (`:222`) → `CheckDestroy` (`:289`) → `RequestDestroy` → `Destroy` → `OnDestructed` (`:169`). Primary symptoms have a `MAX_TIME_ACTIVE_SAVEGUARD = 20s` kill-switch (`:292`).

### The architectural distinction: primary vs secondary

```
PRIMARY symptoms            SECONDARY symptoms
────────────────────        ─────────────────────
Full-body animation         Additive overlay / FX
MUTUALLY EXCLUSIVE          ALL RUN CONCURRENTLY
priority-based selection    (priority 0, no preemption)
one animates at a time      blindness, fever blur, hand shiver…
vomit, cough, sneeze…
```

Only **one primary symptom animates at a time** (full-body, via `m_ActiveSymptomIndexPrimary`); **all secondary symptoms run simultaneously** as additive/overlay effects.

### `SymptomManager.OnTick` (`statemanager.c:224`)

1. Read current command ID from player (`:228`).
2. If no active primary (`m_ActiveSymptomIndexPrimary == -1`), `FindFirstAvailableSymptomIndex()` (`:560`) returns the first primary whose `CanActivate()` is true; sync its ID to remotes.
3. `UpdateActiveSymptoms(dt)` (`:323`): activate + `Update` the current primary; activate + `Update` **all** secondary symptoms.
4. Drive `m_AnimMeta`: if not playing, `PlayRequest()`; on `FAILED`, `OnAnimationFinished(FAILURE)`; if playing, `m_AnimMeta.Update(movement_state)`.

### `SymptomIDs` enum (`statemanager.c:7-29`)

| ID | Name | ID | Name |
|----|------|----|------|
| 1 | `SYMPTOM_COUGH` | 11 | `SYMPTOM_FREEZE` |
| 2 | `SYMPTOM_VOMIT` | 12 | `SYMPTOM_FREEZE_RATTLE` |
| 3 | `SYMPTOM_BLINDNESS` | 13 | `SYMPTOM_HOT` |
| 4 | `SYMPTOM_BULLET_HIT` | 14 | `SYMPTOM_PAIN_LIGHT` |
| 5 | `SYMPTOM_BLEEDING_SOURCE` | 15 | `SYMPTOM_PAIN_HEAVY` |
| 6 | `SYMPTOM_BLOODLOSS` | 16 | `SYMPTOM_HAND_SHIVER` |
| 7 | `SYMPTOM_SNEEZE` | 17 | `SYMPTOM_DEAFNESS_COMPLETE` |
| 8 | `SYMPTOM_FEVERBLUR` | 18 | `SYMPTOM_HMP_SEVERE` |
| 9 | `SYMPTOM_LAUGHTER` | 19 | `SYMPTOM_GASP` |
| 10 | `SYMPTOM_UNCONSCIOUS` | | |

### Queueing & prioritization (`QueueUpPrimarySymptom`, `:473`)

- Max-count check per symptom type (`m_MaxCount`); skip if exceeded.
- Unconscious filter unless `AllowInUnconscious()`.
- **Sorted insertion by priority descending** (`:484-496`): walk the primary queue; insert before the first existing symptom that `CanBeInterupted()` **and** has strictly lower priority (`ComparePriority(new, existing) == 1` ⟺ `newPrio > existingPrio`).
- Queue capped at `MAX_QUEUE_SIZE = 5` (`:45`); overflow destroyed.
- `CleanUpPrimaryQueue()` (`:465`) — called on `RPC_PLAYER_SYMPTOM_ON` for a primary (`:602`) so a new remote-synced primary fully replaces the running one.

### Symptom priority tiers

| Tier | Priority | Symptoms |
|------|----------|----------|
| Acute (interrupting) | 100 | Cough, Vomit, Sneeze, Gasp |
| Ambient (interruptible) | 1 | Freeze, Hot, PainLight, PainHeavy |
| Lowest | 0 | Laughter |

A symptom whose animation has been requested returns `CanBeInterupted() == false` (`statebase.c:64-72`) — it **cannot be preempted mid-anim**.

### Complete symptom class list

**Primary (`playersymptoms/states/primary/`) — full-body, mutually exclusive:**

| Class | ID | Priority | MaxCount |
|-------|----|----------|----------|
| `CoughSymptom` | COUGH | 100 | -1 |
| `VomitSymptom` | VOMIT | 100 | 1 |
| `SneezeSymptom` | SNEEZE | 100 | -1 |
| `GaspSymptom` | GASP | 100 | -1 |
| `FreezeSymptom` | FREEZE | 1 | 2 |
| `HotSymptom` | HOT | 1 | 2 |
| `PainLightSymptom` | PAIN_LIGHT | 1 | 2 |
| `PainHeavySymptom` | PAIN_HEAVY | 1 | 2 |
| `LaughterSymptom` | LAUGHTER | 0 | -1 |

**Secondary (`playersymptoms/states/secondary/`) — additive overlay, all concurrent:**

| Class | ID |
|-------|----|
| `BlindnessSymptom` | BLINDNESS |
| `BloodLoss` | BLOODLOSS (auto-queued at construction, `manager :108`) |
| `BulletHitState` | BULLET_HIT |
| `DeafnessCompleteSymptom` | DEAFNESS_COMPLETE (MaxCount 1) |
| `FeverBlurSymptom` | FEVERBLUR |
| `HandShiversSymptom` | HAND_SHIVER |
| `HMP3Symptom` | HMP_SEVERE (MaxCount 1) |

Supporting files: `statecb.c` = `SymptomCB` (animation callback bridging engine anim events back to `SymptomBase.AnimationFinish`); `smptanimmeta.c` = `SmptAnimMetaBase` (base for animation meta; `SmptAnimMetaFB` for full-body).

---

## The Tick Loop — Two Distinct Paths

`PlayerBase` owns both managers (`playerbase.c:41` `m_ModifiersManager`, `:48` `m_SymptomManager`; constructed at `:376` and `:383`). Crucially they tick on **different** schedules:

### 1. Scheduled gameplay tick — `OnScheduledTick(dt)` (`playerbase.c:2687`)

Called from `OnTick()` (`:2798`, which computes real delta from `GetGame().GetTime()`):

```
OnScheduledTick(deltaTime)
  ├─► m_ModifiersManager.OnScheduledTick(dt)   (:2692)
  │      iterates m_ModifierListArray
  │      → modifier.Tick(deltaTime) per modifier
  ├─► m_NotifiersManager.OnScheduledTick()     (:2694)
  ├─► TransferValues / VirtualHud / BleedingManager / Environment
```

### 2. Command-handler tick — `OnCommandHandlerTick(dt, pCurrentCommandID)` (`playerbase.c:2716`)

Invoked from the `CommandHandler` override (`:3147`). Symptoms live here **deliberately** because they play animations, which require the animation/command context:

```
OnCommandHandlerTick(delta_time, pCurrentCommandID)
  ├─► GetSymptomManager().OnTick(dt, pCurrentCommandID, m_MovementState)  (:2730)
  ├─► DebugMonitorValues
  ├─► sound handler, effect widgets
```

Both gated by `IsAlive()` / `IsPlayerSelected()`.

---

## The Agent / Disease System

### `eAgents` enum (bitmask, `3_game/enums/eagents.c`)

Each agent is a power-of-2 bit so they combine in a single mask (max 32 agents):

| Bit | Agent | Bit | Agent |
|-----|-------|-----|-------|
| 1 | `CHOLERA` | 64 | `WOUND_AGENT` |
| 2 | `INFLUENZA` | 128 | `NERVE_AGENT` |
| 4 | `SALMONELLA` | 256 | `HEAVYMETAL` |
| 8 | `BRAIN` | | |
| 16 | `FOOD_POISON` | | |
| 32 | `CHEMICAL_POISON` | | |

### `AgentBase` contract (`transmissionagents/agents/agentbase.c`)

Each concrete agent (e.g. `CholeraAgent`, `choleraagent.c`) sets in `Init()`:

| Field | Meaning |
|-------|---------|
| `m_Type` | `eAgents` bit |
| `m_Invasibility` | Growth rate |
| `m_TransferabilityIn` / `Out` | Transmission to/from player |
| `m_Digestibility` | Stomach-digestion multiplier |
| `m_MaxCount` | Cap |
| `m_AntibioticsResistance` | [0..1] — resistance to antibiotics |
| `m_Potency` | `EStatLevels` — grows only when immunity ≤ potency |
| `m_DieOffSpeed` | Die-off rate |
| `m_AutoinfectCount` / `m_AutoinfectProbability` | Auto-infection parameters |

Concrete agents: `CholeraAgent`, `InfluenzaAgent`, `SalmonellaAgent`, `BrainAgent`, `FoodPoisonAgent`, `ChemicalAgent`, `WoundAgent`, `NerveAgent`, `HeavyMetalAgent`.

### `PlayerAgentPool` (`transmissionagents/playeragentpool/playeragentpool.c`)

Holds `m_VirusPool` (map<agentId, count>) and `m_AgentMask`. Entry point:

```c
void ImmuneSystemTick(value, deltaT)   // :42
  = ProcessTemporaryResistance + SpawnAgents + GrowAgents
```

`GrowAgents(dt)` (`:55`) — for each agent in pool, compares `agentPotency` vs player's `GetImmunityLevel()`:
- `potency <= immunityLevel` → grows by `invasibility * deltaT` (unless temp-resistance or antibiotics/chelation blocks it)
- else → dies off by `dieOffSpeed * deltaT`, clamped to `[0, maxCount]`

### How agents link to modifiers

1. **Agents enter** the pool via `PlayerBase.InsertAgent(agent, count)` (`playerbase.c:7514`) → `m_AgentPool.AddAgent` (drinking contaminated water, wound exposure, gas cloud, cannibalism…).
2. **`ImmuneSystemMdfr`** (`immunesystem.c`) is **always active**. Its `OnTick` (`:34`) calls `player.ImmuneSystemTick(result, deltaT)` (`playerbase.c:7544`) → `PlayerAgentPool.ImmuneSystemTick` → agent growth/die-off. It also toggles `NTF_SICK` / `NTF_PILLS` based on `player.HasDisease()` / `HasHealings()`.
3. **Disease modifiers poll agent counts** in their `ActivateCondition`/`DeactivateCondition` via `player.GetSingleAgentCount(eAgents.XXX)` (`playerbase.c:7520`) and `player.GetSingleAgentCountNormalized(...)` (`:7526`).

---

## Notifiers — The HUD Layer

### `NotifierBase` contract (`playernotifiers/notifierbase.c`)

Each notifier observes one stat and drives a HUD badge + tendency arrow:

| Hook | Purpose |
|------|---------|
| `GetNotifierType()` | → `eNotifiers` |
| `GetObservedValue()` `:186` | The stat to watch (e.g. `m_Player.GetStatEnergy().Get()`) |
| `DisplayBadge()` / `HideBadge()` `:183-184` | Show/hide HUD badge |
| `DisplayTendency(float delta)` `:67` | Trend arrow via `CalculateTendency` (`:149`) + `DisplayElementTendency` on VirtualHud |

`OnTick(current_time)` (`:137`): `DisplayBadge()` → buffer observed value → once buffer full (`m_TendencyBufferSize = 3`), `DisplayTendency(GetDeltaAvaraged())`. The cyclic buffer computes a moving-average delta for the trend arrow.

### `eNotifiers` enum (`notifiersmanager.c:1-23`)

`NTF_HEALTHY, NTF_BLEEDISH, NTF_HUNGRY, NTF_THIRSTY, NTF_STUFFED, NTF_SICK, NTF_WETNESS, NTF_WARMTH, NTF_FEVERISH, NTF_BLOOD, NTF_LIVES, NTF_STAMINA, NTF_PILLS, NTF_HEARTBEAT, NTF_FRACTURE, NTF_LEGS`.

### Manager & registration

`NotifiersManager.Init()` (`:46`) registers: `HungerNotfr, ThirstNotfr, WarmthNotfr, WetnessNotfr, HealthNotfr, FeverNotfr, SickNotfr, StuffedNotfr, BloodNotfr, PillsNotfr, HeartbeatNotfr, FracturedLegNotfr, InjuredLegNotfr`.

`OnScheduledTick()` (`:97`) → `TickNotifiers()` (`:105`) loops each active notifier.

### Connection to modifiers/stats

Notifiers are **largely decoupled** — they read stats directly (`GetStatEnergy().Get()`) rather than being driven by modifiers. The two exceptions are `NTF_SICK` and `NTF_PILLS`, explicitly toggled by `ImmuneSystemMdfr` (`immunesystem.c:45/61`) based on disease/healing state.

Files in `playernotifiers/notifiers/`: `agentsnotfr.c, bleedingnotfr.c, bloodnotfr.c, fevernotfr.c, fracturedlegnotfr.c, healthnotfr.c, heartbeatnotfr.c, hungernotfr.c, injuredlegnotfr.c, pillsnotfr.c, sicknotfr.c, stuffednotfr.c, thirstnotfr.c, warmthnotfr.c, wetnessnotfr.c`.

Example `HungerNotfr` (`hungernotfr.c`): `GetObservedValue()` returns `GetStatEnergy().Get()`; `DisplayTendency` uses `GetStatLevelEnergy()` to set seriousness on `DELM_TDCY_ENERGY`.

---

## End-to-End Example: Cholera

File: `modifiers/diseases/cholera.c`. The complete disease chain — agent entry → growth → modifier activation → stat drain → symptom animation → notifier.

```
1. INFECTION
   Player drinks contaminated water
      → PlayerBase.InsertAgent(eAgents.CHOLERA, count)   playerbase.c:7514
      → PlayerAgentPool.AddAgent
      → m_VirusPool[CHOLERA] += count

2. GROWTH  (every ImmuneSystemMdfr.OnTick)
   player.ImmuneSystemTick(result, deltaT)               playerbase.c:7544
      → PlayerAgentPool.GrowAgents
   CholeraAgent: m_Invasibility=0.15, m_Potency=HIGH,
                 m_MaxCount=1000, m_DieOffSpeed=0.45
   if immunityLevel >= potency → dies off
   else                         → climbs toward 1000

3. MODIFIER ACTIVATION  (CholeraMdfr.ActivateCondition, cholera.c:31)
   polled every DEFAULT_TICK_TIME_INACTIVE (3s)
   if GetSingleAgentCount(CHOLERA) >= AGENT_THRESHOLD_ACTIVATE (250)
      → ActivateRequest → Activate()
      → OnActivate (cholera.c:36):
           player.IncreaseDiseaseCount()    ◄── makes HasDisease() true
                                              → ImmuneSystemMdfr toggles NTF_SICK
           QueueSymptom(SYMPTOM_VOMIT, 4-8s)

4. ON TICK  (every DEFAULT_TICK_TIME_ACTIVE = 3s while active, cholera.c:63)
   player.GetStatWater().Add(-waterLoss * normalizedAgentCount)
   if stomach volume >= 200:
      roll vomit chance; on success:
         QueueSymptom(SYMPTOM_VOMIT)
         GetStatWater().Add(-450)     ◄── WATER_DRAIN_FROM_VOMIT
         GetStatEnergy().Add(-310)    ◄── ENERGY_DRAIN_FROM_VOMIT
         ActivateModifier(MDF_VOMIT_EXHAUSTION, 30s)

5. VOMIT SYMPTOM  (vomitstate.c)
   OnGetActivatedServer → play CMD_ACTIONFB_VOMIT (full-body, priority 100, preempts)
   OnAnimationStart     → reduce stomach contents; if contaminated: -250 blood
   OnAnimationFinish    → deplete stamina

6. DEACTIVATION  (CholeraMdfr.DeactivateCondition, cholera.c:58)
   if GetSingleAgentCount(CHOLERA) <= AGENT_THRESHOLD_DEACTIVATE (50)
      → OnDeactivate:
           clear stamina exhaustion modifiers
           player.DecreaseDiseaseCount()
              → if no diseases left, NTF_SICK toggles off
```

**Full chain:** agent enters pool → `ImmuneSystemMdfr` grows it → `CholeraMdfr` activates at threshold → `OnActivate` queues vomit symptom + flags sick notifier → `OnTick` drains water/energy stats and re-queues vomit → symptom plays anim + drains stamina/blood → at low threshold `CholeraMdfr` deactivates, clears notifier.

---

## Related Handlers (adjacent systems)

| File | Class | Role |
|------|-------|------|
| `injuryhandler.c` | `InjuryAnimationHandler` | `Update(dt)` (`:80`) sets the injured additive locomotion animation based on health-derived `eInjuryHandlerLevels` — separate from modifiers (drives animation, not stats) |
| `shockhandler.c` | `ShockHandler` | `Update(dt)` (`:44`) accumulates shock and fires unconsciousness threshold checks (`CheckValue`, `:108`); interacts with `MDF_SHOCK` / `MDF_UNCONSCIOUSNESS` |
| `staminahandler.c` | `StaminaHandler` | Stamina drain/regen — see [Stamina](/world-gameplay/stamina) |
| `nutritionalprofile.c` | `NutritionalProfile` | Defines energy/water/etc. indices for consumables (`GetNutritionalIndex`); feeds the stomach/stat system |
| `playerstomach.c` | `PlayerStomach` | Stomach contents & digestion → feeds `StomachMdfr` |

---

## How to Add a Custom Modifier or Symptom (Modding)

1. **Create a class** extending `ModifierBase` (or `SymptomBase`), pick a new `MDF_*` / `SYMPTOM_*` ID from the enum (extend it).
2. **Override `Init()`** to set the ID, tick intervals, and flags.
3. **Override `ActivateCondition` / `DeactivateCondition` / `OnTick`** (modifier) or `CanActivate` / `OnUpdateServer` / `SpawnAnimMetaObject` (symptom).
4. **Register** it — `ModifiersManager.Init()` / `SymptomManager.Init()` are modded via `modded class` to `Insert` your new typename.
5. **Activate it** either via its `ActivateCondition` (poll-based) or `ActivateModifier(id)` (forced, e.g. from a drug's `OnStartServer` in the [User Actions System](./user-actions-system)).

See [Modding → Safe Patterns](/modding/safe-patterns).

---

## Directory Structure

```
classes/
├── playermodifiers/
│   ├── emodifiers.c                 MDF_* ID enum
│   ├── modifierbase.c               ModifierBase root
│   ├── modifiersmanager.c           Manager + eModifierSyncIDs + tick constants
│   └── modifiers/
│        ├── hunger.c thirst.c stomach.c healthregen.c bloodregen.c
│        ├── immunesystem.c heatcomfortmdfr.c shock.c …
│        ├── conditions/             bleeding.c brokenlegs.c fever.c
│        │                           heartattack.c poisoning.c …
│        ├── diseases/               cholera.c influenza.c salmonella.c
│        │                           commoncold.c braindisease.c
│        │                           woundinfection.c contamination.c
│        │                           heavymetal.c pneumonia.c
│        └── (drugs)                 antibiotics.c charcoalmdfr.c morphinemdfr.c
│                                    painkillersmdfr.c epinephrinemdfr.c …
├── playersymptoms/
│   ├── statemanager.c               SymptomManager + SymptomIDs enum
│   ├── statebase.c                  SymptomBase root
│   ├── statecb.c                    SymptomCB (anim callback)
│   ├── smptanimmeta.c               SmptAnimMetaBase
│   └── states/
│        ├── primary/                cough vomit sneeze gasp freeze hot
│        │                           painlight painheavy laughter
│        └── secondary/              blindness bloodloss bullethit
│                                    deafnesscomplete feverblur handshivers hmp3
├── playernotifiers/
│   ├── notifierbase.c
│   ├── notifiersmanager.c           eNotifiers enum + Init/registration
│   └── notifiers/                   hungernotfr.c thirstnotfr.c warmthnotfr.c
│                                    wetnessnotfr.c healthnotfr.c fevernotfr.c
│                                    sicknotfr.c stuffednotfr.c bloodnotfr.c
│                                    pillsnotfr.c heartbeatnotfr.c fracturedlegnotfr.c …
├── transmissionagents/
│   ├── agents/agentbase.c           AgentBase root
│   ├── agents/                      choleraagent.c influenzaagent.c …
│   └── playeragentpool/playeragentpool.c   PlayerAgentPool
├── playerstats/
│   ├── playerstatbase.c             PlayerStatBase + PlayerStat<T>
│   └── playerstatspco.c             Stat registration (versioned PCO)
├── nutritionalprofile.c             NutritionalProfile
├── playerstomach.c                  PlayerStomach
├── injuryhandler.c                  InjuryAnimationHandler
└── shockhandler.c                   ShockHandler
```

---

## Related Documentation

- [Player Stats](/world-gameplay/player-stats) — gameplay-facing stat thresholds, metabolic rates, values
- [Stamina System](/world-gameplay/stamina) — stamina handler deep-dive
- [Damage & Combat](./damage-combat) — health/blood and the engine damage system that modifiers react to
- [Effect System](./effect-system) — the post-processing & particle effects symptoms trigger (fever blur, blood loss darkening)
- [Player System](./player-system) — `PlayerBase` lifecycle that owns these managers
- [User Actions System](./user-actions-system) — drug/medical item actions call `ActivateModifier` from `OnStartServer`
- [Script Layers → Layer 4](/script-layers/4-world) — file-by-file index
