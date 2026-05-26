import {NotFoundError} from '../../Domain/errors.mjs';
import {inMemoryDatabase} from '../database/inMemoryDatabase.mjs';

export class InMemoryVehicleRepository {
  save(vehicle) {
    inMemoryDatabase.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  findById(id) {
    const vehicle = inMemoryDatabase.vehicles.get(id);
    if (!vehicle) {
      throw new NotFoundError(`Vehicle ${id} was not found.`);
    }
    return vehicle;
  }

  findByFleetId(fleetId) {
    return [...inMemoryDatabase.vehicles.values()].filter((vehicle) => vehicle.fleetId === fleetId);
  }
}
