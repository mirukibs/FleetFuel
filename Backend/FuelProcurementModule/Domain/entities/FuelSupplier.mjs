import { randomUUID } from "crypto";
import { ValidationError, DomainError } from "../errors.mjs";

export class FuelSupplier {
  constructor({ id, supplierName, contactPerson, email, phoneNumber, fuelOffers = [], createdAt = new Date().toISOString(), updatedAt = createdAt }) {
    if (!supplierName) throw new ValidationError("Supplier name is required");
    if (!email) throw new ValidationError("Email is required");

    this.id = id || randomUUID();
    this.supplierName = supplierName;
    this.contactPerson = contactPerson;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.fuelOffers = fuelOffers;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(supplierName, contactPerson, email, phoneNumber) {
    return new FuelSupplier({
      supplierName,
      contactPerson,
      email,
      phoneNumber,
    });
  }

  updateDetails(supplierName, contactPerson, email, phoneNumber) {
    if (!supplierName) throw new ValidationError("Supplier name is required");
    if (!email) throw new ValidationError("Email is required");

    this.supplierName = supplierName;
    this.contactPerson = contactPerson;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.updatedAt = new Date().toISOString();
  }

  getSupplierName() {
    return this.supplierName;
  }

  getContactPerson() {
    return this.contactPerson;
  }

  getEmail() {
    return this.email;
  }

  getPhoneNumber() {
    return this.phoneNumber;
  }

  getFuelOffers() {
    return [...this.fuelOffers];
  }

  addFuelOffer(fuelOffer) {
    if (!fuelOffer) throw new ValidationError("Fuel offer is required");
    // Prevent duplicate fuel types
    const existing = this.fuelOffers.findIndex(offer => offer.getFuelType() === fuelOffer.getFuelType());
    if (existing >= 0) {
      this.fuelOffers[existing] = fuelOffer;
    } else {
      this.fuelOffers.push(fuelOffer);
    }
    this.updatedAt = new Date().toISOString();
  }

  removeFuelOffer(fuelType) {
    if (!fuelType) throw new ValidationError("Fuel type is required");
    this.fuelOffers = this.fuelOffers.filter(offer => offer.getFuelType() !== fuelType);
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      supplierName: this.supplierName,
      contactPerson: this.contactPerson,
      email: this.email,
      phoneNumber: this.phoneNumber,
      fuelOffers: this.fuelOffers.map(offer => offer.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
