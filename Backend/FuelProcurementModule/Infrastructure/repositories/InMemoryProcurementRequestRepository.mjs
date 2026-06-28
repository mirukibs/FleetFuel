import { inMemoryDatabase } from '../database/inMemoryDatabase.mjs';

export class InMemoryProcurementRequestRepository {
  save(request) {
    inMemoryDatabase.procurementRequests.set(request.id, request);
    return request;
  }

  findById(id) {
    return inMemoryDatabase.procurementRequests.get(id) || null;
  }

  findByFleetCompanyId(fleetCompanyId) {
    return [...inMemoryDatabase.procurementRequests.values()]
      .filter(r => r.fleetCompanyId === fleetCompanyId);
  }

  findByFuelSupplierId(fuelSupplierId) {
    return [...inMemoryDatabase.procurementRequests.values()]
      .filter(r => r.fuelSupplierId === fuelSupplierId);
  }
}
