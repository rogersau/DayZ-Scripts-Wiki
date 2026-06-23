# Vehicle System

The vehicle system manages all drivable and ridable vehicles in DayZ, including cars, boats, and helicopters. Vehicles extend the `Pawn` class through the `Transport` base.

## Architecture

```
Transport (3_game/vehicles/transport.c)
│   Base vehicle class (extends Pawn)
│
├── Car (3_game/vehicles/car.c)
│   └── Wheeled ground vehicles
│
├── Boat (3_game/vehicles/boat.c)
│   └── Water vehicles
│
└── Helicopter (3_game/vehicles/helicopter.c)
    └── Rotary-wing aircraft

Simulation:
├── Physics (engine-level via enphysics.c)
├── Damage zones (from EntityAI)
└── Inventory (buildinginventory.c, transportinventory.c)
```

## Transport Base

The base vehicle class extends `Pawn` and provides shared functionality:

```c
class Transport : Pawn {
    // Vehicle state
    float m_Health;
    float m_Fuel;
    float m_Speed;
    float m_RPM;
    
    // Component states
    bool m_EngineOn;
    bool m_LightsOn;
    bool m_IsLocked;
    
    // Seats
    int m_SeatCount;
    bool m_IsSeatOccupied[int];
    
    // Wheels/tracks
    int m_WheelCount;
    float m_WheelHealth[int];
    
    // Methods
    void EngineOn();
    void EngineOff();
    void LockDoors();
    void UnlockDoors();
    float GetSpeed();
    int GetOccupiedSeatCount();
};
```

## Car (`car.c`)

Wheeled vehicle simulation:

- **Engine**: RPM, torque, gear ratios
- **Transmission**: Automatic gear shifting
- **Suspension**: Per-wheel suspension simulation
- **Tires**: Individual tire health, traction, pressure
- **Brakes**: Braking force, handbrake
- **Steering**: Rack-and-pinion steering model
- **Fuel**: Fuel consumption based on RPM/load

### Car Components

Cars are composed of replaceable parts, each with its own health:
- Engine
- Tires (individual)
- Doors (individual)
- Windows (individual)
- Headlights/Taillights
- Fuel tank
- Spark plugs
- Battery
- Radiator
- Glow plug

### Car Physics

```c
class Car : Transport {
    // Physics parameters (from config)
    float m_MaxSpeed;
    float m_Acceleration;
    float m_BrakingForce;
    float m_SteeringAngle;
    float m_SuspensionTravel;
    float m_TireFriction;
    
    // Simulation
    void UpdateWheelPhysics(float delta);
    void UpdateEngine(float delta);
    void UpdateTransmission(float delta);
};
```

## Boat (`boat.c`)

Water vehicle simulation:

- **Buoyancy**: Water displacement physics
- **Propulsion**: Outboard motor simulation
- **Steering**: Rudder-based steering
- **Stability**: Hull stability in waves
- **Fuel**: Fuel consumption

```c
class Boat : Transport {
    // Water physics
    float m_BuoyancyForce;
    float m_Draft;
    float m_HullStability;
    float m_MotorPower;
    
    // Navigation
    float m_RudderAngle;
    float m_WaterResistance;
};
```

## Helicopter (`helicopter.c`)

Rotary-wing aircraft simulation:

- **Rotor**: Main rotor RPM, collective pitch
- **Tail rotor**: Anti-torque control
- **Flight model**: Cyclic, collective, pedal controls
- **Stability**: Auto-hover capability
- **Fuel**: High fuel consumption
- **Damage**: Tail rotor, main rotor, engine

```c
class Helicopter : Transport {
    // Rotor systems
    float m_MainRotorRPM;
    float m_TailRotorRPM;
    float m_CollectivePitch;
    float m_CyclicPitch;
    float m_AntiTorquePedal;
    
    // Flight state
    float m_Altitude;
    bool m_IsAutoHover;
    bool m_EngineFlameOut;
    
    // Simulation
    void UpdateRotorPhysics(float delta);
    void UpdateFlightDynamics(float delta);
};
```

## Vehicle Inventory

Vehicles have inventory storage:
- **Cargo**: Trunk/storage space
- **Seats**: Passenger inventory access
- **Attachment slots**: Spare tire, roof rack

## Vehicle Config Data

Vehicle properties are defined in `DZ/vehicles/`:

```
DZ/vehicles/
├── data/          # Shared vehicle data
├── parts/         # Vehicle parts (engine, tires, etc.)
├── water/         # Boat definitions
└── wheeled/       # Car definitions
```

Example config:

```cpp
// DZ/vehicles/wheeled/config.cpp
class CfgVehicles {
    class CivilianSedan: Car {
        maxSpeed = 160;
        fuelCapacity = 50;
        seatCount = 5;
        wheelCount = 4;
        parts[] = { "Engine", "Tire", "Battery", "SparkPlug" };
    };
};
```

## Damage & Repair

Components can be individually damaged and repaired:

- **Engine damage**: Reduces power, can fail completely
- **Flat tire**: Reduces speed/handling
- **Broken window**: Reduces weather protection
- **Dead battery**: Prevents starting
- **Overheating**: Radiator damage causes engine failure

Repair requires appropriate tools and parts:
- Tire repair kit → flat tires
- Engine tools → engine damage
- Duct tape → minor body damage

## Integration with Other Systems

- **Player system**: Player enters/exits, controls vehicle
- **Inventory system**: Vehicle storage, part replacement
- **Damage system**: Vehicle/component damage from collisions
- **Sound system**: Engine sounds, tire screech, crash sounds
- **Effect system**: Smoke from damaged engine, exhaust particles
- **Animation system**: Steering wheel, pedal, gear shift animations
- **Network**: Vehicle position/state synchronization
