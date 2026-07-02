# Real Mod Examples

This page documents real mod patterns and structures used in DayZ modding. The examples below illustrate common mod architectures — they are **illustrative patterns** based on real mod conventions, not verbatim extractions from any specific P:\ drive directory.

> **Note:** The `P:/` paths referenced in other wiki pages point to the DayZ source installation. The specific directories `P:/DMOverrides/`, `P:/NBH_Mod/`, `P:/NBH_NamalskSurvival/`, and `P:/NBH_NamalskIsland/` are **not guaranteed to exist** on your installation. Treat these as reference patterns only.

## Mod Project Scaffold (Generic)

A typical DayZ mod scaffold provides empty script modules ready for development, a Workbench IDE configuration, and a local test server setup.

### Directory Structure

```
MyMod/
├── Scripts/
│   ├── config.cpp              — Mod registration
│   ├── Inputs.xml              — Input action bindings
│   ├── stringtable.csv         — Localization table
│   ├── 1_Core/MyMod/           — Core layer scripts (empty)
│   ├── 3_Game/MyMod/           — Game layer scripts (empty)
│   ├── 4_World/MyMod/          — World layer scripts (empty)
│   └── 5_Mission/MyMod/        — Mission layer scripts (empty)
└── Workbench/
    ├── dayz.gproj              — Workbench project file
    ├── project.cfg             — Mod loader config
    ├── server.cfg              — Local test server config
    ├── exclude.lst             — File exclusion list
    └── ToolAddons/             — Workbench tool addons (empty)
```

### Mod Registration (config.cpp)

```cpp
class CfgPatches
{
    class MyMod_Scripts
    {
        units[] = {};
        weapons[] = {};
        requiredVersion = 0.1;
        requiredAddons[] = { "DZ_Scripts" };
    };
};

class CfgMods
{
    class MyMod
    {
        type = "mod";
        
        class Scripts
        {
            class 1_Core
            {
                // Core engine module
                // Path: MyMod/Scripts/1_Core
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

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
    <actions>
        <!-- Mod-specific action bindings go here -->
    </actions>
    <preset></preset>
</root>
```

### Localization (stringtable.csv)

```csv
Original,English,Czech,German,Russian,Polish,Spanish,French,Italian,Japanese,Chinese,ChineseSimp,Portuguese
```

The header row defines the supported language columns, ready for translation entries.

### Workbench Project (dayz.gproj)

```ini
[Project]
ID=MyMod
Title=MyMod
Platform=PC
WorkDrive=P:/

[ScriptModules]
Core=MyMod/Scripts/1_Core
Game=MyMod/Scripts/3_Game
World=MyMod/Scripts/4_World
Mission=MyMod/Scripts/5_Mission

[WorkbenchModules]
MyMod/Workbench/ToolAddons
```

Key configuration:
- **Platform=PC** — PC-only targets
- **WorkDrive=P:/** — Points to the DayZ installation for script references
- **ScriptModules** — Search paths per layer

### Mod Loader Config (project.cfg)

```ini
Mods=
ServerMods=
Prefixes=
```

This tells the Workbench loader which mods to load when testing.

### Test Server Config (server.cfg)

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

## Small Single-Feature Mod (Generic)

A finished, build-ready mod that modifies a specific gameplay mechanic. This pattern is common for small, focused mods.

### Directory Structure

```
@MySmallMod/
├── Addons/
│   └── MySmallMod.pbo           — Packaged mod content
├── mod.cpp                      — Mod manifest
├── meta.cpp                     — Workshop metadata (auto-generated)
├── Keys/                        — Public signing keys
│   └── mykey.bikey
└── README.md
```

### mod.cpp

```cpp
name = "My Small Mod";
picture = "mySmallMod/gui/imagesets/logo_co.edds";
logoSmall = "mySmallMod/gui/imagesets/logo_small_co.edds";
logo = "mySmallMod/gui/imagesets/logo_co.edds";
logoOver = "mySmallMod/gui/imagesets/logo_hover_co.edds";
action = "https://example.com/";
tooltip = "My Small Mod";
overview = "A small focused mod for DayZ";
author = "AuthorName";
hidePicture = 0;
```

### PBO Contents

A typical small PBO contains:

| File | Purpose |
|------|---------|
| `config.cpp` | `CfgPatches` entry with dependencies |
| `mod.cpp` | Mod metadata (embedded in PBO for self-containment) |
| `scripts/4_World/MyMod/MyFeature.c` | Main script implementation |

### Script Structure

Scripts are placed in the appropriate layer:

```
MySmallMod.pbo/
├── config.cpp
├── scripts/
│   └── 4_World/
│       └── MyMod/
│           └── MyFeature.c
```

Example script structure for a hearing modifier mod:

```c
// Pseudocode structure — adapt to your feature
class MyMod_FeatureManager
{
    static bool IsFeatureActive()
    {
        // Check game state for feature activation
        return true;
    }
};

class MyMod_MissionExtension
{
    float m_modifierValue;
    
    void CalculateEffect()
    {
        // Apply the mod's effect to gameplay
    }
};
```

### PBO Build Process

The build workflow:
1. Develop scripts in a source directory
2. Build PBOs with a PBO tool (e.g., DayZ PBO Maker, MakePbo)
3. Sign PBOs with a private key (generates `.bisign`)
4. Copy `.bikey` to the mod's `Keys/` folder
5. Distribute the `@` folder

Gitignore pattern for build artifacts:

```
*.pbo          — Built PBO artifacts
*.bisign       — Signed PBO signatures
*.biprivatekey — Private signing keys
*.bikey        — Public signing keys
build/         — Build output directory
dist/          — Distribution directory
```

## Scaffold vs Built Mod — Key Differences

| Aspect | Scaffold | Built Mod |
|--------|----------|-----------|
| State | Development template | Finished, released mod |
| Scripts | Empty directories | Populated script files |
| Config | CfgMods registration | CfgPatches (in PBO) |
| Workbench | Full `.gproj` project | No Workbench files |
| PBOs | None | Packaged `.pbo` files |
| Keys | None | Has `.bikey` for signing |
| Server config | `server.cfg` + `project.cfg` | Uses game defaults |

## Key Takeaways for Mod Developers

### From the Scaffold Pattern

1. **Start with a scaffold**: Create empty script modules for each layer before writing code
2. **Set up Workbench early**: The `.gproj` project file links scripts, imagesets, and widgets
3. **Configure test server**: A `server.cfg` with `verifySignatures=0` and `allowFilePatching=1` speeds up iteration
4. **Use CfgMods**: Register your mod properly so the game recognizes its script modules
5. **Plan for localization**: Include the `stringtable.csv` from the start

### From the Small Mod Pattern

1. **Single-responsibility PBOs**: Keep mods small and focused — one feature, one PBO
2. **Layer-appropriate placement**: Place scripts in the correct layer (4_World for gameplay, 5_Mission for mission overrides)
3. **Namespace your classes**: Use a unique prefix to prevent symbol conflicts
4. **Use existing event systems**: Integrate with game events rather than building custom systems
5. **Gitignore build artifacts**: Exclude PBOs and keys from version control

## Related Documentation

- [Mod Project Structure](./mod-structure) — Standard mod project anatomy
- [Client/Server Logic](./client-server-logic) — Understanding server/client split
- [Common APIs](./common-apis) — Key APIs used in mod development
- [Safe Modding Patterns](./safe-patterns) — Best practices for compatible mods
