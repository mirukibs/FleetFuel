import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const updateFuelOffer = endpoint({
  method: 'put',
  path: '/api/fuel-suppliers/:id/offers',
  description: 'Update a fuel offer for a supplier.',
  successStatus: 200,
  requestSample: {
    fuelType: 'DIESEL',
    pricePerUnit: 1400,
    availableQuantityLitres: 90000,
    minimumOrderQuantityLitres: 1000
  },
  responseSample: {
    id: 'fs-001',
    fuelOffers: [
      {
        fuelType: 'DIESEL',
        pricePerUnit: 1400,
        availableQuantityLitres: 90000,
        minimumOrderQuantityLitres: 1000
      }
    ]
  },
  handler: (request) => services.fuelSupplier.updateFuelOffer(
    getParam(request, 'id'),
    request.body ?? {}
  )
});
