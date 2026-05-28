import {Vehicle} from '../../Domain/entities/Vehicle.mjs';
import {normalizeVehicleType} from '../../Domain/enums/VehicleType.mjs';
import {VehicleSpecification} from '../../Domain/value-objects/VehicleSpecification.mjs';
import {nextId} from '../../Infrastructure/database/inMemoryDatabase.mjs';

export class VehicleApplicationService {
  constructor({vehicleRepo, fleetRepo}) {
    this.vehicleRepo = vehicleRepo;
    this.fleetRepo = fleetRepo;
  }

  registerVehicle(input) {
    if (input.fleetId) {
      this.fleetRepo.findById(input.fleetId);
    }
    const vehicle = new Vehicle({
      id: input.id ?? nextId('vehicle'),
      fleetId: input.fleetId ?? null,
      specification: new VehicleSpecification(input.make, input.model, input.year),
      type: normalizeVehicleType(input.type),
      licensePlate: input.licensePlate
    });
    return this.vehicleRepo.save(vehicle).toJSON();
  }

  updateVehicleDetails(id, input) {
    const vehicle = this.vehicleRepo.findById(id);
    vehicle.updateDetails({
      specification: new VehicleSpecification(input.make, input.model, input.year),
      type: normalizeVehicleType(input.type),
      licensePlate: input.licensePlate
    });
    return this.vehicleRepo.save(vehicle).toJSON();
  }

  assignVehicleToFleet(vehicleId, fleetId) {
    this.fleetRepo.findById(fleetId);
    const vehicle = this.vehicleRepo.findById(vehicleId);
    vehicle.assignToFleet(fleetId);
    return this.vehicleRepo.save(vehicle).toJSON();
  }

  removeVehicleFromFleet(vehicleId) {
    const vehicle = this.vehicleRepo.findById(vehicleId);
    vehicle.removeFromFleet();
    return this.vehicleRepo.save(vehicle).toJSON();
  }

  assignFuelSensor(vehicleId, sensorId, serialNo) {
    const vehicle = this.vehicleRepo.findById(vehicleId);
    vehicle.assignFuelSensor(sensorId, serialNo);
    return this.vehicleRepo.save(vehicle).toJSON();
  }
}
