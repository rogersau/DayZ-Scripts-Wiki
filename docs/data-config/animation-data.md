# Animation Data

The `DZ/anims/` directory defines the animation system configuration — skeleton definitions, animation workspaces, and animation `.anm` files for player and infected characters. Unlike most config directories, the animation system uses **XML-based data** rather than config.cpp classes.

## Directory Structure

```
anims/
├── anm/                          — Animation definition files
│   ├── infected/                 — Infected/zombie animations
│   └── player/                   — Player character animations
├── cfg/                          — Configuration data
│   ├── config.cpp               — Patch registration (stub)
│   ├── skeletons.anim.xml       — Skeleton hierarchy definitions
│   ├── profiles/                 — Animation profiles
│   └── testworkspaces/          — Test animation workspaces
└── workspaces/                  — Workbench animation workspaces
    ├── infected/                 — Infected animation workspace files
    ├── player/                   — Player animation workspace files
    └── samples/                  — Sample/animation clips
```

## Config Registration

From `P:/DZ/anims/cfg/config.cpp`:

```cpp
class CfgPatches
{
    class DZ_Anims_Cfg
    {
        units[] = {};
        weapons[] = {};
        requiredVersion = 0.1;
        requiredAddons[] = {};
    };
};
```

This is purely a patch registration — the actual animation definitions live in XML files, not in config.cpp.

## Skeleton Definitions

From `P:/DZ/anims/cfg/skeletons.anim.xml` (~38 KB):

The skeleton XML defines the bone hierarchy for character models. It specifies:

- **Bone names** and hierarchy (parent-child relationships)
- **Bind pose** transformations
- **Skeleton structure** for player and infected characters

```xml
<!-- Conceptual structure -->
<Skeleton>
    <Bone name="Pelvis" index="0">
        <Bone name="Spine1" index="1">
            <Bone name="Spine2" index="2">
                <Bone name="Neck" index="3">
                    <Bone name="Head" index="4"/>
                </Bone>
            </Bone>
        </Bone>
        <Bone name="LeftUpLeg" index="5">
            <Bone name="LeftLoLeg" index="6"/>
        </Bone>
        <Bone name="RightUpLeg" index="7">
            <Bone name="RightLoLeg" index="8"/>
        </Bone>
    </Bone>
</Skeleton>
```

The skeleton defines:
- All character bones with hierarchical indexing
- Bone lengths and orientation in bind pose
- IK (Inverse Kinematics) markers for hand/foot placement
- Collision volumes for physics interactions

## Animation Files (.anm)

Animation `.anm` files in `anm/player/` and `anm/infected/` define individual animation clips:

```
anm/
├── infected/
│   ├── idle.anm
│   ├── walk.anm
│   ├── run.anm
│   ├── attack.anm
│   └── ...
└── player/
    ├── idle.anm
    ├── walk.anm
    ├── run.anm
    ├── sprint.anm
    ├── crouch.anm
    ├── prone.anm
    ├── climb.anm
    ├── swim.anm
    └── ...
```

Each `.anm` file stores:

| Component | Description |
|-----------|-------------|
| **Bone transforms** | Per-bone position/rotation keyframes |
| **Timing** | Frame count, frame rate, total duration |
| **Events** | Animation event markers (footstep, sound, gameplay trigger) |
| **Blending** | Blend-in/out times for transitions |
| **Looping** | Loop start/end points for cyclic animations |

### Animation Events

Animation `.anm` files can embed script-callable events at specific frames:

| Event | Purpose |
|-------|---------|
| `footstep` | Footstep sound trigger |
| `melee_hit` | Melee damage frame |
| `weapon_fire` | Weapon discharge frame |
| `sound` | Generic sound event |
| `particle` | Particle effect spawn |
| `inventory_open` | Inventory visibility toggle |

These events are processed by the script-side animation event system in `P:/scripts/3_game/dayzanimevents.c` and `dayzanimeventmaps.c`.

## Animation Workspaces

Workspace files in `workspaces/` are Workbench IDE project files that organize animations into editable projects:

| Directory | Contents |
|-----------|----------|
| `workspaces/player/` | Player animation workspaces (movement, combat, gestures) |
| `workspaces/infected/` | Infected animation workspaces (movement, attack, death) |
| `workspaces/samples/` | Reference/sample animation clips |
| `cfg/testworkspaces/` | Test/debug workspace configurations |

### Animation Profiles

Profiles in `cfg/profiles/` define animation blending and configuration parameters:

- **Blend profiles**: Transition speeds between animations (idle→walk, walk→run)
- **Modifier profiles**: Movement speed/multipliers per animation state
- **Override profiles**: Weapon-specific animation overrides (e.g., rifle vs pistol stance)

## Animation Categories

### Player Animations

Player animations cover all character states:

| Category | Animations |
|----------|------------|
| **Locomotion** | Idle, Walk, Run, Sprint, CrouchWalk, ProneMove |
| **Stances** | Stand, Crouch, Prone, Raised |
| **Combat** | MeleeSwing, MeleeHit, GunRaise, ADS, Reload |
| **Interaction** | Pickup, Open, Climb, Vault, Swim, Dive |
| **Damage** | HitReaction, Death, Unconscious, GetUp |
| **Weapon-specific** | Per-weapon grip, movement modifiers, recoil anims |

### Infected Animations

Infected have a simpler animation set:

| Category | Animations |
|----------|------------|
| **Locomotion** | Idle, Wander, Shamble, Run, Sprint |
| **Detection** | Alert, Investigate, Search |
| **Combat** | Attack (left/right), Grab, Bite, Rage |
| **Damage** | HitReaction, Stagger, Fall, Death |
| **State** | Agitated, Calm, Eating |

## World-Specific Animation Data

Per-world animation variants exist in:
- `DZ/anims_bliss/` — Livonia-specific animation data
- `DZ/anims_sakhal/` — Sakhal-specific animations (cold weather movement, etc.)

## Related Documentation

- [Animation System](/game-systems/animation-system) — Script-side animation management
- [Animation Data (DZ)](/data-config/animation-data) — This page
- [Characters](./characters) — Character model definitions that use these skeletons
- [Sound System](/game-systems/sound-system) — Animation event-triggered sounds
