import { randomUUID } from "crypto";
import { FuelType } from "../enums/FuelType.mjs";
import { ProcurementRequestStatus } from "../enums/ProcurementRequestStatus.mjs";
import { ValidationError, DomainError } from "../errors.mjs";

export class ProcurementRequest {
  constructor({ id, fleetCompanyId, fuelSupplierId, fuelType, fuelQuantityLitres, unitPrice, procurementStatus, createdAt = new Date().toISOString(), updatedAt = createdAt }) {
    if (!fleetCompanyId) throw new ValidationError("Fleet company ID is required");
    if (!fuelSupplierId) throw new ValidationError("Fuel supplier ID is required");
    if (!Object.values(FuelType).includes(fuelType)) throw new ValidationError("Invalid fuel type");
    if (fuelQuantityLitres <= 0) throw new ValidationError("Fuel quantity must be greater than zero");
    if (unitPrice <= 0) throw new ValidationError("Unit price must be greater than zero");

    this.id = id || randomUUID();
    this.fleetCompanyId = fleetCompanyId;
    this.fuelSupplierId = fuelSupplierId;
    this.fuelType = fuelType;
    this.fuelQuantityLitres = fuelQuantityLitres;
    this.unitPrice = unitPrice;
    this.procurementStatus = procurementStatus || ProcurementRequestStatus.DRAFT;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(fleetCompanyId, fuelSupplierId, fuelType, fuelQuantityLitres, unitPrice) {
    return new ProcurementRequest({
      fleetCompanyId,
      fuelSupplierId,
      fuelType,
      fuelQuantityLitres,
      unitPrice,
      procurementStatus: ProcurementRequestStatus.DRAFT
    });
  }

  submit() {
    if (this.procurementStatus !== ProcurementRequestStatus.DRAFT) {
      throw new DomainError(`Cannot submit a request from status: ${this.procurementStatus}`);
    }
    this.procurementStatus = ProcurementRequestStatus.SUBMITTED;
    this.updatedAt = new Date().toISOString();
  }

  accept() {
    if (this.procurementStatus !== ProcurementRequestStatus.SUBMITTED) {
      throw new DomainError(`Cannot accept a request from status: ${this.procurementStatus}`);
    }
    this.procurementStatus = ProcurementRequestStatus.ACCEPTED;
    this.updatedAt = new Date().toISOString();
  }

  reject() {
    if (this.procurementStatus !== ProcurementRequestStatus.SUBMITTED) {
      throw new DomainError(`Cannot reject a request from status: ${this.procurementStatus}`);
    }
    this.procurementStatus = ProcurementRequestStatus.REJECTED;
    this.updatedAt = new Date().toISOString();
  }

  fulfill() {
    if (this.procurementStatus !== ProcurementRequestStatus.ACCEPTED) {
      throw new DomainError(`Cannot fulfill a request from status: ${this.procurementStatus}`);
    }
    this.procurementStatus = ProcurementRequestStatus.FULFILLED;
    this.updatedAt = new Date().toISOString();
  }

  updateDetails(fuelQuantityLitres, unitPrice) {
    if (this.procurementStatus !== ProcurementRequestStatus.DRAFT) {
      throw new DomainError(`Cannot update details for a request in status: ${this.procurementStatus}`);
    }
    if (fuelQuantityLitres <= 0) throw new ValidationError("Fuel quantity must be greater than zero");
    if (unitPrice <= 0) throw new ValidationError("Unit price must be greater than zero");

    this.fuelQuantityLitres = fuelQuantityLitres;
    this.unitPrice = unitPrice;
    this.updatedAt = new Date().toISOString();
  }

  getFuelType() {
    return this.fuelType;
  }

  getFuelQuantityLitres() {
    return this.fuelQuantityLitres;
  }

  getUnitPrice() {
    return this.unitPrice;
  }

  getTotalCost() {
    return this.fuelQuantityLitres * this.unitPrice;
  }

  toJSON() {
    return {
      id: this.id,
      fleetCompanyId: this.fleetCompanyId,
      fuelSupplierId: this.fuelSupplierId,
      fuelType: this.fuelType,
      fuelQuantityLitres: this.fuelQuantityLitres,
      unitPrice: this.unitPrice,
      totalCost: this.getTotalCost(),
      procurementStatus: this.procurementStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
