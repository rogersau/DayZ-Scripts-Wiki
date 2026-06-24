# Weapons

The `DZ/weapons/` directory defines all weapons, ammunition, attachments, projectile ballistics, and explosive devices. From `P:/DZ/weapons/`.

## Directory Structure

```
weapons/
├── ammunition/       — Loose ammunition boxes and stacks
├── animations/       — Weapon-specific animation data
├── archery/          — Bows, crossbows, arrows
├── attachments/      — Scopes, suppressors, grips, lights, bayonets
│   ├── data/         — Shared attachment textures
│   ├── light/        — Flashlights, tactical lights
│   ├── magazine/     — All magazine definitions
│   ├── muzzle/       — Suppressors, bayonets, compensators
│   ├── optics/       — Scopes, red dots, iron sights
│   ├── support/      — Grips, bipods
│   └── underslung/   — Grenade launchers
├── data/             — Shared weapon textures and materials
├── explosives/       — Grenades, mines, claymores, plastic explosive
├── firearms/         — All rifles and submachine guns (38 types)
├── launchers/        — RPG-7, M79, M203, GP-25, LAW
├── melee/            — Blades, blunt weapons, powered melee
├── misc/             — Miscellaneous weapon items
├── nonlethal/        — Non-lethal weapons
├── pistols/          — Handguns (17 types)
├── projectiles/      — Bullet/bolt/arrow ballistics (CfgAmmo)
├── proxies/          — Weapon attachment proxy models
└── shotguns/         — Shotgun definitions
```

## Attachment Types

Attachments modify weapon handling, recoil, sound, and functionality. Each type occupies a specific inventory slot.

### Optics (`attachments/optics/`)

Optic attachments provide magnification and aim point. They inherit from `ItemOptics` and use the `"weaponOptics"` slot.

```cpp
class ItemOptics_Base: ItemOptics
{
    repairableWithKits[] = {7};              // Repair kit type
    repairCosts[] = {25};
    // All optics define these properties:
    simulation = "itemoptics";
    memoryPointCamera = "eyeScope";          // Camera position through scope
    cameraDir = "cameraDir";                 // Camera direction
    recoilModifier[] = {1,1,1};              // Recoil multiplier
    swayModifier[] = {1,1,1};               // Aim sway multiplier
};
```

| Optic | Slot Name | Notes |
|-------|-----------|-------|
| M4_CarryHandleOptic | weaponOptics | M4 iron sight carry handle |
| PSO11Optic | weaponOptics | PSO-1 4x scope (SVD, SKS) |
| PSO6Optic | weaponOptics | PSO-6 variant |
| HuntingOptic | weaponOptics | Hunting scope |
| KazuarOptic | weaponOptics | Kazuar scope |
| StarlightOptic | weaponOptics | Night vision scope |
| NVGoggles | weaponOptics | Night vision goggles |
| M68Optic | weaponOptics | Aimpoint red dot |
| M4_T3NRDSOptic | weaponOptics | M4 T3NR red dot |
| ACOGOptic | weaponOptics | ACOG 4x |
| ACOGOptic_6x | weaponOptics | ACOG 6x |
| MK4Optic | weaponOptics | MK4 scope (Tan, Green, Black variants) |
| SportingOptic | weaponOptics | Sporting scope |
| FNP45_MRDSOptic | weaponOptics | Mini red dot (FNX-45) |

Key optic properties:
- **Zoom levels**: Defined per optic, e.g., 4x, 6x, 8x
- **Zero range**: Default zeroing distance (typically 100-200m)
- **Reticle**: Crosshair type and color
- **Night vision**: Some optics support NV mode

### Muzzles (`attachments/muzzle/`)

Muzzle attachments affect sound signature, recoil, and can provide melee capability.

```cpp
class ItemSuppressor: Inventory_Base
{
    scope = 0;
    simulation = "ItemSuppressor";
    inventorySlot[] = { "weaponMuzzle" };
    selectionFireAnim = "zasleh";            // Muzzle flash position
    soundIndex = 1;                          // Suppressed sound variant
    muzzlePos = "usti hlavne";               // Muzzle bone name
    barrelArmor = 3000;                      // Heat resistance
    recoilModifier[] = {1,1,1};
    swayModifier[] = {1,1,1};
    isMeleeWeapon = 1;                       // Can be used for melee
};
```

| Attachment | Slot | Type | Special |
|------------|------|------|---------|
| AK_Bayonet | weaponBayonetAK / Knife | Blade | Dual-purpose (muzzle + knife) |
| M9A1_Bayonet | weaponM9A1Bayonet / Knife | Blade | M4 bayonet |
| AK_Suppressor | weaponMuzzle | Suppressor | Reduces sound signature |
| AK_Suppressor_Wood | weaponMuzzle | Suppressor | Woodland camo variant |
| M4_Suppressor | weaponMuzzle | Suppressor | M4-specific |
| PistolSuppressor | weaponMuzzle | Suppressor | Pistol caliber |
| Compensator_12ga | weaponMuzzle | Compensator | Shotgun recoil reduction |
| MP5_Compensator | weaponMuzzle | Compensator | MP5 muzzle brake |

Suppressor properties:
- **soundIndex**: Changes weapon sound to suppressed variant (index 1 = suppressed)
- **recoilModifier**: Typically reduces recoil slightly
- **dispersionModifier**: May affect accuracy

### Lights (`attachments/light/`)

Weapon-mounted lights provide illumination.

| Attachment | Slot | Features |
|------------|------|----------|
| UniversalLight | weaponLight | Standard weapon flashlight |
| TLRLight | weaponLight | Tactical light + laser (FNX-45) |

Light properties:
- **Light range**: Distance the light reaches (meters)
- **Battery consumption**: Power drain over time
- **Toggle mode**: Constant on, momentary, strobe

### Supports (`attachments/support/`)

Support attachments improve weapon stability.

| Attachment | Slot | Effect |
|------------|------|--------|
| WeaponGrip | weaponSupport | Reduces sway when aiming |
| AK_RailHndgrd | weaponSupport | Rail handguard (AK) |
| AK_FoldingBttstck | weaponSupport | Folding stock |
| M4_RISHndgrd | weaponSupport | Rail handguard (M4) |
| M4_CQBBttstck | weaponSupport | CQB stock |
| Saiga_Bttstck | weaponSupport | Saiga stock |

Properties:
- **swayModifier**: Reduces aim sway (e.g., `{0.8,0.9,1}`)
- **recoilModifier**: Reduces recoil

### Underslung (`attachments/underslung/`)

Underslung attachments mount beneath the weapon barrel.

| Attachment | Slot | Purpose |
|------------|------|---------|
| M203 | weaponUnderslung | 40mm grenade launcher (M4) |

## Magazines (`attachments/magazine/`)

Magazines are defined in `CfgMagazines`:

```cpp
class Magazine_Base: DefaultMagazine
{
    count = 30;                              // Default round count
    ammo = "";                               // Linked ammo type
    ammoItems[] = {};                        // Compatible ammo items
    weightPerQuantityUnit = 8;               // Weight per round
    handheld = "true";
    isMeleeWeapon = 1;                       // Can be used to bludgeon
};
```

### Rifle Magazines

| Magazine | Capacity | Compatible Weapons | Cartridge |
|----------|----------|--------------------|-----------|
| Mag_AK101_30Rnd | 30 | AK-101, AK-102 | 5.56×45mm |
| Mag_AKM_30Rnd | 30 | AKM, AKMS | 7.62×39mm |
| Mag_AKM_Drum_75Rnd | 75 | AKM, RPK | 7.62×39mm |
| Mag_AKM_Palm30 | 30 | AKM | 7.62×39mm |
| Mag_AK74_30Rnd | 30 | AK-74, AKS-74U | 5.45×39mm |
| Mag_AK74_45Rnd | 45 | AK-74, RPK-74 | 5.45×39mm |
| Mag_M4_CMAG_10 | 10 | M4A1 | 5.56×45mm |
| Mag_M4_CMAG_20 | 20 | M4A1 | 5.56×45mm |
| Mag_STANAG_30Rnd | 30 | M4A1, M16A2 | 5.56×45mm |
| Mag_STANAG_60Rnd | 60 | M4A1, M16A2 | 5.56×45mm |
| Mag_STANAG_Coupled | 60 | M4A1 | 5.56×45mm (coupled 30s) |
| Mag_M14_10Rnd | 10 | M14 | 7.62×51mm |
| Mag_M14_20Rnd | 20 | M14 | 7.62×51mm |
| Mag_FAL_20Rnd | 20 | FN FAL | 7.62×51mm |
| Mag_SVD_10Rnd | 10 | SVD | 7.62×54mmR |
| Mag_SV98_10Rnd | 10 | SV-98 | 7.62×54mmR |
| Mag_CZ550_10Rnd | 10 | CZ 550 | .308 Win |
| Mag_CZ550_4Rnd | 4 | CZ 550 | .308 Win |
| Mag_CZ527_5Rnd | 5 | CZ 527 | 7.62×39mm |
| Mag_VSS_10Rnd | 10 | VSS Vintorez | 9×39mm |
| Mag_VSS_20Rnd | 20 | VSS, AS Val | 9×39mm |

### SMG Magazines

| Magazine | Capacity | Compatible Weapons | Cartridge |
|----------|----------|--------------------|-----------|
| Mag_MP5_15Rnd | 15 | MP5K | 9×19mm |
| Mag_MP5_30Rnd | 30 | MP5 | 9×19mm |
| Mag_UMP_25Rnd | 25 | UMP-45 | .45 ACP |
| Mag_PP19_64Rnd | 64 | PP-19 Bizon | 9×18mm PM |
| Mag_PM73_15Rnd | 15 | PM-73 RAK | 9×19mm |
| Mag_PM73_25Rnd | 25 | PM-73 RAK | 9×19mm |
| Mag_UZI_10Rnd | 10 | Mini Uzi | 9×19mm |
| Mag_UZI_22Rnd | 22 | Mini Uzi | 9×19mm |
| Mag_Vikhr_30Rnd | 30 | Vikhr | 9×39mm |

### Pistol Magazines

| Magazine | Capacity | Compatible Weapons | Cartridge |
|----------|----------|--------------------|-----------|
| Mag_Glock_15Rnd | 15 | Glock 19 | 9×19mm |
| Mag_FNX45_15Rnd | 15 | FNX-45 | .45 ACP |
| Mag_1911_7Rnd | 7 | Colt 1911 | .45 ACP |
| Mag_CZ75_12Rnd | 12 | CZ-75 | 9×19mm |
| Mag_DE_9Rnd | 9 | Desert Eagle | .357 Mag |
| Mag_MKII_10Rnd | 10 | MK II | .22 LR |
| Mag_P1_8Rnd | 8 | P1 | 9×19mm |
| Mag_PB6P9_8Rnd | 8 | PB-6P9 (Makarov) | 9×18mm PM |
| Mag_Red9_20Rnd | 20 | Red 9 | 9×19mm |
| Mag_Longhorn_6Rnd | 6 | Longhorn | .357 Mag |
| Speedloader_357 | 6 | Magnum revolver | .357 Mag |
| Clip_762_5Rnd | 5 | Mosin | 7.62×54mmR |
| Clip_762x39_10Rnd | 10 | SKS | 7.62×39mm |
| Clip_9mm_10Rnd | 10 | Various pistols | 9×19mm |

### Shotgun Magazines / Loading

| Loading Method | Capacity | Compatible Weapons | Shell Type |
|---------------|----------|--------------------|------------|
| Internal tube | 4-6 | Izh-18, Izh-43, MP-133 | 12 gauge |
| Mag_Saiga_5Rnd | 5 | Saiga | 12 gauge |
| Mag_Saiga_8Rnd | 8 | Saiga | 12 gauge |
| Mag_Saiga_Drum | 20 | Saiga | 12 gauge |
| Snaploader | 2 | Double barrel | Various |
| Snaploader_762 | 2 | Mosin | 7.62×54mmR |

## Ammunition (`ammunition/`)

Ammunition boxes contain loose rounds for crafting and magazine loading:

```cpp
class Ammunition_Base: Magazine_Base
{
    ammo = "";                               // Links to CfgAmmo bullet type
    count = 0;                               // Quantity per box
    canBeSplit = 1;
    varQuantityDestroyOnMin = 1;             // Destroy when empty
    destroyOnEmpty = 1;
    soundUse = "craft_rounds";               // Crafting sound
};
```

| Ammo Box | Cartridge | Count | Ammo Type |
|----------|-----------|-------|-----------|
| Ammo_22LR | .22 LR | 50 | Bullet_22LR |
| Ammo_380Auto | .380 Auto | 35 | Bullet_380Auto |
| Ammo_45ACP | .45 ACP | 25 | Bullet_45ACP |
| Ammo_9mm | 9×19mm | 25 | Bullet_9mm |
| Ammo_545x39 | 5.45×39mm | 20 | Bullet_545x39 |
| Ammo_556x45 | 5.56×45mm | 20 | Bullet_556x45 |
| Ammo_762x39 | 7.62×39mm | 20 | Bullet_762x39 |
| Ammo_762x54 | 7.62×54mmR | 20 | Bullet_762x54 |
| Ammo_308Win | .308 Winchester | 20 | Bullet_308Win |
| Ammo_357 | .357 Magnum | 20 | Bullet_357 |
| Ammo_9x39 | 9×39mm | 20 | Bullet_9x39 |
| Ammo_12ga_Buck | 12ga 00 Buckshot | 10 | Bullet_12GaugePellets |
| Ammo_12ga_Slug | 12ga Rifled Slug | 10 | Bullet_12GaugeSlug |
| Ammo_12ga_RubberSlug | 12ga Rubber | 10 | Bullet_12GaugeRubberSlug |
| Ammo_12ga_Beanbag | 12ga Beanbag | 5 | Bullet_12GaugeBeanbag |
| Flare_White/Red/Green/Blue | Flare | 1 | Flare projectile |

## Projectile Ballistics (`projectiles/`)

The `CfgAmmo` class tree defines every projectile's physical properties:

```
CfgAmmo
├── DefaultAmmo
├── BulletCore → Bullet_Base
│   ├── Bullet_22LR
│   ├── Bullet_380Auto
│   ├── Bullet_45ACP
│   ├── Bullet_9mm
│   ├── Bullet_357
│   ├── Bullet_545x39 (+ Tracer)
│   ├── Bullet_556x45 (+ Tracer)
│   ├── Bullet_762x39 (+ Tracer)
│   ├── Bullet_762x54 (+ Tracer)
│   ├── Bullet_308Win (+ Tracer)
│   ├── Bullet_762x51
│   ├── Bullet_9x39
│   └── Bullet_12GaugeSlug
├── ShotgunCore → Shotgun_Base
│   └── Bullet_12GaugePellets
├── Bolt_Base → Hunting/Crossbow bolts
├── Arrow_Base → Bows
├── GrenadeCore → Frag/Flash/Smoke/ChemGas
├── RocketCore → RPG-7 rockets
├── Flare_Base → Flare rounds
├── MeleeDamage → Melee weapon damage
└── ExplosionCore → Explosive devices
```

### Bullet Ballistics Comparison

| Ammo | Hit (Damage) | Init Speed (m/s) | Typical Speed | Air Friction | Caliber | Weapon Class |
|------|-------------|-------------------|---------------|--------------|---------|--------------|
| .22 LR | 4 | — | — | — | 0.3 | MK II |
| .380 Auto | 5 | 300 | 320 | -0.003 | 0.7 | — |
| 9×19mm | 6 | 380 | 400 | -0.002 | 0.8 | Glock, MP5, PM-73 |
| .45 ACP | 7 | 260 | 290 | -0.001 | 0.8 | 1911, FNX-45, UMP |
| .357 Mag | 9 | 440 | 520 | -0.0025 | 1.0 | Magnum, Longhorn, Repeater |
| 5.45×39mm | 7.2 | 880 | 880 | -0.00125 | 0.9 | AK-74, AKS-74U |
| 5.56×45mm | 8 | 850 | 1000 | -0.00125 | 1.0 | M4A1, M16A2, AUG |
| 7.62×39mm | 9.5 | 640 | 740 | -0.0015 | 1.0 | AKM, SKS, CZ 527 |
| 7.62×54mmR | 12 | 785 | 865 | -0.001 | 1.0 | Mosin, SVD |
| .308 Win | 12 | 770 | 940 | -0.001 | 1.0 | CZ 550, M14, Scout |
| 9×39mm | 10 | 290 | 290 | — | 0.9 | VSS, AS Val, Vikhr |
| 12ga Slug | 11 | 380 | 420 | -0.005 | 1.0 | Shotguns |
| 12ga Buckshot | 8×pellets | 340 | 420 | -0.00575 | 0.5/pellet | Shotguns |
| 12ga Rubber Slug | 2 | 60 | 80 | -0.02 | 0.1 | Less-lethal |
| 12ga Beanbag | 1 | 240 | 240 | -0.006 | 0.1 | Less-lethal |

Key ballistics properties:
- **hit**: Base damage value applied on impact
- **initSpeed**: Muzzle velocity (m/s)
- **typicalSpeed**: Reference velocity for ballistic calculations
- **airFriction**: Drag coefficient (more negative = more drag)
- **caliber**: Ballistic coefficient (affects penetration and deflection)
- **indirectHit**: Splash/area damage (0 for most bullets)
- **indirectHitRange**: Area damage radius

### Ballistic Behavior

- **High velocity rounds** (5.56mm, .308): Flatter trajectory, better penetration, lower drag
- **Slow, heavy rounds** (.45 ACP): Higher stopping power at close range, more drag
- **Subsonic rounds** (9×39mm): Designed for suppressed use, no supersonic crack
- **Shotgun pellets**: Multiple projectiles with individual damage and spread

## Firearm Categories

### Rifles (Assault & Battle)

| Weapon | Cartridge | Mag Capacity | Fire Mode | Recoil Profile |
|--------|-----------|-------------|-----------|----------------|
| AKM | 7.62×39mm | 30/75 | Auto/Semi | akmrecoil |
| AK-101 | 5.56×45mm | 30 | Auto/Semi | ak101recoil |
| AK-74 | 5.45×39mm | 30/45 | Auto/Semi | ak74recoil |
| AKS-74U | 5.45×39mm | 30 | Auto/Semi | aks74urecoil |
| M4A1 | 5.56×45mm | 10-60 | Auto/Semi | m4a1recoil |
| M16A2 | 5.56×45mm | 30 | Burst/Semi | m16a2recoil |
| AUG | 5.56×45mm | 30 | Auto/Semi | augrecoil |
| FAL | 7.62×51mm | 20 | Auto/Semi | falrecoil |
| FAMAS | 5.56×45mm | 25 | Burst/Auto | famasrecoil |
| G36 | 5.56×45mm | 30 | Auto/Semi | — |

### Designated Marksman / Sniper Rifles

| Weapon | Cartridge | Mag Capacity | Recoil Profile |
|--------|-----------|-------------|----------------|
| SVD | 7.62×54mmR | 10 | svdrecoil |
| SV-98 | 7.62×54mmR | 10 | sv98recoil |
| CZ 550 | .308 Win | 4/10 | cz550recoil |
| B-95 | .308 Win | 5 | b95recoil |
| M14 | 7.62×51mm | 10/20 | m14recoil |
| Mosin-Nagant | 7.62×54mmR | 5 (clip) | mosinrecoil |
| VSS Vintorez | 9×39mm | 10/20 | vssrecoil |
| SKS | 7.62×39mm | 10 (clip) | sksrecoil |
| SSG 82 | 5.45×39mm | 5 | ssg82recoil |
| Scout | .308 Win | 10 | scoutrecoil |
| Winchester 70 | .308 Win | 5 | winchester70recoil |

### Submachine Guns

| Weapon | Cartridge | Mag Capacity | Recoil Profile |
|--------|-----------|-------------|----------------|
| MP5K | 9×19mm | 15/30 | mp5krecoil |
| UMP-45 | .45 ACP | 25 | ump45recoil |
| PP-19 Bizon | 9×18mm PM | 64 | pp19recoil |
| PM-73 RAK | 9×19mm | 15/25 | pm73rak |
| Mini Uzi | 9×19mm | 10/22 | — |
| Vikhr | 9×39mm | 30 | — |
| OTs-14 Groza | 9×39mm | 20 | — |

### Pistols

| Weapon | Cartridge | Capacity | Recoil Profile |
|--------|-----------|---------|----------------|
| Glock 19 | 9×19mm | 15 | glockrecoil |
| Colt 1911 | .45 ACP | 7 | colt1911recoil |
| FNX-45 | .45 ACP | 15 | fnx45recoil |
| CZ-75 | 9×19mm | 12 | cz75recoil |
| Desert Eagle | .357 Mag | 9 | deaglerecoil |
| Makarov PM | 9×18mm PM | 8 | makarovrecoil |
| PB-6P9 | 9×18mm PM | 8 | — |
| P1 | 9×19mm | 8 | p1recoil |
| MK II | .22 LR | 10 | mkiirecoil |
| Red 9 | 9×19mm | 20 | — |
| Magnum | .357 Mag | 6 | magnumrecoil |
| Longhorn | .357 Mag | 6 | longhornrecoil |
| Derringer | .357 Mag | 2 | derringerrecoil |
| Flare gun | Flare | 1 | — |

### Shotguns

| Weapon | Gauge | Capacity | Recoil Profile |
|--------|-------|----------|----------------|
| Izh-18 | 12ga | 1 (single) | izh18recoil |
| Izh-43 | 12ga | 2 (side-by-side) | izh43recoil |
| MP-133 | 12ga | 4 (tube) | mp133recoil |
| Saiga | 12ga | 5/8/20 | siagarecoil |

Ammunition: 12ga Buckshot, 12ga Slug, 12ga Rubber Slug, 12ga Beanbag

### Melee Weapons

From `DZ/weapons/melee/`:

| Category | Examples | Damage Type |
|----------|----------|-------------|
| Blades | Combat Knife, Hunting Knife, Steak Knife, Bayonet, Machete, Cleaver | Slash/Stab |
| Blunt | Baseball Bat, Lead Pipe, Crowbar, Sledgehammer, Brass Knuckles | Blunt force |
| Powered | Chainsaw, Circular Saw | High damage, fuel consumption |

### Archery

From `DZ/weapons/archery/`:

| Weapon | Draw Weight | Ammo |
|--------|------------|------|
| Recurve Bow | Medium | Arrows |
| Improvised Bow (PVC) | Low | Arrows |
| Quickie Bow | Very Low | Arrows |
| Crossbow | High | Bolts |

Ammunition types: `Ammo_Arrow_Composite`, `Ammo_Arrow_Crude`, `Ammo_Bolt_BigGame`, `Ammo_Bolt_SmallGame`

### Explosives

From `DZ/weapons/explosives/`:

| Device | Type | Damage | Radius |
|--------|------|--------|--------|
| RGD-5 Grenade | Fragmentation | High | Medium |
| M67 Grenade | Fragmentation | High | Medium |
| Flashbang | Blinding | None (stun) | Wide |
| Smoke Grenade (White) | Screening | None | — |
| Smoke Grenade (RDG-2) | Screening | None | — |
| M18 Smoke (Red/Green) | Screening | None | — |
| Chemical Gas Grenade | Chemical | Damage over time | Area |
| Claymore Mine | Directional frag | Very high | Directed |
| Land Mine | Blast | High | Medium |
| Improvised Explosive | Blast | Medium | Medium |
| Plastic Explosive | Demolition | Very high | Wide |

### Launchers

From `DZ/weapons/launchers/`:

| Launcher | Ammo | Purpose |
|----------|------|---------|
| RPG-7 | PG-7V rocket | Anti-vehicle |
| M79 | 40mm grenades | Standalone launcher |
| M203 | 40mm grenades | Underslung (M4) |
| GP-25 | VOG-25 grenades | Underslung (AK) |
| LAW | M72 rocket | Disposable anti-vehicle |

## Recoil Profiles

Each weapon has a unique recoil pattern that defines horizontal and vertical kick over successive shots. From `P:/scripts/4_world/classes/recoilbase/recoils/` (48 profiles):

| Pattern | Weapons | Character |
|---------|---------|-----------|
| Default | Fallback | Generic rise |
| ak101recoil | AK-101 | Moderate vertical |
| ak74recoil | AK-74 | Light, controllable |
| akmrecoil | AKM | Strong |
| aks74urecoil | AKS-74U | Quick, snappy |
| augrecoil | AUG | Smooth |
| m4a1recoil | M4A1 | Moderate, right bias |
| m14recoil | M14 | Heavy |
| mosinrecoil | Mosin | High vertical |
| svdrecoil | SVD | Moderate DMR |
| glockrecoil | Glock 19 | Light pistol |
| magnumrecoil | Magnum | Heavy revolver |

Recoil profiles define:
- **Vertical rise**: How much the gun climbs per shot
- **Horizontal drift**: Random left/right deviation
- **Recovery**: Speed of return to aim point
- **Incremental climb**: Increasing spread on sustained fire

## Attachment Compatibility

Not all weapons accept all attachments. Each weapon's `attachments[]` array lists compatible slots:

```cpp
class AKM: Rifle_Base
{
    attachments[] = {
        "WeaponSuppressor",      // AK Suppressor
        "WeaponOptics",          // Scopes (PSO-1, etc.)
        "WeaponWrap"             // Ghillie wrap
    };
};

class M4A1: Rifle_Base
{
    attachments[] = {
        "WeaponSuppressor",      // M4 Suppressor
        "WeaponOptics",          // Optics (ACOG, M68, etc.)
        "WeaponLight",           // UniversalLight
        "WeaponSupport"          // Grips, bipods
    };
};
```

## Related Documentation

- [Animation System](/game-systems/animation-system) — Weapon animations and recoil
- [Damage & Combat](/game-systems/damage-combat) — Damage calculation and hit detection
- [Sound System](/game-systems/sound-system) — Weapon sound shaders
- [Config System Guide](./config-cpp-guide) — Config file format reference
