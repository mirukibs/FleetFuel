import { randomUUID } from 'node:crypto';
import { ValidationError } from '../errors.mjs';

export const USER_ROLES = Object.freeze({
  FUEL_SUPPLIER: 'fuel_supplier',
  FLEET_COMPANY: 'fleet_company'
});

const allowedRoles = new Set(Object.values(USER_ROLES));

export class User {
  constructor({
    id,
    email,
    passwordHash,
    role,
    affiliatedServiceId,
    createdAt = new Date().toISOString(),
    updatedAt = createdAt
  }) {
    if (!email) throw new ValidationError('Email is required');
    if (!passwordHash) throw new ValidationError('Password hash is required');
    if (!allowedRoles.has(role)) {
      throw new ValidationError('Role must be either fuel_supplier or fleet_company');
    }
    if (!affiliatedServiceId) {
      throw new ValidationError('Affiliated service is required');
    }

    this.id = id || randomUUID();
    this.email = String(email).trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.role = role;
    this.affiliatedServiceId = affiliatedServiceId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      affiliatedServiceId: this.affiliatedServiceId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
