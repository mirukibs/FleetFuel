import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const listFuelSuppliers = endpoint({
  method: 'get',
  path: '/api/fuel-suppliers',
  description: 'List all registered Fuel Suppliers.',
  successStatus: 200,
  responseSample: [{
    id: 'fs-001',
    supplierName: 'Global Fuels',
    contactPerson: 'Alice',
    email: 'alice@globalfuels.com',
    phoneNumber: '555-1234',
    fuelOffers: []
  }],
  handler: () => services.fuelSupplier.listFuelSuppliers()
});
