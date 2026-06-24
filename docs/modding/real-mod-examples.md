# Real Mod Examples

This page documents real mod projects found at `P:\`, showing how the patterns from [Mod Project Structure](./mod-structure) are applied in practice.

## DMOverrides — Mod Project Scaffold

`P:/DMOverrides/` is a DayZ mod project scaffold with Workbench IDE configuration, empty script modules ready for development, and a local test server setup.

### Directory Structure

```
DMOverrides/
├── Scripts/
│   ├── config.cpp              — Mod registration
│   ├── Inputs.xml              — Input action bindings
│   ├── stringtable.csv         — Localization table
│   ├── 1_Core/DMOverrides/     — Core layer scripts (empty)
│   ├── 3_Game/DMOverrides/     — Game layer scripts (empty)
│   ├── 4_World/DMOverrides/    — World layer scripts (empty)
│   └── 5_Mission/DMOverrides/  — Mission layer scripts (empty)
└── Workbench/
    ├── dayz.gproj              — Workbench project file
    ├── project.cfg             — Mod loader config
    ├── server.cfg              — Local test server config
    ├── exclude.lst             — File exclusion list
    └── ToolAddons/
        └── ResourceManager/    — Workbench tool addons (empty)
```

### Mod Registration (config.cpp)

From `P:/DMOverrides/Scripts/config.cpp`:

```cpp
class CfgPatches
{
    class MT_Scripts
    {
        units[] = {};
        weapons[] = {};
        requiredVersion = 0.1;
        requiredAddons[] = { "DZ_Scripts" };
    };
};

class CfgMods
{
    class DMOverrides
    {
        type = "mod";
        
        class Scripts
        {
            class 1_Core
            {
                // Core engine module
                // Path: DMOverrides/Scripts/1_Core
            };
            class 3_Game
            {
                // Game logic module
            };
            class 4_World
            {
                // World gameplay module
            };
            class 5_Mission
            {
                // Mission/UI module
            };
        };
    };
};
```

Key points:
- `requiredAddons[] = { "DZ_Scripts" }` declares dependency on the core game scripts
- `CfgMods` registers the mod with 4 script modules matching the layer architecture
- Script module directories are `1_Core`, `3_Game`, `4_World`, `5_Mission` — the layer numbers align with the game's own script layering

### Input Bindings (Inputs.xml)

From `P:/DMOverrides/Scripts/Inputs.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
    <actions>
        <!-- Mod-specific action bindings go here -->
    </actions>
    <preset></preset>
</root>
```

This is a skeleton file where mod-specific input actions would be defined.

### Localization (stringtable.csv)

From `P:/DMOverrides/Scripts/stringtable.csv`:

```csv
Original,English,Czech,German,Russian,Polish,Spanish,French,Italian,Japanese,Chinese,ChineseSimp,Portuguese
```

The header row defines the supported language columns, ready for translation entries.

### Workbench Project (dayz.gproj)

From `P:/DMOverrides/Workbench/dayz.gproj`:

```ini
[Project]
ID=DMOverrides
Title=DMOverrides
Platform=PC
WorkDrive=P:/

[ScriptModules]
Core=DMOverrides/Scripts/1_Core;DabsFramework/Scripts/1_Core
Game=DMOverrides/Scripts/3_Game;DabsFramework/Scripts/3_Game
World=DMOverrides/Scripts/4_World;DabsFramework/Scripts/4_World
Mission=DMOverrides/Scripts/5_Mission;DabsFramework/Scripts/5_Mission

[Imagesets]
DabsFramework/gui/icons/brands.imageset
DabsFramework/gui/icons/thin.imageset
DabsFramework/gui/icons/light.imageset
DabsFramework/gui/icons/regular.imageset
DabsFramework/gui/icons/solid.imageset

[WidgetStyles]
DabsFramework/gui/looknfeel/prefabs.styles

[WorkbenchModules]
DabsFramework/Workbench/ToolAddons
DMOverrides/Workbench/ToolAddons
```

Key configuration:
- **Platform=PC** — PC-only targets (with stubs for XBOX_ONE, PS4, LINUX)
- **WorkDrive=P:/** — Points to the DayZ installation for script references
- **ScriptModules** — Multiple search paths per layer (mod first, then framework)
- **Imagesets/WidgetStyles** — UI framework references (Dabs Framework)

### Mod Loader Config (project.cfg)

From `P:/DMOverrides/Workbench/project.cfg`:

```ini
Mods=@Dabs Framework
ServerMods=
Prefixes=
```

This tells the Workbench mod loader to load `@Dabs Framework` when testing. `ServerMods` and `Prefixes` are empty.

### Test Server Config (server.cfg)

From `P:/DMOverrides/Workbench/server.cfg`:

```ini
hostname = "Test Development Server"
maxPlayers = 5
verifySignatures = 0
allowFilePatching = 1
disableCrosshair = 1

serverTime="2020/7/1/12/00"
serverTimeAcceleration=0.1

class Missions
{
    class DayZ
    {
        template = "dayzOffline.chernarusplus";
    };
};
```

Important server settings for mod development:
- `verifySignatures = 0` — Allows unsigned PBOs during development
- `allowFilePatching = 1` — Allows Workbench file patching (hot-reload scripts)
- `serverTimeAcceleration = 0.1` — Slow time for testing
- Single mission `dayzOffline.chernarusplus` — Offline Chernarus for local testing

## Namalsk Blizzard Hearing — Built Mod Example

`P:/NBH_Mod/` (symlinked to `@NamalskBlizzardHearing`) is a finished, build-ready mod that modifies how players hear blizzards on the Namalsk map.

### Directory Structure

```
@NamalskBlizzardHearing/
├── Addons/
│   └── NamalskBlizzard.pbo     — Packaged mod content
├── mod.cpp                      — Mod manifest
├── meta.cpp                     — Workshop metadata
├── README.md                    — Documentation
└── .gitignore                   — Build artifacts excluded
```

### mod.cpp

```cpp
name = "Namalsk Blizzard Hearing";
// ... standard mod.cpp fields
```

### PBO Contents

`NamalskBlizzard.pbo` is a small PBO (5,442 bytes) containing:

| File | Purpose |
|------|---------|
| `config.cpp` | `CfgPatches NamalskBlizzardHearing` with `requiredAddons[] = {"DZ_Data"}` |
| `mod.cpp` | Mod metadata (embedded in PBO for self-containment) |
| `README.md` | Mod documentation |
| `scripts/4_World/NamalskBlizzardHearing/BlizzardNoise.c` | Main script implementation |
| `.gitignore` | `*.pbo`, `*.bisign`, `*.biprivatekey`, `*.bikey`, `build/`, `dist/` |

### Script Structure

The mod has a single script file in the `4_World` layer:

```
NamalskBlizzard.pbo/
├── config.cpp
├── scripts/
│   └── 4_World/
│       └── NamalskBlizzardHearing/
│           └── BlizzardNoise.c
```

The `BlizzardNoise.c` file implements a hearing modifier system:

```c
// Pseudocode structure based on mod analysis
class BlizzardNoise
{
    // Modifies player hearing during blizzard events
    static bool NBH_GetActiveBlizzard()
    {
        // Checks NamEventManager for active "Blizzard" event
        // Returns true if blizzard is active
    }
};

class BlizzardNoiseMission
{
    float m_normalMultiplier;     // Hearing range multiplier
    
    void CalculateHearing()
    {
        // Reduces hearing range during active blizzard
        // Applies muffling effect to audio
    }
};
```

### PBO Build Process

The `.gitignore` reveals the mod's build pipeline:

```
*.pbo          — Built PBO artifacts
*.bisign       — Signed PBO signatures
*.biprivatekey — Private signing keys
*.bikey        — Public signing keys
build/         — Build output directory
dist/          — Distribution directory
```

The build workflow:
1. Develop scripts in a source directory
2. Build PBOs with a PBO tool (e.g., DayZ PBO Maker, MakePbo)
3. Sign PBOs with a private key (generates `.bisign`)
4. Copy `.bikey` to the mod's `Keys/` folder
5. Distribute the `@` folder

### Key Differences: Scaffold vs Built Mod

| Aspect | DMOverrides (Scaffold) | NamalskBlizzard (Built) |
|--------|----------------------|------------------------|
| State | Development template | Finished, released mod |
| Scripts | Empty directories | `4_World/BlizzardNoise.c` |
| Config | CfgMods registration | CfgPatches only |
| Workbench | Full `.gproj` project | No Workbench files |
| PBOs | None | `NamalskBlizzard.pbo` |
| Keys | None | Has `.bikey` in parent |
| Server config | `server.cfg` + `project.cfg` | None (uses game defaults) |

## Key Takeaways for Mod Developers

### From DMOverrides

1. **Start with a scaffold**: Create empty script modules for each layer before writing code
2. **Set up Workbench early**: The `.gproj` project file links scripts, imagesets, and widgets
3. **Configure test server**: A `server.cfg` with `verifySignatures=0` and `allowFilePatching=1` speeds up iteration
4. **Use CfgMods**: Register your mod properly so the game recognizes its script modules
5. **Plan for localization**: Include the `stringtable.csv` from the start

### From NamalskBlizzard

1. **Single-responsibility PBOs**: The mod is small and focused — one feature, one PBO
2. **Layer-appropriate placement**: Script lives in `4_World` because it modifies world gameplay
3. **Namespace your classes**: The `NBH_` prefix prevents symbol conflicts
4. **Use game event system**: Integrate with `NamEventManager` rather than building custom event handling
5. **Gitignore build artifacts**: Exclude PBOs and keys from version control

## Related Documentation

- [Mod Project Structure](./mod-structure) — Standard mod project anatomy
- [Client/Server Logic](./client-server-logic) — Understanding server/client split
- [Common APIs](./common-apis) — Key APIs used in mod development
- [Safe Modding Patterns](./safe-patterns) — Best practices for compatible mods
