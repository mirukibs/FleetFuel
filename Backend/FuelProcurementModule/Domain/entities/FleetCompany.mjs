import { randomUUID } from "crypto";
import { ValidationError } from "../errors.mjs";

export class FleetCompany {
  constructor({ id, companyName, contactPerson, email, phoneNumber, createdAt = new Date().toISOString(), updatedAt = createdAt }) {
    if (!companyName) throw new ValidationError("Company name is required");
    if (!email) throw new ValidationError("Email is required");

    this.id = id || randomUUID();
    this.companyName = companyName;
    this.contactPerson = contactPerson;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(companyName, contactPerson, email, phoneNumber) {
    return new FleetCompany({
      companyName,
      contactPerson,
      email,
      phoneNumber,
    });
  }

  updateDetails(companyName, contactPerson, email, phoneNumber) {
    if (!companyName) throw new ValidationError("Company name is required");
    if (!email) throw new ValidationError("Email is required");

    this.companyName = companyName;
    this.contactPerson = contactPerson;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.updatedAt = new Date().toISOString();
  }

  getCompanyName() {
    return this.companyName;
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

  toJSON() {
    return {
      id: this.id,
      companyName: this.companyName,
      contactPerson: this.contactPerson,
      email: this.email,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
