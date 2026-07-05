import {FleetManager} from '../../Domain/entities/FleetManager.mjs';
import {Name} from '../../Domain/value-objects/Name.mjs';
import {nextId} from '../../Infrastructure/database/inMemoryDatabase.mjs';

export class FleetManagerApplicationService {
  constructor({managerRepo}) {
    this.managerRepo = managerRepo;
  }

  createManager(input) {
    const manager = new FleetManager({
      id: input.id ?? nextId('manager'),
      name: new Name(input.firstName, input.lastName),
      email: input.email ?? null,
      fleetCompanyId: input.fleetCompanyId
    });
    return this.managerRepo.save(manager).toJSON();
  }

  listManagers() {
    return this.managerRepo.findAll().map((manager) => manager.toJSON());
  }

  listManagersByCompany(fleetCompanyId) {
    return this.managerRepo.findByCompanyId(fleetCompanyId).map((manager) => manager.toJSON());
  }

  getManager(id) {
    return this.managerRepo.findById(id).toJSON();
  }
}
