import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const listRequestsBySupplier = endpoint({
  method: 'get',
  path: '/api/fuel-suppliers/:supplierId/procurement-requests',
  description: 'List all procurement requests for a specific Fuel Supplier.',
  successStatus: 200,
  responseSample: [{
    id: 'pr-001',
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    procurementStatus: 'SUBMITTED'
  }],
  handler: (request) => services.procurement.listRequestsBySupplier(getParam(request, 'supplierId'))
});
