import {Fleet} from '../../Domain/entities/Fleet.mjs';
import {nextId} from '../../Infrastructure/database/inMemoryDatabase.mjs';

export class FleetApplicationService {
  constructor({fleetRepo, managerRepo}) {
    this.fleetRepo = fleetRepo;
    this.managerRepo = managerRepo;
  }

  createFleet(input) {
    if (input.fleetManagerId) {
      this.managerRepo.findById(input.fleetManagerId);
    }
    const fleet = new Fleet({
      id: input.id ?? nextId('fleet'),
      name: input.name,
      fleetManagerId: input.fleetManagerId ?? null
    });
    return this.fleetRepo.save(fleet).toJSON();
  }

  listFleets() {
    return this.fleetRepo.findAll().map((fleet) => fleet.toJSON());
  }

  getFleet(id) {
    return this.fleetRepo.findById(id).toJSON();
  }

  updateFleetName(id, newName) {
    const fleet = this.fleetRepo.findById(id);
    fleet.updateName(newName);
    return this.fleetRepo.save(fleet).toJSON();
  }
}
