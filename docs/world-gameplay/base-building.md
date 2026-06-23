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

Base building starts with a **kit** (a crafted item in inventory):

```c
class ConstructionKit : InventoryItem {
    // Place the kit to start construction
    bool PlaceKit(vector position, vector orientation);
    
    // Resulting construction type
    string m_ConstructionType;  // "Fence", "Watchtower", "Gate", etc.
    int m_MaxBuildStage;        // Total stages (typically 3)
};
```

### 2. Building Stages

Construction proceeds through stages:

```c
enum BuildStage {
    STAGE_1_MATERIALS,    // Kit placed, raw materials visible
    STAGE_2_WALLS,        // Basic structure built
    STAGE_3_COMPLETE      // Fully constructed
};
```

Each stage requires:
- **Materials**: Wood planks, nails, tools
- **Time**: Progressive building over time
- **Tools**: Hammer, saw, shovel, pliers

### 3. Stage Progression

```c
class BaseBuildingBase {
    int m_CurrentStage;           // Current build stage (0-3)
    float m_ConstructionProgress;  // Progress toward next stage
    float m_Health;                // Current health
    float m_MaxHealth;             // Maximum health
    
    // Stage requirements
    array<string> m_RequiredItems[int];  // Items needed per stage
    int m_RequiredTool;                   // Tool needed to build
    
    // Methods
    bool CanUpgradeStage(EntityAI player);
    void UpgradeStage(EntityAI player);
    void Damage(float amount);
    void Repair(float amount);
};
```

## Structure Types

| Structure | Stages | Purpose |
|-----------|--------|---------|
| **Fence** | 3 | Perimeter walls |
| **Gate** | 3 | Entry point with door |
| **Watchtower** | 3 | Elevated vantage point |
| **Shelter** | 3 | Basic roofed structure |
| **Storage** | 3 | Secure container cache |
| **Hunting Stand** | 3 | Elevated hunting platform |

## Structure Health & Decay

```c
class BaseBuildingBase {
    // Health system
    float m_Health;
    float m_MaxHealth;
    
    // Decay system
    float m_DecayRate;            // Health lost per day
    float m_LastMaintenanceTime;  // Last repair timestamp
    float m_MaintenancePeriod;    // Days before decay starts
    
    // Damage types
    void OnBulletHit(float damage);
    void OnExplosionHit(float damage);
    void OnMeleeHit(float damage);
    void OnToolDamage(float damage, string toolType);
    
    // Decay check
    void UpdateDecay(float delta) {
        if (time - m_LastMaintenanceTime > m_MaintenancePeriod) {
            m_Health -= m_DecayRate * delta;
        }
    }
};
```

## Security

### Locks

```c
class CombinationLock {
    string m_Code;                  // Player-set code
    bool m_IsLocked;               // Lock state
    
    void SetCode(string code);
    bool TryCode(string code);
    void Lock();
    void Unlock();
};
```

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
