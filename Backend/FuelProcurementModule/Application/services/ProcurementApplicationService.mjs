import { ProcurementRequest } from '../../Domain/entities/ProcurementRequest.mjs';
import { NotFoundError } from '../../Domain/errors.mjs';

export class ProcurementApplicationService {
  constructor({ procurementRepo, fleetCompanyRepo, fuelSupplierRepo }) {
    this.procurementRepo = procurementRepo;
    this.fleetCompanyRepo = fleetCompanyRepo;
    this.fuelSupplierRepo = fuelSupplierRepo;
  }

  createProcurementRequest(input) {
    const fleetCompany = this.fleetCompanyRepo.findById(input.fleetCompanyId);
    if (!fleetCompany) {
      throw new NotFoundError(`FleetCompany with ID ${input.fleetCompanyId} not found.`);
    }

    const supplier = this.fuelSupplierRepo.findById(input.fuelSupplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${input.fuelSupplierId} not found.`);
    }

    const request = new ProcurementRequest({
      id: input.id,
      fleetCompanyId: input.fleetCompanyId,
      fuelSupplierId: input.fuelSupplierId,
      fuelType: input.fuelType,
      fuelQuantityLitres: input.fuelQuantityLitres,
      unitPrice: input.unitPrice
    });

    this.procurementRepo.save(request);
    return request.toJSON();
  }

  updateProcurementRequest(id, input) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }

    request.updateDetails(input.fuelQuantityLitres, input.unitPrice);

    this.procurementRepo.save(request);
    return request.toJSON();
  }

  submitProcurementRequest(id) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }

    request.submit();
    this.procurementRepo.save(request);
    return request.toJSON();
  }

  getProcurementRequest(id) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }
    return request.toJSON();
  }

  listRequestsByFleetCompany(fleetCompanyId) {
    const fleetCompany = this.fleetCompanyRepo.findById(fleetCompanyId);
    if (!fleetCompany) {
      throw new NotFoundError(`FleetCompany with ID ${fleetCompanyId} not found.`);
    }

    const requests = this.procurementRepo.findByFleetCompanyId(fleetCompanyId);
    return requests.map(r => r.toJSON());
  }

  listRequestsBySupplier(supplierId) {
    const supplier = this.fuelSupplierRepo.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${supplierId} not found.`);
    }

    const requests = this.procurementRepo.findByFuelSupplierId(supplierId);
    return requests.map(r => r.toJSON());
  }

  acceptProcurementRequest(id) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }

    request.accept();
    this.procurementRepo.save(request);
    return request.toJSON();
  }

  rejectProcurementRequest(id) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }

    request.reject();
    this.procurementRepo.save(request);
    return request.toJSON();
  }

  fulfillProcurementRequest(id) {
    const request = this.procurementRepo.findById(id);
    if (!request) {
      throw new NotFoundError(`ProcurementRequest with ID ${id} not found.`);
    }

    request.fulfill();
    this.procurementRepo.save(request);
    return request.toJSON();
  }
}
