import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const updateSupplierDetails = endpoint({
  method: 'put',
  path: '/api/fuel-suppliers/:id',
  description: 'Update the details of a Fuel Supplier.',
  successStatus: 200,
  requestSample: {
    supplierName: 'Global Fuels LLC',
    contactPerson: 'Alice',
    email: 'alice@globalfuels.com',
    phoneNumber: '555-4321'
  },
  responseSample: {
    id: 'fs-001',
    supplierName: 'Global Fuels LLC',
    contactPerson: 'Alice',
    email: 'alice@globalfuels.com',
    phoneNumber: '555-4321',
    fuelOffers: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  },
  handler: (request) => services.fuelSupplier.updateSupplierDetails(
    getParam(request, 'id'),
    request.body ?? {}
  )
});
