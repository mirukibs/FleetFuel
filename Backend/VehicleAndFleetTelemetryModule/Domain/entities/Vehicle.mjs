import {ValidationError} from '../errors.mjs';

export class Vehicle {
  constructor({
    id,
    fleetId = null,
    specification,
    type,
    licensePlate,
    sensor = null,
    readings = [],
    createdAt = new Date().toISOString(),
    updatedAt = createdAt
  }) {
    if (!licensePlate || !`${licensePlate}`.trim()) {
      throw new ValidationError('Vehicle license plate is required.');
    }
    this.id = id;
    this.fleetId = fleetId;
    this.specification = specification;
    this.type = type;
    this.licensePlate = `${licensePlate}`.trim();
    this.sensor = sensor;
    this.readings = readings;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateDetails({specification, type, licensePlate}) {
    if (!licensePlate || !`${licensePlate}`.trim()) {
      throw new ValidationError('Vehicle license plate is required.');
    }
    this.specification = specification;
    this.type = type;
    this.licensePlate = `${licensePlate}`.trim();
    this.updatedAt = new Date().toISOString();
  }

  assignToFleet(fleetId) {
    this.fleetId = fleetId;
    this.updatedAt = new Date().toISOString();
  }

  removeFromFleet() {
    this.fleetId = null;
    this.updatedAt = new Date().toISOString();
  }

  assignFuelSensor(sensorId, serialNo) {
    if (!sensorId || !serialNo) {
      throw new ValidationError('Sensor id and serial number are required.');
    }
    this.sensor = {
      id: sensorId,
      serialNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.updatedAt = new Date().toISOString();
  }

  recordSimulatedReading({id, fuelLevel, timestamp}) {
    const parsedLevel = Number(fuelLevel);
    if (!Number.isFinite(parsedLevel) || parsedLevel < 0 || parsedLevel > 100) {
      throw new ValidationError('Fuel level must be a number between 0 and 100.');
    }
    const reading = {
      id,
      vehicleId: this.id,
      timestamp: timestamp ?? new Date().toISOString(),
      fuelLevel: parsedLevel
    };
    const previous = this.getLatestReading();
    this.readings.push(reading);
    this.updatedAt = new Date().toISOString();
    return {
      ...reading,
      alertTriggered: previous ? previous.fuelLevel - parsedLevel >= 15 : false
    };
  }

  getLatestReading() {
    return this.readings.length > 0 ? this.readings[this.readings.length - 1] : null;
  }

  toJSON() {
    return {
      id: this.id,
      fleetId: this.fleetId,
      ...this.specification.toJSON(),
      type: this.type,
      licensePlate: this.licensePlate,
      sensor: this.sensor,
      readings: this.readings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
