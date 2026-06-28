import { inMemoryDatabase } from '../database/inMemoryDatabase.mjs';

export class InMemoryFleetCompanyRepository {
  save(company) {
    inMemoryDatabase.fleetCompanies.set(company.id, company);
    return company;
  }

  findById(id) {
    return inMemoryDatabase.fleetCompanies.get(id) || null;
  }

  findAll() {
    return [...inMemoryDatabase.fleetCompanies.values()];
  }
}
