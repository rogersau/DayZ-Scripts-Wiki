# Layer 4: World (`4_world/`)

**Directory**: `/p/scripts/4_world/`

Layer 4 implements the **world simulation** — all gameplay classes, systems, and plugins that define how the game world behaves. This includes combat mechanics, player stats, inventory interaction, crafting, cooking, emotes, stamina, environmental effects, and the plugin architecture.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `classes/` | 77+ gameplay class files and subdirectories |
| `systems/` | Update-driven world systems |
| `plugins/` | Plugin base class and manager |
| `static/` | Static data and utility classes |

## Classes (`classes/`)

The `classes/` directory contains the bulk of world gameplay logic, organized as individual `.c` files and category subdirectories.

### Combat & Damage

| File/Directory | Purpose |
|----------------|---------|
| `areadamage/` | Area-of-effect damage (explosions, gas) |
| `arrowmanager/` | Arrow/projectile management |
| `basebuilding/` | Base building damage and construction |
| `bleedingindication/` | Visual bleed-out indicators |
| `bleedingsources/` | Bleeding source definitions |
| `bullethitreaction/` | Hit reaction for bullets |
| `destructioneffects/` | Destruction visual effects |
| `explosion.c` | Explosion handling |
| `explosions/` | Explosion sub-classes |
| `hitindication/` | Hit direction indicators |
| `injuryhandler.c` | Injury state management |
| `shockhandler.c` | Shock/knockout system |
| `shockhitreaction/` | Shock reaction behaviors |
| `recoilbase/` | Weapon recoil patterns |

### Player Systems

| File/Directory | Purpose |
|----------------|---------|
| `playergearspawn/` | Starting gear configuration |
| `playerlightmanager.c` | Player-attached light source |
| `playermodifiers/` | Active modifiers on player (effects, buffs, debuffs) |
| `playernotifiers/` | Player state notifications |
| `playerstats/` | Health, blood, energy, water, temperature stats |
| `playerstomach.c` | Digestion and stomach content |
| `playersymptoms/` | Symptom effects (disease, poisoning) |
| `staminahandler.c` | Stamina management |
| `staminamodifierdata.c` | Stamina modification data |
| `staminasoundhandler.c` | Stamina-related sounds (heavy breathing) |
| `softskillsmanager.c` | Soft skills progression |
| `quickbarbase.c` | Quick bar system |

### Interaction & Inventory

| File/Directory | Purpose |
|----------------|---------|
| `contextmenu.c` | Right-click context menu |
| `inventoryactionhandler.c` | Inventory action handling |
| `useractionscomponent/` | User action components |
| `craftingmanager.c` | Crafting system |
| `cooking/` | Cooking mechanics |
| `recipes/` | Recipe definitions |
| `writtennotedata.c` | Notes and writing |

### Environment & Effects

| File/Directory | Purpose |
|----------------|---------|
| `contaminatedarea/` | Contaminated zone effects (gas) |
| `environment/` | Environmental effects |
| `foodstage/` | Food decay stages |
| `heatcomfortanimhandler.c` | Temperature comfort animations |
| `objecttemperaturestatedata.c` | Object temperature states |
| `rainprocurementcomponent.c` | Rain collection |
| `rainprocurementhandler.c` | Rain collection handler |
| `rainprocurementmanager.c` | Rain collection manager |
| `soundevents/` | Sound event definitions |
| `soundhandlers/` | Sound event handlers |
| `transmissionagents/` | Disease transmission agents |
| `camerashake.c` | Camera shake effects |
| `kurushake.c` | Kuru disease shake effects |

### AI & Senses

| File/Directory | Purpose |
|----------------|---------|
| `emoteclasses/` | Emote animation classes |
| `emoteconstructor.c` | Emote construction |
| `emotemanager.c` | Emote management |
| `meleetargeting.c` | Melee targeting logic |

### UI Support

| File/Directory | Purpose |
|----------------|---------|
| `debugmonitorvalues.c` | Debug monitor data |
| `keybinding.c` | Key binding definitions |
| `mousebinding.c` | Mouse binding definitions |
| `mousebuttoninfo.c` | Mouse button information |
| `stanceindicator.c` | Stance indicator UI |
| `toggleselections.c` | Visual selection toggles |
| `virtualhud/` | Virtual HUD elements |
| `weapondebug.c` | Weapon debugging tools |

### Networking & Infrastructure

| File/Directory | Purpose |
|----------------|---------|
| `confighandler/` | Dynamic config handling |
| `messagereceiverbase.c` | Message receiver base class |
| `randomgeneratorsyncmanager.c` | Synced random number generation |
| `transfervalues.c` | Value transfer utilities |
| `undergroundbunkerhandlerclient.c` | Underground bunker handling |
| `undergroundhandlerclient.c` | Underground area handling |

### Other

| File/Directory | Purpose |
|----------------|---------|
| `corpsedata.c` | Corpse/loot data |
| `hologram.c` | Placement hologram system |
| `introscenecharacter.c` | Intro scene character setup |
| `lifespanlevel.c` | Item lifespan/durability |
| `nutritionalprofile.c` | Food nutritional values |
| `propertymodifiers.c` | Property modification system |
| `sceneeditor/` | Scene editor tools |
| `weapons/` | Weapon behavior classes |
| `worlds/` | World-specific classes |
| `modules/` | Gameplay modules |
| `debug/` | Debug utilities |
| `remoteplayerdebug/` | Remote player debugging |

## Entities (`entities/`)

The `entities/` directory contains class implementations for world objects, creatures, items, and player extensions.

### Root Level Files

| File | Class / Purpose |
|------|----------------|
| `dayzplayerimplement.c` | `DayZPlayerImplement` — Main player implementation entry point |
| `dayzplayerimplementaiming.c` | Player weapon aiming mechanics |
| `dayzplayerimplementfalldamage.c` | Fall damage calculation and application |
| `dayzplayerimplementheading.c` | Player heading/rotation control |
| `dayzplayerimplementjumpclimb.c` | Jump and climb movement mechanics |
| `dayzplayerimplementmeleecombat.c` | Melee combat implementation |
| `dayzplayerimplementswimming.c` | Swimming movement and physics |
| `dayzplayerimplementthrowing.c` | Item throwing mechanics |
| `dayzplayerimplementvehicle.c` | Vehicle enter/exit and passenger logic |
| `dayzplayersyncjunctures.c` | Player state juncture synchronization |
| `dayzplayerutils.c` | Player utility functions |
| `dayzspectator.c` | `DayZSpectator` — Free-fly spectator mode |
| `dayzanimalimplement.c` | `DayZAnimalImplement` — Animal entity implementation |
| `dayzinfectedimplement.c` | `DayZInfectedImplement` — Infected/zombie entity implementation |
| `itembase.c` | `ItemBase` — Root carryable item entity class |
| `manbase.c` | `ManBase` — Root humanoid entity class |
| `explosivesbase.c` | `ExplosivesBase` — Explosive device base entity |
| `gardenbase.c` | `GardenBase` — Garden plot and plant entity |
| `rockbase.c` | `RockBase` — Mineable rock resource entity |
| `woodbase.c` | `WoodBase` — Wooden base-building structure entity |
| `scriptedlightbase.c` | `ScriptedLightBase` — Script-controlled light source |
| `synchitinfo.c` | `SyncHitInfo` — Network-synchronized hit data |
| `undergroundstash.c` | Underground stash / burial container entity |
| `weaponparticles.c` | Weapon-attached particle effect definitions |
| `cluttercutter2x2.c` | 2×2 clutter cutting volume |
| `cluttercutter6x6.c` | 6×6 clutter cutting volume |
| `cluttercutterfireplace.c` | Fireplace-specific clutter cutting volume |

### Subdirectories

- `advancedcommunication/` — Radio towers, power poles, lamp posts, radio panels
- `building/` — Buildings with fireplaces, fuel stations, crash sites, outdoor thermometers; subdirectories for industrial, military, residential, specific, underground, and wrecks
- `core/` — Core entity types and inherited specializations (InventoryItem, Man, Building, LightAI, Plant)
- `creatures/` — Animal and infected entity definitions
- `effects/` — Visual effects entities attached to world objects
- `explosivesbase/` — Explosive device entity definitions
- `firearms/` — All firearm types (archery, automatic rifle, launcher, machine gun, pistol, rifle, shotgun, SMG) plus FSM behavior definitions
- `gardenbase/` — Garden plot and plant entity definitions
- `itembase/` — Carryable item entity types: base building, blood containers, clothing, containers, edible_base, fireplace, gear, inventory_base, magazines, seed packs, suppressors, switchable items, tents, transmitters, traps, trap spawns, vehicle batteries, weapon attachments
- `manbase/` — Humanoid entity bases including body parts, DayZPlayer implementation variants, and PlayerBase
- `scriptedentities/` — Script-defined trigger entities
- `scriptedlightbase/` — Scripted light sources (dimming, point, spot light bases)
- `vehicles/` — Vehicle entity definitions (inherited boats and cars)
- `woodbase/` — Wooden base-building entity definitions

## Systems (`systems/`)

Four world-spanning systems with their own update lifecycles:

| System | Purpose |
|--------|---------|
| `animalcatchingsystem/` | Animal trapping mechanics |
| `bot/` | Script-controlled debug bot player |
| `inventory/` | Inventory system (complementing the FSM in 3_game) |
| `universaltemperaturesource/` | Universal temperature source system |

## Plugins (`plugins/`)

A modular plugin architecture for registering features. Each plugin extends `PluginBase` and receives lifecycle callbacks.

### Core Files

- **`pluginbase.c`**: `PluginBase` class with `OnInit`, `OnUpdate`, `OnDestroy` lifecycle hooks and logging
- **`pluginmanager.c`**: `PluginManager` class with registration map, lifecycle management, and update queue integration with `CALL_CATEGORY_GAMEPLAY`

### Built-in Plugins (`pluginbase/`)

| Plugin | Purpose |
|--------|---------|
| `pluginadminlog.c` | Server admin action logging |
| `plugincameratools.c` | Camera manipulation tools (workbench) |
| `pluginconfigviewer.c` | Config file viewer |
| `plugindayzcreatureaidebug.c` | Creature AI debug visualization |
| `plugindayzinfecteddebug.c` | Infected AI debug visualization |
| `plugindayzplayerdebug.c` | Player debug and diagnostics |
| `plugindayzplayerdebug_ctrl.c` | Player debug controls |
| `plugindayzplayerdebug_othercmds.c` | Additional player debug commands |
| `plugindayzplayerdebug_weapons.c` | Weapon debugging tools |
| `plugindeveloper.c` | Developer mode features |
| `plugindevelopersync.c` | Developer synchronization tools |
| `pluginfilehandler.c` | File system operations |
| `pluginhorticulture.c` | Gardening/farming plugin |
| `pluginitemdiagnostic.c` | Item property diagnostics |
| `pluginkeybinding.c` | Custom key binding management |
| `pluginlifespan.c` | Item lifespan/durability tracking |
| `pluginmessagemanager.c` | Message/notification delivery |
| `pluginobjectsinteractionmanager.c` | World object interaction management |
| `pluginpermanentcrosshair.c` | Permanent crosshair display |
| `pluginplayerstatus.c` | Player status tracking and display |
| `pluginpresencenotifier.c` | Player presence notifications |
| `pluginrecipesmanager.c` | Crafting recipe management |
| `pluginrepairing.c` | Item repair mechanics |
| `pluginscenemanager.c` | Scene editor management |
| `pluginsounddebug.c` | Sound system debugging |
| `plugintransmissionagents.c` | Disease transmission agent management |
| `pluginvariables.c` | Variable inspection tools |

## Static Data (`static/`)

Static utility and data classes:

| File | Purpose |
|------|---------|
| `bloodtype.c` | Blood type definitions |
| `liquid.c` | Liquid type definitions |
| `surface.c` | Surface type definitions |
| `soundsetmap.c` | Sound set mapping |
| `miscgameplayfunctions.c` | Miscellaneous gameplay functions |
| `quantityconversions.c` | Quantity unit conversions |
| `paintitem.c` | Item painting utilities |
| `openitem.c` | Opening item containers |
| `betasound.c` | Sound helpers |
| `misceffects.c` | Miscellaneous effects |
| `sensesaievaluate.c` | `NoiseAIEvaluate` — AI noise evaluation based on player speed, shoes, and surface |

## Dependencies

Layer 4 depends on:
- **Layer 3** (`3_game/`): DayZGame, DayZPlayer, Human, entity hierarchy, effects
- **Layer 2** (`2_gamelib/`): Game base, input, menus, utilities
- **Layer 1** (`1_core/`): Constants, Param, proto natives
