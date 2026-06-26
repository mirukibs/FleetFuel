import {ValidationError} from '../errors.mjs';

export class FuelSensorReading {
  constructor({id, vehicleId, fuelLevel, timestamp}) {
    const parsedLevel = Number(fuelLevel);
    if (!id || !vehicleId) {
      throw new ValidationError('Fuel sensor reading id and vehicle id are required.');
    }
    if (!Number.isFinite(parsedLevel) || parsedLevel < 0 || parsedLevel > 100) {
      throw new ValidationError('Fuel level must be a number between 0 and 100.');
    }
    this.id = id;
    this.vehicleId = vehicleId;
    this.timestamp = timestamp ?? new Date().toISOString();
    this.fuelLevel = parsedLevel;
  }

  getId() {
    return this.id;
  }

  getVehicleId() {
    return this.vehicleId;
  }

  getTimestamp() {
    return this.timestamp;
  }

  getFuelLevel() {
    return this.fuelLevel;
  }

  toJSON() {
    return {
      entityType: 'FuelSensorReading',
      id: this.id,
      vehicleId: this.vehicleId,
      timestamp: this.timestamp,
      fuelLevel: this.fuelLevel
    };
  }
}
