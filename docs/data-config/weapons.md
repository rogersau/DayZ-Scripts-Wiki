# Weapons

The `DZ/weapons/` directory defines all weapons, ammunition, attachments, and projectile types in the game.

## Categories

| Category | Directory | Examples |
|----------|-----------|----------|
| Ammunition | `weapons/ammunition/` | Bullets, shells, pellets |
| Archery | `weapons/archery/` | Bows, crossbows, arrows |
| Attachments | `weapons/attachments/` | Scopes, suppressors, grips |
| Data | `weapons/data/` | Shared weapon configuration |
| Explosives | `weapons/explosives/` | Grenades, mines, claymores |
| Firearms | `weapons/firearms/` | Rifles (AK, M4, etc.) |
| Launchers | `weapons/launchers/` | RPG, grenade launcher |
| Melee | `weapons/melee/` | Knives, bats, axes |
| Pistols | `weapons/pistols/` | Handguns |
| Projectiles | `weapons/projectiles/` | Ballistics data |
| Shotguns | `weapons/shotguns/` | Shotguns and shells |

## Weapon Config Structure

Firearm weapons follow a consistent config pattern:

```cpp
// Base firearm class
class Rifle_Base: Inventory_Base {
    // Weapon mechanics
    reloadAction = "Reload";           // Reload action
    chamberSize = 1;                   // Rounds in chamber
    magazineSlot[] = { "magazine" };   // Magazine slot
    
    // Recoil
    recoil = "recoil_ak";             // Recoil profile
    recoilModifier[] = {1,1,1};       // Multipliers
    
    // Handling
    dispersion = 0.001;               // Base dispersion
    dispersionAiming = 0.0005;        // Aiming dispersion
    shotActionDelay = 0.1;            // Delay between shots
    reloadTime = 2.0;                 // Reload time
    jamChance = 0.01;                 // Jam probability
    clickChance = 0.001;              // Click (empty) probability
    
    // Sounds
    soundFire[] = {"weapon_fire_ak"};
    soundReload[] = {"weapon_reload_ak"};
    soundDryFire[] = {"weapon_dryfire"};
};

// Specific weapon
class AKM: Rifle_Base {
    scope = 2;
    displayName = "AKM";
    model = "\dz\weapons\firearms\akm\akm.p3d";
    weight = 3300;
    itemSize[] = {4,2};
    
    // AKM specific
    magCount = 30;                    // Magazine capacity
    recoil = "recoil_akm";           // Specific recoil
    chamberableFrom[] = {"Ammo_762x39"};
    magazines[] = {"Mag_AKM_30Rnd"};
    attachments[] = {"WeaponSuppressor", "WeaponOptic", "WeaponWrap"};
};
```

## Ammunition Config

```cpp
class Ammo_Base: Inventory_Base {
    // Ballistic properties
    caliber = "7.62x39mm";
    weight = 12;                         // Bullet weight (grams)
    muzzleVelocity = 700;                // Initial velocity (m/s)
    
    // Damage
    damage = 70;                         // Base damage
    damageType = FIRE_ARM;              // Damage type
    
    // Ballistics
    airFriction = -0.001;               // Air resistance
    terminalVelocity = 300;              // Minimum velocity
    initSpeed = 0;                       // Initial speed modifier
};
```

## Attachment Config

```cpp
class WeaponOptic: Inventory_Base {
    scope = 2;
    displayName = "Scope";
    
    // Attachment properties
    inventorySlot[] = { "WeaponOptic" };
    attachmentType = ATTACHMENT_OPTIC;
    
    // Optic-specific
    zoomLevels[] = {4, 8};              // Zoom levels
    hasReticle = 1;                      // Has crosshair
    reticleType = "crosshair_ak";
    zeroRange = 100;                     // Zero range (meters)
};
```

## Melee Weapon Config

```cpp
class MeleeWeapon_Base: Inventory_Base {
    // Melee properties
    meleeDamage = 30;                    // Base melee damage
    meleeDamageType = CLOSE_COMBAT;     // Damage type
    meleeRange = 1.5;                    // Attack range (meters)
    
    // Attack types
    lightAttacks[] = {"stab", "slash"};
    heavyAttacks[] = {"powerStab", "powerSlash"};
    
    // Durability
    damagePerUse = 0.1;
};
```

## Projectile Config

```cpp
class CfgAmmo {
    class Bullet_Base {
        // Ballistics
        hit = 70;                        // Impact damage
        indirectHit = 0;                 // Splash damage
        indirectHitRange = 0;            // Splash radius
        
        // Visual
        model = "\dz\weapons\projectiles\tracer.p3d";
        tracerScale = 1;
        tracerColor[] = {1,1,0};
        
        // Audio
        soundFly[] = {"bullet_fly"};
        soundHit[] = {"bullet_hit"};
    };
};
```

## Weapon Script Integration

Weapon behavior is implemented in scripts that read config properties:

```c
// 3_game/entities/ (weapon handling)
class Weapon : InventoryItem {
    bool CanFire() {
        return HasMagazine() && GetChamberedRound() != null;
    }
    
    void Fire() {
        // Read config for damage, recoil, dispersion
        float damage = ConfigGetFloat("damage");
        // Apply damage to target
    }
};
```

Weapon-specific classes exist in `4_world/classes/weapons/` for specialized behaviors.
