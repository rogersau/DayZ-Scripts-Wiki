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

**Root files:**

| File | Purpose |
|------|---------|
| `explosion.c` | Explosion handling |
| `injuryhandler.c` | Injury state management |
| `shockhandler.c` | Shock/knockout system |

**Area Damage (`areadamage/`):**

| File | Purpose |
|------|---------|
| `areadamage.c` | Area damage base |
| `areadamageonetime.c` | One-time area damage |
| `areadamageonetimedeferred.c` | Deferred one-time area damage |
| `areadamageonetimeraycasted.c` | Raycasted one-time area damage |
| `areadamageonetimeraycasteddeferred.c` | Deferred raycasted one-time damage |
| `areadamageregular.c` | Regular (repeating) area damage |
| `areadamageregulardeferred.c` | Deferred regular area damage |
| `areadamageregularraycasted.c` | Raycasted regular area damage |
| `areadamageregularraycasteddeferred.c` | Deferred raycasted regular damage |
| `areadamagetrigger.c` | Area damage trigger |
| `areadamagenew/areadamageevents.c` | New area damage events |
| `areadamagenew/areadamagelooped.c` | Looped area damage |
| `areadamagenew/areadamageloopeddeferred.c` | Deferred looped area damage |
| `areadamagenew/areadamageloopeddeferred_novehicle.c` | No-vehicle deferred looped damage |
| `areadamagenew/areadamagemanager.c` | Area damage manager (new system) |
| `areadamagenew/areadamageonce.c` | Once-off area damage (new) |
| `areadamagenew/areadamagetriggerbase.c` | Trigger base (new) |
| `areadamagenew/areadamagetriggerdirect.c` | Direct trigger (new) |
| `areadamagenew/damagecomponents/areadamagecomponent.c` | Damage component base |
| `areadamagenew/damagecomponents/areadamagecomponentrandomhitzone.c` | Random hit zone component |
| `areadamagenew/damagecomponents/areadamagecomponentraycasted.c` | Raycasted damage component |

**Arrow Manager (`arrowmanager/`):**

| File | Purpose |
|------|---------|
| `arrowmanager/arrowmanagerplayer.c` | Player arrow/projectile management |

**Base Building (`basebuilding/`):**

| File | Purpose |
|------|---------|
| `basebuilding/construction.c` | Construction system |
| `basebuilding/constructionactiondata.c` | Construction action data |
| `basebuilding/constructionpart.c` | Construction part component |

**Bleeding Indication (`bleedingindication/`):**

| File | Purpose |
|------|---------|
| `bleedingindication/bleedingindicationconstants.c` | Bleeding indication constants |
| `bleedingindication/bleedingindicationstaticinfo.c` | Static bleeding info |

**Bleeding Sources (`bleedingsources/`):**

| File | Purpose |
|------|---------|
| `bleedingsources/bleedingsource.c` | Bleeding source base |
| `bleedingsources/bleedingsourcelocation.c` | Bleeding source location |
| `bleedingsources/bleedingsourcesmanagerbase.c` | Bleeding sources manager base |
| `bleedingsources/bleedingsourcesmanagerremote.c` | Remote client manager |
| `bleedingsources/bleedingsourcesmanagerserver.c` | Server-side manager |
| `bleedingsources/bleedingsourcezone.c` | Zone-based bleeding source |

**Bullet Hit Reaction (`bullethitreaction/`):**

| File | Purpose |
|------|---------|
| `bullethitreaction/bullethitreaction.c` | Bullet impact hit reaction behavior |

**Destruction Effects (`destructioneffects/`):**

| File | Purpose |
|------|---------|
| `destructioneffects/destructioneffects.c` | Destruction visual effects logic |

**Explosions (`explosions/`):**

| File | Purpose |
|------|---------|
| `explosions/flashbangeffect.c` | Flashbang explosion effect |

**Hit Indication (`hitindication/`):**

| File | Purpose |
|------|---------|
| `hitindication/hitdirectionarrow.c` | Arrow-direction hit indicator |
| `hitindication/hitdirectionbase.c` | Hit direction base class |
| `hitindication/hitdirectionspike.c` | Spike-direction hit indicator |
| `hitindication/hitdirectionsplash.c` | Splash-direction hit indicator |
| `hitindication/hitdirectionimages/hitdirectionimagesarrow.c` | Arrow image indicator |
| `hitindication/hitdirectionimages/hitdirectionimagesbase.c` | Image indicator base |
| `hitindication/hitdirectionimages/hitdirectionimagesspike.c` | Spike image indicator |
| `hitindication/hitdirectionimages/hitdirectionimagessplash.c` | Splash image indicator |

**Recoil (`recoilbase/`):**

| File | Purpose |
|------|---------|
| `recoilbase/recoilbase.c` | Weapon recoil base class |
| `recoilbase/recoils/ak101recoil.c` through `recoilbase/recoils/winchester70recoil.c` | Per-weapon recoil patterns (50+ files: ak101, ak74, akm, aks74u, aug, b95, colt1911, crossbow, cz527, cz550, cz75, deagle, default, derringer, fal, famas, fnx45, glock, izh18, izh18sawedoff, izh18shotgun, izh43, longhorn, m14, m16a2, m4a1, m79, magnum, makarov, mkii, mosin, mosinsawedoff, mp133, mp5k, p1, pm73rak, pp19, r12, repeater, ruger1022, scout, siaga, skorpion, sks, ssg82, sv98, svd, ump45, vss, winchester70) |

**Shock Hit Reaction (`shockhitreaction/`):**

| File | Purpose |
|------|---------|
| `shockhitreaction/shockhitreaction.c` | Shock damage hit reaction behavior |

	
### Player Systems

**Root files:**

| File | Purpose |
|------|---------|
| `playerlightmanager.c` | Player-attached light source management |
| `playerstomach.c` | Digestion and stomach content system |
| `staminahandler.c` | Stamina management |
| `staminamodifierdata.c` | Stamina modification data |
| `staminasoundhandler.c` | Stamina-related sounds (heavy breathing) |
| `softskillsmanager.c` | Soft skills progression system |
| `quickbarbase.c` | Quick bar / hotbar system |
| `consumeconditiondata.c` | Consume condition data for food/drink |
| `nutritionalprofile.c` | Food nutritional value definitions |
| `bloodyhands.c` | Bloody hands state management |
| `propertymodifiers.c` | Property modification system |

**Player Gear Spawn (`playergearspawn/`):**

| File | Purpose |
|------|---------|
| `playergearspawn/cfgplayerspawndatainterpreted.c` | Interpreted player spawn data |
| `playergearspawn/cfgplayerspawndatajson.c` | JSON player spawn data |
| `playergearspawn/cfgplayerspawnhandler.c` | Player spawn configuration handler |

**Player Modifiers (`playermodifiers/`):**

| File | Purpose |
|------|---------|
| `playermodifiers/emodifiers.c` | Modifier enum definitions |
| `playermodifiers/modifierbase.c` | `ModifierBase` — Base class for all modifiers |
| `playermodifiers/modifiersmanager.c` | `ModifiersManager` — Manages active modifiers |

**Modifiers (effects/buffs/debuffs):**

| File | Purpose |
|------|---------|
| `playermodifiers/modifiers/antibiotics.c` | Antibiotics effect |
| `playermodifiers/modifiers/bloodregen.c` | Blood regeneration |
| `playermodifiers/modifiers/boneregen.c` | Bone regeneration |
| `playermodifiers/modifiers/breathvapourmdfr.c` | Breath vapour (cold weather) |
| `playermodifiers/modifiers/charcoalmdfr.c` | Charcoal tablets effect |
| `playermodifiers/modifiers/chelation.c` | Chelation (heavy metal treatment) |
| `playermodifiers/modifiers/disinfectmdfr.c` | Disinfectant effect |
| `playermodifiers/modifiers/drowning.c` | Drowning state |
| `playermodifiers/modifiers/epinephrinemdfr.c` | Epinephrine effect |
| `playermodifiers/modifiers/flies.c` | Flies attraction (corpse proximity) |
| `playermodifiers/modifiers/health.c` | Health stat |
| `playermodifiers/modifiers/healthregen.c` | Health regeneration |
| `playermodifiers/modifiers/heatcomfortmdfr.c` | Heat comfort modifier |
| `playermodifiers/modifiers/hunger.c` | Hunger stat |
| `playermodifiers/modifiers/immunesystem.c` | Immune system strength |
| `playermodifiers/modifiers/immunityboost.c` | Immunity boost effect |
| `playermodifiers/modifiers/mask.c` | Mask/breathing modifier |
| `playermodifiers/modifiers/morphinemdfr.c` | Morphine effect |
| `playermodifiers/modifiers/painkillersmdfr.c` | Painkiller effect |
| `playermodifiers/modifiers/saline.c` | Saline solution effect |
| `playermodifiers/modifiers/shock.c` | Shock damage stat |
| `playermodifiers/modifiers/shockdamage.c` | Shock damage over time |
| `playermodifiers/modifiers/stomach.c` | Stomach contents |
| `playermodifiers/modifiers/testing.c` | Testing/debug modifier |
| `playermodifiers/modifiers/thirst.c` | Thirst stat |
| `playermodifiers/modifiers/toxicity.c` | Toxicity level |
| `playermodifiers/modifiers/unconsciousness.c` | Unconsciousness state |

**Conditions:**

| File | Purpose |
|------|---------|
| `playermodifiers/modifiers/conditions/areaexposure.c` | Area exposure (contaminated zones) |
| `playermodifiers/modifiers/conditions/bleeding.c` | Bleeding condition |
| `playermodifiers/modifiers/conditions/blinded.c` | Blinded condition |
| `playermodifiers/modifiers/conditions/brokenarms.c` | Broken arms condition |
| `playermodifiers/modifiers/conditions/brokenlegs.c` | Broken legs condition |
| `playermodifiers/modifiers/conditions/burning.c` | Burning condition |
| `playermodifiers/modifiers/conditions/fatigue.c` | Fatigue condition |
| `playermodifiers/modifiers/conditions/fever.c` | Fever condition |
| `playermodifiers/modifiers/conditions/heartattack.c` | Heart attack condition |
| `playermodifiers/modifiers/conditions/heatbuffer.c` | Heat buffer condition |
| `playermodifiers/modifiers/conditions/hemolyticreaction.c` | Hemolytic reaction |
| `playermodifiers/modifiers/conditions/poisoning.c` | Poisoning condition |
| `playermodifiers/modifiers/conditions/stuffedstomach.c` | Stuffed stomach condition |
| `playermodifiers/modifiers/conditions/tremor.c` | Tremor condition |
| `playermodifiers/modifiers/conditions/vomitstuffed.c` | Vomit (stuffed) condition |
| `playermodifiers/modifiers/conditions/wet.c` | Wet condition |

**Diseases:**

| File | Purpose |
|------|---------|
| `playermodifiers/modifiers/diseases/braindisease.c` | Brain disease (Kuru) |
| `playermodifiers/modifiers/diseases/cholera.c` | Cholera |
| `playermodifiers/modifiers/diseases/commoncold.c` | Common cold |
| `playermodifiers/modifiers/diseases/contamination.c` | Contamination (gas) level 1 |
| `playermodifiers/modifiers/diseases/contamination2.c` | Contamination level 2 |
| `playermodifiers/modifiers/diseases/contamination3.c` | Contamination level 3 |
| `playermodifiers/modifiers/diseases/heavymetal.c` | Heavy metal poisoning |
| `playermodifiers/modifiers/diseases/influenza.c` | Influenza |
| `playermodifiers/modifiers/diseases/pneumonia.c` | Pneumonia |
| `playermodifiers/modifiers/diseases/salmonella.c` | Salmonella |
| `playermodifiers/modifiers/diseases/testdisease.c` | Test disease (debug) |
| `playermodifiers/modifiers/diseases/woundinfection.c` | Wound infection |
| `playermodifiers/modifiers/diseases/woundinfection2.c` | Wound infection (advanced) |

**Player Notifiers (`playernotifiers/`):**

| File | Purpose |
|------|---------|
| `playernotifiers/notifierbase.c` | `NotifierBase` — Base class for player state notifiers |
| `playernotifiers/notifiersmanager.c` | `NotifiersManager` — Manages active notifiers |
| `playernotifiers/notifiers/agentsnotfr.c` | Disease agents notification |
| `playernotifiers/notifiers/bleedingnotfr.c` | Bleeding notification |
| `playernotifiers/notifiers/bloodnotfr.c` | Blood level notification |
| `playernotifiers/notifiers/fevernotfr.c` | Fever notification |
| `playernotifiers/notifiers/fracturedlegnotfr.c` | Fractured leg notification |
| `playernotifiers/notifiers/healthnotfr.c` | Health notification |
| `playernotifiers/notifiers/heartbeatnotfr.c` | Heartbeat notification |
| `playernotifiers/notifiers/hungernotfr.c` | Hunger notification |
| `playernotifiers/notifiers/injuredlegnotfr.c` | Injured leg notification |
| `playernotifiers/notifiers/pillsnotfr.c` | Pill effectiveness notification |
| `playernotifiers/notifiers/sicknotfr.c` | Sickness notification |
| `playernotifiers/notifiers/stuffednotfr.c` | Stuffed notification |
| `playernotifiers/notifiers/thirstnotfr.c` | Thirst notification |
| `playernotifiers/notifiers/warmthnotfr.c` | Warmth notification |
| `playernotifiers/notifiers/wetnessnotfr.c` | Wetness notification |

**Player Stats (`playerstats/`):**

| File | Purpose |
|------|---------|
| `playerstats/playerstatbase.c` | `PlayerStatBase` — Base stat class |
| `playerstats/playerstatrecord.c` | `PlayerStatRecord` — Stat recording |
| `playerstats/playerstats.c` | `PlayerStats` — Stat collection manager |
| `playerstats/playerstatspco.c` | `PlayerStatsPCO` — PCO stat serialization |
| `playerstats/statdebugobject.c` | Stat debug visualization |

**Player Symptoms (`playersymptoms/`):**

| File | Purpose |
|------|---------|
| `playersymptoms/smptanimmeta.c` | Symptom animation metadata |
| `playersymptoms/statebase.c` | `StateBase` — Symptom state base class |
| `playersymptoms/statecb.c` | `StateCB` — Symptom callback |
| `playersymptoms/statemanager.c` | `StateManager` — Manages active symptoms |

**Primary Symptom States:**

| File | Purpose |
|------|---------|
| `playersymptoms/states/primary/coughstate.c` | Coughing symptom |
| `playersymptoms/states/primary/freezestate.c` | Freezing symptom |
| `playersymptoms/states/primary/gaspsymptom.c` | Gasping symptom |
| `playersymptoms/states/primary/hotstate.c` | Overheating symptom |
| `playersymptoms/states/primary/laughterstate.c` | Laughing (Kuru) symptom |
| `playersymptoms/states/primary/painheavystate.c` | Heavy pain symptom |
| `playersymptoms/states/primary/painlightstate.c` | Light pain symptom |
| `playersymptoms/states/primary/sneezestate.c` | Sneezing symptom |
| `playersymptoms/states/primary/vomitstate.c` | Vomiting symptom |

**Secondary Symptom States:**

| File | Purpose |
|------|---------|
| `playersymptoms/states/secondary/blindnessstate.c` | Blindness symptom |
| `playersymptoms/states/secondary/bloodloss.c` | Blood loss symptom |
| `playersymptoms/states/secondary/bullethitstate.c` | Bullet hit reaction |
| `playersymptoms/states/secondary/deafnesscomplete.c` | Complete deafness |
| `playersymptoms/states/secondary/feverblurstate.c` | Fever blur effect |
| `playersymptoms/states/secondary/handshivers.c` | Hand shivers (aim shake) |
| `playersymptoms/states/secondary/hmpsevere.c` | HMP severe state |

### Interaction & Inventory

**Root files:**

| File | Purpose |
|------|---------|
| `contextmenu.c` | Right-click context menu |
| `inventoryactionhandler.c` | Inventory action handling |
| `craftingmanager.c` | Crafting system |
| `writtennotedata.c` | Notes and writing system |

**Cooking (`cooking/`):**

| File | Purpose |
|------|---------|
| `cooking.c` | Cooking mechanics |
| `fireconsumable.c` | Fire consumable (fuel) |
| `fireconsumabletype.c` | Fire consumable type definitions |

**Recipes (`recipes/`):**

| File | Purpose |
|------|---------|
| `cacheobject.c` | Recipe cache object |
| `recipebase.c` | `RecipeBase` — Base class for all crafting recipes |

The `recipes/recipes/` directory contains **216 individual crafting recipe files** covering: attach/detach holsters and pouches, blood tests, chelation, clean/disinfect items, craft armbands, arrows, bait, basebuilding (fence, watchtower), bone hooks/knives, bows, burlap strips, camo nets, cooking stands, courier bags, dry sacks, feathers, fireplaces, fishing rods, fish nets, gas mask filters, ghillie suits, improvised explosives/bags, leather crafting, metal wire, rabbit snares, rags, rope, saline bags, shelters, spears, splints, stone knives, suppressors, tanned leather, territory flags, torches, tripwire, truck wheels, watchtower kits, and many more. These are organized alphabetically and inherit from `RecipeBase`.

**User Actions Component (`useractionscomponent/`):**

| File | Purpose |
|------|---------|
| `_constants.c` | User action constants |
| `actionbase.c` | `ActionBase` — Base action class |
| `actionconstructor.c` | Action constructor |
| `actioninput.c` | Action input handling |
| `actionmanagerbase.c` | `ActionManagerBase` — Base action manager |
| `actionmanagerclient.c` | `ActionManagerClient` — Client-side action manager |
| `actionmanagerserver.c` | `ActionManagerServer` — Server-side action manager |
| `actiontargets.c` | Action target definitions |
| `actionvariantsmanager.c` | Action variants manager |
| `animatedactionbase.c` | `AnimatedActionBase` — Base for animated actions |

**Action Components (continuous/interact/single-use behavior components):**

| File | Purpose |
|------|---------|
| `cabase.c` | `CABase` — Base action component |
| `cacontinuousbase.c` | Continuous action component base |
| `cacontinuouscraft.c` | Crafting continuous component |
| `cacontinuousdisinfectplant.c` | Plant disinfection continuous |
| `cacontinuousempty.c` | Empty container continuous |
| `cacontinuousemptymagazine.c` | Empty magazine continuous |
| `cacontinuousfertilizegardenslot.c` | Garden fertilization continuous |
| `cacontinuousfill.c` | Fill container continuous |
| `cacontinuousfillbrakes.c` | Fill brakes continuous |
| `cacontinuousfillcoolant.c` | Fill coolant continuous |
| `cacontinuousfillfuel.c` | Fill fuel continuous |
| `cacontinuousfilloil.c` | Fill oil continuous |
| `cacontinuousfillpowergenerator.c` | Fill generator continuous |
| `cacontinuousfish.c` | Fishing continuous |
| `cacontinuousloadmagazine.c` | Load magazine continuous |
| `cacontinuousminerock.c` | Mine rock continuous |
| `cacontinuousminewood.c` | Mine wood continuous |
| `cacontinuousquantity.c` | Quantity-based continuous |
| `cacontinuousquantitybloodtransfer.c` | Blood transfer continuous |
| `cacontinuousquantityedible.c` | Edible consumption continuous |
| `cacontinuousquantityextinguish.c` | Extinguish continuous |
| `cacontinuousquantityliquidtransfer.c` | Liquid transfer continuous |
| `cacontinuousquantityrepeat.c` | Repeat quantity continuous |
| `cacontinuousrepeat.c` | Repeat action continuous |
| `cacontinuousrepeatfishing.c` | Repeat fishing continuous |
| `cacontinuousrepeatstartengine.c` | Start engine continuous |
| `cacontinuoustime.c` | Timed continuous action |
| `cacontinuoustimecooking.c` | Cooking timed continuous |
| `cacontinuoustransferquantity.c` | Transfer quantity continuous |
| `cacontinuouswaterplant.c` | Water plant continuous |
| `cacontinuouswaterslot.c` | Water slot continuous |
| `cacontinuouswringclothes.c` | Wring clothes continuous |
| `cadummy.c` | Dummy action component |
| `cainteract.c` | Interact action component |
| `cainteractloop.c` | Interact loop component |
| `casingleuse.c` | Single-use action component |
| `casingleusebase.c` | Single-use action component base |
| `casingleusequantity.c` | Quantity single-use component |
| `casingleusequantityedible.c` | Edible single-use component |
| `casingleuseturnonplugged.c` | Turn on plugged single-use |

**Action Definitions:**

| File | Purpose |
|------|---------|
| `actions/actionconstants.c` | Action constants |
| `actions/actioncontinuousbase.c` | Continuous action base class |
| `actions/actioninstantbase.c` | Instant action base class |
| `actions/actioninteractbase.c` | Interact action base class |
| `actions/actioninteractloopbase.c` | Interact loop action base |
| `actions/actionsequentialbase.c` | Sequential action base class |
| `actions/actionsingleusebase.c` | Single-use action base class |

The `actions/continuous/` directory contains **~160 continuous action files** covering: activate trap, arm explosive, build oven/part/stone circle, bury body, consume, cook on stick, craft items, dig garden/stash, disarm explosive, drink/eat, fish, fold/toggle basebuilding, force feed, ignite fireplace, load magazine, lock/unlock, mine, mount barbed wire, pack gift, place object, pour liquid, push boat/car, raise flag, refuel torch, repair vehicle/part, restrain self/target, saw planks, shave, skin animal, sort ammo, transfer liquid, tune frequency, turn valve, view optics, wash hands, water garden, and many more.

The `actions/interact/` directory contains **~60 interact action files** covering: build shelter, close/open barrel/doors/fence, detach items, enter/exit ladder, fold object, get in/out transport, harvest crops, open combination lock, operate panel, pack shelter/tent, pick berry, pickup item, pull body from transport, remove plant, repack tent, set alarm/timer, swap item, take item/arrow, toggle tent, tune radio, turn on/off devices, use underground lever, wash hands, and vehicle interactions (animate seats, car doors, switch lights).

The `actions/singleuse/` directory contains **~80 single-use action files** covering: attach items/seeds/wheels, close, consume single, create fireplace/oven, disinfect plant, drop item, fold bandana/map, force bite/sip, handcuff, install sparkplug, light torch, measure battery, open, pin/unpin, place fireplace, plant seed, plugin to fence, read paper, repair with tool, reset timer, take bite/sip, toggle fishing/NVG/placement, trigger remotely, turn on/off devices, unfold item, wash hands, zoom in/out, and medical actions (bite pills, disinfect, inject, etc.).

The `actions/weapons/` directory contains firearm-specific actions: attach/detach magazine, load bullet/multi-bullet, mechanic manipulate, unjam.

**Root files:**

| File | Purpose |
|------|---------|
| `heatcomfortanimhandler.c` | Temperature comfort animations |
| `objecttemperaturestatedata.c` | Object temperature states |
| `camerashake.c` | Camera shake effects |
| `kurushake.c` | Kuru disease shake effects |
| `rainprocurementcomponent.c` | Rain collection component |
| `rainprocurementhandler.c` | Rain collection handler |
| `rainprocurementmanager.c` | Rain collection manager |

**Contaminated Area (`contaminatedarea/`):**

| File | Purpose |
|------|---------|
| `contaminatedarea.c` | `ContaminatedArea` — Base contaminated zone |
| `contaminatedarea_dynamic.c` | Dynamic contaminated area |
| `contaminatedarea_dynamicbase.c` | Dynamic contaminated area base |
| `contaminatedarea_local.c` | Local client contaminated area |
| `contaminatedarealoader.c` | Contaminated area JSON loader |
| `dynamicarea_flare.c` | Dynamic flare effect area |
| `effectarea.c` | Visual effect area |
| `geyserarea.c` | Geyser effect area |
| `hotspringarea.c` | Hot spring area |
| `jsondatacontaminatedarea.c` | Contaminated area JSON data |
| `spookyarea.c` | Spooky ambiance area |
| `spookyareamisc.c` | Spooky area miscellaneous |
| `volcanicarea.c` | Volcanic area |

**Environment (`environment/`):**

| File | Purpose |
|------|---------|
| `environment.c` | `Environment` — Base environmental effect class |

**Food Stage (`foodstage/`):**

| File | Purpose |
|------|---------|
| `foodstage.c` | `FoodStage` — Food decay/ripeness stages |

**Sound Events (`soundevents/`):**

| File | Purpose |
|------|---------|
| `soundevents.c` | `SoundEvents` — Sound event definitions |
| `infectedsoundevents/infectedsoundeventbase.c` | Infected sound event base |
| `infectedsoundevents/infectedsoundeventhandler.c` | Infected sound event handler |
| `infectedsoundevents/events/mindstates.c` | Infected mind-state sounds |
| `playersoundevents/playersoundeventbase.c` | Player sound event base |
| `playersoundevents/playersoundeventhandler.c` | Player sound event handler |
| `playersoundevents/events/damageevents.c` | Damage sound events |
| `playersoundevents/events/drowningevents.c` | Drowning sound events |
| `playersoundevents/events/heatcomfortevents.c` | Heat comfort sound events |
| `playersoundevents/events/holdbreathevents.c` | Hold breath sound events |
| `playersoundevents/events/injuryevents.c` | Injury sound events |
| `playersoundevents/events/jumpevents.c` | Jump sound events |
| `playersoundevents/events/meleeattack.c` | Melee attack sound events |
| `playersoundevents/events/miscevents.c` | Miscellaneous sound events |
| `playersoundevents/events/staminaevents.c` | Stamina sound events |
| `playersoundevents/events/symptomevents.c` | Symptom sound events |
| `replacesoundevents/replacesoundeventbase.c` | Replace sound event base |
| `replacesoundevents/replacesoundeventhandler.c` | Replace sound event handler |
| `replacesoundevents/events/actionsurfaceevents.c` | Action surface sound events |

**Sound Handlers (`soundhandlers/`):**

| File | Purpose |
|------|---------|
| `freezingsoundhandler.c` | Freezing sound handler |
| `hungersoundhandler.c` | Hunger sound handler |
| `injurysoundhandler.c` | Injury sound handler |
| `itemsoundhandler.c` | Item interaction sound handler |
| `playersoundmanager.c` | Player sound manager |
| `thirstsoundhandler.c` | Thirst sound handler |

**Transmission Agents (`transmissionagents/`):**

| File | Purpose |
|------|---------|
| `agents/agentbase.c` | `AgentBase` — Base disease agent |
| `agents/brainagent.c` | Brain disease agent (Kuru) |
| `agents/chemicalagent.c` | Chemical agent (gas) |
| `agents/choleraagent.c` | Cholera agent |
| `agents/foodpoisonagent.c` | Food poisoning agent |
| `agents/heavymetalagent.c` | Heavy metal poisoning agent |
| `agents/influenzaagent.c` | Influenza agent |
| `agents/nerveagent.c` | Nerve agent |
| `agents/salmonellaagent.c` | Salmonella agent |
| `agents/woundagent.c` | Wound infection agent |
| `playeragentpool/playeragentpool.c` | Player agent pool |

### AI & Senses

**Root files:**

| File | Purpose |
|------|---------|
| `emoteconstructor.c` | Emote construction |
| `emotemanager.c` | Emote management |
| `meleetargeting.c` | Melee targeting logic |

**Emote Classes (`emoteclasses/`):**

| File | Purpose |
|------|---------|
| `emotebase.c` | `EmoteBase` — Base emote class |
| `emoteclasses.c` | Emote class definitions |

### UI Support

**Root files:**

| File | Purpose |
|------|---------|
| `debugmonitorvalues.c` | Debug monitor data values |
| `keybinding.c` | Key binding definitions |
| `mousebinding.c` | Mouse binding definitions |
| `mousebuttoninfo.c` | Mouse button information |
| `stanceindicator.c` | Stance indicator UI |
| `toggleselections.c` | Visual selection toggles |
| `weapondebug.c` | Weapon debugging tools |
| `sqfdebugwatcher.c` | SQF debug watcher |

**Virtual HUD (`virtualhud/`):**

| File | Purpose |
|------|---------|
| `_constants.c` | Virtual HUD constants |
| `displayelementbadge.c` | Badge display element |
| `displayelementbase.c` | Display element base class |
| `displayelementtendency.c` | Tendency display element |
| `displaystatus.c` | Display status manager |
| `elements/badge/badgebleeding.c` | Bleeding badge |
| `elements/badge/badgefracture.c` | Fracture badge |
| `elements/badge/badgeheartbeat.c` | Heartbeat badge |
| `elements/badge/badgelegs.c` | Legs condition badge |
| `elements/badge/badgepills.c` | Pills badge |
| `elements/badge/badgepoisoned.c` | Poisoned badge |
| `elements/badge/badgesick.c` | Sick badge |
| `elements/badge/badgestuffed.c` | Stuffed badge |
| `elements/badge/badgewet.c` | Wet badge |
| `elements/misc/elementstance.c` | Stance element |
| `elements/tendency/tendencybacteria.c` | Bacteria tendency |
| `elements/tendency/tendencyblood.c` | Blood tendency |
| `elements/tendency/tendencyhealth.c` | Health tendency |
| `elements/tendency/tendencyhunger.c` | Hunger tendency |
| `elements/tendency/tendencytemperature.c` | Temperature tendency |
| `elements/tendency/tendencythirst.c` | Thirst tendency |

### Networking & Infrastructure

**Root files:**

| File | Purpose |
|------|---------|
| `messagereceiverbase.c` | Message receiver base class |
| `randomgeneratorsyncmanager.c` | Synced random number generation |
| `transfervalues.c` | Value transfer utilities |
| `undergroundbunkerhandlerclient.c` | Underground bunker handling (client) |
| `undergroundhandlerclient.c` | Underground area handling (client) |
| `underobjectdecalspawncomponent.c` | Under-object decal spawn component |

**Config Handler (`confighandler/`):**

| File | Purpose |
|------|---------|
| `cfgparam.c` | Config parameter base |
| `cfgparamarray.c` | Array config parameter |
| `cfgparambool.c` | Boolean config parameter |
| `cfgparamfloat.c` | Float config parameter |
| `cfgparamint.c` | Integer config parameter |
| `cfgparamstring.c` | String config parameter |
| `cfgparamtype.c` | Config parameter type mappings |

### Other

**Root files:**

| File | Purpose |
|------|---------|
| `corpsedata.c` | Corpse/loot data |
| `hologram.c` | Placement hologram system |
| `introscenecharacter.c` | Intro scene character setup |
| `lifespanlevel.c` | Item lifespan/durability |
| `missionbaseworld.c` | Mission base world class |

**Debug (`debug/`):**

| File | Purpose |
|------|---------|
| `presethandlers.c` | Debug preset handlers |

**Modules (`modules/`):**

| File | Purpose |
|------|---------|
| `plantmaterial.c` | Plant material definitions |
| `syncedvalue.c` | Synced value for multiplayer |

**Remote Player Debug (`remoteplayerdebug/`):**

| File | Purpose |
|------|---------|
| `damagedata.c` | Remote damage data |
| `remoteplayerdamagedebug.c` | Remote player damage debug |
| `remoteplayermeta.c` | Remote player metadata |
| `remoteplayerstatdebug.c` | Remote player stat debug |

**Scene Editor (`sceneeditor/`):**

| File | Purpose |
|------|---------|
| `scenedata.c` | Scene data |
| `sceneobject.c` | Scene object |
| `sceneplayer.c` | Scene player |

**Weapons (`weapons/`):**

| File | Purpose |
|------|---------|
| `weaponmanager.c` | `WeaponManager` — Weapon behavior management |

**Worlds (`worlds/`):**

| File | Purpose |
|------|---------|
| `chernarusplus.c` | Chernarus+ world class |
| `enoch.c` | Enoch (Livonia) world class |
| `mainmenuworlddata.c` | Main menu world data |
| `sakhal.c` | Sakhal world class |

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

### Subdirectory File Listings

#### Advanced Communication (`advancedcommunication/`)

| File | Purpose |
|------|---------|
| `advancedcommunication.c` | Base advanced communication entity |
| `land_lamp_city1_amp.c` | City lamp post with amplifier |
| `land_power_pole_conc1_amp.c` | Concrete power pole with amplifier |
| `land_power_pole_conc4_lamp_amp.c` | Concrete power pole with lamp and amplifier |
| `land_power_pole_wood1_amp.c` | Wooden power pole with amplifier |
| `land_power_pole_wood1_lamp_amp.c` | Wooden power pole with lamp and amplifier |
| `land_radio_panelbig.c` | Large radio panel |
| `land_radio_panelpas.c` | Public address system radio panel |

#### Building (`building/`)

**Root files:**

| File | Purpose |
|------|---------|
| `buildingwithfireplace.c` | Building with functional fireplace |
| `crashbase.c` | Helicopter crash site base |
| `fuelstation.c` | Fuel station with pumps |
| `outdoorthermometer.c` | Outdoor thermometer building |
| `signs.c` | Signage entities |
| `well.c` | Water well entity |

**Industrial:**

| File | Purpose |
|------|---------|
| `industrial/land_bags_stack_industrial.c` | Bag stack industrial |
| `industrial/land_barrel_exp_industrial.c` | Explosive barrel industrial |
| `industrial/land_barrel_industrial.c` | Barrel industrial |
| `industrial/land_barrel_sand_industrial.c` | Sand barrel industrial |
| `industrial/land_barrel_sand_water_industrial.c` | Sand/water barrel industrial |
| `industrial/land_barrel_water_industrial.c` | Water barrel industrial |
| `industrial/land_fortified_industrial.c` | Fortified industrial |
| `industrial/land_garbage_container_industrial.c` | Garbage container industrial |
| `industrial/land_generator_industrial.c` | Generator industrial |
| `industrial/land_mini_container_industrial.c` | Mini container industrial |
| `industrial/land_phone_boxes_industrial.c` | Phone booth industrial |
| `industrial/land_pipe_industrial.c` | Pipe industrial |
| `industrial/land_power_pole_industrial.c` | Power pole industrial |
| `industrial/land_power_pole_wood_industrial.c` | Wooden power pole industrial |
| `industrial/land_trailer_industrial.c` | Trailer industrial |
| `industrial/land_transformer_industrial.c` | Transformer industrial |

**Military:**

| File | Purpose |
|------|---------|
| `military/a2/land_a2_budova1_military.c` | A2 building military |
| `military/a2/land_a2_budova4_military.c` | A2 building military |
| `military/a2/land_a2_bunker_military.c` | A2 bunker military |
| `military/a2/land_a2_hangar_military.c` | A2 hangar military |
| `military/a2/land_a2_panelak1_military.c` | A2 panel building military |
| `military/a2/land_a2_plot_vnitrek_military.c` | A2 interior plot military |
| `military/a2/land_a2_plot_zed_military.c` | A2 wall military |
| `military/a2/land_a2_posedestone_military.c` | A2 stone base military |
| `military/a2/land_a2_stodol_old_open_military.c` | A2 old barn military |
| `military/a2/land_a2_teplacka_military.c` | A2 heating plant military |
| `military/a3/land_a3_hangar_military.c` | A3 hangar military |
| `military/a3/land_a3_kasarna_prujezd_military.c` | A3 barracks passage military |
| `military/a3/land_a3_pristrelek_military.c` | A3 shelter military |
| `military/phoenix/land_phoenix_guardhouse.c` | Phoenix guardhouse |
| `military/phoenix/land_phoenix_hqs.c` | Phoenix headquarters |

**Residential:**

| File | Purpose |
|------|---------|
| `residential/houseblocks/land_houseblock_1.c` | House block 1 |
| `residential/houseblocks/land_houseblock_2.c` | House block 2 |
| `residential/houseblocks/land_houseblock_3.c` | House block 3 |
| `residential/houseblocks/land_houseblock_4.c` | House block 4 |
| `residential/houses/land_house_1w1.c` | House 1W1 |
| `residential/houses/land_house_1w10.c` | House 1W10 |
| `residential/houses/land_house_1w11.c` | House 1W11 |
| `residential/houses/land_house_1w12.c` | House 1W12 |
| `residential/houses/land_house_1w2.c` | House 1W2 |
| `residential/houses/land_house_1w3.c` | House 1W3 |
| `residential/houses/land_house_1w4.c` | House 1W4 |
| `residential/houses/land_house_1w5.c` | House 1W5 |
| `residential/houses/land_house_1w6.c` | House 1W6 |
| `residential/houses/land_house_1w7.c` | House 1W7 |
| `residential/houses/land_house_1w8.c` | House 1W8 |
| `residential/houses/land_house_1w9.c` | House 1W9 |
| `residential/houses/land_house_2b.c` | House 2B |

**Specific:**

| File | Purpose |
|------|---------|
| `specific/land_church.c` | Church building |
| `specific/land_water_tower.c` | Water tower |
| `specific/land_lighthouse.c` | Lighthouse |
| `specific/land_windmill.c` | Windmill |
| `specific/land_castle_berghof.c` | Castle berghof |
| `specific/land_castle_ruins.c` | Castle ruins |

**Underground:**

| File | Purpose |
|------|---------|
| `underground/bunker.c` | Underground bunker |
| `underground/stairs/land_underground_stairs_bottom.c` | Underground stairs bottom |
| `underground/stairs/land_underground_stairs_middle.c` | Underground stairs middle |
| `underground/stairs/land_underground_stairs_top.c` | Underground stairs top |

**Wrecks:**

| File | Purpose |
|------|---------|
| `wrecks/land_a3_wreck_heli.c` | A3 helicopter wreck |
| `wrecks/land_wreck_brigde.c` | Bridge wreck |
| `wrecks/land_wreck_car.c` | Car wreck |
| `wrecks/land_wreck_heli.c` | Helicopter wreck |
| `wrecks/land_wreck_mi8.c` | Mi8 wreck |
| `wrecks/land_wreck_truck.c` | Truck wreck |
| `wrecks/land_wreck_truck_door.c` | Truck door wreck |

#### Core (`core/`)

| File | Purpose |
|------|---------|
| `inherited/building.c` | Building inherited entity |
| `inherited/entityai.c` | EntityAI inherited entity |
| `inherited/inventoryitem.c` | InventoryItem inherited entity |
| `inherited/inventoryitemtype.c` | InventoryItemType inherited |
| `inherited/itemoptics.c` | Item optics inherited |
| `inherited/lightai.c` | LightAI inherited entity |
| `inherited/man.c` | Man inherited entity |
| `inherited/plant.c` | Plant inherited entity |
| `inherited/weapon.c` | Weapon inherited entity |
| `game/super/building.c` | Building super class |
| `game/super/inventoryitem.c` | InventoryItem super class |
| `game/super/lightai.c` | LightAI super class |
| `game/super/man.c` | Man super class |
| `game/super/plant.c` | Plant super class |

#### Creatures (`creatures/`)

| File | Purpose |
|------|---------|
| `animals/animalbase.c` | `AnimalBase` — Base class for all animals |
| `infected/dayzinfectedcfgbase.c` | `DayZInfectedCfgBase` — Infected config base |
| `infected/zombiebase.c` | `ZombieBase` — Base zombie class |
| `infected/zombiefemalebase.c` | `ZombieFemaleBase` — Female zombie entity |
| `infected/zombiemalebase.c` | `ZombieMaleBase` — Male zombie entity |

#### Effects (`effects/`)

| File | Purpose |
|------|---------|
| `boatwatereffects.c` | Boat water interaction effects |
| `wheelsmoke.c` | Wheel/skid smoke particle effects |

#### Explosives Base (`explosivesbase/`)

| File | Purpose |
|------|---------|
| `claymoremine.c` | Claymore directional mine |
| `improvisedexplosive.c` | Improvised explosive device |
| `plastic_explosive.c` | Plastic explosive |
| `remotedetonator.c` | Remote detonator trigger |

#### Firearms (`firearms/`)

**Root weapon base files:**

| File | Purpose |
|------|---------|
| `weapon_base.c` | `Weapon_Base` — Root firearm entity class |
| `weaponfsm.c` | Weapon FSM (action/event/guard definitions) |
| `debug.c` | Weapon debug utilities |
| `cupidsboltsimulation.c` | Cupid's bolt simulation (ballistics) |
| `flaresimulation.c` | Flare projectile simulation |
| `smokesimulation.c` | Smoke projectile simulation |
| `pistol_base.c` | `Pistol_Base` — Base pistol class |
| `pistolalt_base.c` | `PistolAlt_Base` — Alternate pistol base |
| `singleshotpistol_base.c` | Single-shot pistol base |
| `rifle_base.c` | `Rifle_Base` — Base rifle class |
| `rifleboltfree_base.c` | Free-bolt rifle base |
| `rifleboltlock_base.c` | Locked-bolt rifle base |
| `riflesingleshot_base.c` | Single-shot rifle base |
| `riflesingleshotmanual_base.c` | Manual single-shot rifle base |
| `openbolt_base.c` | Open-bolt firearm base |
| `doublebarrel_base.c` | Double-barrel firearm base |
| `boltactionrifle_base.c` | Bolt-action rifle base |
| `boltactionrifleexternalmagazine_base.c` | Bolt-action with external magazine |
| `boltactionrifleinnermagazine_base.c` | Bolt-action with internal magazine |
| `boltrifle_base.c` | Bolt rifle base |
| `chamberfirstinnermagazinesemiautomatic_base.c` | Chamber-first inner magazine semi-auto base |

**Archery:**

| File | Purpose |
|------|---------|
| `archery/archery_base.c` | Archery weapon base |
| `archery/crossbow.c` | Crossbow entity |

**Automatic Rifles:**

| File | Purpose |
|------|---------|
| `automaticrifle/ak101.c` | AK-101 assault rifle |
| `automaticrifle/ak74.c` | AK-74 assault rifle |
| `automaticrifle/akm.c` | AKM assault rifle |
| `automaticrifle/aks74u.c` | AKS-74U carbine |
| `automaticrifle/aug.c` | Steyr AUG assault rifle |
| `automaticrifle/fal.c` | FN FAL battle rifle |
| `automaticrifle/famas.c` | FAMAS assault rifle |
| `automaticrifle/m14.c` | M14 battle rifle |
| `automaticrifle/m16a2.c` | M16A2 assault rifle |
| `automaticrifle/m4a1.c` | M4A1 carbine |
| `automaticrifle/ots14.c` | OTs-14 Groza assault rifle |
| `automaticrifle/sks.c` | SKS semi-auto rifle |

**FSM (Weapon State Machine):**

| File | Purpose |
|------|---------|
| `fsm/actions.c` | Weapon FSM action definitions |
| `fsm/events.c` | Weapon FSM event definitions |
| `fsm/guards.c` | Weapon FSM guard conditions |
| `fsm/states/bullethide.c` | Bullet hide state |
| `fsm/states/bulletshow.c` | Bullet show state |
| `fsm/states/magazinehide.c` | Magazine hide state |
| `fsm/states/magazineshow.c` | Magazine show state |
| `fsm/states/riflechambering.c` | Rifle chambering state |
| `fsm/states/rifleejectcasing.c` | Rifle casing eject state |
| `fsm/states/riflerechambering.c` | Rifle rechambering state |
| `fsm/states/weaponattachmagazine.c` | Magazine attach state |
| `fsm/states/weaponchamberfromattmag.c` | Chamber from attached magazine |
| `fsm/states/weaponchambering.c` | Weapon chambering state |
| `fsm/states/weaponchamberinglooped.c` | Looped chambering state |
| `fsm/states/weaponcharging.c` | Weapon charging state |
| `fsm/states/weapondetachingmag.c` | Magazine detach state |
| `fsm/states/weaponejectbullet.c` | Bullet eject state |
| `fsm/states/weaponejectcasingandchamberfromattmag.c` | Eject casing and chamber from mag |
| `fsm/states/weaponfire.c` | Weapon fire state |
| `fsm/states/weaponfireandchambernext.c` | Fire and chamber next state |
| `fsm/states/weaponfireandchambernextfrominnermag.c` | Fire and chamber from inner mag |
| `fsm/states/weaponfirelast.c` | Last round fire state |
| `fsm/states/weaponrechamber.c` | Rechamber state |
| `fsm/states/weaponreplacingmagandchambernext.c` | Replace mag and chamber next |
| `fsm/states/weaponstablestate.c` | Weapon stable/idle state |
| `fsm/states/weaponstartaction.c` | Weapon action start state |

**Launchers:**

| File | Purpose |
|------|---------|
| `launcher/launcher_base.c` | Launcher weapon base |
| `launcher/m79.c` | M79 grenade launcher |
| `launcher/rpg7.c` | RPG-7 rocket launcher |

**Machine Guns:**

| File | Purpose |
|------|---------|
| `machinegun/machinegun_base.c` | Machine gun base |
| `machinegun/machinegun_lmg.c` | Light machine gun |
| `machinegun/machinegun_mmg.c` | Medium machine gun |

**Pistols:**

| File | Purpose |
|------|---------|
| `pistol/colt1911.c` | Colt M1911 pistol |
| `pistol/cz75.c` | CZ-75 pistol |
| `pistol/deagle.c` | Desert Eagle pistol |
| `pistol/derringer.c` | Derringer pistol |
| `pistol/fnx45.c` | FNX-45 pistol |
| `pistol/glock19.c` | Glock 19 pistol |
| `pistol/longhorn.c` | Longhorn revolver |
| `pistol/magnum.c` | Magnum revolver |
| `pistol/makarov.c` | Makarov PM pistol |
| `pistol/mkii.c` | MKII pistol |
| `pistol/p1luger.c` | P1 Luger pistol |
| `pistol/pm73rak.c` | PM-73 RAK pistol |

**Rifles:**

| File | Purpose |
|------|---------|
| `rifle/b95.c` | B95 rifle |
| `rifle/cz527.c` | CZ 527 rifle |
| `rifle/cz550.c` | CZ 550 rifle |
| `rifle/mosin9130.c` | Mosin-Nagant 91/30 rifle |
| `rifle/repeater.c` | Winchester repeater rifle |
| `rifle/ruger1022.c` | Ruger 10/22 rifle |
| `rifle/sawedoffmosin.c` | Sawed-off Mosin-Nagant |
| `rifle/scout.c` | Scout rifle |
| `rifle/ssg82.c` | SSG 82 rifle |
| `rifle/sv98.c` | SV-98 sniper rifle |
| `rifle/svd.c` | SVD Dragunov sniper rifle |
| `rifle/vss.c` | VSS Vintorez sniper rifle |
| `rifle/winchester70.c` | Winchester model 70 rifle |

**Shotguns:**

| File | Purpose |
|------|---------|
| `shotgun/izh18.c` | Izh-18 shotgun |
| `shotgun/izh18sawedoff.c` | Sawed-off Izh-18 |
| `shotgun/izh43.c` | Izh-43 shotgun |
| `shotgun/mp133.c` | MP-133 shotgun |
| `shotgun/r12.c` | R12 shotgun |
| `shotgun/sawedoffizh18shotgun.c` | Sawed-off Izh-18 shotgun variant |
| `shotgun/sawedoffizh43.c` | Sawed-off Izh-43 |

**SMGs:**

| File | Purpose |
|------|---------|
| `smg/mp5k.c` | MP5K submachine gun |
| `smg/pp19.c` | PP-19 Bizon submachine gun |
| `smg/skorpion.c` | Skorpion vz. 61 submachine gun |
| `smg/ump45.c` | UMP-45 submachine gun |
| `smg/vikhr.c` | AS Val "Vikhr" silenced assault rifle |

#### Garden Base (`gardenbase/`)

| File | Purpose |
|------|---------|
| `gardenplot.c` | `GardenPlot` — Garden plot/slot entity |
| `plantbase.c` | `PlantBase` — Base plant entity |
| `slot.c` | `Slot` — Garden plot slot entity |

#### Grenade Base (`grenade_base/`)

| File | Purpose |
|------|---------|
| `smokegrenadebase.c` | `SmokeGrenadeBase` — Base smoke grenade |
| `flashgrenade.c` | Flashbang grenade |
| `grenade_chemgas.c` | Chemical gas grenade |
| `m18smokegrenade_colorbase.c` | M18 colored smoke grenade |
| `m67grenade.c` | M67 fragmentation grenade |
| `rdg2smokegrenade_colorbase.c` | RDG-2 colored smoke grenade |
| `rgd5grenade.c` | RGD-5 fragmentation grenade |

#### Item Base (`itembase/`)

**Root item entities:**

`ammoboxes.c`, `bandagedressing.c`, `barbedbaseballbat.c`, `barbedwire.c`, `bark_colorbase.c`, `barrel_colorbase.c`, `baseballbat.c`, `basebuildingbase.c`, `battery9v.c`, `batterycharger.c`, `binocularsbase.c`, `blowtorch.c`, `boneknife.c`, `brassknuckles_colorbase.c`, `cablereel.c`, `camonet.c`, `cattleprod.c`, `chemlight.c`, `chernarusmap_open.c`, `cleaver.c`, `clockbase.c`, `clothing_base.c`, `combatknife.c`, `combinationlock.c`, `combinationlock4.c`, `compass.c`, `container_base.c`, `containerlocked.c`, `cookingstand.c`, `crudemachete.c`, `defibrillator.c`, `edible_base.c`, `eyemask_colorbase.c`, `fangeknife.c`, `fencekit.c`, `fieldshovel.c`, `firefighteraxe.c`, `fireplacebase.c`, `firewood.c`, `fireworksbase.c`, `fishingrod_base.c`, `flag_base.c`, `flashlight.c`, `giftbox_base.c`, `giftwrappaper.c`, `grenade_base.c`, `hacksaw.c`, `hammer.c`, `handcuffslocked.c`, `handdrillkit.c`, `hatchet.c`, `head.c`, `heatpack.c`, `hescobox.c`, `huntingknife.c`, `inventory_base.c`, `itembook.c`, `kitbase.c`, `kitchenknife.c`, `kukriknife.c`, `largegascannister.c`, `longtorch.c`, `machete.c`, `mapnavigationbehaviour.c`, `matchbox.c`, `mediumgascannister.c`, `megaphone.c`, `metalplate.c`, `metalwire.c`, `nail.c`, `nailedbaseballbat.c`, `nvgoggles.c`, `openablebehaviour.c`, `orientalmachete.c`, `paper.c`, `particletest.c`, `pelt_base.c`, `petrollighter.c`, `pickaxe.c`, `pileofwoodenplanks.c`, `pipe.c`, `pipewrench.c`, `pitchfork.c`, `pliers.c`, `portablegaslamp.c`, `portablegasstove.c`, `poweredoptic_base.c`, `powergenerator.c`, `pumpkinhelmet.c`, `punchedcard.c`, `radio.c`, `rag.c`, `rangefinder.c`, `raycaster.c`, `refridgerator.c`, `roadflare.c`, `scientificbriefcase.c`, `scientificbriefcasekeys.c`, `screwdriver.c`, `seedpackbase.c`, `shelterkit.c`, `shippingcontainerkeys_colorbase.c`, `shovel.c`, `sickle.c`, `sledgehammer.c`, `smallgascannister.c`, `sodacan_empty.c`, `spotlight.c`, `steakknife.c`, `stone.c`, `stoneknife.c`, `stunbaton.c`, `suppressorbase.c`, `surrenderdummyitem.c`, `switchable_base.c`, `sword.c`, `telescopicbaton.c`, `tentbase.c`, `thermometer.c`, `toolbase.c`, `torch.c`, `torch_video.c`, `totemkit.c`, `transmitterbase.c`, `trapbase.c`, `trapspawnbase.c`, `tripod.c`, `vehiclebattery.c`, `watchtowerkit.c`, `woodaxe.c`, `woodenlog.c`, `woodenplank.c`, `woodenstick.c`, `worldcontainer_base.c`, `xmasbaseballbat.c`, `xmaslights.c`

**Item Base Subdirectories:**

| Directory | Contents |
|-----------|----------|
| `bark_colorbase/` | `bark_birch.c`, `bark_oak.c` |
| `basebuildingbase/` | `fence.c`, `sheltersite.c`, `staticflagpole.c`, `totem.c`, `watchtower.c` |
| `bloodcontainerbase/` | `bloodbagempty.c`, `bloodbagfull.c`, `bloodbagiv.c`, `bloodcontainerbase.c`, `bloodsyringe.c`, `syringe.c` |
| `clothing/` | `airbornemask.c`, `alicebag_colorbase.c`, `armband_colorbase.c`, `armband_white.c`, `armypouch_colorbase.c`, `assaultbag_colorbase.c`, `athleticshoes_colorbase.c`, `aviatorglasses.c`, `balaclava3holes_colorbase.c`, `balaclavamask_colorbase.c`, `ballerinas_colorbase.c`, `bandana_hybrid.c`, `bandanamask_colorbase.c`, `baseballcap_colorbase.c`, `bdujacket.c`, `bdupants.c`, `beaniehat_colorbase.c` and 200+ additional clothing items |
| `container_base/` | `barrelholes_colorbase.c`, `barrelhole_base.c`, `barrel_base.c`, `barrel_blue.c`, `barrel_green.c`, `barrel_grey.c`, `barrel_red.c`, `barrel_yellow.c`, `cart.c`, `seachest_base.c`, `woodencrate.c`, `woodencratebase.c` |
| `edible_base/` | `bottle_base.c` subdirectory; `edible_Base.c`, `bottle_base/bottle_Base.c`, `bottle_base/canteen.c`, `bottle_base/flask.c`, `bottle_base/waterbottle.c` and 65+ additional consumable files |
| `fireplacebase/` | `fireplace.c`, `fireplaceindoor.c`, `oven.c`, `barrelholes_colorbase/barrelholes_colorbase.c`, `barrelholes_colorbase/barrelholes_blue.c`, `barrelholes_colorbase/barrelholes_green.c`, `barrelholes_colorbase/barrelholes_grey.c`, `barrelholes_colorbase/barrelholes_red.c`, `barrelholes_colorbase/barrelholes_yellow.c` |
| `gear/` | Tools (`broom.c`, `canopener.c`, `chainsaw.c`, `ducttape.c`, `epoxyputty.c`, `huntingknife.c`, `leathersewingkit.c`, `lockpick.c`, `lugwrench.c`, `measuringtape.c`, `minerpick.c`, `multitool.c`, `saw.c`, `sewingkit.c`, `sharpeningstone.c`, `wrench.c`); Medical (`atropineinjector.c`, `bandana_colorbase.c`, `bloodtestkit.c`, `charcoaltablets.c`, `disinfectantalcohol.c`, `disinfectantspray.c`, `epinephrine.c`, `firstaidkit.c`, `iodinetincture.c`, `morphineinjector.c`, `painkillertablets.c`, `purificationtablets.c`, `salinebag.c`, `salinebagiv.c`, `startkitiv.c`, `surgicalgloves_colorbase.c`, `surgicalmask.c`, `tetracyclineantibiotics.c`, `thermometer.c`, `vitaminbottle.c`); Food (`apple.c`, `bacon.c`, `bakedbeanscan.c`, `brisco_snackpack.c`, `cereal_box.c`, `cereals.c`, `crackers.c`, `dogfoodcan.c`, `dried_banana.c`, `dried_apple.c`, `dried_apricot.c`, `dried_fruitmix.c`, `dried_smokedmeat.c`, `dried_vegetables.c`, `guts.c`, `honey.c`, `jam.c`, `marmalade.c`, `pear_can.c`, `porkcan.c`, `powderedmilk.c`, `rice.c`, `sardinescan.c`, `spaghettican.c`, `tacticalbaconcan.c`, `vegetablesack.c`, `yeast.c`, `zucchini.c`); Drinks (`beercan.c`, `canteen.c`, `cocacola.c`, `coffeecan.c`, `flask.c`, `kombucha.c`, `pepsican.c`, `spiritsbottle.c`, `spritecan.c`, `waterbottle.c`, `winebottle.c`); and additional subdirectories for `cooking/`, `navigation/`, `optics/`, `radio/`, `camping/`, `consumables/` |
| `inventory_base/` | `backpacks/` (`coyotebag_colorbase.c`, `huntingbag_colorbase.c`, `mountainbag_colorbase.c`, `tortillabag_colorbase.c`, `drybag_colorbase.c`, `duffelbag_colorbase.c`, `canvasbag_colorbase.c`, `slimgeigerbag_colorbase.c`, `slingbag_colorbase.c`, `smershsbag_colorbase.c`, `improvisedbag_colorbase.c`, `leatherbag_colorbase.c`, `childsbag_colorbase.c`, `taloonbag_colorbase.c`, `courierbag.c`, `hippack_colorbase.c`, `partybag_colorbase.c`); `holster/` (`platecarrierholster.c`, `nylonknifesheath.c`, `splitleathercanteenholder.c`); `pouches/` (`platecarrierpouches.c`, `smershholster.c`, `smershbag.c`); `vests/` (`pressvest_colorbase.c`, `platecarrier_smershvest.c`, `platecarriervest.c`, `highcapacityvest_olive.c`, `chestholster.c`, `policevest.c`, `huntingvest.c`); `ammopouches/` (`ammopouch.c`); `belt/` (`militarybelt.c`, `cargobelt.c`, `tacticalbelt.c`, `ropebelt.c`) |
| `magazine/` | `magazine.c`, `magazine_stanag.c`, and 30+ magazine type files |
| `seedpackbase/` | `seedpack.c` |
| `suppressorbase/` | `ak_suppressor.c`, `pistol_suppressor.c` |
| `switchable_base/` | `headtorch_colorbase.c`, `heli_headdress_colorbase.c`, `navy_headdress_colorbase.c`, `desert_headdress_colorbase.c`, `christmas_headdress_colorbase.c`, `witchhoodcoif_colorbase.c`, `constructionlight.c`, `chemlightbase.c` |
| `tentbase/` | `tent_base.c`, `tent_small.c`, `tent_leather.c`, `tent_leather_roof.c`, `tent_camo.c` |
| `transmitterbase/` | `personalradio.c`, `transmitter.c` |
| `trapbase/` | `trap_base.c`, `beartrap.c`, `rabbitsnaretrap.c`, `smallfishtrap.c`, `fishnettrap.c` |
| `trapspawnbase/` | `trapspawnbase.c`, `tripodtrap.c` |
| `vehiclebattery/` | `carbattery.c`, `truckbattery.c` |
| `weaponattachments/` | `weaponattachments.c` and subdirectory files for bayonets, bipods, grips, handguards, optics, stocks, wraps, and suppressors |

#### Man Base (`manbase/`)

| File | Purpose |
|------|---------|
| `lightaibase.c` | `LightAIBase` — Base for AI-controlled humanoids |
| `playerbase.c` | `PlayerBase` — Base player entity |
| `playerbaseclient.c` | `PlayerBaseClient` — Client-side player entity |
| `playerbase/aitargetcallbacksplayer.c` | Player-specific AI target callbacks |
| `playerbase/playerconsumedata.c` | Player consumption data |
| `playerbase/survivorbase.c` | `SurvivorBase` — Survivor player class |
| `bodyparts/feet.c` | Feet body part |
| `bodyparts/hands.c` | Hands body part |
| `bodyparts/head.c` | Head body part |
| `bodyparts/legs.c` | Legs body part |
| `bodyparts/torso.c` | Torso body part |
| `dayzplayer/dayzplayercamera1stperson.c` | 1st person camera |
| `dayzplayer/dayzplayercamera3rdperson.c` | 3rd person camera |
| `dayzplayer/dayzplayercamera_base.c` | Camera base class |
| `dayzplayer/dayzplayercameraironsights.c` | Iron sights camera |
| `dayzplayer/dayzplayercameras.c` | Camera system main |
| `dayzplayer/dayzplayercameravehicles.c` | Vehicle camera |
| `dayzplayer/dayzplayercfgbase.c` | Player config base |
| `dayzplayer/dayzplayercfgsounds.c` | Player sound config |
| `dayzplayer/dayzplayermeleefightlogic_lightheavy.c` | Melee fight logic |

#### Scripted Entities (`scriptedentities/`)

| File | Purpose |
|------|---------|
| `triggers/trigger.c` | Base trigger entity |
| `triggers/barbedwiretrigger.c` | Barbed wire damage trigger |
| `triggers/contaminatedtrigger.c` | Contaminated area trigger |
| `triggers/cylindertrigger.c` | Cylinder-shaped trigger |
| `triggers/effecttrigger.c` | Visual effect trigger |
| `triggers/geysertrigger.c` | Geyser effect trigger |
| `triggers/hotspringtrigger.c` | Hot spring trigger |
| `triggers/mantrigger.c` | Man-detecting trigger |
| `triggers/spheretrigger.c` | Sphere-shaped trigger |
| `triggers/spookytrigger.c` | Spooky ambiance trigger |
| `triggers/traptrigger.c` | Trap activation trigger |
| `triggers/triggereffectmanager.c` | Trigger effect manager |
| `triggers/triggerevents.c` | Trigger event definitions |
| `triggers/undergroundbunkertrigger.c` | Underground bunker trigger |
| `triggers/undergroundtrigger.c` | Underground area trigger |
| `triggers/volcanictrigger.c` | Volcanic area trigger |

#### Scripted Light Base (`scriptedlightbase/`)

| File | Purpose |
|------|---------|
| `pointlightbase.c` | `PointLightBase` — Base point light |
| `spotlightbase.c` | `SpotlightBase` — Base spot light |

**Dimming:**

| File | Purpose |
|------|---------|
| `dimming/dimmingconfig.c` | Dimming configuration |
| `dimming/lightdimming.c` | Light dimming behavior |

**Point Lights:**

| File | Purpose |
|------|---------|
| `pointlightbase/anniversaryboxlight.c` | Anniversary box light |
| `pointlightbase/anniversarymainlight.c` | Anniversary main light |
| `pointlightbase/blowtorchlight.c` | Blowtorch light |
| `pointlightbase/bonfirelight.c` | Bonfire light |
| `pointlightbase/brightnesstestlight.c` | Brightness test light |
| `pointlightbase/buoylight.c` | Buoy light |
| `pointlightbase/chemlightlight.c` | Chemlight light |
| `pointlightbase/entrancelight.c` | Entrance area light |
| `pointlightbase/fireplacelight.c` | Fireplace light |
| `pointlightbase/flarelight.c` | Flare light |
| `pointlightbase/goatlight.c` | "GOAT" light effect |
| `pointlightbase/muzzleflashlight.c` | Muzzle flash light |
| `pointlightbase/partylight.c` | Party light |
| `pointlightbase/personallight.c` | Personal light (player) |
| `pointlightbase/portablegaslamplight.c` | Gas lamp light |
| `pointlightbase/roadflarelight.c` | Road flare light |
| `pointlightbase/stovelight.c` | Stove light |
| `pointlightbase/tirepilelight.c` | Tire fire light |
| `pointlightbase/torchlight.c` | Torch light |
| `pointlightbase/warheadstoragelight.c` | Warhead storage light |
| `pointlightbase/xmassleighlight.c` | Christmas sleigh light |
| `pointlightbase/xmastreelight.c` | Christmas tree light |
| `pointlightbase/zombiemummylight.c` | Zombie mummy light |

**Spot Lights:**

| File | Purpose |
|------|---------|
| `spotlightbase/flashlightlight.c` | Handheld flashlight |
| `spotlightbase/headtorchlight.c` | Head torch light |
| `spotlightbase/pistollightlight.c` | Pistol-mounted light |
| `spotlightbase/spotlightlight.c` | Fixed spotlight |
| `spotlightbase/universallightlight.c` | Universal light |
| `spotlightbase/carlightbase.c` | Vehicle light base |
| `spotlightbase/carlightbase/civiliansedanfrontlight.c` | Sedan front light |
| `spotlightbase/carlightbase/hatchback_02frontlight.c` | Hatchback front light |
| `spotlightbase/carlightbase/offroad_02frontlight.c` | Offroad front light |
| `spotlightbase/carlightbase/offroadhatchbackfrontlight.c` | Offroad hatchback front light |
| `spotlightbase/carlightbase/sedan_02frontlight.c` | Sedan 02 front light |
| `spotlightbase/carlightbase/truck_01frontlight.c` | Truck front light |
| `spotlightbase/carlightbase/carrearlightbase.c` | Rear light base |
| `spotlightbase/carlightbase/carrearlightbase/civiliansedanrearlight.c` | Sedan rear light |
| `spotlightbase/carlightbase/carrearlightbase/hatchback_02rearlight.c` | Hatchback rear light |
| `spotlightbase/carlightbase/carrearlightbase/offroad_02rearlight.c` | Offroad rear light |
| `spotlightbase/carlightbase/carrearlightbase/offroadhatchbackrearlight.c` | Offroad hatchback rear light |
| `spotlightbase/carlightbase/carrearlightbase/sedan_02rearlight.c` | Sedan 02 rear light |
| `spotlightbase/carlightbase/carrearlightbase/truck_01rearlight.c` | Truck rear light |

#### Vehicles (`vehicles/`)

| File | Purpose |
|------|---------|
| `boatscript.c` | `BoatScript` — Boat physics/behavior |
| `carscript.c` | `CarScript` — Car physics/behavior |
| `helicopterscript.c` | `HelicopterScript` — Helicopter physics/behavior |
| `vehicleaniminstances.c` | Vehicle animation instance definitions |
| `inheritedboats/boat_01.c` | Boat 01 (utility boat) |
| `inheritedcars/civiliansedan.c` | Civilian sedan |
| `inheritedcars/hatchback_02.c` | Hatchback 02 |
| `inheritedcars/offroad_02.c` | Offroad 02 |
| `inheritedcars/offroadhatchback.c` | Offroad hatchback |
| `inheritedcars/sedan_02.c` | Sedan 02 |
| `inheritedcars/test.c` | Test vehicle |
| `inheritedcars/truck_01_base.c` | Truck 01 base chassis |
| `inheritedcars/truck_01_cargo.c` | Truck 01 cargo variant |
| `inheritedcars/truck_01_chassis.c` | Truck 01 chassis |
| `inheritedcars/truck_01_covered.c` | Truck 01 covered variant |
| `inheritedcars/truck_02.c` | Truck 02 (V3S) |
| `inheritedcars/van_01.c` | Van 01 |

#### Wood Base (`woodbase/`)

| File | Purpose |
|------|---------|
| `bushes.c` | Bush entity |
| `christmastree.c` | Christmas tree entity |
| `trees.c` | Tree entity |

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
