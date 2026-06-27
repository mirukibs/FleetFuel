import {ValidationError} from '../errors.mjs';

export class FuelSensor {
  constructor({id, serialNo, createdAt = new Date().toISOString(), updatedAt = createdAt}) {
    if (!id || !serialNo) {
      throw new ValidationError('Fuel sensor id and serial number are required.');
    }
    this.id = id;
    this.serialNo = `${serialNo}`.trim();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId() {
    return this.id;
  }

  getSerialNo() {
    return this.serialNo;
  }

  toJSON() {
    return {
      entityType: 'FuelSensor',
      id: this.id,
      serialNo: this.serialNo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
