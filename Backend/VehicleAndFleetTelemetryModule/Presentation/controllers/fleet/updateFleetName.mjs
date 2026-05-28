import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const updateFleetName = endpoint({
  method: 'put',
  path: '/api/fleets/:id/name',
  description: 'Update the display name of an existing fleet.',
  requestSample: {
    name: 'Upcountry Delivery Fleet'
  },
  responseSample: {
    id: 'fleet-001',
    name: 'Upcountry Delivery Fleet'
  },
  handler: (request) => services.fleet.updateFleetName(getParam(request, 'id'), request.body?.name)
});
