import { FuelType } from "../../../SharedKernel/enums/FuelType.mjs";
import { ValidationError } from "../errors.mjs";

export class FuelOffer {
  constructor({ fuelType, pricePerUnit, availableQuantityLitres, minimumOrderQuantityLitres }) {
    if (!Object.values(FuelType).includes(fuelType)) {
      throw new ValidationError("Invalid fuel type");
    }
    if (pricePerUnit <= 0) {
      throw new ValidationError("Price per unit must be greater than zero");
    }
    if (availableQuantityLitres < 0) {
      throw new ValidationError("Available quantity cannot be negative");
    }
    if (minimumOrderQuantityLitres <= 0) {
      throw new ValidationError("Minimum order quantity must be greater than zero");
    }

    this.fuelType = fuelType;
    this.pricePerUnit = pricePerUnit;
    this.availableQuantityLitres = availableQuantityLitres;
    this.minimumOrderQuantityLitres = minimumOrderQuantityLitres;
  }

  static create(fuelType, pricePerUnit, availableQuantityLitres, minimumOrderQuantityLitres) {
    return new FuelOffer({
      fuelType,
      pricePerUnit,
      availableQuantityLitres,
      minimumOrderQuantityLitres
    });
  }

  updateDetails(fuelType, pricePerUnit, availableQuantityLitres, minimumOrderQuantityLitres) {
    if (!Object.values(FuelType).includes(fuelType)) {
      throw new ValidationError("Invalid fuel type");
    }
    if (pricePerUnit <= 0) {
      throw new ValidationError("Price per unit must be greater than zero");
    }
    if (availableQuantityLitres < 0) {
      throw new ValidationError("Available quantity cannot be negative");
    }
    if (minimumOrderQuantityLitres <= 0) {
      throw new ValidationError("Minimum order quantity must be greater than zero");
    }

    this.fuelType = fuelType;
    this.pricePerUnit = pricePerUnit;
    this.availableQuantityLitres = availableQuantityLitres;
    this.minimumOrderQuantityLitres = minimumOrderQuantityLitres;
  }

  getFuelType() {
    return this.fuelType;
  }

  getPricePerUnit() {
    return this.pricePerUnit;
  }

  getAvailableQuantityLitres() {
    return this.availableQuantityLitres;
  }

  getMinimumOrderQuantityLitres() {
    return this.minimumOrderQuantityLitres;
  }

  toJSON() {
    return {
      fuelType: this.fuelType,
      pricePerUnit: this.pricePerUnit,
      availableQuantityLitres: this.availableQuantityLitres,
      minimumOrderQuantityLitres: this.minimumOrderQuantityLitres
    };
  }
}
