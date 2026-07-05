import { randomUUID } from "crypto";
import { ValidationError } from "../errors.mjs";

export class FuelTransaction {
  constructor({ id, vehicleId, fuelType, quantityLitres, timestamp = new Date().toISOString() }) {
    if (!vehicleId) throw new ValidationError("Vehicle ID is required");
    if (!fuelType) throw new ValidationError("Fuel type is required");
    if (quantityLitres <= 0) throw new ValidationError("Quantity in litres must be greater than zero");

    this.id = id || randomUUID();
    this.vehicleId = vehicleId;
    this.fuelType = fuelType;
    this.quantityLitres = quantityLitres;
    this.timestamp = timestamp;
  }

  static create(vehicleId, fuelType, quantityLitres, timestamp) {
    return new FuelTransaction({
      vehicleId,
      fuelType,
      quantityLitres,
      timestamp: timestamp || new Date().toISOString()
    });
  }

  getVehicleId() {
    return this.vehicleId;
  }

  getFuelType() {
    return this.fuelType;
  }

  getQuantityLitres() {
    return this.quantityLitres;
  }

  getTimestamp() {
    return this.timestamp;
  }

  toJSON() {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      fuelType: this.fuelType,
      quantityLitres: this.quantityLitres,
      timestamp: this.timestamp
    };
  }
}
