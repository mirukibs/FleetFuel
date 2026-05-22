## The Domain Layer
The **vehicle and fuel telemetry module** is designed following the layered architecture with the core business logic residing in the **domain layer.** This layer is made up of:
- Entities
- Value objects and Enums
- Repositories

**Entities**
These are the core, mutable components of the system contained in the domain layer, governing the module's business logic. The entities in this module are:
1. Vehicle
	   - This is a core entity, acting as the main aggregate that models the vehicle and its fuel consumption.
2. Fleet
	   - This entity, also a separate aggregate, is designed for simplicity to model the collection of vehicles called a fleet.
3. Fleet Manager
	   - This entity, also an aggregate, models the main user of the system.
4. Fuel Sensor
	   - A minor entity, it's nested within the vehicle aggregate although being an important component of the module. It models the fuel sensor device to be simulated.
5. Fuel Sensor Reading
	   - Also a minor entity nested within the vehicle aggregate. It models the data sent by a fuel sensor attached to a vehicle, sending out telemetry data for fuel level at particular timestamps.

![Entities](Docs/Entities.png "Entities")

**Value Objects**
These are immutable objects in the domain that do not have their own lifecycle, instead they act as attributes with both value and behavior. They are owned by entities with an aggregate relationship and serve as a way to reduce an entity's responsibilities by delegating complexity. These value objects are:
1. Vehicle Specification
	   - Describes a vehicle's make, model and year.
2. Name
	   - Describes a person's name, breaking it into first and last name while also allowing the formation of the full name

![Value Objects](Docs/ValueObjects.png "Value Objects")


We also have the enumeration **VehicleType** which defines different vehicle types as a collection of constants. These types are:
1. Sedan: defining small passenger vehicles
2. SUV: defining larger passenger vehicles
3. Truck: defining trucks and lorries with a rear cabin
4. Motorcycle: defining 2 to 3-wheeled vehicles

**Repositories**
These classes hold methods acting as intermediaries between the domain and infrastructure specific data queries - therefore act as interfaces allowing for data storage layers to access domain layer aggregates. 3 common methods in these repositories: save(), findById() and delete(), allow writing, retrieval and deletion of domain aggregates respectively.

In this module, the repositories are:
1. Vehicle Repository
	   - This allows access to the vehicle aggregate - writing, retrieving and deleting.
2. Fleet Repository
	   - This allows access to the fleet aggregate - writing, retrieving and deleting.
3. Fleet Manager Repository
	   - This allows access to the fleet manager aggregate - writing, retrieving and deleting.

They ensure the domain layer with its core business logic remain uncontaminated by infrastructure specific implementation of data storage, enforcing modularity.

![Repositories](Docs/Repositories.png "Repositories")

