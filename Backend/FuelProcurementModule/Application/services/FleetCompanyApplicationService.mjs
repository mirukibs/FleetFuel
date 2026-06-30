import { FleetCompany } from '../../Domain/entities/FleetCompany.mjs';
import { NotFoundError } from '../../Domain/errors.mjs';

export class FleetCompanyApplicationService {
  constructor({ fleetCompanyRepo }) {
    this.fleetCompanyRepo = fleetCompanyRepo;
  }

  registerFleetCompany(input) {
    const company = new FleetCompany({
      id: input.id,
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      email: input.email,
      phoneNumber: input.phoneNumber
    });
    
    this.fleetCompanyRepo.save(company);
    return company.toJSON();
  }

  updateCompanyDetails(id, input) {
    const company = this.fleetCompanyRepo.findById(id);
    if (!company) {
      throw new NotFoundError(`FleetCompany with ID ${id} not found.`);
    }

    company.updateDetails(
      input.companyName,
      input.contactPerson,
      input.email,
      input.phoneNumber
    );

    this.fleetCompanyRepo.save(company);
    return company.toJSON();
  }

  getFleetCompany(id) {
    const company = this.fleetCompanyRepo.findById(id);
    if (!company) {
      throw new NotFoundError(`FleetCompany with ID ${id} not found.`);
    }
    return company.toJSON();
  }

  listFleetCompanies() {
    const companies = this.fleetCompanyRepo.findAll();
    return companies.map(c => c.toJSON());
  }
}
