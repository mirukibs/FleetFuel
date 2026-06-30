import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const compareFuelPrices = endpoint({
  method: 'get',
  path: '/api/fuel-offers/compare/:fuelType',
  description: 'Compare fuel prices across all suppliers by fuel type.',
  successStatus: 200,
  responseSample: [{
    supplierId: 'fs-002',
    supplierName: 'Cheap Fuels',
    fuelType: 'DIESEL',
    pricePerUnit: 1400,
    availableQuantityLitres: 50000,
    minimumOrderQuantityLitres: 1000
  }],
  handler: (request) => services.fuelSupplier.compareFuelPrices(getParam(request, 'fuelType'))
});
