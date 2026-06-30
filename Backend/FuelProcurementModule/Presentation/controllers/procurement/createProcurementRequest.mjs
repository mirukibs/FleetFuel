import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const createProcurementRequest = endpoint({
  method: 'post',
  path: '/api/procurement-requests',
  description: 'Create a new procurement request.',
  successStatus: 201,
  requestSample: {
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    fuelType: 'DIESEL',
    fuelQuantityLitres: 2000,
    unitPrice: 1500
  },
  responseSample: {
    id: 'pr-001',
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    fuelType: 'DIESEL',
    fuelQuantityLitres: 2000,
    unitPrice: 1500,
    totalCost: 3000000,
    procurementStatus: 'DRAFT',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  handler: (request) => services.procurement.createProcurementRequest(request.body ?? {})
});
