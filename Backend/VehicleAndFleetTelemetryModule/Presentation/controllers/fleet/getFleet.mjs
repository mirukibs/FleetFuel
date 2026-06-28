import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const getFleet = endpoint({
  method: 'get',
  path: '/api/fleets/:id',
  description: 'Get fleet details.',
  responseSample: {
    id: 'fleet-001',
    name: 'Dar es Salaam Delivery Fleet',
    fleetManagerId: 'manager-001'
  },
  handler: (request) => services.fleet.getFleet(getParam(request, 'id'))
});
