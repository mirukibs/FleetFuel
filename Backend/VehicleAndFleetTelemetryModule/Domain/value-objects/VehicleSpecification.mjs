import {ValidationError} from '../errors.mjs';

export class VehicleSpecification {
  constructor(make, model, year) {
    if (!make || !model || !year) {
      throw new ValidationError('Vehicle make, model, and year are required.');
    }
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900) {
      throw new ValidationError('Vehicle year must be a valid integer.');
    }
    this.make = `${make}`.trim();
    this.model = `${model}`.trim();
    this.year = parsedYear;
  }

  toJSON() {
    return {
      make: this.make,
      model: this.model,
      year: this.year
    };
  }
}
