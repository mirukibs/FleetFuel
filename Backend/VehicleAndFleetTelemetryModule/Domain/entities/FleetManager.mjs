import {ValidationError} from '../errors.mjs';

export class FleetManager {
  constructor({id, name, email, fleetCompanyId, createdAt = new Date().toISOString(), updatedAt = createdAt}) {
    if (!fleetCompanyId) {
      throw new ValidationError('Fleet company ID is required.');
    }
    this.id = id;
    this.name = name;
    this.email = email;
    this.fleetCompanyId = fleetCompanyId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.name.toJSON(),
      email: this.email,
      fleetCompanyId: this.fleetCompanyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
