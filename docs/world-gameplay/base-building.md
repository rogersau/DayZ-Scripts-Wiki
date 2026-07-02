# Base Building

The base building system allows players to construct, maintain, and defend structures in the world.

## Architecture

```
Base Building (classes/basebuilding/)
├── Construction
│   ├── Kit placement
│   ├── Building stages
│   └── Upgrade paths
│
├── Structure Management
│   ├── Health/damage
│   ├── Maintenance
│   └── Decay
│
├── Interaction
│   ├── Attaching/detaching parts
│   ├── Fence gates/doors
│   └── Locks and security
│
└── Config Data (DZ/gear/crafting/)
    └── Base building kit definitions
```

## Construction Process

### 1. Kit Placement

Base building starts with a **kit** (a crafted item in inventory). Kits are placed in the world to begin construction.

> **Note:** The `ConstructionKit` class with `PlaceKit()`, `m_ConstructionType`, `m_MaxBuildStage` is **not verified** in the actual source. The exact kit placement API should be confirmed against the source in `classes/basebuilding/`.

### 2. Building Stages

Construction proceeds through stages (typically 3 stages from kit placement to completed structure).

> **Note:** The `BuildStage` enum (`STAGE_1_MATERIALS`, `STAGE_2_WALLS`, `STAGE_3_COMPLETE`) is **not verified** in the actual source. Stage progression is handled by the actual base building classes — consult the source for exact stage definitions.

Each stage requires:
- **Materials**: Wood planks, nails, tools
- **Time**: Progressive building over time
- **Tools**: Hammer, saw, shovel, pliers

### 3. Stage Progression

> **Note:** The `BaseBuildingBase` class with members like `m_CurrentStage`, `m_ConstructionProgress`, `CanUpgradeStage()`, `UpgradeStage()`, `Damage()`, `Repair()`, `m_RequiredItems`, `m_RequiredTool` is **not verified** in the actual source. The real base building class hierarchy should be consulted in the source for the authoritative API.

## Structure Types

> **Note:** The specific stage counts below are **not verified** against the actual source. These are gameplay-observed descriptions.

| Structure | Purpose |
|-----------|---------|
| **Fence** | Perimeter walls |
| **Gate** | Entry point with door |
| **Watchtower** | Elevated vantage point |
| **Shelter** | Basic roofed structure |
| **Storage** | Secure container cache |
| **Hunting Stand** | Elevated hunting platform |

## Structure Health & Decay

Base structures have health and decay mechanics.

> **Note:** The `BaseBuildingBase` decay-related members (`m_DecayRate`, `m_LastMaintenanceTime`, `m_MaintenancePeriod`, `OnBulletHit()`, `OnExplosionHit()`, `OnMeleeHit()`, `OnToolDamage()`, `UpdateDecay()`) are **not verified** in the actual source. Consult the actual base building source for the real health/decay API.

## Security

### Locks

```c
class CombinationLock {
    // Verified API
    void SetBaseLockValues(/* ... */);   // Configure lock values on the base building
};
```

> **Note:** Methods like `SetCode()`, `TryCode()`, `Lock()`, `Unlock()` and fields like `m_Code`, `m_IsLocked` are **not verified** in the actual source. The only confirmed method on `CombinationLock` is `SetBaseLockValues()`.

### Access Control

- **Combination locks**: Placed on gates/doors
- **Code**: Set by the player who places the lock
- **Breaking**: Locks can be destroyed with tools
- **Fence interaction**: Gates open/close

## Tools Required

| Tool | Use |
|------|-----|
| Hammer | Building, repairing |
| Saw | Cutting materials |
| Shovel | Digging, burying |
| Pliers | Cutting, lock removal |
| Hatchet | Wood gathering |
| Crowbar | Breaking structures |

## Integration with Other Systems

- **Crafting**: Construction kits are crafted items
- **Inventory**: Building materials stored in inventory
- **Damage system**: Structures take damage from weapons/explosions
- **Persistence**: Base structures persist on server
- **Network**: Structure state synced to all players
- **World collision**: Structures interact with world geometry
