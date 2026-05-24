import {ValidationError} from '../errors.mjs';

export const VehicleType = Object.freeze({
  SEDAN: 'Sedan',
  SUV: 'SUV',
  TRUCK: 'Truck',
  MOTORCYCLE: 'Motorcycle'
});

export const normalizeVehicleType = (type) => {
  const value = `${type ?? ''}`.trim().toLowerCase();
  const match = Object.values(VehicleType).find((item) => item.toLowerCase() === value);
  if (!match) {
    throw new ValidationError('Vehicle type must be Sedan, SUV, Truck, or Motorcycle.');
  }
  return match;
};
