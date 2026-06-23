# Vehicle Data

The `DZ/vehicles/` directory defines all vehicle types, parts, and configuration data.

## Categories

| Category | Directory | Contents |
|----------|-----------|----------|
| Data | `vehicles/data/` | Shared vehicle configuration |
| Parts | `vehicles/parts/` | Vehicle components (engine, tires, etc.) |
| Water | `vehicles/water/` | Boat definitions |
| Wheeled | `vehicles/wheeled/` | Car/truck definitions |

## Vehicle Config Structure

### Car Config

```cpp
class Car_Base: Transport {
    // Physics
    maxSpeed = 160;                     // Maximum speed (km/h)
    fuelCapacity = 50;                  // Fuel tank capacity (liters)
    fuelConsumption = 0.5;              // Fuel per km
    enginePower = 100;                  // Engine power (HP)
    torque = 200;                       // Engine torque (Nm)
    
    // Dimensions
    wheelCount = 4;                     // Number of wheels
    seatCount = 5;                      // Number of seats
    cargoVolume = 100;                  // Cargo volume
    
    // Components
    parts[] = {                         // Repairable components
        "CarEngine",
        "CarBattery",
        "CarRadiator",
        "CarWheel",
        "CarDoor_Base",
        "CarGlass",
        "CarLight"
    };
    
    // Visual
    hiddenSelections[] = { "body" };
    hiddenSelectionsTextures[] = {
        "#(argb,8,8,3)color(0.5,0.5,0.5,1.0)"  // Paint color
    };
};

// Specific vehicle
class CivilianSedan: Car_Base {
    scope = 2;
    displayName = "Civilian Sedan";
    model = "\dz\vehicles\wheeled\sedan.p3d";
    weight = 1200;
    maxSpeed = 160;
    fuelConsumption = 0.4;
    seatCount = 5;
    wheelCount = 4;
};
```

### Boat Config

```cpp
class Boat_Base: Transport {
    // Water physics
    maxSpeed = 60;                      // Water speed (km/h)
    fuelCapacity = 30;
    fuelConsumption = 0.8;
    enginePower = 50;
    
    // Water-specific
    draft = 0.5;                        // Water depth requirement (m)
    hullStability = 0.8;               // Anti-capsize stability
    motorType = "outboard";             // Engine type
    
    // Capacity
    seatCount = 3;
    cargoVolume = 50;
    
    // Components
    parts[] = {
        "BoatEngine",
        "BoatFuelTank"
    };
};
```

### Helicopter Config

```cpp
class Helicopter_Base: Transport {
    // Flight physics
    maxSpeed = 250;                     // Air speed (km/h)
    maxAltitude = 5000;                 // Max altitude (m)
    fuelCapacity = 200;
    fuelConsumption = 2.0;              // High fuel use
    enginePower = 300;
    
    // Rotor systems
    mainRotorRadius = 5.0;              // Rotor disc radius
    tailRotorRadius = 1.0;
    mainRotorRPM = 300;
    
    // Flight characteristics
    hoverStability = 0.7;
    maxClimbRate = 10;                  // m/s
    maxDescentRate = 5;                 // m/s
    
    // Capacity
    seatCount = 4;
    cargoVolume = 200;
    
    // Components
    parts[] = {
        "HelicopterEngine",
        "HelicopterRotor",
        "HelicopterTailRotor"
    };
};
```

## Vehicle Parts Config

Replaceable vehicle components:

```cpp
class CarWheel: Inventory_Base {
    scope = 2;
    displayName = "Car Wheel";
    model = "\dz\vehicles\parts\wheel.p3d";
    weight = 15000;                     // 15kg
    itemSize[] = {3,3};
    
    // Wheel-specific
    wheelType = "sedan";               // Compatible vehicle types
    traction = 1.0;                     // Grip multiplier
    durability = 100;                   // Health
    isPunctured = 0;                    // Flat tire state
};

class CarEngine: Inventory_Base {
    scope = 2;
    displayName = "Car Engine";
    model = "\dz\vehicles\parts\engine.p3d";
    weight = 50000;                     // 50kg
    itemSize[] = {4,4};
    
    // Engine-specific
    engineType = "sedan";              // Compatible vehicles
    enginePower = 100;                  // HP contribution
    condition = 100;                    // Health percentage
};
```

## How Scripts Use Vehicle Config

```c
// Vehicles read config for physics parameters
class Car : Transport {
    float GetMaxSpeed() {
        return ConfigGetFloat("maxSpeed");
    }
    
    float GetFuelCapacity() {
        return ConfigGetFloat("fuelCapacity");
    }
    
    // Get compatible parts list
    array<string> GetCompatibleParts() {
        return ConfigGetStringArray("parts");
    }
};
```
