import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const updateProcurementRequest = endpoint({
  method: 'put',
  path: '/api/procurement-requests/:id',
  description: 'Update a draft procurement request.',
  successStatus: 200,
  requestSample: {
    fuelQuantityLitres: 3000,
    unitPrice: 1450
  },
  responseSample: {
    id: 'pr-001',
    fleetCompanyId: 'fc-001',
    fuelSupplierId: 'fs-001',
    fuelType: 'DIESEL',
    fuelQuantityLitres: 3000,
    unitPrice: 1450,
    totalCost: 4350000,
    procurementStatus: 'DRAFT',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  },
  handler: (request) => services.procurement.updateProcurementRequest(
    getParam(request, 'id'),
    request.body ?? {}
  )
});
