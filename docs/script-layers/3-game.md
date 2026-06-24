# Layer 3: Game Logic (`3_game/`)

**Directory**: `/p/scripts/3_game/`

Layer 3 is the **heart of DayZ's game logic**. It contains the DayZ-specific implementation of the `Game` base class, the player entity, AI, damage systems, effects, weather, vehicles, inventory, and all core gameplay mechanics. This is the largest layer, containing ~250+ files.

## Complete File Index

### Actor / Character Files

| File | Lines | Purpose |
|------|-------|---------|
| `human.c` | ~1,700 | `Human` class, input controller, movement/combat/death commands |
| `dayzplayer.c` | ~1,400 | `DayZPlayer`, camera system, weapon handling, aiming model |
| `dayzcreature.c` | `DayZCreature` — Creature base |
| `dayzcreatureai.c` | `DayZCreatureAI` — AI-driven creature |
| `humansettings.c` | `SHumanGlobalSettings`, `SHumanCommandMoveSettings` — Human movement physics settings |
| `humanitems.c` | `HumanItemBehaviorCfg` — Per-item stance/movement/IK configuration |
| `playerconstants.c` | ~270 | Player stat thresholds, metabolic rates |
| `hitinfo.c` | `HitInfo` — Native hit information wrapper (ammo, position, surface) |
| `killerdata.c` | `KillerData` — Tracking killer, murder weapon, and fatal hit info |
| `inventoryitemtype.c` | `InventoryItemType` — Inventory item type sound event binding |

### Core Game Systems

| File | Lines | Purpose |
|------|-------|---------|
| `dayzgame.c` | ~3,900 | `DayZGame` singleton, game state machine, session management |
| `game.c` | `CGame CreateGame()` — Game factory entry point |
| `gameplay.c` | ~1,500 | Serialization, RPC, world objects, UI widgets |
| `xboxdemogame.c` | Xbox demo mode globals (player class, weather, time of day) |
| `modinfo.c` | `ModInfo` — Mod metadata query API (name, author, version, logo) |

### Constants, Enums & Config

| File | Purpose |
|------|---------|
| `constants.c` | Game enums (chat, voice, hit direction, object intersection) |
| `colors.c` | `Colors` — X11 color constants and damage/health color codes |
| `econtrolschemestate.c` | `EControlSchemeState` — Input control scheme states (IronSight, Gun, Melee, Vehicle, UI) |
| `efireignitetype.c` | `EFireIgniteType` — Fire ignition methods (Matchbox, Roadflare, HandDrill) |
| `controlschememanager.c` | `ControlSchemeManager` — Control scheme setter (legacy stub) |
| `cfggameplaydatajson.c` | `CfgGameplayJson` + `ITEM_DataBase` — cfggameplay.json data model |
| `cfggameplayhandler.c` | `CfgGameplayHandler` — cfggameplay.json loader, validator, and server sync |
| `cfgplayerrestrictedareahandler.c` | `CfgPlayerRestrictedAreaHandler` — Player restricted area JSON loader |
| `cfgplayerrestrictedareajsondata.c` | `CfgPlayerRestrictedAreaJsonData` — Restricted area shape/instance definitions |

### Damage, Combat & Effects

| File | Lines | Purpose |
|------|-------|---------|
| `damagesystem.c` | ~160 | Static damage utilities (melee, explosion, firearm) |
| `effect.c` | ~650 | `Effect` base class (particle and sound effects) |
| `effectmanager.c` | ~875 | `SEffectManager` — effect lifecycle management |
| `ppeffects.c` | ~20,300 | Post-processing effects (bloom, color grading) |
| `ammocamparams.c` | `AmmoCamParams` — Camera shake parameters per ammo type |
| `ammoeffects.c` | `AmmoEffects` — Static ammo config data (particles, effects per ammo type) |
| `impacteffects.c` | `ImpactTypes` enum, `ImpactEffectsData`, `ImpactMaterials` — Bullet/melee impact handling |
| `bleedchancedata.c` | `BleedChanceData` — Bleeding probability tables per damage type (melee, infected) |
| `gameplayeffectwidgets_base.c` | `GameplayEffectWidgets_base` — Abstract base for gameplay effect widget integration |

### Weather & Environment

| File | Lines | Purpose |
|------|-------|---------|
| `weather.c` | ~13,400 | Weather simulation (rain, fog, wind, cloud cover) |
| `worlddata.c` | ~15,900 | World state management |
| `worldlighting.c` | World lighting configuration |
| `debugweatherrpcdata.c` | `DebugWeatherRPCData` — Weather debug RPC data transfer object |
| `undergroundarealoader.c` | `JsonUndergroundTriggers`, `JsonUndergroundAreaBreadcrumb`, `JsonUndergroundAreaTriggerData` — Underground area JSON loading |
| `triggercarrierbase.c` | `UndergroundTriggerCarrierBase` — ScriptedEntity for underground trigger carriers |
| `persistentflag.c` | `PersistentFlag` — Player-persistent boolean flags (e.g. area presence) |

### Audio

| File | Purpose |
|------|---------|
| `sound.c` | `WaveKind` and `SoundControllerAction` enums for audio system |
| `vonmanager.c` | Voice-over-network (proximity chat, radio) |
| `dayzanimevents.c` | `AnimSurfaces` enum — Animation surface type definitions |
| `dayzanimeventmaps.c` | `SoundLookupTable` — Animated sound builder lookup tables |
| `noise.c` | `NoiseSystem`, `NoiseParams` — AI noise generation system |

### AI

| File | Purpose |
|------|---------|
| `aibehaviour.c` | AI behavior definitions |
| `noise.c` | Noise generation for AI perception |

### Entity Hierarchy (`entities/`)

| File | Class |
|------|-------|
| `object.c` | `Object` — Base world object (transform, geometry, rendering) |
| `objecttyped.c` | `ObjectTyped` — Typed object with config type system |
| `entity.c` | `Entity` — Animation phases, simulation control, bone access |
| `entityai.c` | `EntityAI` — Damage zones, inventory slots, AI awareness |
| `building.c` | `Building` — Static buildings |
| `camera.c` | `Camera` — Camera objects |
| `inventoryitem.c` | `InventoryItem` — Carryable items |
| `scriptedentity.c` | `ScriptedEntity` — User-defined entities |
| `bullettypes.c` | Bullet type definitions for ballistics |
| `dayzaihitcomponents.c` | AI hit zone / component definitions |
| `soundonvehicle.c` | Vehicle-attached sound sources |

**Creature & Character entities** (see also root-level character files):

| File | Class |
|------|-------|
| `pawn.c` | `Pawn` — Animated character with physics |
| `man.c` | `Man` / `Person` — Humanoid base |
| `dayzcreature.c` | `DayZCreature` — Creature base |
| `dayzcreatureai.c` | `DayZCreatureAI` — AI-driven creature |
| `dayzanimal.c` | `DayZAnimal` — Wildlife |
| `dayzanimalinputcontroller.c` | Animal-specific input controller |
| `dayzanimaltype.c` | Animal type definitions |
| `dayzcreatureaiinputcontroller.c` | Creature AI input controller |
| `dayzcreatureaitype.c` | Creature AI type definitions |
| `dayzinfected.c` | `DayZInfected` — Zombies |
| `dayzinfectedinputcontroller.c` | Infected input controller |
| `dayzinfectedtype.c` | Infected type definitions |
| `entityai.c` | `EntityAI` — Damage zones, inventory, inventory slots |

**Vehicles & Light sources**:

| File | Class |
|------|-------|
| `transport.c` | `Transport` — Base vehicle |
| `entitylightsource.c` | Entity-attached light sources |

### Utility & Infrastructure

| File | Purpose |
|------|---------|
| `progressasync.c` | `ProgressAsync` — Native async progress bar API |
| `canvas.c` | `Canvas` — Debug pixel-art painting utility |
| `billboardset.c` | `BillboardSetHandler` — Billboard configuration and rendering |
| `hiddenselectionsdata.c` | `HiddenSelectionsData` — Config-to-runtime hidden selections loader |
| `surfaceinfo.c` | `SurfaceInfo` — CfgSurfaces runtime query API |
| `objectspawner.c` | `ObjectSpawnerHandler` — JSON-based object spawning system |
| `remotelyactivateditembehaviour.c` | `RemotelyActivatedItemBehaviour` — Remote pairing for trigger/receiver items |
| `syncevents.c` | `SyncEvents` — Synchronized multiplayer event system |
| `isboxcollidinggeometryproxyclasses.c` | `BoxCollidingParams`, `BoxCollidingResult`, `ComponentInfo` — Box geometry collision proxy |
| `inventoryitemtype.c` | `InventoryItemType` — Item type sound event loading |

### Enums (`enums/`)

The `enums/` directory contains **29 enum definition files** that define the game's state machines, RPC identifiers, and type classifications:

| File | Enums Defined |
|------|---------------|
| `eactions.c` | Action type constants |
| `eagents.c` | Disease/agent identifiers |
| `eanimsoundeventid.c` | Animation sound event IDs |
| `ebrokenlegs.c` | Broken leg state flags |
| `ebuildinglocktypes.c` | Building lock types |
| `ecamerazoomtype.c` | Camera zoom modes |
| `echargender.c` | Character gender |
| `econsumetype.c` | Consumption types |
| `econsumptionpenaltycontext.c` | Consumption penalty contexts |
| `econtaminationtypes.c` | Contamination zone types |
| `ecrewmemberstate.c` | Vehicle crew member states |
| `edayzprofilesoptions.c` | DayZ profile options |
| `ediagmenuids.c` | Diagnostic menu IDs |
| `edynamicmusicplayercategory.c` | Dynamic music categories |
| `eenvironmenttemperaturecomponent.c` | Environment temperature components |
| `egamestateicons.c` | Game state UI icons |
| `emedicaldrugstype.c` | Medical drug types |
| `emeleetargettype.c` | Melee target types |
| `emixedsoundstates.c` | Mixed sound states |
| `eplayerstates.c` | Player FSM states |
| `epulsetype.c` | Pulse types |
| `erpcs.c` | RPC identifier codes |
| `estaminaconsumers.c` | Stamina consumer types |
| `estaminamodifiers.c` | Stamina modifier types |
| `estatlevels.c` | Stat level thresholds |
| `esyncevent.c` | Synchronized event types |
| `etimeofday.c` | Time of day periods |
| `etransformationaxis.c` | Transformation axes |
| `ewaterlevels.c` | Water level states |
| `ewatersourceobjecttype.c` | Water source types |

### Subdirectory Systems

#### Animation (`anim/`)

| File | Purpose |
|------|---------|
| `animcommand.c` | Animation command base interface |
| `animphysagent.c` | Animation physics agent for physical interaction |

#### Automated Testing (`autotest/`)

| File | Purpose |
|------|---------|
| `autotestconfighandler.c` | Auto-test configuration handler |
| `autotestconfigjson.c` | Auto-test JSON config data |
| `autotestfixture.c` | Test fixture base class |
| `autotestrunner.c` | Test runner (executes automated test suites) |

#### Central Economy (`ce/`)

| File | Purpose |
|------|---------|
| `centraleconomy.c` | Central economy system (server-authoritative loot distribution) |

#### Client Systems (`client/`)

| File | Purpose |
|------|---------|
| `clientdata.c` | Client-side data storage |
| `onlineservices.c` | Online service integration |
| `syncdata.c` | Client sync data management |
| `syncentitykill.c` | Entity kill synchronization |
| `syncplayer.c` | Player state synchronization |
| `syncplayerlist.c` | Player list synchronization |
| `mods/modloader.c` | Mod loading and management |
| `mods/modstructure.c` | Mod structure definitions |
| `notifications/notificationdata.c` | Notification data model |
| `notifications/notificationsystem.c` | Notification delivery system |
| `notifications/notificationui.c` | Notification UI rendering |

#### Effects (`effects/`)

| Directory | Contents |
|-----------|----------|
| `backlit/` | Backlit rendering effects |
| `destructioneffects/` | Destruction visual effects base |
| `effectparticle/` | Particle-based effects (bullet impacts, bleeding, vomit, vehicle smoke, etc.) |
| `effectparticle/bulletimpactbase/` | Per-surface bullet impact effects (concrete, dirt, glass, metal, wood, etc.) |
| `effectparticle/player/` | Player-specific particle effects (breath vapour) |
| `effectparticle/vehiclesmoke/` | Vehicle smoke effects (coolant, engine, exhaust) |

#### Global Functions (`global/`)

| File | Purpose |
|------|---------|
| `ammotypes.c` | Ammo type definitions |
| `dayzphysics.c` | Physics global functions |
| `game.c` | Global game access functions |
| `pboapi.c` | PBO file API |
| `uuid.c` | UUID generation |
| `world.c` | World global functions |
| `errormodulehandler/` | Error dialog module handler (BIOS, kick, connect errors) |

#### GUI Components (`gui/`)

| Directory | Contents |
|-----------|----------|
| `containers/` | Scrollbar, size-to-child container widgets |
| `credits/` | Credits screen JSON loader |
| `dlcs/` | DLC info data loader |
| `effects/` | Widget visual effects (bouncer, hover, radial menu) |
| `hints/` | Hint panel system |
| `spacers/` | Layout spacer widgets (horizontal, vertical, auto-height) |

#### Particles (`particles/`)

| File | Purpose |
|------|---------|
| `particle.c` | Particle wrapper |
| `particlebase.c` | Particle base class |
| `particlelist.c` | Particle list management |
| `particlemanager/particlemanager.c` | Particle system manager |
| `particlemanager/particlesource.c` | Particle source definition |
| `tests/` | Particle unit tests |

#### Post-Processing (`ppemanager/`)

| Directory | Contents |
|-----------|----------|
| `ppeconstants.c` | PPE constants |
| `ppemanager.c` | PPE manager (orchestrates post-processing stack) |
| `pperequestdata.c` | PPE request data |
| `pperequesterbank.c` | PPE requester registration |
| `materials/matclasses/` | Per-effect material classes (bloom, color grading, DOF, god rays, snow, etc.) |
| `materials/matparameters/` | Per-parameter material wrappers (bool, float, int, color, texture) |
| `requesters/` | PPE requesters for specific game states (blood loss, fever, underwater, shock, etc.) |

#### Static Utilities (`static/`)

| File | Purpose |
|------|---------|
| `easing.c` | Easing functions (EaseInOutExpo, etc.) |
| `timeaccel.c` | Time acceleration utilities |

#### Tools (`tools/`)

| File | Purpose |
|------|---------|
| `bitarray.c` | Bit-level array operations |
| `blend2d.c` | 2D blending utilities |
| `cameratools.c` | Camera manipulation tools |
| `component.c` | Component base class |
| `componentsbank.c` | Component registry |
| `debug.c` | Debug utilities |
| `debugprint.c` | Debug print helpers |
| `dispatcher.c` | Event dispatcher |
| `input.c` | Input handling utilities |
| `inpututils.c` | Additional input helpers |
| `jsonfileloader.c` | JSON file loading |
| `jsonobject.c` | JSON object parsing |
| `keystouielements.c` | Key-to-UI binding |
| `logtemplates.c` | Log message templates |
| `simplecircularbuffer.c` | Circular buffer implementation |
| `simplemovingaverage.c` | Moving average calculation |
| `timeconversions.c` | Time unit conversion helpers |
| `tools.c` | General-purpose utility set |
| `uimanager.c` | UI manager base |
| `uiscriptedmenu.c` | Scripted menu helpers |
| `uiscriptedwindow.c` | Scripted window helpers |
| `utilityclasses.c` | General utility classes |
| `vector2.c` | 2D vector operations |
| `component/bodystaging.c` | Body staging component |
| `component/componentanimalbleeding.c` | Animal bleeding component |
| `component/componentenergymanager.c` | Energy manager component |
| `component/componententitydebug.c` | Entity debug component |
| `component/_constants.c` | Component system constants |

#### Supplementary Systems

| System | Located At | Purpose |
|--------|------------|---------|
| **FSM Framework** | `systems/fsmbase.c`, `systems/hfsmbase.c`, `systems/ofsmbase.c` | Finite, hierarchical, and orthogonal state machines |
| **Actions** | `systems/actions/` | Action base and input classes |
| **AI System** | `systems/ai/` | AI target callbacks |
| **Animal Catching** | `systems/animalcatching/` | Animal trapping mechanics |
| **Arrow Manager** | `systems/arrowmanager/` | Arrow projectile management |
| **Dynamic Music** | `systems/dynamicmusicplayer/` | Zone-based dynamic music system |
| **Inventory** | `systems/inventory/` | FSM-driven inventory system (30+ files) |
| **Temperature Access** | `systems/temperatureaccess/` | Temperature zone component and manager |
| **Universal Temperature** | `systems/universaltemperaturesource/` | Generic temperature source system |
| **Unit Tests** | `systems/tftests/` | Profiler and Invoker tests |
| **Test Framework** | `systems/testframework.c` | General test framework |
| **Hive** | `hive/hive.c` | DayZ persistence layer (database sync) |
| **HTTP** | `http/backendapi.c`, `http/jsonapi.c`, `http/jsonapistruct.c`, `http/restapi.c` | HTTP networking: Backend API, JSON API data model, REST API client |
| **Input API** | `inputapi/uainput.c` | Raw input device abstraction |
| **Analytics** | `analytics/analyticsmanagerclient.c`, `analyticsmanagerserver.c`, `scriptanalytics.c` | Telemetry and analytics (client/server data collection) |
| **Services** | `services/` — `achievementsxbox.c`, `biosclientservices.c`, `bioslobbyservice.c`, `biospackageservice.c`, `biosprivacyservice.c`, `biossessionservice.c`, `biossocialservice.c`, `biosusermanager.c`, `contentdlc.c`, `trialservice.c` | Platform services (Xbox achievements, BIOS client/lobby/package/session/social, DLC content, trial licensing) |

## Main Systems

### DayZGame (`dayzgame.c`)

The singleton game instance, extending `Game` (from `2_gamelib`). Manages:

- **Game states**: `DayZGameState` enum — MAIN_MENU, LOGIN, PLAYING, etc.
- **Load states**: `DayZLoadState` enum — loading phase progression
- **Session management**: Connect/disconnect, login queue
- **Collision/projectile info**: ProjectileStoppedInfo, ObjectCollisionInfo, TerrainCollisionInfo
- **Crash sound sets**: Vehicle crash sound management

### DayZPlayer (`dayzplayer.c`)

The player avatar, extending `Human`. Key systems:

- **Camera system** (`DayZPlayerCamera`, `DayZPlayerCameraResult`): First person, third person, ironsights, free-look cameras
- **Aiming model** (`SDayZPlayerAimingModel`): Weapon handling and aiming mechanics
- **Heading model** (`SDayZPlayerHeadingModel`): Character rotation and heading
- **Animation type tables**: Player state to animation mapping

### Human (`human.c`)

Extends `Man`. Provides shared humanoid functionality:

- **HumanInputController**: Input abstraction for movement, aiming, stance, melee, weapon raise/ADS, freelook
- **Animation commands**: `HumanCommandMove`, `HumanCommandMelee`, `HumanCommandMelee2`, `HumanCommandFall`, `HumanCommandDeath`, `HumanCommandUnconscious`
- **HumanAnimInterface**: Animation state machine

### Inventory System (`systems/inventory/`)

A comprehensive FSM-driven inventory system (~30 files):

| File | Lines | Purpose |
|------|-------|---------|
| `inventory.c` | ~54,600 | Main inventory logic |
| `humaninventory.c` | ~23,250 | Human-specific inventory |
| `inventorylocation.c` | ~19,400 | Inventory location abstraction |
| `hand_fsm.c` | — | Hand state machine |
| `hand_actions.c` | — | Hand action definitions |
| `hand_states.c` | — | Hand state definitions |
| `cargo.c` | — | Cargo container logic |
| `inventoryslots.c` | — | Slot management |

### Effect System

- **`Effect`** base class (wraps `EffectParticle` and `EffectSound`): Autodestroy, event invokers (OnStarted, OnStopped)
- **`SEffectManager`**: Static singleton that registers, plays, and cleans up effects. Supports `PlayInWorld` and `PlayOnObject`
- **Effect subdirectories**: `effects/effectparticle/` (bullet impacts, player effects, vehicle smoke), `backlit/`, `destructioneffects/`

### AI System

- **`ai/`**: `aiagent.c`, `aigroup.c`, `aigroupbehaviour.c`, `aiworld.c`
- **`systems/ai/`**: Additional AI behavior definitions
- **`aibehaviour.c`**: Top-level AI behavior definitions

### Weather System (`weather.c`, ~13,400 lines)

Comprehensive weather simulation:
- Rain (intensity, accumulation)
- Fog (density, height)
- Wind (speed, direction)
- Cloud cover (overcast levels)
- Weather transitions

### Vehicle System

- **Transport** (`vehicles/transport.c`): Base vehicle simulation
- **Car** (`vehicles/car.c`): Wheeled vehicle physics
- **Boat** (`vehicles/boat.c`): Water vehicle physics
- **Helicopter** (`vehicles/helicopter.c`): Rotary-wing aircraft physics

### GUI System (`gui/`)

- `containers/` — Scrollbar, size-to-child containers
- `credits/` — Credits screen
- `dlcs/` — DLC-specific UI
- `effects/` — Bouncer, hover, radial menu, radial progress bar, rotator effects
- `hints/` — Hint panel system
- `spacers/` — Layout spacers

## Layer 3 Dependencies

Layer 3 depends on:
- **Layer 1** (`1_core/`): Constants, Param types, proto native functions (enmath, enphysics, etc.)
- **Layer 2** (`2_gamelib/`): `Game` base class, input manager, menu manager, ScriptCallQueue

Higher layers (4_world, 5_mission) depend on Layer 3.
