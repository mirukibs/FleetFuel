import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const addFuelOffer = endpoint({
  method: 'post',
  path: '/api/fuel-suppliers/:id/offers',
  description: 'Add a fuel offer to a supplier.',
  successStatus: 201,
  requestSample: {
    fuelType: 'DIESEL',
    pricePerUnit: 1500,
    availableQuantityLitres: 100000,
    minimumOrderQuantityLitres: 500
  },
  responseSample: {
    id: 'fs-001',
    fuelOffers: [
      {
        fuelType: 'DIESEL',
        pricePerUnit: 1500,
        availableQuantityLitres: 100000,
        minimumOrderQuantityLitres: 500
      }
    ]
  },
  handler: (request) => services.fuelSupplier.addFuelOffer(
    getParam(request, 'id'),
    request.body ?? {}
  )
});
