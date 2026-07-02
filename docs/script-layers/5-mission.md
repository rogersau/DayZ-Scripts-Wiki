# Layer 5: Mission (`5_mission/`)

**Directory**: `/p/scripts/5_mission/`

Layer 5 is the **top of the script stack**. It provides the mission entry point (factory function), mission lifecycle management, and the entire user interface — every screen, HUD element, menu, and tool the player sees or interacts with.

## Files

| File | Purpose |
|------|---------|
| `dayzintroscene.c` | Intro cutscene (shared) |
| `dayzintroscenepc.c` | PC-specific intro cutscene |
| `dayzintroscenexbox.c` | Xbox-specific intro cutscene |

### `mission/` Directory

Mission lifecycle classes:

| File | Purpose |
|------|---------|
| `missionbase.c` | Core mission lifecycle (update, event handling, world management) |
| `missiongameplay.c` | In-game mission (the actual gameplay session) |
| `missionmainmenu.c` | Main menu mission |
| `missionserver.c` | Headless dedicated server mission |
| `missionbenchmark.c` | Benchmark/test mission |
| `dispatchercaller.c` | Dispatcher integration |
| `gameplayeffectwidgets/gameplayeffectwidgets.c` | Gameplay effect widgets main |
| `gameplayeffectwidgets/gewidgetsmetadata.c` | Effect widget metadata definitions |
| `gameplayeffectwidgets/gewidgetsmetadatableeding.c` | Bleeding-specific effect metadata |
| `gameplayeffectwidgets/bleedingindicators/bleedingdrop.c` | Bleeding drop indicator widget |
| `gameplayeffectwidgets/bleedingindicators/bleedingindicator.c` | Bleeding indicator UI management |

### `gui/` Directory

The entire UI layer — **70+ files** covering all player-facing screens.

#### HUD Elements

| File | Purpose |
|------|---------|
| `ingamehud.c` | Main in-game HUD |
| `ingamehudheatbuffer.c` | Heat buffer HUD display |
| `ingamehudvisibility.c` | Visibility indicator |
| `huddebug.c` | Debug HUD overlay |
| `crosshairselector.c` | Crosshair selector |
| `projectedcrosshair.c` | Projected crosshair for aiming |
| `objectfollower.c` | UI element following world objects |
| `watermark.c` | Server watermark |
| `stanceindicator.c` | Stance indicator |

#### Menus

| File | Purpose |
|------|---------|
| `actionmenu.c` | Context action menu |
| `bookmenu.c` | Book/item reading menu |
| `gesturesmenu.c` | Gesture/emote selection menu |
| `helpscreen.c` | Help/tutorial screen |
| `inspectmenunew.c` | Item inspection menu |
| `inventorymenu.c` | Inventory screen |
| `invitemenu.c` | Item interaction menu |
| `itemactionswidget.c` | Item action buttons |
| `itemdropwarningmenu.c` | Item drop confirmation |
| `loadingmenu.c` | Loading screen |
| `logoutmenu.c` | Logout confirmation |
| `maphandler.c` | Map interaction handling |
| `mapmarkersinfo.c` | Map marker information |
| `mapmenu.c` | Map screen |
| `notemenu.c` | Note viewing/writing |
| `presetsmenu.c` | Character preset selection |
| `profileoptionsui.c` | Profile/options screen |
| `radialquickbarmenu.c` | Radial quick bar |
| `respawndialogue.c` | Respawn screen |
| `startupmenu.c` | Startup/launch screen |
| `titlescreenmenu.c` | Title screen |
| `earlyaccessmenu.c` | Early access info |

#### Script Console

| File | Purpose |
|------|---------|
| `scriptconsole.c` | Developer script console (main) |
| `scriptconsole/scriptconsoleaddposition.c` | Add position dialog |
| `scriptconsole/scriptconsolenewpresetdialog.c` | New preset creation dialog |
| `scriptconsole/scriptconsolerenamepresetdialog.c` | Preset rename dialog |
| `scriptconsole/scriptconsoleuniversalinfodialog.c` | Universal info dialog |
| `scriptconsolecameratab.c` | Camera debugging tab |
| `scriptconsoleconfigtab.c` | Config inspection tab |
| `scriptconsoleenfscripttab.c` | Script execution tab |
| `scriptconsolegeneraltab.c` | General info tab |
| `scriptconsoleitemstab.c` | Item spawning tab |
| `scriptconsoleoutputtab.c` | Console output tab |
| `scriptconsolepresetslist.c` | Console presets list |
| `scriptconsoleselector.c` | Entity selector tab |
| `scriptconsolesoundstab.c` | Sound testing tab |
| `scriptconsoletabbase.c` | Script console tab base class |
| `scriptconsolevicinitytab.c` | Vicinity browser tab |
| `scriptconsoleweathertab.c` | Weather control tab |

#### Other GUI

| File/Directory | Purpose |
|----------------|---------|
| `connectiondialogue.c` | Connection status dialogue |
| `continuousactionprogress.c` | Action progress bar |
| `controlsxbox.c` / `controlsxboxnew.c` | Xbox controller layouts |
| `inputdevicedisconnectwarningmenu.c` | Input device disconnect warning |
| `debugmonitor.c` | Debug statistics monitor |
| `ingamemenu.c` | In-game pause menu |
| `ingamemenuxbox.c` | Xbox-specific in-game pause menu |
| `staticguiutils.c` | Shared GUI utility functions |
| `widgeteventhandler.c` | Widget event handling |
| `actiontargetscursor.c` | Action target cursor |

##### Camera Tools (`cameratools/`)

| File | Purpose |
|------|---------|
| `cameratoolsmenu.c` | Camera tools main menu |
| `ctactor.c` | Actor manipulation in camera tools |
| `ctevent.c` | Event handling for camera tools |
| `ctkeyframe.c` | Keyframe management |
| `ctobjectfollower.c` | Object follower camera mode |
| `ctsavestructure.c` | Save/load camera tool structures |

##### Chat System (`chat/`)

| File | Purpose |
|------|---------|
| `chat.c` | Main chat system |
| `chatinputmenu.c` | Chat text input menu |
| `chatline.c` | Individual chat line rendering |

##### DayZ Player Debug (`dayzplayerdebug/`)

| File | Purpose |
|------|---------|
| `dayzplayerdebug.c` | Player debug overlays | 

##### In-Game Menu Xbox (`ingamemenu_xbox/`)

| File | Purpose |
|------|---------|
| `playerlistentryscriptedwidget.c` | Player list entry widget (Xbox) |
| `playerlistscriptedwidget.c` | Player list container widget (Xbox) |

##### Inventory UI (`inventory/`)

| File | Purpose |
|------|---------|
| `inventorycombinationflags.c` | Inventory combination flag definitions |
| `inventoryquickbar.c` | Quickbar inventory management |

##### New Inventory UI (`inventorynew/`)

**Root files:**

| File | Purpose |
|------|---------|
| `inventory.c` | New inventory system main |
| `itemmanager.c` | Item manager for inventory |
| `colormanager.c` | Color theme management |
| `layoutholder.c` | Layout container management |
| `playerpreview.c` | 3D player preview rendering |
| `splititemutils.c` | Item splitting utilities |
| `vicinityitemmanager.c` | Vicinity item management |

**Areas:**

| File | Purpose |
|------|---------|
| `areas/handsarea.c` | Hands equipment area |
| `areas/leftarea.c` | Left panel area |
| `areas/rightarea.c` | Right panel area |

**Contained Items:**

| File | Purpose |
|------|---------|
| `containeditems/cargocontainer.c` | Cargo container display |
| `containeditems/cargocontainerrow.c` | Cargo container row |
| `containeditems/handspreview.c` | Hands slot preview |
| `containeditems/icon.c` | Item icon rendering |
| `containeditems/slotscontainer.c` | Slots container widget |
| `containeditems/slotsicon.c` | Individual slot icon |
| `containeditems/headers/closableheader.c` | Closable header widget |
| `containeditems/headers/collapsibleheader.c` | Collapsible header widget |
| `containeditems/headers/handsheader.c` | Hands section header |
| `containeditems/headers/header.c` | Base header widget |

**Containers:**

| File | Purpose |
|------|---------|
| `containers/attachmentsgroupcontainer.c` | Attachments group container |
| `containers/attachmentswrapper.c` | Attachments wrapper |
| `containers/closablecontainer.c` | Closable container widget |
| `containers/collapsiblecontainer.c` | Collapsible container widget |
| `containers/container.c` | Base container widget |
| `containers/handscontainer.c` | Hands container widget |
| `containers/iconscontainer.c` | Icons container widget |

**Inherited containers:**

| File | Purpose |
|------|---------|
| `inherited/attachmentcategoriescontainer.c` | Attachment categories container |
| `inherited/attachmentcategoriesrow.c` | Attachment categories row |
| `inherited/attachmentcategoriesslotscontainer.c` | Attachment categories slots container |
| `inherited/containerwithcargo.c` | Container with cargo slots |
| `inherited/containerwithcargoandattachments.c` | Container with cargo and attachment slots |
| `inherited/containerwithelectricmanager.c` | Container with electric/device manager |
| `inherited/playercontainer.c` | Player inventory container |
| `inherited/vicinitycontainer.c` | Vicinity container |
| `inherited/vicinityslotscontainer.c` | Vicinity slots container |
| `inherited/zombiecontainer.c` | Zombie inventory container |

##### New UI System (`newui/`)

**Root files:**

| File | Purpose |
|------|---------|
| `consoletoolbarhandler.c` | Console toolbar handler |
| `optionselector.c` | Option selector widget |
| `optionselectorbase.c` | Option selector base class |
| `optionselectoreditbox.c` | Edit box option selector |
| `optionselectorlevelmarker.c` | Level marker option selector |
| `optionselectormultistate.c` | Multi-state option selector |
| `optionselectorslider.c` | Slider option selector |
| `optionselectorslidersetup.c` | Slider setup configuration |
| `videoplayer.c` | Video player widget |

**Character Creation:**

| File | Purpose |
|------|---------|
| `charactercreation/charactercreationmenu.c` | Character creation menu |

**Control Mapping:**

| File | Purpose |
|------|---------|
| `controlmapping/controlmappingkeybinds.c` | Control mapping key bindings display |

**Credits:**

| File | Purpose |
|------|---------|
| `credits/creditsmenu.c` | Credits screen |
| `credits/elements/creditsdepartmentelement.c` | Department element |
| `credits/elements/creditselement.c` | Base credits element |
| `credits/elements/creditsgraphicalelement.c` | Graphical credits element |

**Dropdown Prefab:**

| File | Purpose |
|------|---------|
| `dropdownprefab/dropdownprefab.c` | Dropdown widget prefab |

**Keybindings:**

| File | Purpose |
|------|---------|
| `keybindings/keybindingelement.c` | Keybinding display element |
| `keybindings/keybindingelementnew.c` | New keybinding element |
| `keybindings/keybindingscontainer.c` | Keybinding container |
| `keybindings/keybindingsentrywindow.c` | Keybinding entry window |
| `keybindings/keybindingsgroup.c` | Keybinding group |
| `keybindings/keybindingsmenu.c` | Keybindings settings menu |

**Main Menu:**

| File | Purpose |
|------|---------|
| `mainmenu/bannerhandlerbase.c` | Banner/advertisement handler |
| `mainmenu/mainmenuconsoles.c` | Console main menu |
| `mainmenu/mainmenunewsfeed.c` | News feed display |
| `mainmenu/mainmenupromo.c` | Promotional content |
| `mainmenu/mainmenustats.c` | Player statistics |
| `mainmenu/mainmenuvideo.c` | Main menu background video |
| `mainmenu/tutorialsmenu.c` | Tutorials menu |
| `mainmenu/mainmenu.c` | Main menu controller (root) |

**Mods Menu:**

| File | Purpose |
|------|---------|
| `modsmenu/modsmenudetailed.c` | Detailed mods menu |
| `modsmenu/modsmenudetailedentry.c` | Detailed mod entry |
| `modsmenu/modsmenusimple.c` | Simple mods menu |
| `modsmenu/modsmenusimpleentry.c` | Simple mod entry |
| `modsmenu/modsmenutooltip.c` | Mod tooltip display |

**Options Menu:**

| File | Purpose |
|------|---------|
| `options/dependentoptions.c` | Dependent option handling |
| `options/optionsmenu.c` | Options menu root |
| `options/optionsmenucontrols.c` | Controls options tab |
| `options/optionsmenugame.c` | Game options tab |
| `options/optionsmenusounds.c` | Sound options tab |
| `options/optionsmenuvideo.c` | Video options tab |

**Server Browser:**

| File | Purpose |
|------|---------|
| `serverbrowsermenu/serverbrowserdetailscontainer.c` | Server details container |
| `serverbrowsermenu/serverbrowserentry.c` | Server list entry |
| `serverbrowsermenu/serverbrowserfavoritestabconsolepages.c` | Favorites tab (console pages) |
| `serverbrowsermenu/serverbrowserfavoritestabpc.c` | Favorites tab (PC) |
| `serverbrowsermenu/serverbrowserfiltercontainer.c` | Filter container |
| `serverbrowsermenu/serverbrowsermenunew.c` | Server browser main menu |
| `serverbrowsermenu/serverbrowsertab.c` | Base tab |
| `serverbrowsermenu/serverbrowsertabconsole.c` | Console tab |
| `serverbrowsermenu/serverbrowsertabconsolepages.c` | Console pages tab |
| `serverbrowsermenu/serverbrowsertabpc.c` | PC tab |

**Tabber Prefab:**

| File | Purpose |
|------|---------|
| `tabberprefab/tabberui.c` | Tabbed UI widget |

##### Scene Editor Menu (`sceneeditormenu/`)

**Root files:**

| File | Purpose |
|------|---------|
| `uipopupscript.c` | Popup script base |
| `uipropertyattachment.c` | Property attachment editor |

**Popup scripts:**

| File | Purpose |
|------|---------|
| `uipopupscript/uipopupscriptconfigs.c` | Config editor popup |
| `uipopupscript/uipopupscripteditorsettings.c` | Editor settings popup |
| `uipopupscript/uipopupscriptinitscript.c` | Init script popup |
| `uipopupscript/uipopupscriptnotify.c` | Notify popup |
| `uipopupscript/uipopupscriptpositionmanager.c` | Position manager popup |
| `uipopupscript/uipopupscriptpresetnew.c` | New preset popup |
| `uipopupscript/uipopupscriptpresetrename.c` | Rename preset popup |
| `uipopupscript/uipopupscriptscenedelete.c` | Delete scene popup |
| `uipopupscript/uipopupscriptscenemanager.c` | Scene manager popup |
| `uipopupscript/uipopupscriptscenenew.c` | New scene popup |
| `uipopupscript/uipopupscriptscenerename.c` | Rename scene popup |
| `uipopupscript/uipopupscriptscenesettings.c` | Scene settings popup |

##### Scripted Windows (`scriptedwindows/`)

| File | Purpose |
|------|---------|
| `missionloader.c` | Mission loading window |

##### Script HUD Debug (`scriptshuddebug/`)

| File | Purpose |
|------|---------|
| `huddebugwinbase.c` | HUD debug window base class |
| `huddebugwincharagents.c` | Character agents debug |
| `huddebugwinchardebug.c` | Character debug info |
| `huddebugwincharlevels.c` | Character stat levels |
| `huddebugwincharmodifiers.c` | Character modifiers |
| `huddebugwincharstats.c` | Character stats |
| `huddebugwincharstomach.c` | Stomach contents debug |
| `huddebugwinhealth.c` | Health debug |
| `huddebugwinhorticulture.c` | Horticulture debug |
| `huddebugwintemperature.c` | Temperature debug |
| `huddebugwinversion.c` | Version debug |

##### Vehicle UI (`vehicles/`)

| File | Purpose |
|------|---------|
| `boathud.c` | Boat HUD display |
| `carhud.c` | Car HUD display |
| `vehiclehudbase.c` | Vehicle HUD base class |

## Mission Classes

The mission system uses a class hierarchy with `MissionBase` as the root game-mode class (`5_mission/mission/missionbase.c`):

```
Mission (engine base)
  └── MissionBaseWorld
       └── MissionBase
            ├── MissionGameplay  — Full in-game session
            ├── MissionMainMenu  — Main menu with intro cutscene
            ├── MissionServer    — Headless dedicated server
            └── MissionDummy     — Fallback/edge-case mission
```

**Key points**:
- No `CreateMission` factory function exists — the engine instantiates the appropriate mission class directly.
- `MissionServer` is designed for dedicated servers (no rendering, no UI).
- `MissionGameplay` is the full in-game mission.
- `MissionMainMenu` handles the main menu and optional intro cutscene.

## How Layers 1-5 Fit Together

A file in `5_mission/gui/inventorymenu.c` can reference:
- `4_world/classes/playerstats/` for player stat data
- `3_game/dayzplayer.c` for the player entity
- `3_game/systems/inventory/` for inventory logic
- `3_game/global/game.c` to access `GetGame()`
- `1_core/param.c` for Param serialization
- `1_core/proto/enwidgets.c` for native widget functions

This layered dependency is what makes the architecture powerful — the UI can access anything below it, but the core doesn't know about the UI.
