# Damage & Combat System

The damage system handles all forms of harm in DayZ: melee combat, firearms, explosions, environmental damage, and the resulting injuries, bleeding, shock, and unconsciousness.

## Architecture

```
DamageSystem (3_game/damagesystem.c)
├── Melee damage
├── Firearm damage
├── Explosion damage
└── Stun damage

Classes (4_world/classes/)
├── area damage/
│   └── Area-of-effect damage
├── bleedingindication/
│   └── Visual bleeding feedback
├── bleedingsources/
│   └── Bleeding source definitions
├── bullethitreaction/
│   └── Hit reactions
├── shockhandler.c
│   └── Shock/concussion state
├── injuryhandler.c
│   └── Injury state machine
├── hitindication/
│   └── Hit direction/damage indicators
├── shockhitreaction/
│   └── Shock-based reactions
├── explosion.c
│   └── Explosion handling
├── meleetargeting.c
│   └── Melee hit detection
└── destructioneffects/
    └── Destruction VFX
```

## Damage Types

```c
enum DamageType {
    CLOSE_COMBAT,   // Melee weapons, fists
    FIRE_ARM,       // Bullets
    EXPLOSION,      // Explosives, grenades
    STUN,           // Stun/concussive
    CUSTOM          // Script-defined
};
```

## DamageSystem (`3_game/damagesystem.c`)

A static utility class providing damage application:

```c
class DamageSystem {
    // Apply melee damage
    static void CloseCombatDamage(
        EntityAI victim, 
        EntityAI attacker, 
        float damage, 
        string component
    );
    
    // Apply explosion damage
    static void ExplosionDamage(
        EntityAI victim, 
        vector position, 
        float radius, 
        float damage
    );
    
    // Get damage zone mapping
    static ref map<string, int> GetDamageZoneMap();
    
    // Query total damage
    static float TotalDamageResult(
        EntityAI entity, 
        string zone, 
        int healthType
    );
};
```

## Damage Zones

Entities have multiple damage zones defined in config:

```c
// From scripts/config.cpp CfgSlots
// Damage zones typically include:
// HEAD, FACE, NECK, CHEST, STOMACH, 
// LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG
```

Each zone has:
- Health pool
- Armor value (from worn clothing)
- Bleeding probability
- Shock damage multiplier

## Combat Types

### Melee Combat

Melee weapons include fists, knives, bats, axes, and other hand-to-hand weapons. Key files:

- `HumanCommandMelee` / `HumanCommandMelee2` — Animation commands for melee attacks
- `4_world/classes/meleetargeting.c` — Hit detection and targeting
- `DZ/weapons/melee/config.cpp` — Melee weapon definitions

Melee damage is calculated from:
- Weapon base damage (from config)
- Heavy/light attack type
- Target damage zone
- Armor from worn clothing

### Firearms

Firearm damage involves:

- **Projectile**: Defined in `DZ/weapons/projectiles/`
- **Ballistics**: Handled by engine physics (`enphysics.c`)
- **Hit detection**: `bullethitreaction/` classes
- **Impact effects**: `ammoeffects.c`, `3_game/ammocamparams.c`

### Explosions

```c
class ExplosionDamage {
    static void ApplyExplosion(
        vector position, 
        float radius, 
        float damage, 
        string ammoType
    );
};
```

Explosions:
- Apply area-of-effect damage
- Have damage falloff over distance
- Can cause structural damage
- Trigger destruction effects
- Apply shock/stun to nearby entities

## Injury System

The injury handler (`4_world/classes/injuryhandler.c`) manages injury states:

```
Bleeding ──→ Bandage/medical treatment
   │
   ↓
Blood loss ──→ Transfusion required
   │
   ↓
Unconscious ──→ Wake up or die
```

### Bleeding

- Multiple bleeding sources (cuts, gunshot wounds)
- Bleeding rate depends on wound severity
- Visual feedback via `bleedingindication/`
- Medical items (bandage, sewing kit) stop bleeding

### Shock

The `shockhandler.c` manages concussive damage:
- Triggered by explosions, heavy impacts, severe damage
- Causes blurred vision, difficulty aiming
- Can lead to unconsciousness at high levels

## Combat Flow

```
Attack initiated
    ↓
Hit detection (melee targeting / projectile hit)
    ↓
Damage calculation (base damage × zone multiplier × armor)
    ↓
Health reduction
    ↓
Bleeding check (probability based on damage type)
    ↓
Shock application (based on damage type/amount)
    ↓
Hit reaction (animation, camera shake)
    ↓
Effect spawning (blood particles, impact sounds)
    ↓
State update (unconscious/death if threshold exceeded)
```

## Related Config Files

- `DZ/weapons/data/` — Weapon damage values
- `DZ/weapons/ammunition/` — Ammo types and damage
- `DZ/gear/medical/` — Medical item effectiveness
- `DZ/characters/data/` — Character armor values
