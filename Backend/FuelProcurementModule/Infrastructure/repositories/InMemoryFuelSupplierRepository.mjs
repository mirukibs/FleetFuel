import { inMemoryDatabase } from '../database/inMemoryDatabase.mjs';

export class InMemoryFuelSupplierRepository {
  save(supplier) {
    inMemoryDatabase.fuelSuppliers.set(supplier.id, supplier);
    return supplier;
  }

  findById(id) {
    return inMemoryDatabase.fuelSuppliers.get(id) || null;
  }

  findAll() {
    return [...inMemoryDatabase.fuelSuppliers.values()];
  }
}
