import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const registerFuelSupplier = endpoint({
  method: 'post',
  path: '/api/fuel-suppliers',
  description: 'Register a new Fuel Supplier.',
  successStatus: 201,
  requestSample: {
    supplierName: 'Global Fuels',
    contactPerson: 'Alice',
    email: 'alice@globalfuels.com',
    phoneNumber: '555-1234'
  },
  responseSample: {
    id: 'fs-001',
    supplierName: 'Global Fuels',
    contactPerson: 'Alice',
    email: 'alice@globalfuels.com',
    phoneNumber: '555-1234',
    fuelOffers: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  handler: (request) => services.fuelSupplier.registerFuelSupplier(request.body ?? {})
});
