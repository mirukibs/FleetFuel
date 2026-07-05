import { FuelAccount } from '../../Domain/entities/FuelAccount.mjs';
import { NotFoundError, ValidationError } from '../../Domain/errors.mjs';

export class FuelTransactionApplicationService {
  constructor({ fuelAccountRepository }) {
    this.fuelAccountRepository = fuelAccountRepository;
  }

  depositFuel(input) {
    let account = this.fuelAccountRepository.findByFleetCompanyId(input.fleetCompanyId);
    
    if (!account) {
      account = FuelAccount.create(input.fleetCompanyId);
    }

    account.depositFuel(input.fuelType, input.quantityLitres);
    this.fuelAccountRepository.save(account);
  }

  simulateRefueling(input) {
    const account = this.fuelAccountRepository.findByFleetCompanyId(input.fleetCompanyId);
    
    if (!account) {
      throw new NotFoundError(`FuelAccount for FleetCompany ${input.fleetCompanyId} not found.`);
    }

    // Records Fuel Transaction & Deducts Fuel Balance
    account.simulateRefueling(input.vehicleId, input.fuelType, input.quantityLitres, input.timestamp);
    
    this.fuelAccountRepository.save(account);
  }

  viewFuelAccount(fleetCompanyId) {
    const account = this.fuelAccountRepository.findByFleetCompanyId(fleetCompanyId);
    if (!account) {
      throw new NotFoundError(`FuelAccount for FleetCompany ${fleetCompanyId} not found.`);
    }
    return account.toJSON();
  }

  viewFuelBalance(fleetCompanyId) {
    const account = this.fuelAccountRepository.findByFleetCompanyId(fleetCompanyId);
    if (!account) {
      throw new NotFoundError(`FuelAccount for FleetCompany ${fleetCompanyId} not found.`);
    }
    return account.getBalances();
  }

  viewTransactionHistory(fleetCompanyId) {
    const account = this.fuelAccountRepository.findByFleetCompanyId(fleetCompanyId);
    if (!account) {
      throw new NotFoundError(`FuelAccount for FleetCompany ${fleetCompanyId} not found.`);
    }
    return account.getTransactions().map(t => t.toJSON());
  }
}
