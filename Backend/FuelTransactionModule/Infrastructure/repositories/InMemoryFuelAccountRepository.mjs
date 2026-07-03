import { FuelAccountRepository } from "../../Domain/repositories/FuelAccountRepository.mjs";
import { FuelAccount } from "../../Domain/entities/FuelAccount.mjs";
import { inMemoryDatabase, nextId } from "../database/inMemoryDatabase.mjs";

export class InMemoryFuelAccountRepository extends FuelAccountRepository {
  save(account) {
    if (!account.id) {
      account.id = nextId("FA");
    }
    // We clone the account data to simulate DB serialization/deserialization
    const serialized = JSON.stringify(account.toJSON());
    inMemoryDatabase.fuelAccounts.set(account.id, JSON.parse(serialized));
  }

  findById(id) {
    const data = inMemoryDatabase.fuelAccounts.get(id);
    if (!data) return null;
    return new FuelAccount(data);
  }

  findByFleetCompanyId(fleetCompanyId) {
    for (const data of inMemoryDatabase.fuelAccounts.values()) {
      if (data.fleetCompanyId === fleetCompanyId) {
        return new FuelAccount(data);
      }
    }
    return null;
  }
}
