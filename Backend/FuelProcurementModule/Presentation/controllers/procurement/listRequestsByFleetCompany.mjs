import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const listRequestsByFleetCompany = endpoint({
  method: 'get',
  path: '/api/fleet-companies/:fleetCompanyId/procurement-requests',
  description: 'List all procurement requests for a specific Fleet Company.',
  successStatus: 200,
  responseSample: [{
    id: 'pr-001',
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    procurementStatus: 'DRAFT'
  }],
  handler: (request) => services.procurement.listRequestsByFleetCompany(getParam(request, 'fleetCompanyId'))
});
