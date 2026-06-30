import {NotFoundError} from '../../Domain/errors.mjs';
import {inMemoryDatabase} from '../database/inMemoryDatabase.mjs';

export class InMemoryFleetRepository {
  save(fleet) {
    inMemoryDatabase.fleets.set(fleet.id, fleet);
    return fleet;
  }

  findById(id) {
    const fleet = inMemoryDatabase.fleets.get(id);
    if (!fleet) {
      throw new NotFoundError(`Fleet ${id} was not found.`);
    }
    return fleet;
  }

  findAll() {
    return [...inMemoryDatabase.fleets.values()];
  }
}
