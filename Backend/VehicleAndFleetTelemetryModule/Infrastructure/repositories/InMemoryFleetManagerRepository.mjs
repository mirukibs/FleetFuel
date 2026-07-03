import {NotFoundError} from '../../Domain/errors.mjs';
import {inMemoryDatabase} from '../database/inMemoryDatabase.mjs';

export class InMemoryFleetManagerRepository {
  save(manager) {
    inMemoryDatabase.fleetManagers.set(manager.id, manager);
    return manager;
  }

  findById(id) {
    const manager = inMemoryDatabase.fleetManagers.get(id);
    if (!manager) {
      throw new NotFoundError(`Fleet manager ${id} was not found.`);
    }
    return manager;
  }

  findAll() {
    return [...inMemoryDatabase.fleetManagers.values()];
  }

  findByCompanyId(fleetCompanyId) {
    return [...inMemoryDatabase.fleetManagers.values()].filter(m => m.fleetCompanyId === fleetCompanyId);
  }
}
