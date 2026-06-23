# Inventory System

The inventory system is one of the largest and most complex subsystems in DayZ. It manages item storage, movement, equipment, and the player's hand/item state machine. Located primarily in `3_game/systems/inventory/`, it spans ~140,000 lines across ~30 files.

## Architecture

```
Inventory System
├── Core Inventory (inventory.c) — 54,600 lines
│   ├── Item storage management
│   ├── Stack operations
│   ├── Container queries
│   └── Serialization
│
├── Human Inventory (humaninventory.c) — 23,250 lines
│   ├── Player-specific inventory
│   ├── Equipment slots
│   └── Quick bar
│
├── Inventory Locations (inventorylocation.c) — 19,400 lines
│   ├── Location abstraction
│   ├── Cargo locations
│   ├── Proxy locations
│   └── Hand locations
│
├── Hand FSM (hand_fsm.c, hand_actions.c, hand_events.c,
│   │         hand_guards.c, hand_states.c)
│   ├── Hand state machine
│   ├── Item manipulation actions
│   └── Event-driven transitions
│
├── Slots (inventoryslots.c)
│   ├── Slot type definitions
│   └── Slot validation
│
├── Cargo (cargo.c)
│   ├── Container cargo management
│   └── Item arrangement
│
├── Weapon Inventory (weaponinventory.c)
│   ├── Weapon attachments
│   ├── Chambering
│   └── Magazine management
│
├── Building Inventory (buildinginventory.c)
│   └── Building storage containers
│
└── Transport Inventory (transportinventory.c)
    └── Vehicle storage
```

## Core Concepts

### Inventory Locations

Every item exists at a location:

```c
enum InventoryLocationType {
    INVENTORY_LOCATION_CARGO,     // In a container's cargo
    INVENTORY_LOCATION_PROXY,     // Attached to a proxy slot (on-body)
    INVENTORY_LOCATION_HAND,      // In the player's hand
    INVENTORY_LOCATION_GROUND,    // On the ground
};
```

### Slot Types

Defined in `DZ/` configs and managed at runtime:

```c
// Common slot types (from scripts/config.cpp CfgSlots)
// Head, Shoulder, Melee, Bow, Headgear, Mask, Eyewear,
// Hands, LeftHand, Gloves, Armband, Vest, Body, Back,
// Hips, Legs, Feet, Pistol, Knife, magazine, Driver, Cargo
```

### Item Storage

```c
class InventoryItem : EntityAI {
    int GetWeight();              // Item weight in grams
    vector GetItemSize();         // Item dimensions (x, y)
    int GetQuantity();            // Current quantity (ammo, liquid, etc.)
    int GetMaxQuantity();         // Maximum quantity
    bool IsStackable();           // Can this item stack?
};
```

## Hand State Machine

The hand FSM manages what the player is doing with their hands/items:

```
States:
├── IDLE
├── PICKING_ITEM
├── DROPPING_ITEM
├── USING_ITEM
├── COMBINING_ITEMS
├── ATTACHING_ITEM
├── DETACHING_ITEM
└── SWAPPING_ITEMS

Transitions are triggered by events:
├── EVENT_PICK
├── EVENT_DROP
├── EVENT_USE
├── EVENT_COMBINE
├── EVENT_ATTACH
├── EVENT_DETACH
└── EVENT_SWAP
```

## Human Inventory Flow

```
Player Input (use key / inventory UI)
    ↓
InventoryActionHandler (4_world/classes/)
    ↓
HumanInventory
    ↓
InventoryLocation resolution
    ↓
Hand FSM transition
    ↓
Inventory state change (move, equip, drop)
    ↓
Network synchronization via ScriptRPC
```

## Key Files

### `inventory.c` (54,600 lines)

The core inventory logic:
- **Container management**: Add, remove, find items in containers
- **Stack operations**: Merge, split, transfer stacks
- **Weight/capacity**: Calculate total weight, enforce capacity limits
- **Serialization**: Save/load inventory state
- **Query**: Find items by type, slot, or location

### `humaninventory.c` (23,250 lines)

Human-specific inventory:
- **Equipment slots**: Manages worn items (headgear, vest, backpack, etc.)
- **Quick bar**: Manages the 1-9 quick bar slots
- **Hands**: Manages the currently held item
- **Cargo**: Manages backpack/storage cargo

### `inventorylocation.c` (19,400 lines)

Abstraction layer for where items can be:
- **CargoLocation**: Items in container cargos
- **ProxyLocation**: Items attached to proxy slots on the body
- **HandLocation**: Items held in hands
- **GroundLocation**: Items on the ground

## Related Config Files

Inventory slot types and container dimensions are defined in config:

```cpp
// DZ/gear/containers/config.cpp
class CfgSlots {
    slot Back {
        // Backpack slot configuration
    };
    slot Vest {
        // Vest slot configuration
    };
};
```

## Interaction with Other Systems

- **Damage system**: Items take damage and degrade
- **Crafting system**: Inventory items are used as crafting ingredients
- **Cooking system**: Food items are stored in inventory
- **Medical system**: Medical items are applied from inventory
- **Network**: Inventory changes are synced via RPC
- **Persistence**: Inventory state is saved to the hive database
