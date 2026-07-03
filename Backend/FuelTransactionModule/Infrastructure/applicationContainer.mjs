import { FuelTransactionApplicationService } from '../Application/services/FuelTransactionApplicationService.mjs';
import { InMemoryFuelAccountRepository } from './repositories/InMemoryFuelAccountRepository.mjs';

const fuelAccountRepo = new InMemoryFuelAccountRepository();

export const services = {
  fuelTransaction: new FuelTransactionApplicationService({ fuelAccountRepository: fuelAccountRepo })
};
