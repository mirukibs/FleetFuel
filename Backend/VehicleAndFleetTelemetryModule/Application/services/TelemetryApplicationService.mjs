import {nextId} from '../../Infrastructure/database/inMemoryDatabase.mjs';

export class TelemetryApplicationService {
  constructor({vehicleRepo, fleetRepo}) {
    this.vehicleRepo = vehicleRepo;
    this.fleetRepo = fleetRepo;
  }

  generateSimulatedFuelReading(input) {
    const vehicle = this.vehicleRepo.findById(input.vehicleId);
    const reading = vehicle.recordSimulatedReading({
      id: input.id ?? nextId('reading'),
      fuelLevel: input.fuelLevel,
      timestamp: input.timestamp
    });
    this.vehicleRepo.save(vehicle);
    return reading;
  }

  viewFleetFuelEfficiencyDashboard(fleetId) {
    const fleet = this.fleetRepo.findById(fleetId);
    const vehicles = this.vehicleRepo.findByFleetId(fleetId).map((vehicle) => {
      const latestReading = vehicle.getLatestReading();
      return {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        currentFuelLevel: latestReading?.getFuelLevel() ?? null,
        lastUpdated: latestReading?.getTimestamp() ?? null,
        sensor: vehicle.sensor ? vehicle.sensor.toJSON() : null,
        alertTriggered: false
      };
    });

    return {
      fleetId: fleet.id,
      fleetName: fleet.name,
      vehicles
    };
  }

  listVehicleTelemetryReadings(vehicleId) {
    const vehicle = this.vehicleRepo.findById(vehicleId);
    return vehicle.readings.map((reading) => reading.toJSON());
  }

  listTelemetryReadings({vehicleId} = {}) {
    if (vehicleId) {
      return this.listVehicleTelemetryReadings(vehicleId);
    }
    return this.vehicleRepo
      .findAll()
      .flatMap((vehicle) => vehicle.readings);
  }
}
