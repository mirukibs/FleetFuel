import { FleetCompanyApplicationService } from '../Application/services/FleetCompanyApplicationService.mjs';
import { FuelSupplierApplicationService } from '../Application/services/FuelSupplierApplicationService.mjs';
import { ProcurementApplicationService } from '../Application/services/ProcurementApplicationService.mjs';

import { InMemoryFleetCompanyRepository } from './repositories/InMemoryFleetCompanyRepository.mjs';
import { InMemoryFuelSupplierRepository } from './repositories/InMemoryFuelSupplierRepository.mjs';
import { InMemoryProcurementRequestRepository } from './repositories/InMemoryProcurementRequestRepository.mjs';

const fleetCompanyRepo = new InMemoryFleetCompanyRepository();
const fuelSupplierRepo = new InMemoryFuelSupplierRepository();
const procurementRepo = new InMemoryProcurementRequestRepository();

export const services = {
  fleetCompany: new FleetCompanyApplicationService({ fleetCompanyRepo }),
  fuelSupplier: new FuelSupplierApplicationService({ fuelSupplierRepo }),
  procurement: new ProcurementApplicationService({ procurementRepo, fleetCompanyRepo, fuelSupplierRepo })
};
