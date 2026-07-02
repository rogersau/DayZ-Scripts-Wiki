# Safe Modding Patterns

This page covers best practices for writing DayZ mods that are compatible, maintainable, and safe to use in production servers.

> **Prerequisite:** Make sure you're familiar with the [Enforce Script Language Reference](/modding/enforce-syntax) — types, keywords, OOP, and memory management patterns used throughout this page.

## Config-Only Modding

The simplest and safest way to add content is through **config-only modding**. Because DayZ's architecture separates data from logic (documented in [Scripts vs Config](/architecture/script-vs-config)), you can add new items, vehicles, and characters without writing any Enforce Script code.

### When Config-Only Works

```cpp
// config.cpp — no script changes needed
class CfgPatches
{
    class MyMod_Weapons
    {
        units[] = {};
        weapons[] = { MyMod_NewRifle };
        requiredVersion = 0.1;
        requiredAddons[] = { "DZ_Weapons_Firearms" };
    };
};

class CfgWeapons
{
    class Rifle_Base;    // Inherit from existing base
    
    class MyMod_NewRifle : Rifle_Base
    {
        // Define properties — no scripts needed
        scope = 2;
        displayName = "My Custom Rifle";
        model = "myMod\myRifle.p3d";
        weight = 350;
        // ... all other properties
    };
};
```

This works for:
- New weapons, magazines, and attachments
- New clothing and gear
- New vehicles
- New building/structure types
- World object placements

### Scenarios Requiring Scripts

You need Enforce Script code when you want to:
- New gameplay behavior or mechanics
- Custom interaction logic (e.g., a special item that does something unique)
- Server-side persistence logic
- Custom UI/HUD elements
- AI behavior modifications

## Script Override Best Practices

When you need to override game scripts, follow these patterns to minimize conflicts.

### Extending vs Overriding

**Prefer extending over full overrides** when possible:

```c
// ❌ FULL OVERRIDE — replaces DayZPlayer entirely
// If another mod also overrides DayZPlayer, they clash
class DayZPlayer
{
    // ... full class definition
};

// ✅ EXTENSION — add behavior without replacing
class MyModPlayerExtension
{
    void OnMyModAction()
    {
        DayZPlayer player = DayZPlayer.Cast(GetGame().GetPlayer());
        // Your mod's logic using the existing player
    }
};
```

### Inheritance

When you need to override, use inheritance to preserve base behavior:

```c
// Override with inheritance
class MyModMissionServer : MissionServer
{
    override void OnInit()
    {
        super.OnInit();   // Call base implementation
        // Then add your custom init
        MyModInit();
    }
    
    void MyModInit()
    {
        // Your mod-specific initialization
        GetGame().GetCallQueue(CALL_CATEGORY_GAMEPLAY)
            .CallLater(this.MyModUpdate, 5000, true);
    }
};
```

### Selective Overrides

Override only the methods you need to change:

```c
class MyModPlayer : DayZPlayer
{
    override void OnItemUsed(EntityAI item)
    {
        // Add custom behavior before or after
        if (item.GetType() == "MyMod_SpecialItem")
        {
            HandleMyModItem(item);
            return;     // Possibly skip base behavior
        }
        
        super.OnItemUsed(item);  // Default behavior for other items
    }
};
```

## Avoiding `#ifdef` Pitfalls

Preprocessor defines are powerful but easy to misuse:

### ❌ Common Mistakes

```c
// DANGER: Missing #ifdef guard on server-only code
// This will crash on client builds!
void SaveWorldData()
{
    // Server persistence operations only work on server
    // CRASH on client if unguarded
}

// DANGER: Mixing up #ifdef and #ifndef
#ifdef SERVER
    // This is correct — server only
#else
    // This compiles on clients AND Workbench without -server
    // Be careful: what you put here affects both
#endif
```

### ✅ Safe Patterns

```c
// SAFE: Guard entire function
#ifdef SERVER
void SaveWorldData()
{
    // Server persistence — only compiled on server
    // ... persistence logic
}
#endif

// SAFE: Guard specific calls within function
void SomeMethod()
{
    // Common logic here
    
#ifdef SERVER
    // Server-specific logic here
    SaveWorldData();
#endif
    
    // More common logic
}

// SAFE: Class-level member guarding
class MyModManager
{
#ifdef SERVER
    ref SomeServerOnlyData m_ServerData;
#endif
    
    void Init()
    {
#ifdef SERVER
        m_ServerData = new SomeServerOnlyData();
#endif
    }
};
```

## Compatible Addon Patching

When adding to existing config classes, use the `+` override syntax to add without replacing:

```cpp
// Add items to an existing weapons array
class CfgWeapons
{
    // ✅ Add to existing category
    class M4A1 : M4A1_Base
    {
        // + allowed attachments: add new ones without removing existing
        class WeaponsSlotsInfo
        {
            class Slot_MyModAttachment
            {
                name = "MyModAttachment";
                linkProxy = "myMod/proxy/myModAttach.lod";
            };
        };
    };
};

// Add to existing modular vest system
class CfgVehicles
{
    class PlateCarrierVest;
    class PlateCarrierVest_Winter : PlateCarrierVest
    {
        hiddenSelections[] = { "camo1", "camo2", "camo3" };
        // Additional selections added
    };
};
```

### Remove Without Breaking

When a mod is removed, any objects or scripts referencing it will error. Mitigate this:

```cpp
// Use fallback values for mod-provided config entries
float GetMyModValue()
{
    float val = ConfigGetFloat("CfgMyMod Settings someValue");
    if (val == 0)
        return DEFAULT_VALUE;  // Fallback if mod is missing
    return val;
}
```

## Mod Load Order and Dependencies

### CfgPatches Dependencies

Always declare your dependencies in `CfgPatches`:

```cpp
class CfgPatches
{
    class MyMod_Scripts
    {
        requiredAddons[] = {
            "DZ_Scripts",           // Core scripts
            "DZ_Data",              // Core data
            "DZ_Weapons_Firearms",  // If extending weapons
            "DZ_Gear_Containers"    // If using containers
        };
    };
};
```

The game uses these to:
1. Determine load order (dependency → dependant)
2. Detect missing dependencies
3. Report load errors if a required addon isn't present

### Load Order Example

```
1. DZ_Data              → Core game data
2. DZ_Scripts           → Core game scripts
3. DZ_Weapons_Firearms  → Weapon definitions
4. MyMod_Data           → Your mod data (depends on DZ_*)
5. MyMod_Scripts        → Your mod scripts (depends on MyMod_Data)
```

## Namespace Conventions

Prevent symbol conflicts with other mods by following naming conventions:

### Class Names

```c
// ✅ PREFIX your classes with a unique mod identifier
class NBH_CustomPlayer : DayZPlayer
class NST_SpecialItem : ItemBase
class MYMOD_CustomSystem : ScriptedEntity

// ❌ Avoid generic names that might clash
class CustomPlayer           // Another mod might also have one
class SpecialItem            // Too generic
class System                 // Extremely generic — WILL clash
```

### Config Classes

```cpp
// ✅ Prefix in your config.cpp
class CfgPatches
{
    class MYMOD_Weapons { ... };
};

class CfgWeapons
{
    class MYMOD_Rifle_Base : Rifle_Base { ... };
    class MYMOD_AK47 : MYMOD_Rifle_Base { ... };
};
```

### RPC IDs

Use high numbers for custom RPCs to avoid conflicting with game RPCs:

```c
enum ERPCs
{
    // Game RPCs use low numbers (0–99)
    // Reserve a range for your mod:
    RPC_MYMOD_BASE = 10000,
    RPC_MYMOD_SYNC,
    RPC_MYMOD_EVENT,
    RPC_MYMOD_REQUEST,
};
```

### File Names

```c
// Prefix files with your mod identifier
3_game/mymod_custom_player.c
4_world/classes/mymod_special_item.c
5_mission/mission/mymod_mission_ext.c
```

## Testing Tips

### Local Testing Checklist

Before releasing your mod, verify each of these:

- [ ] **Compiles without errors**: Check the `.rpt` log for compilation errors
- [ ] **Loads without warnings**: No config merge errors in logs
- [ ] **Client and server tested**: Test on a local dedicated server, not just Workbench
- [ ] **Reconnect test**: Join, play, disconnect, rejoin — verify state persists correctly
- [ ] **Config data accessible**: All config entries return expected values
- [ ] **RPC round-trip**: Client→Server→Client communication works
- [ ] **Mod removal**: What happens when the mod is removed? Graceful degradation?
- [ ] **Multiple instances**: Spawn multiple copies of new items — no errors
- [ ] **Concurrent players**: Test with at least 2 players for multiplayer issues

### Common Issues

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| "Unknown entity type" | Config not loading or missing `CfgPatches` | Check `requiredAddons[]` and PBO structure |
| Script compile error in `.rpt` | Syntax error or missing semicolon | Check line in your `.c` file |
| Item has no model | Missing or wrong model path | Verify path in config.cpp |
| RPC not arriving | Wrong RPC direction or unregistered handler | Check `RPCRegisterClient`/`RPCRegisterServer` |
| Server crash on spawn | Missing `#ifdef SERVER` guard | Review server-only code |
| Client crash on join | Missing `#ifndef SERVER` guard on UI code | Review client-only code |

### Test Server Setup

For real testing, set up a local DayZ dedicated server:

1. Install DayZ Server via Steam
2. Copy your mod to the server's `@myMod/` directory (or `!Workshop/@myMod/`)
3. Add `-serverMod=@myMod` to the server startup parameters
4. Check `server_profile.rpt` for your mod's log output
5. Connect from a retail (non-Workbench) client for accurate testing
