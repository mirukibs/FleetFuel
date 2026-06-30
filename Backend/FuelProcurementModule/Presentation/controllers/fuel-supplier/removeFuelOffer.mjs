import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const removeFuelOffer = endpoint({
  method: 'delete',
  path: '/api/fuel-suppliers/:id/offers/:fuelType',
  description: 'Remove a fuel offer from a supplier.',
  successStatus: 200,
  responseSample: {
    id: 'fs-001',
    fuelOffers: []
  },
  handler: (request) => services.fuelSupplier.removeFuelOffer(
    getParam(request, 'id'),
    getParam(request, 'fuelType')
  )
});
