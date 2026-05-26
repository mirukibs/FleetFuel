import {ValidationError} from '../errors.mjs';

export class Fleet {
  constructor({id, name, fleetManagerId, createdAt = new Date().toISOString(), updatedAt = createdAt}) {
    if (!name || !`${name}`.trim()) {
      throw new ValidationError('Fleet name is required.');
    }
    this.id = id;
    this.name = `${name}`.trim();
    this.fleetManagerId = fleetManagerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateName(name) {
    if (!name || !`${name}`.trim()) {
      throw new ValidationError('Fleet name is required.');
    }
    this.name = `${name}`.trim();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      fleetManagerId: this.fleetManagerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
