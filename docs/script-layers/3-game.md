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

**Root files:**

| File | Purpose |
|------|---------|
| `effectparticle.c` | Base particle effect wrapper |
| `effectsound.c` | Sound effect wrapper (`EffectSound`) |

**Backlit:**

| File | Purpose |
|------|---------|
| `backlit/backlit.c` | Backlit rendering effect for character/object lighting |

**Destruction Effects:**

| File | Purpose |
|------|---------|
| `destructioneffects/destructioneffectbase.c` | Base class for destruction visual effects |

**Effect Particles (`effectparticle/`):**

| File | Purpose |
|------|---------|
| `bleedingsource.c` | Bleeding source particle effect |
| `bloodsplatter.c` | Blood splatter particle effect |
| `bulletimpactbase.c` | Base bullet impact particle class |
| `bulletimpacttest.c` | Bullet impact test particle |
| `generatorsmoke.c` | Generator/exhaust smoke particle |
| `landmineexplosion.c` | Land mine explosion particle |
| `menucarenginesmoke.c` | Main menu car engine smoke |
| `menuevaporation.c` | Main menu evaporation effect |
| `swarmingflies.c` | Swarming flies particle (on corpses) |
| `vehiclesmoke.c` | Vehicle smoke base |
| `vomit.c` | Vomit particle effect |
| `vomitblood.c` | Blood vomit particle effect |

**Per-Surface Bullet Impacts (`effectparticle/bulletimpactbase/`):**

| File | Purpose |
|------|---------|
| `hit_concrete.c` | Concrete impact particles |
| `hit_dirt.c` | Dirt impact particles |
| `hit_error.c` | Error/fallback impact particles |
| `hit_foliage.c` | Foliage impact particles |
| `hit_foliage/hit_foliage_conifer.c` | Conifer foliage impact |
| `hit_foliage/hit_foliage_green.c` | Green foliage impact |
| `hit_glass.c` | Glass impact particles |
| `hit_glass_thin.c` | Thin glass impact particles |
| `hit_grass.c` | Grass impact particles |
| `hit_gravel.c` | Gravel impact particles |
| `hit_ice.c` | Ice impact particles |
| `hit_meatbones.c` | Meat/bone impact particles |
| `hit_meatbones/hit_meatbones_meleefist.c` | Melee fist on meat/bones |
| `hit_meatbones/hit_meatbones_meleepipewrench.c` | Melee pipe wrench on meat/bones |
| `hit_meatbones/hit_meatbones_meleeshovel.c` | Melee shovel on meat/bones |
| `hit_meatbones/hit_meatbones_meleewrench.c` | Melee wrench on meat/bones |
| `hit_metal.c` | Metal impact particles |
| `hit_plaster.c` | Plaster impact particles |
| `hit_plastic.c` | Plastic impact particles |
| `hit_rubber.c` | Rubber impact particles |
| `hit_sand.c` | Sand impact particles |
| `hit_snow.c` | Snow impact particles |
| `hit_textile.c` | Textile impact particles |
| `hit_undefined.c` | Undefined surface impact |
| `hit_water.c` | Water impact particles |
| `hit_wood.c` | Wood impact particles |

**Player Effects (`effectparticle/player/`):**

| File | Purpose |
|------|---------|
| `effbreathvapourheavy.c` | Heavy breath vapour effect |
| `effbreathvapourlight.c` | Light breath vapour effect |
| `effbreathvapourmedium.c` | Medium breath vapour effect |

**Vehicle Smoke (`effectparticle/vehiclesmoke/`):**

| File | Purpose |
|------|---------|
| `coolantsteam.c` | Coolant leak steam effect |
| `enginesmoke.c` | Engine damage smoke effect |
| `exhaustsmoke.c` | Exhaust smoke effect |

#### Global Functions (`global/`)

| File | Purpose |
|------|---------|
| `ammotypes.c` | Ammo type definitions |
| `dayzphysics.c` | Physics global functions |
| `game.c` | Global game access functions |
| `pboapi.c` | PBO file API |
| `uuid.c` | UUID generation |
| `world.c` | World global functions |
| `errormodulehandler/bioserrormodule.c` | BIOS error dialog module |
| `errormodulehandler/clientkickedmodule.c` | Client kick dialog module |
| `errormodulehandler/connecterrorclientmodule.c` | Client connection error dialog |
| `errormodulehandler/connecterrorscriptmodule.c` | Script connection error dialog |
| `errormodulehandler/connecterrorservermodule.c` | Server connection error dialog |
| `errormodulehandler/errorhandlermodule.c` | Base error handler module |
| `errormodulehandler/errormodulehandler.c` | Error module handler (manages error dialog stack) |
| `errormodulehandler/errorproperties.c` | Error property definitions |

#### GUI Components (`gui/`)

**Root files:**

| File | Purpose |
|------|---------|
| `embeded.c` | Embedded widget handling |
| `inventorygrid.c` | Inventory grid widget |
| `tabber.c` | Tabbed container widget |
| `widgetlayoutname.c` | Widget layout name utilities |

**Containers:**

| File | Purpose |
|------|---------|
| `containers/scrollbarcontainer.c` | Scrollbar container widget |
| `containers/sizetochild.c` | Size-to-child container widget |

**Credits:**

| File | Purpose |
|------|---------|
| `credits/creditsloader.c` | Credits screen loader |
| `credits/jsondatacredits.c` | Credits JSON data model |
| `credits/jsondatacreditsdepartment.c` | Credits department data |
| `credits/jsondatacreditssection.c` | Credits section data |

**DLCs:**

| File | Purpose |
|------|---------|
| `dlcs/dlcdataloader.c` | DLC data loader |
| `dlcs/jsondatadlcinfo.c` | DLC info JSON data |

**Widget Effects:**

| File | Purpose |
|------|---------|
| `effects/bouncer.c` | Bouncer widget animation |
| `effects/hovereffect.c` | Hover highlight effect |
| `effects/mainmenubuttoneffect.c` | Main menu button animation |
| `effects/radialmenu.c` | Radial menu rendering effect |
| `effects/radialprogressbar.c` | Radial progress bar effect |
| `effects/rotator.c` | Rotator widget animation |

**Hints:**

| File | Purpose |
|------|---------|
| `hints/hintpage.c` | Hint page data |
| `hints/uihintpanel.c` | UI hint panel widget |

**Spacers:**

| File | Purpose |
|------|---------|
| `spacers/autoheightspacer.c` | Auto-height spacer |
| `spacers/horizontalspacer.c` | Horizontal spacer |
| `spacers/horizontalspacerwithfixedaspect.c` | Fixed-aspect horizontal spacer |
| `spacers/itemscounter.c` | Items counter spacer |
| `spacers/noticespacer.c` | Notice spacer |
| `spacers/rightgap.c` | Right gap spacer |
| `spacers/spacerbase.c` | Base spacer class |
| `spacers/verticalspacer.c` | Vertical spacer |

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

**Root files:**

| File | Purpose |
|------|---------|
| `ppeconstants.c` | PPE constants |
| `ppemanager.c` | PPE manager (orchestrates post-processing stack) |
| `pperequestdata.c` | PPE request data structure |
| `pperequesterbank.c` | PPE requester registration bank |

**Base material class:**

| File | Purpose |
|------|---------|
| `materials/ppematclassesbase.c` | Base material class for PPE effects |

**Material Classes (`materials/matclasses/`):**

| File | Purpose |
|------|---------|
| `ppechromaber.c` | Chromatic aberration effect |
| `ppecolorgrading.c` | Color grading effect |
| `ppecolors.c` | Color adjustment effect |
| `ppedepthoffield.c` | Depth of field effect |
| `ppedistort.c` | Distortion effect |
| `ppedynamicblur.c` | Dynamic blur effect |
| `ppefilmgrain.c` | Film grain effect |
| `ppefxaa.c` | FXAA anti-aliasing |
| `ppegaussfilter.c` | Gaussian filter effect |
| `ppeghost.c` | Ghost/artifact effect |
| `ppeglow.c` | Glow/bloom effect |
| `ppegodrays.c` | God rays effect |
| `ppehbao.c` | HBAO ambient occlusion |
| `ppemedian.c` | Median filter effect |
| `ppenone.c` | Null/no-op effect |
| `pperadialblur.c` | Radial blur effect |
| `pperain.c` | Rain effect |
| `pperotblur.c` | Rotational blur effect |
| `ppesmaa.c` | SMAA anti-aliasing |
| `ppesnowfall.c` | Snowfall effect |
| `ppessao.c` | SSAO ambient occlusion |
| `ppesunmask.c` | Sun mask effect |
| `ppeunderwater.c` | Underwater effect |
| `ppewetdistort.c` | Wet lens distortion effect |

**Exceptions (platform-specific material overrides):**

| File | Purpose |
|------|---------|
| `matclasses/exceptions/ppedof.c` | DOF exception (platform override) |
| `matclasses/exceptions/ppeexposurenative.c` | Native exposure exception |
| `matclasses/exceptions/ppeeyeaccomodationnative.c` | Eye accommodation native exception |
| `matclasses/exceptions/ppelightintensityparamsnative.c` | Light intensity native params exception |

**Material Parameters (`materials/matparameters/`):**

| File | Purpose |
|------|---------|
| `ppematclassparameterbool.c` | Boolean parameter wrapper |
| `ppematclassparametercolor.c` | Color parameter wrapper |
| `ppematclassparametercommanddata.c` | Command data parameter |
| `ppematclassparameterfloat.c` | Float parameter wrapper |
| `ppematclassparameterint.c` | Integer parameter wrapper |
| `ppematclassparameterresource.c` | Resource parameter wrapper |
| `ppematclassparametertexture.c` | Texture parameter wrapper |
| `ppematclassparametervector.c` | Vector parameter wrapper |

**Requesters (game state → PPE effect bridges):**

| File | Purpose |
|------|---------|
| `requesters/pperbloodloss.c` | Blood loss visual effect |
| `requesters/pperburlapsack.c` | Burlap sack head covering effect |
| `requesters/ppercameraads_opt.c` | Camera ADS optics effect |
| `requesters/ppercameranv.c` | Night vision camera effect |
| `requesters/ppercontaminated.c` | Contaminated area effect |
| `requesters/ppercontrollerdisconnectblur.c` | Controller disconnect blur |
| `requesters/ppercontrolsblur.c` | Controls overlay blur |
| `requesters/pperdeathdarkening.c` | Death/darkening effect |
| `requesters/pperdrowningeffect.c` | Drowning visual effect |
| `requesters/pperequestplatformsbase.c` | Base platform requester |
| `requesters/pperfeedbackblur.c` | Feedback effect blur |
| `requesters/pperfever.c` | Fever visual effect |
| `requesters/pperflashbangeffects.c` | Flashbang effect |
| `requesters/pperglasses.c` | Eyewear/glasses effect |
| `requesters/pperhealthhit.c` | Health hit reaction effect |
| `requesters/pperhmp_lvl3.c` | HMP level 3 effect |
| `requesters/pperhmpghosts.c` | HMP ghosting effect |
| `requesters/pperintrochromabb.c` | Intro chromatic aberration |
| `requesters/pperinventoryblur.c` | Inventory open blur |
| `requesters/pperlatencyblur.c` | Network latency blur |
| `requesters/ppermenueffects.c` | Menu transition effects |
| `requesters/pperpain.c` | Pain reaction effect |
| `requesters/pperserverbrowser.c` | Server browser blur |
| `requesters/ppershockhit.c` | Shock damage hit effect |
| `requesters/pperspooky.c` | Spooky atmosphere effect |
| `requesters/ppertunnel.c` | Tunnel vision effect |
| `requesters/ppertutorial.c` | Tutorial overlay effect |
| `requesters/pperunconeffects.c` | Unconsciousness effect |
| `requesters/pperundergroundacco.c` | Underground accommodation effect |

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

**FSM Framework:**

| File | Purpose |
|------|---------|
| `systems/fsmbase.c` | Finite state machine base |
| `systems/hfsmbase.c` | Hierarchical finite state machine base |
| `systems/ofsmbase.c` | Orthogonal finite state machine base |
| `systems/testframework.c` | General test framework |

**Actions:**

| File | Purpose |
|------|---------|
| `systems/actions/actionbase_basic.c` | Basic action base class |
| `systems/actions/actioninput_basic.c` | Basic action input handling |

**AI System:**

| File | Purpose |
|------|---------|
| `systems/ai/aitarget_callbacks.c` | AI target event callbacks |

**Animal Catching:**

| File | Purpose |
|------|---------|
| `systems/animalcatching/catchingconstants.c` | Animal catching constants |
| `systems/animalcatching/catchingcontextbase.c` | Base catching context |
| `systems/animalcatching/catchingcontextpoissonbase.c` | Poisson-based catching context |
| `systems/animalcatching/catchingresultbasic.c` | Basic catching result |
| `systems/animalcatching/catchyieldbank.c` | Yield bank for catching |
| `systems/animalcatching/catchyielditembase.c` | Base yield item for catching |

**Arrow Manager:**

| File | Purpose |
|------|---------|
| `systems/arrowmanager/arrowmanagerbase.c` | Arrow projectile management base |

**Dynamic Music:**

| File | Purpose |
|------|---------|
| `systems/dynamicmusicplayer/dynamicmusicplayer.c` | Zone-based dynamic music player |
| `systems/dynamicmusicplayer/dynamicmusicplayerregistry.c` | Music player registry base |
| `systems/dynamicmusicplayer/dynamicmusicplayerregistrychernarus.c` | Chernarus music registry |
| `systems/dynamicmusicplayer/dynamicmusicplayerregistryenoch.c` | Enoch (Livonia) music registry |
| `systems/dynamicmusicplayer/dynamicmusicplayerregistrysakhal.c` | Sakhal music registry |

**Inventory System (`systems/inventory/`):**

| File | Purpose |
|------|---------|
| `inventory.c` | Main inventory logic (~54,600 lines) |
| `inventorylocation.c` | Inventory location abstraction |
| `inventoryslots.c` | Slot management |
| `inventoryinputuserdata.c` | Inventory input user data |
| `humaninventory.c` | Human-specific inventory |
| `humaninventorywithfsm.c` | Human inventory with FSM |
| `buildinginventory.c` | Building inventory |
| `transportinventory.c` | Vehicle/transport inventory |
| `weaponinventory.c` | Weapon inventory management |
| `cargo.c` | Cargo container logic |
| `junctures.c` | Inventory juncture handling |
| `debug.c` | Inventory debug utilities |
| `handfsm.c` | Hand state machine |
| `handstatebase.c` | Hand state base class |
| `handstablestate.c` | Hand stable state |
| `handstartaction.c` | Hand start action |
| `hand_actions.c` | Hand action definitions |
| `hand_events.c` | Hand event definitions |
| `hand_states.c` | Hand state definitions |
| `hand_guards.c` | Hand guard conditions |
| `handanimated_guards.c` | Animated hand guard conditions |
| `handanimatedforceswapping.c` | Animated forced item swapping |
| `handanimatedswapping.c` | Animated item swapping |
| `handanimatedmovingtoatt.c` | Animated move to attachment |
| `handanimatedtakingfromatt.c` | Animated take from attachment |
| `handreplacingiteminhands.c` | Replace item in hands |
| `handreplacingitemelsewherewithnewinhands.c` | Replace item elsewhere with new in hands |
| `replaceitemwithnewlambdabase.c` | Lambda base for item replacement |

**Temperature Access:**

| File | Purpose |
|------|---------|
| `systems/temperatureaccess/temperatureaccesscomponent.c` | Temperature zone component |
| `systems/temperatureaccess/temperatureaccessconstants.c` | Temperature access constants |
| `systems/temperatureaccess/temperatureaccessmanager.c` | Temperature access manager |
| `systems/temperatureaccess/temperatureaccesstypes.c` | Temperature access type definitions |
| `systems/temperatureaccess/temperaturedata.c` | Temperature data |

**Universal Temperature Source:**

| File | Purpose |
|------|---------|
| `systems/universaltemperaturesource/universaltemperaturesource.c` | Generic temperature source |
| `systems/universaltemperaturesource/universaltemperaturesourcelambdabase.c` | Temperature source lambda base |

**Unit Tests:**

| File | Purpose |
|------|---------|
| `systems/tftests/enprofilertests.c` | Enscript profiler tests |
| `systems/tftests/scriptinvokertests.c` | ScriptInvoker unit tests |

**Other Systems:**

| System | Files | Purpose |
|--------|-------|---------|
| **Hive** | `hive/hive.c` | DayZ persistence layer (database sync) |
| **HTTP** | `http/backendapi.c`, `http/jsonapi.c`, `http/jsonapistruct.c`, `http/restapi.c` | HTTP networking: Backend API, JSON API data model, REST API client |
| **Input API** | `inputapi/uainput.c` | Raw input device abstraction |
| **Analytics** | `analytics/analyticsmanagerclient.c`, `analyticsmanagerserver.c`, `scriptanalytics.c` | Telemetry and analytics |
| **Services** | `services/achievementsxbox.c`, `biosclientservices.c`, `bioslobbyservice.c`, `biospackageservice.c`, `biosprivacyservice.c`, `biossessionservice.c`, `biossocialservice.c`, `biosusermanager.c`, `contentdlc.c`, `trialservice.c` | Platform services |

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
