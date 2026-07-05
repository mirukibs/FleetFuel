import { randomUUID } from "crypto";
import { FuelType } from "../../../SharedKernel/enums/FuelType.mjs";
import { FuelTransaction } from "./FuelTransaction.mjs";
import { ValidationError, DomainError } from "../errors.mjs";

export class FuelAccount {
  constructor({ id, fleetCompanyId, balances = {}, transactions = [], createdAt = new Date().toISOString(), updatedAt = new Date().toISOString() }) {
    if (!fleetCompanyId) throw new ValidationError("Fleet company ID is required");

    // Validate balances object
    for (const [type, amount] of Object.entries(balances)) {
      if (!Object.values(FuelType).includes(type)) throw new ValidationError(`Invalid fuel type: ${type}`);
      if (amount < 0) throw new ValidationError("Available fuel cannot be negative");
    }
    
    if (Object.keys(balances).length > 2) {
      throw new ValidationError("A fuel account cannot hold more than 2 fuel types");
    }

    this.id = id || randomUUID();
    this.fleetCompanyId = fleetCompanyId;
    this.balances = balances;
    this.transactions = transactions.map(t => 
      t instanceof FuelTransaction ? t : new FuelTransaction(t)
    );
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(fleetCompanyId) {
    return new FuelAccount({
      fleetCompanyId,
      balances: {},
      transactions: []
    });
  }

  depositFuel(fuelType, quantityLitres) {
    if (!Object.values(FuelType).includes(fuelType)) {
      throw new ValidationError("Invalid fuel type");
    }
    if (quantityLitres <= 0) {
      throw new ValidationError("Deposit quantity must be greater than zero");
    }

    if (!this.balances[fuelType]) {
      if (Object.keys(this.balances).length >= 2) {
        throw new ValidationError("A fuel account cannot hold more than 2 fuel types");
      }
      this.balances[fuelType] = 0;
    }

    this.balances[fuelType] += quantityLitres;
    this.updatedAt = new Date().toISOString();
  }

  simulateRefueling(vehicleId, fuelType, quantityLitres, timestamp) {
    if (!Object.values(FuelType).includes(fuelType)) {
      throw new ValidationError("Invalid fuel type");
    }
    if (quantityLitres <= 0) {
      throw new ValidationError("Refueling quantity must be greater than zero");
    }
    
    const currentBalance = this.balances[fuelType] || 0;
    if (currentBalance < quantityLitres) {
      throw new DomainError(`Insufficient ${fuelType} fuel balance for refueling`);
    }

    const transaction = FuelTransaction.create(vehicleId, fuelType, quantityLitres, timestamp);
    this.transactions.push(transaction);
    this.balances[fuelType] -= quantityLitres;
    this.updatedAt = new Date().toISOString();
  }

  getBalances() {
    return { ...this.balances };
  }

  getTransactions() {
    return [...this.transactions];
  }

  toJSON() {
    return {
      id: this.id,
      fleetCompanyId: this.fleetCompanyId,
      balances: this.balances,
      transactions: this.transactions.map(t => t.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
