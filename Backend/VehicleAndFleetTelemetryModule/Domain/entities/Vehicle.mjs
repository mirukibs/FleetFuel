import {ValidationError} from '../errors.mjs';
import {FuelSensor} from './FuelSensor.mjs';
import {FuelSensorReading} from './FuelSensorReading.mjs';

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
    this.sensor = new FuelSensor({
      id: sensorId,
      serialNo,
    });
    this.updatedAt = new Date().toISOString();
  }

  recordSimulatedReading({id, fuelLevel, timestamp}) {
    const reading = new FuelSensorReading({
      id,
      vehicleId: this.id,
      timestamp,
      fuelLevel
    });
    const previous = this.getLatestReading();
    this.readings.push(reading);
    this.updatedAt = new Date().toISOString();
    return {
      ...reading.toJSON(),
      alertTriggered: previous ? previous.getFuelLevel() - reading.getFuelLevel() >= 15 : false
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
      sensor: this.sensor ? this.sensor.toJSON() : null,
      readings: this.readings.map((reading) => reading.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
