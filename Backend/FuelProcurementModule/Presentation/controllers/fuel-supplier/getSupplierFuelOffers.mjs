import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const getSupplierFuelOffers = endpoint({
  method: 'get',
  path: '/api/fuel-suppliers/:id/offers',
  description: 'Get fuel offers for a specific supplier.',
  successStatus: 200,
  responseSample: [{
    fuelType: 'DIESEL',
    pricePerUnit: 1500,
    availableQuantityLitres: 100000,
    minimumOrderQuantityLitres: 500
  }],
  handler: (request) => services.fuelSupplier.getSupplierFuelOffers(getParam(request, 'id'))
});
