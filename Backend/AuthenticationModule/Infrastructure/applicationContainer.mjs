import { AuthenticationApplicationService } from '../Application/services/AuthenticationApplicationService.mjs';
import { InMemorySessionRepository } from './repositories/InMemorySessionRepository.mjs';
import { InMemoryUserRepository } from './repositories/InMemoryUserRepository.mjs';
import { PasswordHasher } from './security/PasswordHasher.mjs';
import { repos as fpRepos } from '../../FuelProcurementModule/Infrastructure/applicationContainer.mjs';

const userRepo = new InMemoryUserRepository();
const sessionRepo = new InMemorySessionRepository();
const passwordHasher = new PasswordHasher();

export const services = {
  auth: new AuthenticationApplicationService({ 
    userRepo, 
    sessionRepo, 
    passwordHasher,
    fleetCompanyRepo: fpRepos.fleetCompanyRepo,
    fuelSupplierRepo: fpRepos.fuelSupplierRepo
  })
};
