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

**All Recipe Files (`recipes/recipes/`):**

| File | Purpose |
|------|---------|
| `attachholster.c` | Attach holster to vest |
| `attachholsterpouch.c` | Attach holster pouch |
| `attachpouch.c` | Attach pouch to carrier |
| `attachpouchesholster.c` | Attach pouches and holster |
| `bloodtest.c` | Test blood sample |
| `chelatewater.c` | Chelate contaminated water |
| `cleanrags.c` | Clean dirty rags |
| `cleanweapon.c` | Clean a weapon |
| `closescientificbriefcase.c` | Close scientific briefcase |
| `craftarmbandflag.c` | Craft armband from flag |
| `craftarmbandrag.c` | Craft armband from rag |
| `craftarmbandraincoat.c` | Craft armband from raincoat |
| `craftarrow.c` | Craft arrow |
| `craftarrowbone.c` | Craft bone arrow |
| `craftbait.c` | Craft fishing bait |
| `craftbaseballbatbarbed.c` | Craft barbed baseball bat |
| `craftbaseballbatnailed.c` | Craft nailed baseball bat |
| `craftbloodbagiv.c` | Craft blood bag IV |
| `craftbonebait.c` | Craft bone bait |
| `craftbonehook.c` | Craft bone hook |
| `craftboneknife.c` | Craft bone knife |
| `craftbow.c` | Craft bow |
| `craftburlapstrips.c` | Craft burlap strips |
| `craftcamonetshelter.c` | Craft camo net shelter |
| `craftcookingstand.c` | Craft cooking stand |
| `craftcourierbag.c` | Craft courier bag |
| `craftdrysackbag.c` | Craft dry sack bag |
| `craftfeathers.c` | Craft feathers from chicken |
| `craftfencekit.c` | Craft fence kit |
| `craftfireplace.c` | Craft fireplace |
| `craftfishingrod.c` | Craft fishing rod |
| `craftfishnettrap.c` | Craft fish net trap |
| `craftgasmask_filter_improvised.c` | Craft improvised gas mask filter |
| `craftghillieattachment.c` | Craft ghillie attachment |
| `craftghilliebushrag.c` | Craft ghillie bushrag |
| `craftghilliehood.c` | Craft ghillie hood |
| `craftghilliesuit.c` | Craft ghillie suit |
| `craftghillietop.c` | Craft ghillie top |
| `craftgorkahelmetcomplete.c` | Complete gorka helmet |
| `craftgutsrope.c` | Craft rope from guts |
| `crafthanddrillkit.c` | Craft hand drill kit |
| `craftimprovisedbag.c` | Craft improvised bag |
| `craftimprovisedexplosive.c` | Craft improvised explosive |
| `craftimprovisedleatherbag.c` | Craft improvised leather bag |
| `craftleathercourierbag.c` | Craft leather courier bag |
| `craftleathersack.c` | Craft leather sack |
| `craftlongtorch.c` | Craft long torch |
| `craftmetalwire.c` | Craft metal wire |
| `craftrabbitsnare.c` | Craft rabbit snare |
| `craftrag.c` | Craft rag |
| `craftragrope.c` | Craft rope from rags |
| `craftsalinebagiv.c` | Craft saline bag IV |
| `craftshelterkit.c` | Craft shelter kit |
| `craftsmallfishtrap.c` | Craft small fish trap |
| `craftspearbone.c` | Craft bone spear |
| `craftspearstone.c` | Craft stone spear |
| `craftsplint.c` | Craft splint |
| `craftstoneknife.c` | Craft stone knife |
| `craftsuppressor.c` | Craft firearm suppressor |
| `crafttannedleather.c` | Craft tanned leather |
| `craftterritoryflagkit.c` | Craft territory flag kit |
| `crafttorch.c` | Craft torch |
| `crafttripwire.c` | Craft tripwire |
| `crafttruck01doublewheel.c` | Craft truck double wheel |
| `craftwatchtowerkit.c` | Craft watchtower kit |
| `craftwitchhoodcoif.c` | Craft witch hood coif |
| `craftwoodencrate.c` | Craft wooden crate |
| `craftwoodenhook.c` | Craft wooden hook |
| `craftwoodenplank.c` | Craft wooden plank |
| `cutoutpepperseeds.c` | Cut out pepper seeds |
| `cutoutpumpkinseeds.c` | Cut out pumpkin seeds |
| `cutoutseeds.c` | Cut out seeds (generic) |
| `cutouttomatoseeds.c` | Cut out tomato seeds |
| `cutoutzucchiniseeds.c` | Cut out zucchini seeds |
| `decraftarmband.c` | Decraft/remove armband |
| `decraftbow.c` | Decraft bow |
| `decraftcamonetshelter.c` | Decraft camo net shelter |
| `decraftcarriercomplete.c` | Decraft complete carrier |
| `decraftcarrierholster.c` | Decraft carrier holster |
| `decraftcarrierpouches.c` | Decraft carrier pouches |
| `decraftcookingstand.c` | Decraft cooking stand |
| `decraftcourierbag.c` | Decraft courier bag |
| `decraftdetonator.c` | Decraft detonator |
| `decraftfishingrod.c` | Decraft fishing rod |
| `decraftfishnettrap.c` | Decraft fish net trap |
| `decraftghillieattachment.c` | Decraft ghillie attachment |
| `decraftghilliebushrag.c` | Decraft ghillie bushrag |
| `decraftghilliehood.c` | Decraft ghillie hood |
| `decraftghilliesuit.c` | Decraft ghillie suit |
| `decraftghillietop.c` | Decraft ghillie top |
| `decrafthanddrillkit.c` | Decraft hand drill kit |
| `decraftimprovisedbag.c` | Decraft improvised bag |
| `decraftimprovisedleatherbag.c` | Decraft improvised leather bag |
| `decraftleathercourierbag.c` | Decraft leather courier bag |
| `decraftleathersack.c` | Decraft leather sack |
| `decraftsnaretrap.c` | Decraft snare trap |
| `decraftspear.c` | Decraft spear |
| `decraftsplint.c` | Decraft splint |
| `decrafttripwire.c` | Decraft tripwire |
| `decrafttruck01doublewheel.c` | Decraft truck double wheel |
| `decraftwoodencrate.c` | Decraft wooden crate |
| `disinfectitem.c` | Disinfect an item |
| `drainliquid.c` | Drain liquid from container |
| `extinguishtorch.c` | Extinguish torch |
| `fillgasmask_filter.c` | Fill gas mask filter |
| `fillsyringe.c` | Fill syringe |
| `fuelchainsaw.c` | Fuel chainsaw |
| `loadmagazine.c` | Load ammunition into magazine |
| `opencan.c` | Open can |
| `openscientificbriefcase.c` | Open scientific briefcase |
| `paintak101.c` | Paint AK-101 |
| `paintak10130mag.c` | Paint AK-101 30-round magazine |
| `paintak74.c` | Paint AK-74 |
| `paintak7430mag.c` | Paint AK-74 30-round magazine |
| `paintak74hndgrdblack.c` | Paint AK-74 black handguard |
| `paintak74hndgrdcamo.c` | Paint AK-74 camo handguard |
| `paintak74woodbttstckblack.c` | Paint AK-74 black wood stock |
| `paintak74woodbttstckcamo.c` | Paint AK-74 camo wood stock |
| `paintakfoldingbttstck.c` | Paint AK folding stock |
| `paintakmdrummag.c` | Paint AKM drum magazine |
| `paintakmpalm30mag.c` | Paint AKM palm 30-round magazine |
| `paintakplasticbttstck.c` | Paint AK plastic stock |
| `paintakrailhndgrd.c` | Paint AK rail handguard |
| `paintaks74u.c` | Paint AKS-74U |
| `paintaks74ubttstck.c` | Paint AKS-74U stock |
| `paintakwoodbttstckblack.c` | Paint AK wood stock black |
| `paintakwoodbttstckcamo.c` | Paint AK wood stock camo |
| `paintb95.c` | Paint B-95 rifle |
| `paintballistichelmet.c` | Paint ballistic helmet |
| `paintcmag10.c` | Paint 10-round C-mag |
| `paintcmag20.c` | Paint 20-round C-mag |
| `paintcmag30.c` | Paint 30-round C-mag |
| `paintcmag40.c` | Paint 40-round C-mag |
| `paintcz527.c` | Paint CZ 527 |
| `paintcz527camoblack.c` | Paint CZ 527 camo black |
| `paintcz527camogreen.c` | Paint CZ 527 camo green |
| `paintdarkmotohelmet.c` | Paint dark moto helmet |
| `paintfirefighteraxe.c` | Paint firefighter axe |
| `paintghillieattblack.c` | Paint ghillie attachment black |
| `paintghillieattgreen.c` | Paint ghillie attachment green |
| `paintghillieattgreenmossy.c` | Paint ghillie attachment green mossy |
| `paintghilliebushragblack.c` | Paint ghillie bushrag black |
| `paintghilliebushraggreen.c` | Paint ghillie bushrag green |
| `paintghilliebushraggreenmossy.c` | Paint ghillie bushrag green mossy |
| `paintghilliehoodblack.c` | Paint ghillie hood black |
| `paintghilliehoodgreen.c` | Paint ghillie hood green |
| `paintghilliehoodgreenmossy.c` | Paint ghillie hood green mossy |
| `paintghilliesuitblack.c` | Paint ghillie suit black |
| `paintghilliesuitgreen.c` | Paint ghillie suit green |
| `paintghilliesuitgreenmossy.c` | Paint ghillie suit green mossy |
| `paintghillietopblack.c` | Paint ghillie top black |
| `paintghillietopgreen.c` | Paint ghillie top green |
| `paintghillietopgreenmossy.c` | Paint ghillie top green mossy |
| `paintgorkahelmet.c` | Paint Gorka helmet |
| `paintgorkahelmetcomplete.c` | Paint complete Gorka helmet |
| `paintm4a1.c` | Paint M4A1 |
| `paintm4cqbbttstck.c` | Paint M4 CQB stock |
| `paintm4mpbttstck.c` | Paint M4 MP stock |
| `paintm4mphndgrd.c` | Paint M4 MP handguard |
| `paintm4oebttstck.c` | Paint M4 OE stock |
| `paintm4plastichndgrd.c` | Paint M4 plastic handguard |
| `paintm4rishndgrd.c` | Paint M4 RIS handguard |
| `paintmosin.c` | Paint Mosin-Nagant |
| `paintmosincamoblack.c` | Paint Mosin camo black |
| `paintmosincamogreen.c` | Paint Mosin camo green |
| `paintmotohelmet.c` | Paint moto helmet |
| `paintruger1022.c` | Paint Ruger 10/22 |
| `paintsawedoffmosin.c` | Paint sawed-off Mosin |
| `paintsawedoffmosincamoblack.c` | Paint sawed-off Mosin camo black |
| `paintsawedoffmosincamogreen.c` | Paint sawed-off Mosin camo green |
| `paintsks.c` | Paint SKS |
| `paintzsh3pilothelmet.c` | Paint ZSH-3 pilot helmet |
| `patchitem.c` | Patch/repair item with sewing kit |
| `peelpotato.c` | Peel potato |
| `pluginrecipesmanagerbase.c` | Plugin recipe manager base |
| `pokeholesbarrel.c` | Poke holes in barrel |
| `pourliquid.c` | Pour liquid between containers |
| `prepareanimal.c` | Prepare animal for cooking |
| `preparecarp.c` | Prepare carp |
| `preparechicken.c` | Prepare chicken |
| `preparefish.c` | Prepare fish |
| `preparefox.c` | Prepare fox |
| `preparemackerel.c` | Prepare mackerel |
| `preparerabbit.c` | Prepare rabbit |
| `preparesteelheadtrout.c` | Prepare steelhead trout |
| `preparewalleyepollock.c` | Prepare walleye pollock |
| `purifywater.c` | Purify water |
| `recipetest.c` | Recipe test (debug) |
| `refueltorch.c` | Refuel torch |
| `repairelectric.c` | Repair electrical device |
| `repairepoxy.c` | Repair with epoxy putty |
| `repaireyepatch.c` | Repair eye patch |
| `repairplanks.c` | Repair planks |
| `repairwithpliers.c` | Repair with pliers |
| `repairwithrags.c` | Repair with rags |
| `repairwithtape.c` | Repair with duct tape |
| `sawoffb95.c` | Saw off B-95 barrel |
| `sawofffamas.c` | Saw off FAMAS barrel |
| `sawoffizh18.c` | Saw off Izh-18 barrel |
| `sawoffizh18shotgun.c` | Saw off Izh-18 shotgun barrel |
| `sawoffmagnum.c` | Saw off Magnum barrel |
| `sawoffmosin.c` | Saw off Mosin barrel |
| `sawoffmosinpainted.c` | Saw off painted Mosin barrel |
| `sawoffshotgunizh43.c` | Saw off Izh-43 shotgun barrel |
| `sawwoodenlog.c` | Saw wooden log into planks |
| `sharpenbroom.c` | Sharpen broom into spear |
| `sharpenlongstick.c` | Sharpen long stick |
| `sharpenmelee.c` | Sharpen melee weapon |
| `sharpenstick.c` | Sharpen stick |
| `splitbroom.c` | Split broom into sticks |
| `splitfirewood.c` | Split firewood |
| `splitlongwoodenstick.c` | Split long wooden stick |
| `splitstones.c` | Split stones into sharp stones |
| `upgradetorchwithlard.c` | Upgrade torch with lard |
| `upgradetorchwithliquidfuel.c` | Upgrade torch with liquid fuel |
| `writeletter.c` | Write a letter on paper |

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

**Continuous Actions (`actions/continuous/`):**

| File | Purpose |
|------|---------|
| `actionactivatetrap.c` | Activate a trap |
| `actionarmexplosive.c` | Arm an explosive device |
| `actionattachexplosivestrigger.c` | Attach explosive trigger |
| `actionbreaklongwoodenstick.c` | Break long wooden stick |
| `actionbuildoven.c` | Build an oven |
| `actionbuildpart.c` | Build a construction part |
| `actionbuildstonecircle.c` | Build a stone circle |
| `actionburyashes.c` | Bury fireplace ashes |
| `actionburybody.c` | Bury a body |
| `actionconsume.c` | Consume food/drink (generic) |
| `actioncookonstick.c` | Cook food on a stick |
| `actioncoverheadself.c` | Cover own head |
| `actioncoverheadtarget.c` | Cover target's head |
| `actioncraft.c` | Craft an item |
| `actioncraftarmband.c` | Craft an armband |
| `actioncraftbolts.c` | Craft bolts |
| `actioncraftboltsfeather.c` | Craft bolts with feather |
| `actioncraftboneknife.c` | Craft bone knife |
| `actioncraftboneknifeenv.c` | Craft bone knife (environment) |
| `actioncraftimprovisedeyepatch.c` | Craft improvised eyepatch |
| `actioncraftimprovisedfacecover.c` | Craft improvised face cover |
| `actioncraftimprovisedfeetcover.c` | Craft improvised feet cover |
| `actioncraftimprovisedhandscover.c` | Craft improvised hands cover |
| `actioncraftimprovisedheadcover.c` | Craft improvised head cover |
| `actioncraftimprovisedlegscover.c` | Craft improvised legs cover |
| `actioncraftimprovisedtorsocover.c` | Craft improvised torso cover |
| `actioncraftropebelt.c` | Craft rope belt |
| `actioncraftstoneknifeenv.c` | Craft stone knife (environment) |
| `actioncreategreenhousegardenplot.c` | Create greenhouse garden plot |
| `actiondecraftdrysackbag.c` | Decraft dry sack bag |
| `actiondecraftropebelt.c` | Decraft rope belt |
| `actiondecraftwitchhoodcoif.c` | Decraft witch hood coif |
| `actiondestroycombinationlock.c` | Destroy combination lock |
| `actiondestroypart.c` | Destroy construction part |
| `actiondialcombinationlock.c` | Dial combination lock |
| `actiondialcombinationlockontarget.c` | Dial combo lock on target |
| `actiondiggardenplot.c` | Dig garden plot |
| `actiondiginstash.c` | Dig in stash |
| `actiondigoutstash.c` | Dig out stash |
| `actiondigworms.c` | Dig for worms |
| `actiondisarmexplosive.c` | Disarm explosive |
| `actiondisarmexplosivewithremotedetonator.c` | Disarm explosive with remote detonator |
| `actiondisarmexplosivewithremotedetonatorunpaired.c` | Disarm explosive (unpaired detonator) |
| `actiondisarmmine.c` | Disarm mine |
| `actiondisinfectplant.c` | Disinfect plant |
| `actiondismantlegardenplot.c` | Dismantle garden plot |
| `actiondismantleoven.c` | Dismantle oven |
| `actiondismantlepart.c` | Dismantle construction part |
| `actiondismantlestonecircle.c` | Dismantle stone circle |
| `actiondrainliquid.c` | Drain liquid |
| `actiondrink.c` | Drink from container |
| `actiondrinkcan.c` | Drink from can |
| `actiondrinkcookingpot.c` | Drink from cooking pot |
| `actiondrinkpondcontinuous.c` | Drink from pond |
| `actiondrinkthroughcontinuous.c` | Drink through (filter/straw) |
| `actiondrinkwellcontinuous.c` | Drink from well |
| `actiondummyrelease.c` | Dummy release action |
| `actioneat.c` | Eat food |
| `actioneatcan.c` | Eat from can |
| `actioneatcereal.c` | Eat cereal |
| `actioneatfruit.c` | Eat fruit |
| `actioneatmeat.c` | Eat meat |
| `actioneatsnowcontinuous.c` | Eat snow |
| `actionemptybottlebase.c` | Empty bottle |
| `actionemptycookingpot.c` | Empty cooking pot |
| `actionemptymagazine.c` | Empty magazine |
| `actionextinguishfireplacebyextinguisher.c` | Extinguish fireplace with extinguisher |
| `actionextinguishfireplacebyliquid.c` | Extinguish fireplace with liquid |
| `actionfertilizeslot.c` | Fertilize garden slot |
| `actionfillbottlebase.c` | Fill bottle |
| `actionfillbottlesnow.c` | Fill bottle with snow |
| `actionfillgeneratortank.c` | Fill generator tank |
| `actionfillobject.c` | Fill object with liquid |
| `actionfishing.c` | Fish (original) |
| `actionfishingnew.c` | Fish (new system) |
| `actionfoldbasebuildingobject.c` | Fold base building object |
| `actionforceconsume.c` | Force consume item on another |
| `actionforcedrink.c` | Force drink another |
| `actionforcefeed.c` | Force feed another |
| `actionforcefeedcan.c` | Force feed can to another |
| `actionforcefeedmeat.c` | Force feed meat to another |
| `actiongagself.c` | Gag self |
| `actiongagtarget.c` | Gag target |
| `actionignitefireplacebyair.c` | Ignite fireplace (air) |
| `actionlightitemonfire.c` | Light item on fire |
| `actionlightitemonfirewithblowtorch.c` | Light item with blowtorch |
| `actionloadmagazine.c` | Load magazine |
| `actionlockattachment.c` | Lock attachment |
| `actionlockdoors.c` | Lock doors |
| `actionlowerflag.c` | Lower territory flag |
| `actionminebush.c` | Mine bush (with tool) |
| `actionminebushbyhand.c` | Mine bush by hand |
| `actionminerock.c` | Mine rock |
| `actionminetree.c` | Mine tree |
| `actionminetreebark.c` | Mine tree bark |
| `actionmountbarbedwire.c` | Mount barbed wire |
| `actionpackgift.c` | Pack gift |
| `actionplaceobject.c` | Place object from hands |
| `actionplaceonground.c` | Place item on ground |
| `actionpourliquid.c` | Pour liquid |
| `actionpushboat.c` | Push boat |
| `actionpushcar.c` | Push car |
| `actionpushobject.c` | Push object |
| `actionraiseflag.c` | Raise territory flag |
| `actionraisemegaphone.c` | Raise megaphone |
| `actionrefueltorch.c` | Refuel torch |
| `actionrepairboatchassis.c` | Repair boat chassis |
| `actionrepairboatengine.c` | Repair boat engine |
| `actionrepaircarchassis.c` | Repair car chassis |
| `actionrepaircarchassiswithblowtorch.c` | Repair car chassis with blowtorch |
| `actionrepaircarengine.c` | Repair car engine |
| `actionrepaircarenginewithblowtorch.c` | Repair car engine with blowtorch |
| `actionrepaircarpart.c` | Repair car part |
| `actionrepaircarpartwithblowtorch.c` | Repair car part with blowtorch |
| `actionrepairitemwithblowtorch.c` | Repair item with blowtorch |
| `actionrepairpart.c` | Repair construction part |
| `actionrepairshelter.c` | Repair shelter |
| `actionrepairtent.c` | Repair tent |
| `actionrepairtentpart.c` | Repair tent part |
| `actionrepairvehiclepartbase.c` | Repair vehicle part base |
| `actionrestrainself.c` | Restrain self |
| `actionrestraintarget.c` | Restrain target |
| `actionsawplanks.c` | Saw planks |
| `actionshave.c` | Shave self |
| `actionshavetarget.c` | Shave target |
| `actionskinning.c` | Skin animal |
| `actionsortammopile.c` | Sort ammo pile |
| `actionstripcarriervest.c` | Strip carrier vest |
| `actiontransferliquid.c` | Transfer liquid |
| `actiontunefrequency.c` | Tune frequency |
| `actiontuneradiostation.c` | Tune radio station |
| `actionturnvalve.c` | Turn valve |
| `actionturnvalveundergroundreservoir.c` | Turn underground reservoir valve |
| `actionuncoverheadself.c` | Uncover own head |
| `actionuncoverheadtarget.c` | Uncover target's head |
| `actionungagself.c` | Ungag self |
| `actionungagtarget.c` | Ungag target |
| `actionunlockcontainerdoor.c` | Unlock container door |
| `actionunlockdoors.c` | Unlock doors |
| `actionunmountbarbedwire.c` | Unmount barbed wire |
| `actionunpackbox.c` | Unpack box |
| `actionunpackgift.c` | Unpack gift |
| `actionunrestrainself.c` | Unrestrain self |
| `actionunrestraintarget.c` | Unrestrain target |
| `actionunrestraintargetempty.c` | Unrestrain target (empty hands) |
| `actionupgradetorchfromgaspump.c` | Upgrade torch from gas pump |
| `actionuserangefinder.c` | Use rangefinder |
| `actionviewbinoculars.c` | View through binoculars |
| `actionviewcompass.c` | View compass |
| `actionviewoptics.c` | View through weapon optics |
| `actionwashhandsitemcontinuous.c` | Wash hands with item |
| `actionwashhandssnow.c` | Wash hands with snow |
| `actionwashhandswater.c` | Wash hands with water |
| `actionwashhandswell.c` | Wash hands at well |
| `actionwatergardenslot.c` | Water garden slot |
| `actionwaterplant.c` | Water plant |
| `actionworldcraft.c` | World craft (environmental crafting) |
| `actionwringclothes.c` | Wring out wet clothes |

**Continuous actions subdirectories:**

| Directory | Contents |
|-----------|----------|
| `deployactions/` | `actiondeploybase.c`, `actiondeployhuntingtrap.c`, `actiondeployobject.c` |
| `medical/` | Bandage, burn sew, check pulse, collect blood, CPR, defibrillate, drink alcohol/disinfectant, eat pills, force feed medical, give blood/saline, measure temperature, sew, splint, test blood (20 files) |
| `vehicles/` | `actioncarhorn.c`, `actionfillbrakes.c`, `actionfillcoolant.c`, `actionfillfuel.c`, `actionfilloil.c`, `actionstartengine.c`, `actionstartengineboat.c` |

**Interact Actions (`actions/interact/`):**

| File | Purpose |
|------|---------|
| `actionbuildshelter.c` | Build shelter |
| `actionclosebarrel.c` | Close barrel |
| `actionclosebarrelholes.c` | Close barrel holes |
| `actionclosedoors.c` | Close doors |
| `actionclosefence.c` | Close fence |
| `actiondetach.c` | Detach item |
| `actiondetachfromtarget.c` | Detach item from target |
| `actiondetachpowersourcefrompanel.c` | Detach power source from panel |
| `actionenterladder.c` | Enter ladder |
| `actionexitladder.c` | Exit ladder |
| `actionfoldobject.c` | Fold object |
| `actiongetintransport.c` | Get in transport vehicle |
| `actiongetouttransport.c` | Get out of transport |
| `actionhandspartswitch.c` | Switch hands part |
| `actionharvestcrops.c` | Harvest crops |
| `actionitest.c` | Interaction test |
| `actionnextcombinationlockdialontarget.c` | Next combo lock dial |
| `actionopenbarrel.c` | Open barrel |
| `actionopenbarrelholes.c` | Open barrel holes |
| `actionopendoors.c` | Open doors |
| `actionopenfence.c` | Open fence |
| `actionoperatepanel.c` | Operate panel |
| `actionoperatepanelpowerstation.c` | Operate power station panel |
| `actionpackshelter.c` | Pack shelter |
| `actionpacktent.c` | Pack tent |
| `actionpickberry.c` | Pick berry |
| `actionpickupchicken.c` | Pick up chicken (dead) |
| `actionpullbodyfromtransport.c` | Pull body from transport |
| `actionpulloutplug.c` | Pull out plug |
| `actionremoveplant.c` | Remove plant |
| `actionremoveseed.c` | Remove seed |
| `actionrepacktent.c` | Repack tent |
| `actionrepositionpluggeditem.c` | Reposition plugged item |
| `actionsetalarmclock.c` | Set alarm clock |
| `actionsetkitchentimer.c` | Set kitchen timer |
| `actionswapitemtohand.c` | Swap item to hand |
| `actiontakearrow.c` | Take arrow |
| `actiontakearrowtohands.c` | Take arrow to hands |
| `actiontakefireplacefrombarrel.c` | Take fireplace from barrel |
| `actiontakefireplaceindoor.c` | Take indoor fireplace |
| `actiontakehybridattachment.c` | Take hybrid attachment |
| `actiontakehybridattachmenttohands.c` | Take hybrid attachment to hands |
| `actiontakeitem.c` | Take item |
| `actiontakeitemtohands.c` | Take item to hands |
| `actiontakematerialtohands.c` | Take material to hands |
| `actiontakeovenindoor.c` | Take indoor oven |
| `actiontoggletentopen.c` | Toggle tent open/closed |
| `actiontunefrequencyonground.c` | Tune frequency (on ground) |
| `actionturnoffpowergenerator.c` | Turn off power generator |
| `actionturnoffspotlight.c` | Turn off spotlight |
| `actionturnofftransmitteronground.c` | Turn off transmitter (on ground) |
| `actionturnoffwhileonground.c` | Turn off device (on ground) |
| `actionturnonpowergenerator.c` | Turn on power generator |
| `actionturnonspotlight.c` | Turn on spotlight |
| `actionturnontransmitteronground.c` | Turn on transmitter (on ground) |
| `actionturnonwhileonground.c` | Turn on device (on ground) |
| `actionunplugthisbycord.c` | Unplug device by cord |
| `actionuseundergroundlever.c` | Use underground lever |
| `actionuseundergroundpanel.c` | Use underground panel |
| `actionwashhandswaterone.c` | Wash hands (water, one-handed) |
| `actionwashhandswellone.c` | Wash hands (well, one-handed) |

**Interact Vehicle Actions (`actions/interact/vehicles/`):**

| File | Purpose |
|------|---------|
| `actionanimatecarselection.c` | Animate car selection |
| `actionanimateseats.c` | Animate seats |
| `actioncardoors.c` | Car doors |
| `actioncardoorsoutside.c` | Car doors (outside) |
| `actionclosecardoors.c` | Close car doors |
| `actionclosecardoorsoutside.c` | Close car doors (outside) |
| `actionopencardoors.c` | Open car doors |
| `actionopencardoorsoutside.c` | Open car doors (outside) |
| `actionsideplateinteract.c` | Side plate interaction |
| `actionswitchlights.c` | Switch vehicle lights |

**Single-Use Actions (`actions/singleuse/`):**

| File | Purpose |
|------|---------|
| `actionattach.c` | Attach item |
| `actionattachonproxy.c` | Attach on proxy |
| `actionattachonselection.c` | Attach on selection |
| `actionattachontentproxy.c` | Attach on tent proxy |
| `actionattachontrap.c` | Attach on trap |
| `actionattachpowersourcetopanel.c` | Attach power source to panel |
| `actionattachseeds.c` | Attach seeds |
| `actionattachtoconstruction.c` | Attach to construction |
| `actionattachwheels.c` | Attach wheels |
| `actionattachwithswich.c` | Attach with switch |
| `actionbuildpartswitch.c` | Build part with switch |
| `actionclapbeartrapwiththisitem.c` | Clap bear trap with item |
| `actionclose.c` | Close (generic) |
| `actionconsumesingle.c` | Consume single |
| `actioncreateindoorfireplace.c` | Create indoor fireplace |
| `actioncreateindooroven.c` | Create indoor oven |
| `actiondisinfectplantbit.c` | Disinfect plant (single) |
| `actiondropitem.c` | Drop item |
| `actiondropitemsimple.c` | Drop item simple |
| `actionemptyseedspack.c` | Empty seeds pack |
| `actionextinquishtorchvideo.c` | Extinguish torch (video) |
| `actionfoldbandanatohead.c` | Fold bandana to head |
| `actionfoldbandanatomask.c` | Fold bandana to mask |
| `actionfoldentitytoslot.c` | Fold entity to slot |
| `actionfoldmap.c` | Fold map |
| `actionforceabite.c` | Force a bite |
| `actionforceabitecan.c` | Force a bite (can) |
| `actionforceasip.c` | Force a sip |
| `actionforceconsumesingle.c` | Force consume single |
| `actionhandcufftarget.c` | Handcuff target |
| `actioninstallsparkplug.c` | Install spark plug |
| `actionlighttorchvideo.c` | Light torch (video) |
| `actionmeasurebattery.c` | Measure battery |
| `actionnextcombinationlockdial.c` | Next combo lock dial |
| `actionopen.c` | Open (generic) |
| `actionpin.c` | Pin (grenade) |
| `actionplacefireplaceindoor.c` | Place fireplace indoor |
| `actionplacefireplaceintobarrel.c` | Place fireplace in barrel |
| `actionplaceovenindoor.c` | Place oven indoor |
| `actionplantseed.c` | Plant seed |
| `actionplugin.c` | Plugin item |
| `actionplugintofence.c` | Plugin to fence |
| `actionplugtargetintothis.c` | Plug target into this |
| `actionreadpaper.c` | Read paper |
| `actionrepairwithtoolfromhands.c` | Repair with tool from hands |
| `actionresetkitchentimer.c` | Reset kitchen timer |
| `actiontakeabite.c` | Take a bite |
| `actiontakeabitecan.c` | Take a bite (can) |
| `actiontakeasip.c` | Take a sip |
| `actiontakematerialtohandsswitch.c` | Take material to hands (switch) |
| `actiontogglefishing.c` | Toggle fishing |
| `actiontogglenvg.c` | Toggle NVG |
| `actiontogglenvmode.c` | Toggle NV mode |
| `actiontoggleplaceobject.c` | Toggle place object |
| `actiontoggleplaceobjectdigging.c` | Toggle place object (digging) |
| `actiontriggerremotely.c` | Trigger remotely |
| `actionturnoffalarmclock.c` | Turn off alarm clock |
| `actionturnoffheadtorch.c` | Turn off head torch |
| `actionturnoffhelmetflashlight.c` | Turn off helmet flashlight |
| `actionturnofftransmitter.c` | Turn off transmitter |
| `actionturnoffweaponflashlight.c` | Turn off weapon flashlight |
| `actionturnoffwhileinhands.c` | Turn off (in hands) |
| `actionturnonalarmclock.c` | Turn on alarm clock |
| `actionturnonchemlight.c` | Turn on chem light |
| `actionturnonheadtorch.c` | Turn on head torch |
| `actionturnonheatpack.c` | Turn on heat pack |
| `actionturnonhelmetflashlight.c` | Turn on helmet flashlight |
| `actionturnontransmitter.c` | Turn on transmitter |
| `actionturnonweaponflashlight.c` | Turn on weapon flashlight |
| `actionturnonwhileinhands.c` | Turn on (in hands) |
| `actionunfoldbandana.c` | Unfold bandana |
| `actionunfoldentity.c` | Unfold entity |
| `actionunfoldmap.c` | Unfold map |
| `actionunpin.c` | Unpin (grenade) |
| `actionwashhandsitem.c` | Wash hands with item |
| `actionworldcraftcancel.c` | Cancel world craft |
| `actionworldcraftswitch.c` | Switch world craft mode |
| `actionworldflagactionswitch.c` | Switch world flag action |
| `actionworldliquidactionswitch.c` | Switch world liquid action |
| `actionwritepaper.c` | Write on paper |
| `actionzoomin.c` | Zoom in |
| `actionzoomout.c` | Zoom out |

**Single-Use Medical Actions (`actions/singleuse/medical/`):**

| File | Purpose |
|------|---------|
| `actionbitecharcoaltablets.c` | Bite charcoal tablets |
| `actionbitepainkillertablets.c` | Bite painkiller tablets |
| `actionbitepurificationtablets.c` | Bite purification tablets |
| `actionbitetetracyclineantibiotics.c` | Bite tetracycline antibiotics |
| `actionbitevitaminbottle.c` | Bite vitamin bottle |
| `actiondisinfectself.c` | Disinfect self |
| `actiondisinfecttarget.c` | Disinfect target |
| `actioneatpillfrombottle.c` | Eat pill from bottle |
| `actioneattabletfromwrapper.c` | Eat tablet from wrapper |
| `actionforcebitecharcoaltablets.c` | Force bite charcoal tablets |
| `actionforcebitepainkillertablets.c` | Force bite painkiller tablets |
| `actionforcebitepurificationtablets.c` | Force bite purification tablets |
| `actionforcebitetetracyclineantibiotics.c` | Force bite tetracycline antibiotics |
| `actionforcebitevitaminbottle.c` | Force bite vitamin bottle |
| `actioninjectepinephrineself.c` | Inject epinephrine (self) |
| `actioninjectepinephrinetarget.c` | Inject epinephrine (target) |
| `actioninjectmorphineself.c` | Inject morphine (self) |
| `actioninjectmorphinetarget.c` | Inject morphine (target) |
| `actioninjectself.c` | Inject self (generic) |
| `actioninjecttarget.c` | Inject target (generic) |

**Single-Use Vehicle Actions (`actions/singleuse/vehicles/`):**

| File | Purpose |
|------|---------|
| `actionstopengine.c` | Stop engine |
| `actionstopengineboat.c` | Stop boat engine |
| `actionswitchseats.c` | Switch seats |

**Weapon Actions (`actions/weapons/`):**

| File | Purpose |
|------|---------|
| `firearmactionattachmagazine.c` | Attach magazine to firearm |
| `firearmactionbase.c` | Firearm action base class |
| `firearmactiondetachmagazine.c` | Detach magazine from firearm |
| `firearmactionloadbullet.c` | Load single bullet |
| `firearmactionloadmultibullet.c` | Load multiple bullets |
| `firearmactionmechanicmanipulate.c` | Mechanical manipulation |
| `firearmactionunjam.c` | Unjam weapon |

**Item Condition Components (`itemconditioncomponents/`):**

| File | Purpose |
|------|---------|
| `ccibase.c` | Item condition component base |
| `ccidummy.c` | Dummy condition component |
| `ccinone.c` | No condition check |
| `ccinonruined.c` | Not ruined condition |
| `ccinotempty.c` | Not empty condition |
| `ccinotpresent.c` | Not present condition |
| `ccinotruinedanddry.c` | Not ruined and dry condition |
| `ccinotruinedandempty.c` | Not ruined and empty condition |
| `ccipresent.c` | Present condition |

**Target Condition Components (`targetconditionscomponents/`):**

| File | Purpose |
|------|---------|
| `cctbase.c` | Target condition component base |
| `cctcursor.c` | Cursor target condition |
| `cctcursornoobject.c` | Cursor no object condition |
| `cctcursornoruincheck.c` | Cursor no ruin check |
| `cctcursorparent.c` | Cursor parent condition |
| `cctdummy.c` | Dummy target condition |
| `cctman.c` | Man target condition |
| `cctnone.c` | No target condition |
| `cctnonruined.c` | Not ruined target condition |
| `cctobject.c` | Object target condition |
| `cctself.c` | Self target condition |
| `cctsurface.c` | Surface target condition |
| `ccttree.c` | Tree target condition |
| `cctwatersurface.c` | Water surface target condition |

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
| `industrial/misc/land_misc_through_static.c` | Through static industrial misc |

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
| `military/houses/mil_barracks1.c` | Military barracks 1 |
| `military/houses/mil_barracks3.c` | Military barracks 3 |
| `military/houses/mil_barracks4.c` | Military barracks 4 |

**Residential:**

| File | Purpose |
|------|---------|
| `residential/houseblocks/land_houseblock_1.c` | House block 1 |
| `residential/houseblocks/land_houseblock_2.c` | House block 2 |
| `residential/houseblocks/land_houseblock_3.c` | House block 3 |
| `residential/houseblocks/land_houseblock_4.c` | House block 4 |
| `residential/houseblocks/houseblock_1f1.c` | House block 1F1 |
| `residential/houseblocks/houseblock_1f3.c` | House block 1F3 |
| `residential/houseblocks/houseblock_1f4.c` | House block 1F4 |
| `residential/houseblocks/houseblock_2f1.c` | House block 2F1 |
| `residential/houseblocks/houseblock_2f8.c` | House block 2F8 |
| `residential/houseblocks/houseblock_2f9.c` | House block 2F9 |
| `residential/houseblocks/houseblock_3f2.c` | House block 3F2 |
| `residential/houseblocks/houseblock_5f.c` | House block 5F |
| `residential/houses/land_house_1b01_pub.c` | House 1B01 pub |
| `residential/houses/land_house_1w01.c` | House 1W01 |
| `residential/houses/land_house_1w02.c` | House 1W02 |
| `residential/houses/land_house_1w03.c` | House 1W03 |
| `residential/houses/land_house_1w04.c` | House 1W04 |
| `residential/houses/land_house_1w05.c` | House 1W05 |
| `residential/houses/land_house_1w06.c` | House 1W06 |
| `residential/houses/land_house_1w08.c` | House 1W08 |
| `residential/houses/land_house_1w09.c` | House 1W09 |
| `residential/houses/land_house_1w10.c` | House 1W10 |
| `residential/houses/land_house_1w11.c` | House 1W11 |
| `residential/houses/land_house_1w12.c` | House 1W12 |
| `residential/houses/land_house_2b01.c` | House 2B01 |
| `residential/houses/land_house_2w01.c` | House 2W01 |
| `residential/houses/land_house_2w02.c` | House 2W02 |
| `residential/houses/land_village_pub.c` | Village pub |
| `residential/misc/land_misc_greenhouse.c` | Greenhouse |
| `residential/misc/land_misc_well_pump_blue.c` | Blue well pump |
| `residential/misc/land_misc_well_pump_yellow.c` | Yellow well pump |

**Specific:**

| File | Purpose |
|------|---------|
| `specific/land_church.c` | Church building |
| `specific/land_water_tower.c` | Water tower |
| `specific/land_lighthouse.c` | Lighthouse |
| `specific/land_windmill.c` | Windmill |
| `specific/land_castle_berghof.c` | Castle berghof |
| `specific/land_castle_ruins.c` | Castle ruins |
| `specific/anniversarymusicsource.c` | Anniversary music source |
| `specific/anniversaryspotlight.c` | Anniversary spotlight |
| `specific/bonfire.c` | Bonfire |
| `specific/land_buoy.c` | Buoy |
| `specific/land_fuelstation_feed.c` | Fuel station feed |
| `specific/land_waterspring_sakhal.c` | Sakhal water spring |
| `specific/misc_tirepile_burning.c` | Burning tire pile |

**Underground:**

| File | Purpose |
|------|---------|
| `underground/bunker.c` | Underground bunker |
| `underground/entrance/land_underground_entrance.c` | Underground entrance |
| `underground/entrance/land_underground_panel.c` | Underground panel |
| `underground/entrance/land_underground_panel_lever.c` | Underground panel lever |
| `underground/land_warheadstorage_main.c` | Warhead storage main |
| `underground/land_warheadstorage_powerstation.c` | Warhead storage power station |
| `underground/powergeneratorstatic.c` | Static power generator |
| `underground/stairs/land_underground_stairs_bottom.c` | Underground stairs bottom |
| `underground/stairs/land_underground_stairs_middle.c` | Underground stairs middle |
| `underground/stairs/land_underground_stairs_top.c` | Underground stairs top |
| `underground/stairs/land_underground_stairs_exit.c` | Underground stairs exit |
| `underground/water/land_underground_waterreservoir.c` | Underground water reservoir |

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
| `wrecks/staticobj_roadblock_wood_small.c` | Small wood roadblock |
| `wrecks/wreck_mi8.c` | Mi8 wreck static |
| `wrecks/wreck_santassleigh.c` | Santa's sleigh wreck |
| `wrecks/wreck_uh1y.c` | UH-1Y wreck |

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

**Bark Colors (`bark_colorbase/`):**

| File | Purpose |
|------|---------|
| `bark_birch.c` | Birch bark item |
| `bark_oak.c` | Oak bark item |

**Base Building (`basebuildingbase/`):**

| File | Purpose |
|------|---------|
| `fence.c` | Fence construction |
| `sheltersite.c` | Shelter construction site |
| `staticflagpole.c` | Static flag pole |
| `totem.c` | Territory totem |
| `watchtower.c` | Watchtower construction |

**Blood Containers (`bloodcontainerbase/`):**

| File | Purpose |
|------|---------|
| `bloodbagempty.c` | Empty blood bag |
| `bloodbagfull.c` | Full blood bag |
| `bloodbagiv.c` | Blood bag IV |
| `bloodcontainerbase.c` | Blood container base |
| `bloodsyringe.c` | Blood syringe |
| `syringe.c` | Syringe |

**Clothing (`clothing/`):**

| File | Purpose |
|------|---------|
| `airbornemask.c` | Airborne mask |
| `alicebag_colorbase.c` | Alice bag (color variants) |
| `armband_colorbase.c` | Armband (color variants) |
| `armband_white.c` | White armband |
| `armypouch_colorbase.c` | Army pouch (color variants) |
| `assaultbag_colorbase.c` | Assault bag (color variants) |
| `athleticshoes_colorbase.c` | Athletic shoes (color variants) |
| `aviatorglasses.c` | Aviator sunglasses |
| `balaclava3holes_colorbase.c` | Balaclava 3-hole (color variants) |
| `balaclavamask_colorbase.c` | Balaclava mask (color variants) |
| `ballerinas_colorbase.c` | Ballerina shoes (color variants) |
| `bandana_hybrid.c` | Bandana hybrid (hat/mask) |
| `bandanamask_colorbase.c` | Bandana mask (color variants) |
| `baseballcap_colorbase.c` | Baseball cap (color variants) |
| `bdujacket.c` | BDU jacket |
| `bdupants.c` | BDU pants |
| `beaniehat_colorbase.c` | Beanie hat (color variants) |
| `blouse_colorbase.c` | Blouse (color variants) |
| `bomberjacket_colorbase.c` | Bomber jacket (color variants) |
| `booniehat_colorbase.c` | Boonie hat (color variants) |
| `breeches_colorbase.c` | Breeches (color variants) |
| `budenovkahat_colorbase.c` | Budenovka hat (color variants) |
| `burlapsackcover.c` | Burlap sack cover |
| `bushlatpolicejacket.c` | Bushlat police jacket |
| `canvasbag_colorbase.c` | Canvas bag (color variants) |
| `canvaspants.c` | Canvas pants |
| `cargopants_colorbase.c` | Cargo pants (color variants) |
| `chainmail.c` | Chainmail armor |
| `chainmail_coif.c` | Chainmail coif |
| `chainmail_leggings.c` | Chainmail leggings |
| `chernarussportshirt.c` | Chernarus sport shirt |
| `chestholster.c` | Chest holster |
| `chestplate.c` | Chest plate armor |
| `childbag_colorbase.c` | Child's bag (color variants) |
| `christmasheadband_colorbase.c` | Christmas headband (color variants) |
| `civilianbelt.c` | Civilian belt |
| `combatboots_colorbase.c` | Combat boots (color variants) |
| `courierbag.c` | Courier bag |
| `cowboyhat_colorbase.c` | Cowboy hat (color variants) |
| `coyotebag_colorbase.c` | Coyote bag (color variants) |
| `crookednose.c` | Crooked nose |
| `dallasmask.c` | Dallas mask (Payday) |
| `denimjacket.c` | Denim jacket |
| `designerglasses.c` | Designer glasses |
| `downjacket_colorbase.c` | Down jacket (color variants) |
| `dressshoes_colorbase.c` | Dress shoes (color variants) |
| `drybag_colorbase.c` | Dry bag (color variants) |
| `drysackbag_colorbase.c` | Dry sack bag (color variants) |
| `duffelbagsmall_colorbase.c` | Small duffel bag (color variants) |
| `eyepatch_improvised.c` | Improvised eyepatch |
| `facecover_improvised.c` | Improvised face cover |
| `feetcover_improvised.c` | Improvised feet cover |
| `firefighterjacket_colorbase.c` | Firefighter jacket (color variants) |
| `firefighterspants_colorbase.c` | Firefighter pants (color variants) |
| `flatcap_colorbase.c` | Flat cap (color variants) |
| `furcourierbag.c` | Fur courier bag |
| `furimprovisedbag.c` | Fur improvised bag |
| `gasmask.c` | Gas mask |
| `gasmask_filter.c` | Gas mask filter |
| `ghilliebushrag_colorbase.c` | Ghillie bushrag (color variants) |
| `ghilliehood_colorbase.c` | Ghillie hood (color variants) |
| `ghilliesuit_colorbase.c` | Ghillie suit (color variants) |
| `ghillietop_colorbase.c` | Ghillie top (color variants) |
| `gorkaejacket_colorbase.c` | Gorka E jacket (color variants) |
| `gorkapants_colorbase.c` | Gorka pants (color variants) |
| `gp5gasmask.c` | GP-5 gas mask |
| `greathelm.c` | Great helm |
| `guyfawkesmask.c` | Guy Fawkes mask |
| `handscover_improvised.c` | Improvised hands cover |
| `headbandana_colorbase.c` | Head bandana (color variants) |
| `headcover_improvised.c` | Improvised head cover |
| `headdress_colorbase.c` | Headdress (color variants) |
| `headtorch_black.c` | Black head torch |
| `headtorch_colorbase.c` | Head torch (color variants) |
| `headtorch_grey.c` | Grey head torch |
| `helmetbase.c` | Helmet base class |
| `highcapacityvest_colorbase.c` | High capacity vest (color variants) |
| `hikingboots_colorbase.c` | Hiking boots (color variants) |
| `hikingbootslow_colorbase.c` | Low hiking boots (color variants) |
| `hikingjacket_colorbase.c` | Hiking jacket (color variants) |
| `hippack_colorbase.c` | Hip pack (color variants) |
| `hockeymask.c` | Hockey mask |
| `hoodie_colorbase.c` | Hoodie (color variants) |
| `hoxtonmask.c` | Hoxton mask (Payday) |
| `hunterpants_colorbase.c` | Hunter pants (color variants) |
| `huntingbag.c` | Hunting bag |
| `huntingjacket_colorbase.c` | Hunting jacket (color variants) |
| `huntingvest.c` | Hunting vest |
| `improvisedbag.c` | Improvised bag |
| `jeans_colorbase.c` | Jeans (color variants) |
| `joggingshoes_colorbase.c` | Jogging shoes (color variants) |
| `jumpsuitjacket_colorbase.c` | Jumpsuit jacket (color variants) |
| `jumpsuitpants_colorbase.c` | Jumpsuit pants (color variants) |
| `jungleboots_colorbase.c` | Jungle boots (color variants) |
| `knifeholster.c` | Knife holster |
| `knifesheaths.c` | Knife sheaths |
| `labcoat.c` | Lab coat |
| `leafcrown.c` | Leaf crown |
| `leatherbelt_colorbase.c` | Leather belt (color variants) |
| `leathergloves_colorbase.c` | Leather gloves (color variants) |
| `leatherhat_colorbase.c` | Leather hat (color variants) |
| `leatherjacket_colorbase.c` | Leather jacket (color variants) |
| `leatherjacket_natural.c` | Natural leather jacket |
| `leathermoccasinsshoes_natural.c` | Natural leather moccasins |
| `leatherpants_colorbase.c` | Leather pants (color variants) |
| `leatherpants_natural.c` | Natural leather pants |
| `leathersack_colorbase.c` | Leather sack (color variants) |
| `leathersack_natural.c` | Natural leather sack |
| `leathershirt_colorbase.c` | Leather shirt (color variants) |
| `leathershoes_colorbase.c` | Leather shoes (color variants) |
| `leatherstoragevest_colorbase.c` | Leather storage vest (color variants) |
| `leatherstoragevest_natural.c` | Natural leather storage vest |
| `legcover_improvised.c` | Improvised leg cover |
| `m65jacket_colorbase.c` | M-65 jacket (color variants) |
| `mansuit_colorbase.c` | Man's suit (color variants) |
| `maskbase.c` | Mask base class |
| `medicalscrubshat_colorbase.c` | Medical scrubs hat (color variants) |
| `medicalscrubspants_colorbase.c` | Medical scrubs pants (color variants) |
| `medicalscrubsshirt_colorbase.c` | Medical scrubs shirt (color variants) |
| `medievalboots.c` | Medieval boots |
| `militarybelt.c` | Military belt |
| `militaryberet_colorbase.c` | Military beret (color variants) |
| `militaryboots_colorbase.c` | Military boots (color variants) |
| `mimemask.c` | Mime mask |
| `minidress_colorbase.c` | Mini dress (color variants) |
| `morozkohat.c` | Morozko hat |
| `mountainbag_colorbase.c` | Mountain bag (color variants) |
| `mouthrag.c` | Mouth rag |
| `navyuniformjacket.c` | Navy uniform jacket |
| `navyuniformpants.c` | Navy uniform pants |
| `nbcbootsbase.c` | NBC boots base |
| `nbcgloves_colorbase.c` | NBC gloves (color variants) |
| `nbchood.c` | NBC hood |
| `nbcjacketbase.c` | NBC jacket base |
| `nbcpantsbase.c` | NBC pants base |
| `nioshfacemask.c` | NIOSH face mask |
| `norsehelm.c` | Norse helm |
| `nursedress_colorbase.c` | Nurse dress (color variants) |
| `nvgheadstrap.c` | NVG head strap |
| `officerhat.c` | Officer hat |
| `okzkcap_colorbase.c` | OKZK cap (color variants) |
| `omkjacket_colorbase.c` | OMK jacket (color variants) |
| `omkpants_colorbase.c` | OMK pants (color variants) |
| `omnogloves_colorbase.c` | OMNO gloves (color variants) |
| `paddedgloves_colorbase.c` | Padded gloves (color variants) |
| `paramedicjacket_colorbase.c` | Paramedic jacket (color variants) |
| `paramedicpants_colorbase.c` | Paramedic pants (color variants) |
| `paydaymask_colorbase.c` | Payday mask (color variants) |
| `petushokhat_colorbase.c` | Petushok hat (color variants) |
| `pilotkacap.c` | Pilotka cap |
| `platecarrierholster.c` | Plate carrier holster |
| `platecarriervest.c` | Plate carrier vest |
| `policecap.c` | Police cap |
| `policejacket.c` | Police jacket |
| `policejacketorel.c` | Police jacket (Orel) |
| `policepants.c` | Police pants |
| `policepantsorel.c` | Police pants (Orel) |
| `policevest.c` | Police vest |
| `pressvest_colorbase.c` | Press vest (color variants) |
| `prisonercap.c` | Prisoner cap |
| `prisonuniformjacket.c` | Prison uniform jacket |
| `prisonuniformpants.c` | Prison uniform pants |
| `quiltedjacket_colorbase.c` | Quilted jacket (color variants) |
| `radarcap_colorbase.c` | Radar cap (color variants) |
| `raincoat_colorbase.c` | Raincoat (color variants) |
| `reflexvest.c` | Reflex vest |
| `ridersjacket_colorbase.c` | Riders jacket (color variants) |
| `ropebelt.c` | Rope belt |
| `santasbeard.c` | Santa's beard |
| `santashat.c` | Santa's hat |
| `sherpahat_colorbase.c` | Sherpa hat (color variants) |
| `shirt_colorbase.c` | Shirt (color variants) |
| `skigloves_colorbase.c` | Ski gloves (color variants) |
| `skigoggles_colorbase.c` | Ski goggles (color variants) |
| `skirt_colorbase.c` | Skirt (color variants) |
| `slackspants_colorbase.c` | Slacks pants (color variants) |
| `slingbag.c` | Sling bag |
| `smershbag.c` | Smersh bag |
| `smershvest.c` | Smersh vest |
| `sneakers_colorbase.c` | Sneakers (color variants) |
| `snowstormushanka_colorbase.c` | Snowstorm ushanka (color variants) |
| `sportglasses_colorbase.c` | Sport glasses (color variants) |
| `surgicalgloves_colorbase.c` | Surgical gloves (color variants) |
| `surgicalmask.c` | Surgical mask |
| `sweater_colorbase.c` | Sweater (color variants) |
| `tacticalgloves_colorbase.c` | Tactical gloves (color variants) |
| `tacticalgoggles.c` | Tactical goggles |
| `tacticalshirt_colorbase.c` | Tactical shirt (color variants) |
| `taloonbag_colorbase.c` | Taloon bag (color variants) |
| `tankerhelmet.c` | Tanker helmet |
| `telnyashkashirt.c` | Telnyashka shirt |
| `thickframesglasses.c` | Thick frames glasses |
| `thinframesglasses.c` | Thin frames glasses |
| `torsocover_improvised.c` | Improvised torso cover |
| `tortillabag.c` | Tortilla bag |
| `tracksuitjacket_colorbase.c` | Tracksuit jacket (color variants) |
| `tracksuitpants_colorbase.c` | Tracksuit pants (color variants) |
| `tshirt_colorbase.c` | T-shirt (color variants) |
| `tshirt_dyed.c` | Dyed T-shirt |
| `tshirt_white.c` | White T-shirt |
| `ttskoboots.c` | TTSKO boots |
| `ttskojacket_colorbase.c` | TTSKO jacket (color variants) |
| `ttskopants.c` | TTSKO pants |
| `ukassvest_colorbase.c` | UKASS vest (color variants) |
| `ushanka_colorbase.c` | Ushanka hat (color variants) |
| `usmcjacket_colorbase.c` | USMC jacket (color variants) |
| `usmcpants_colorbase.c` | USMC pants (color variants) |
| `weldingmask.c` | Welding mask |
| `wellies_colorbase.c` | Wellies boots (color variants) |
| `wintercoif_colorbase.c` | Winter coif (color variants) |
| `witchhat.c` | Witch hat |
| `witchhood.c` | Witch hood |
| `witchhoodcoif_colorbase.c` | Witch hood coif (color variants) |
| `wolfmask.c` | Wolf mask |
| `womansuit_colorbase.c` | Woman's suit (color variants) |
| `woolcoat_colorbase.c` | Wool coat (color variants) |
| `woolgloves_colorbase.c` | Wool gloves (color variants) |
| `woolglovesfingerless_colorbase.c` | Fingerless wool gloves (color variants) |
| `workingboots_colorbase.c` | Working boots (color variants) |
| `workinggloves_colorbase.c` | Working gloves (color variants) |
| `zmijovkacap_colorbase.c` | Zmijovka cap (color variants) |

**Container Base (`container_base/`):**

| File | Purpose |
|------|---------|
| `anniversarybox.c` | Anniversary gift box |
| `en5c_bear_colorbase.c` | EN5C bear container (color variants) |
| `en5c_waterproofbag_colorbase.c` | EN5C waterproof bag (color variants) |

**Edible Base (`edible_base/`):**

| File | Purpose |
|------|---------|
| `edible_base.c` | Edible base class |
| `agaricusmushroom.c` | Agaricus mushroom |
| `amanitamushroom.c` | Amanita mushroom (poisonous) |
| `apple.c` | Apple |
| `auriculariamushroom.c` | Auricularia mushroom |
| `bakedbeanscan.c` | Baked beans can (unopened) |
| `banana.c` | Banana |
| `bearsteakmeat.c` | Bear steak meat |
| `bitterlings.c` | Bitterling fish |
| `boarsteakmeat.c` | Boar steak meat |
| `boletusmushroom.c` | Boletus mushroom |
| `bottle_base.c` | Bottle base class |
| `bottle_base/canistergasoline.c` | Gasoline canister |
| `bottle_base/canteen.c` | Canteen |
| `bottle_base/cauldron.c` | Cauldron |
| `bottle_base/filteringbottle.c` | Filtering bottle |
| `bottle_base/pot.c` | Cooking pot |
| `bottle_base/waterbottle.c` | Water bottle |
| `boxcerealcrunchin.c` | Box of cereal |
| `candycane_colorbase.c` | Candy cane (color variants) |
| `caninaberry.c` | Canina berry |
| `cannabis.c` | Cannabis |
| `carp.c` | Carp fish |
| `carpfilletmeat.c` | Carp fillet meat |
| `charcoaltablets.c` | Charcoal tablets |
| `chelatingtablets.c` | Chelating tablets |
| `chicken_colorbase.c` | Chicken (color variants) |
| `chickenbreastmeat.c` | Chicken breast meat |
| `cowsteakmeat.c` | Cow steak meat |
| `craterellusmushroom.c` | Craterellus mushroom |
| `deersteakmeat.c` | Deer steak meat |
| `disinfectantspray.c` | Disinfectant spray |
| `fox.c` | Fox meat |
| `foxsteakmeat.c` | Fox steak meat |
| `goatsteakmeat.c` | Goat steak meat |
| `greenbellpepper.c` | Green bell pepper |
| `guts.c` | Animal guts |
| `humansteakmeat.c` | Human steak meat |
| `kiwi.c` | Kiwi fruit |
| `lactariusmushroom.c` | Lactarius mushroom |
| `lard.c` | Lard (animal fat) |
| `mackerel.c` | Mackerel fish |
| `mackerelfilletmeat.c` | Mackerel fillet meat |
| `macrolepiotamushroom.c` | Macrolepiota mushroom |
| `mouflonsteakmeat.c` | Mouflon steak meat |
| `orange.c` | Orange |
| `painkillertablets.c` | Painkiller tablets |
| `peachescan.c` | Peaches can |
| `pear.c` | Pear |
| `pigsteakmeat.c` | Pig steak meat |
| `pleurotusmushroom.c` | Pleurotus mushroom |
| `plum.c` | Plum |
| `potato.c` | Potato |
| `psilocybemushroom.c` | Psilocybe mushroom (hallucinogenic) |
| `pumpkin.c` | Pumpkin |
| `purificationtablets.c` | Purification tablets |
| `rabbit.c` | Rabbit meat |
| `rabbitlegmeat.c` | Rabbit leg meat |
| `redcaviar.c` | Red caviar |
| `reindeersteakmeat.c` | Reindeer steak meat |
| `sambucusberry.c` | Sambucus berry |
| `sardines.c` | Sardines (loose) |
| `sardinescan.c` | Sardines can |
| `sheepsteakmeat.c` | Sheep steak meat |
| `shrimp.c` | Shrimp |
| `slicedpumpkin.c` | Sliced pumpkin |
| `smallguts.c` | Small animal guts |
| `spaghettican.c` | Spaghetti can |
| `steelheadtrout.c` | Steelhead trout |
| `steelheadtroutfilletmeat.c` | Steelhead trout fillet |
| `tacticalbaconcan.c` | Tactical bacon can |
| `tetracyclineantibiotics.c` | Tetracycline antibiotics |
| `tomato.c` | Tomato |
| `tunacan.c` | Tuna can |
| `vitaminbottle.c` | Vitamin bottle |
| `walleyepollock.c` | Walleye pollock |
| `walleyepollockfilletmeat.c` | Walleye pollock fillet |
| `wolfsteakmeat.c` | Wolf steak meat |
| `worm.c` | Worm (fishing bait) |
| `zucchini.c` | Zucchini |

**Fireplace Base (`fireplacebase/`):**

| File | Purpose |
|------|---------|
| `fireplace.c` | Fireplace |
| `fireplacefirebarrel.c` | Fire barrel fireplace |
| `fireplaceindoor.c` | Indoor fireplace |
| `land_misc_firebarrel_colorbase.c` | Fire barrel (color variants) |
| `ovenindoor.c` | Indoor oven |
| `barrelholes_colorbase/barrelholes_colorbase.c` | Barrel holes base |
| `barrelholes_colorbase/barrelholes_blue.c` | Blue barrel holes |
| `barrelholes_colorbase/barrelholes_green.c` | Green barrel holes |
| `barrelholes_colorbase/barrelholes_grey.c` | Grey barrel holes |
| `barrelholes_colorbase/barrelholes_red.c` | Red barrel holes |
| `barrelholes_colorbase/barrelholes_yellow.c` | Yellow barrel holes |

**Gear (`gear/`):**

**Subdirectories:**

| Directory | Contents |
|-----------|----------|
| `camping/` | `camping.c` |
| `consumables/` | `consumables.c`, `easteregg.c`, `fishingconsumables.c` |
| `containers/` | `containers.c` |
| `crafting/` | `crafting.c` |
| `cultivation/` | `cultivation.c` |

**Drinks:**

| File | Purpose |
|------|---------|
| `drinks/sodacan_colorbase.c` | Soda can (color variants) |
| `drinks/vodka.c` | Vodka bottle |
| `drinks/waterpouch_colorbase.c` | Water pouch (color variants) |

**Food:**

| File | Purpose |
|------|---------|
| `food/bakedbeanscan_opened.c` | Opened baked beans can |
| `food/cannedfood.c` | Canned food base |
| `food/marmalade.c` | Marmalade |
| `food/mushroombase.c` | Mushroom base class |
| `food/packagedfood.c` | Packaged food base |
| `food/peachescan_opened.c` | Opened peaches can |
| `food/powderedmilk.c` | Powdered milk |
| `food/rice.c` | Rice |
| `food/sardinescan_opened.c` | Opened sardines can |
| `food/spaghettican_opened.c` | Opened spaghetti can |
| `food/tacticalbaconcan_opened.c` | Opened tactical bacon can |
| `food/tunacan_opened.c` | Opened tuna can |

**Medical:**

| File | Purpose |
|------|---------|
| `medical/anticheminjector.c` | Anti-chem injector |
| `medical/bloodtestkit.c` | Blood test kit |
| `medical/cigarettepack_colorbase.c` | Cigarette pack (color variants) |
| `medical/clearsyringe.c` | Clear syringe |
| `medical/disinfectantalcohol.c` | Disinfectant alcohol |
| `medical/epinephrine.c` | Epinephrine auto-injector |
| `medical/injectionvial.c` | Injection vial |
| `medical/iodinetincture.c` | Iodine tincture |
| `medical/morphine.c` | Morphine auto-injector |
| `medical/salinebag.c` | Saline bag |
| `medical/salinebagiv.c` | Saline bag IV |
| `medical/splint.c` | Splint |
| `medical/startkitiv.c` | IV start kit |

**Navigation:**

| File | Purpose |
|------|---------|
| `navigation/gpsreceiver.c` | GPS receiver |
| `navigation/orienteeringcompass.c` | Orienteering compass |

**Optics:**

| File | Purpose |
|------|---------|
| `optics/binoculars.c` | Binoculars |

**Tools:**

| File | Purpose |
|------|---------|
| `tools/alarmclock.c` | Alarm clock |
| `tools/broom.c` | Broom |
| `tools/broom_birch.c` | Birch broom |
| `tools/canopener.c` | Can opener |
| `tools/cassette.c` | Cassette tape |
| `tools/crowbar.c` | Crowbar |
| `tools/doortestcamera.c` | Door test camera |
| `tools/electronicrepairkit.c` | Electronic repair kit |
| `tools/epoxyputty.c` | Epoxy putty |
| `tools/farminghoe.c` | Farming hoe |
| `tools/fireextinguisher.c` | Fire extinguisher |
| `tools/fireworkslauncher.c` | Fireworks launcher |
| `tools/fireworkslauncheranniversary.c` | Anniversary fireworks launcher |
| `tools/fishingrod.c` | Fishing rod |
| `tools/handcuffkeys.c` | Handcuff keys |
| `tools/handcuffs.c` | Handcuffs |
| `tools/handsaw.c` | Handsaw |
| `tools/hayhook.c` | Hay hook |
| `tools/iceaxe.c` | Ice axe |
| `tools/improvisedfishingrod.c` | Improvised fishing rod |
| `tools/kitchentimer.c` | Kitchen timer |
| `tools/leathersewingkit.c` | Leather sewing kit |
| `tools/lockpick.c` | Lockpick |
| `tools/lugwrench.c` | Lug wrench |
| `tools/mace.c` | Mace |
| `tools/meattenderizer.c` | Meat tenderizer |
| `tools/messtin.c` | Mess tin |
| `tools/obsoletefishingrod.c` | Obsolete fishing rod |
| `tools/paddle.c` | Paddle |
| `tools/pen_black.c` | Black pen |
| `tools/pen_blue.c` | Blue pen |
| `tools/pen_colorbase.c` | Pen (color base) |
| `tools/pen_green.c` | Green pen |
| `tools/pen_red.c` | Red pen |
| `tools/sewingkit.c` | Sewing kit |
| `tools/weaponcleaningkit.c` | Weapon cleaning kit |
| `tools/whetstone.c` | Whetstone |
| `tools/wrench.c` | Wrench |

**Inventory Base (`inventory_base/`):**

**Backpacks:**

| File | Purpose |
|------|---------|
| `inventory_base/assaultbag_colorbase.c` | Assault bag (color variants) |
| `inventory_base/canvasbag_colorbase.c` | Canvas bag (color variants) |
| `inventory_base/childsbag_colorbase.c` | Child's bag (color variants) |
| `inventory_base/courierbag.c` | Courier bag |
| `inventory_base/coyotebag_colorbase.c` | Coyote bag (color variants) |
| `inventory_base/drybag_colorbase.c` | Dry bag (color variants) |
| `inventory_base/duffelbag_colorbase.c` | Duffel bag (color variants) |
| `inventory_base/hippack_colorbase.c` | Hip pack (color variants) |
| `inventory_base/huntingbag.c` | Hunting bag |
| `inventory_base/improvisedbag_colorbase.c` | Improvised bag (color variants) |
| `inventory_base/leatherbag_colorbase.c` | Leather bag (color variants) |
| `inventory_base/mountainbag_colorbase.c` | Mountain bag (color variants) |
| `inventory_base/partybag_colorbase.c` | Party bag (color variants) |
| `inventory_base/slingbag_colorbase.c` | Sling bag (color variants) |
| `inventory_base/slimgeigerbag_colorbase.c` | Slim Geiger bag (color variants) |
| `inventory_base/smershsbag_colorbase.c` | Smersh bag (color variants) |
| `inventory_base/taloonbag_colorbase.c` | Taloon bag (color variants) |
| `inventory_base/tortillabag_colorbase.c` | Tortilla bag (color variants) |

**Weapon Attachments & Parts:**

| File | Purpose |
|------|---------|
| `ak74_hndgrd.c` | AK-74 handguard |
| `ak_bayonet.c` | AK bayonet |
| `ak_plastichndgrd.c` | AK plastic handguard |
| `ak_railhndgrd.c` | AK rail handguard |
| `ak_woodhndgrd.c` | AK wood handguard |
| `atlasbipod.c` | Atlas bipod |
| `buisoptic.c` | Back-up iron sight optic |
| `candle.c` | Candle |
| `fryingpan.c` | Frying pan |
| `gardenlime.c` | Garden lime |
| `grozagl_lowerreceiver.c` | Groza GL lower receiver |
| `huntingoptic.c` | Hunting scope optic |
| `m249_hndgrd.c` | M249 handguard |
| `m249_rishndgrd.c` | M249 RIS handguard |
| `m4_carryhandleoptic.c` | M4 carry handle optic |
| `m4_mphndgrd.c` | M4 MP handguard |
| `m4_plastichndgrd.c` | M4 plastic handguard |
| `m4_rishndgrd.c` | M4 RIS handguard |
| `m9a1_bayonet.c` | M9A1 bayonet |
| `mosin_bayonet.c` | Mosin bayonet |
| `mosin_compensator.c` | Mosin compensator |
| `mp5_compensator.c` | MP5 compensator |
| `mp5_plastichndgrd.c` | MP5 plastic handguard |
| `mp5_railhndgrd.c` | MP5 rail handguard |
| `nail.c` | Nail (crafting) |
| `optics.c` | Optics base class |
| `plantmaterial.c` | Plant material (crafting) |
| `pso11optic.c` | PSO-1-1 optic |
| `pso1optic.c` | PSO-1 optic |
| `pso6optic.c` | PSO-6 optic |
| `puscopeoptic.c` | PU scope optic |
| `red9bttstck.c` | Red 9 stock |
| `sks_bayonet.c` | SKS bayonet |

**Magazine (`magazine/`):**

| File | Purpose |
|------|---------|
| `ammunitionpiles.c` | Ammunition piles |
| `magazine.c` | Magazine base class |
| `magazines.c` | Magazine type definitions |

**Seed Packs (`seedpackbase/`):**

| File | Purpose |
|------|---------|
| `cannabisseedspack.c` | Cannabis seeds pack |
| `pepperseedspack.c` | Pepper seeds pack |
| `pumpkinseedspack.c` | Pumpkin seeds pack |
| `tomatoseedspack.c` | Tomato seeds pack |
| `zucchiniseedspack.c` | Zucchini seeds pack |

**Suppressors (`suppressorbase/`):**

| File | Purpose |
|------|---------|
| `ak_suppressor.c` | AK suppressor |
| `groza_barrel_grip.c` | Groza barrel grip |
| `groza_barrel_short.c` | Groza short barrel |
| `groza_barrel_suppressor.c` | Groza barrel suppressor |
| `improvisedsuppressor.c` | Improvised suppressor |
| `m4_suppressor.c` | M4 suppressor |
| `makarovpbsuppressor.c` | Makarov PB suppressor |
| `pistolsuppressor.c` | Pistol suppressor |

**Switchable Items (`switchable_base/`):**

| File | Purpose |
|------|---------|
| `chainsaw.c` | Chainsaw |
| `tlrlight.c` | TLR tactical light |
| `universallight.c` | Universal light |

**Tents (`tentbase/`):**

| File | Purpose |
|------|---------|
| `cartent.c` | Car tent |
| `largetent.c` | Large tent |
| `largetentbackpack.c` | Large tent backpack |
| `mediumtent.c` | Medium tent |
| `partytent.c` | Party tent |
| `shelter.c` | Shelter |

**Transmitters (`transmitterbase/`):**

| File | Purpose |
|------|---------|
| `baseradio.c` | Base radio |
| `personalradio.c` | Personal radio |

**Traps (`trapbase/`):**

| File | Purpose |
|------|---------|
| `trap_bear.c` | Bear trap |
| `trap_landmine.c` | Land mine trap |
| `trap_tripwire.c` | Tripwire trap |

**Trap Spawns (`trapspawnbase/`):**

| File | Purpose |
|------|---------|
| `trap_fishnet.c` | Fish net trap spawn |
| `trap_rabbitsnare.c` | Rabbit snare trap spawn |
| `trap_smallfish.c` | Small fish trap spawn |

**Vehicle Batteries (`vehiclebattery/`):**

| File | Purpose |
|------|---------|
| `aircraftbattery.c` | Aircraft battery |
| `carbattery.c` | Car battery |
| `truckbattery.c` | Truck battery |

**Weapon Attachments (`weaponattachments/`):**

| File | Purpose |
|------|---------|
| `attachments.c` | Weapon attachments base |

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
| `bot/` | Script-controlled debug bot player (see below) |
| `inventory/` | Inventory system (complementing the FSM in 3_game) |
| `universaltemperaturesource/` | Universal temperature source system |

**Animal Catching System (`animalcatchingsystem/`):**

| File | Purpose |
|------|---------|
| `catchingcontexts/poissoncontext.c` | Poisson catching context |
| `catchingcontexts/regularcatchingcontext.c` | Regular catching context |
| `catchingresultstructures/catchingresult.c` | Catching result data |
| `catchingresultstructures/catchingresultbasestruct.c` | Catching result base structure |
| `yielditems/edibleyield.c` | Edible yield item |
| `yielditems/yielditem.c` | Base yield item |
| `yielditems/yielditemcontainer.c` | Yield item container |
| `catchingconstants.c` | Catching constants |
| `catchingcontextbase.c` | Catching context base |
| `catchingcontextpoissonbase.c` | Poisson catching context base |
| `catchingresultbasic.c` | Basic catching result |
| `catchyieldbank.c` | Catch yield bank |
| `catchyielditembase.c` | Catch yield item base |

**Inventory System (`systems/inventory/`) additional root files:**

| File | Purpose |
|------|---------|
| `inventory.c` | Inventory FSM root logic |
| `inventorylocation.c` | Inventory location abstraction |
| `inventoryslots.c` | Inventory slot management |

**Universal Temperature Source (`systems/universaltemperaturesource/`):**

| File | Purpose |
|------|---------|
| `universaltemperaturesource.c` | Universal temperature source |
| `universaltemperaturesourcelambdabase.c` | Temperature source lambda base |

**Bot System (`bot/`) files:**

| File | Purpose |
|------|---------|
| `bot.c` | Bot main class (debug AI player) |
| `bot_hunt.c` | Bot hunting behavior |
| `bot_stancerandomizer.c` | Bot stance randomization |
| `bot_tests.c` | Bot test orchestration |
| `botactions.c` | Bot action definitions |
| `botevents.c` | Bot event definitions |
| `botfsm.c` | Bot FSM (action/event/guard/state) |
| `botguards.c` | Bot guard conditions |
| `botstates.c` | Bot FSM states |
| `bot_timedwait.c` | Bot timed wait behavior |
| `bot_testattachanddropcycle.c` | Bot attach/drop cycle test |
| `bot_testitemmovebackandforth.c` | Bot item movement test |
| `bot_testspamuseractions.c` | Bot spam user actions test |
| `bot_testspawnandopencan.c` | Bot spawn and open can test |
| `bot_testspawndeadbury.c` | Bot spawn/dead/bury test |

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

**Plugin Subdirectories:**

**Developer Tools (`plugindeveloper/`):**

| File | Purpose |
|------|---------|
| `developerfreecamera.c` | Free camera for debugging |
| `developerteleport.c` | Teleport functionality |
| `edevelopermask.c` | Developer mask enum |
| `plugincharplacement.c` | Character placement tool |
| `plugindoorruler.c` | Door/distance measurement |
| `plugindrawcheckerboard.c` | Checkerboard render debug |
| `pluginnutritiondumper.c` | Nutrition data dumping |
| `pluginremoteplayerdebugclient.c` | Remote player debug (client) |
| `pluginremoteplayerdebugserver.c` | Remote player debug (server) |
| `plugintargettemperature.c` | Target temperature debug |
| `pluginuniversaltemperaturesourceclient.c` | Universal temp source debug (client) |
| `pluginuniversaltemperaturesourceserver.c` | Universal temp source debug (server) |

**Diagnostic Menu (`plugindiagmenu/`):**

| File | Purpose |
|------|---------|
| `plugindiagmenu.c` | Diagnostic menu main |
| `plugindiagmenuclient.c` | Client diagnostic menu |
| `plugindiagmenumodding.c` | Modding diagnostic menu |
| `plugindiagmenuserver.c` | Server diagnostic menu |
| `weaponliftdiag.c` | Weapon lift diagnostic |

**File Handler (`pluginfilehandler/`):**

| File | Purpose |
|------|---------|
| `pluginconfighandler.c` | Config file handler base |
| `pluginconfighandler/pluginconfigdebugprofile.c` | Debug profile config |
| `pluginconfighandler/pluginconfigdebugprofilefixed.c` | Fixed debug profile config |
| `pluginconfighandler/pluginconfigemotesprofile.c` | Emotes profile config |
| `pluginconfighandler/pluginconfigscene.c` | Scene config |
| `pluginconfighandler/pluginmissionconfig.c` | Mission config |
| `pluginlocalenscripthistory.c` | Local Enscript history |
| `pluginlocalhistorybase.c` | Local history base |
| `pluginlocalprofile.c` | Local profile handler |
| `pluginlocalprofile/pluginadditionalinfo.c` | Additional info profile |
| `pluginlocalprofile/pluginlocalprofilescene.c` | Local profile scene |

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
