import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const getProcurementRequest = endpoint({
  method: 'get',
  path: '/api/procurement-requests/:id',
  description: 'Get details of a specific procurement request.',
  successStatus: 200,
  responseSample: {
    id: 'pr-001',
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    fuelType: 'DIESEL',
    fuelQuantityLitres: 2000,
    unitPrice: 1500,
    totalCost: 3000000,
    procurementStatus: 'DRAFT'
  },
  handler: (request) => services.procurement.getProcurementRequest(getParam(request, 'id'))
});
