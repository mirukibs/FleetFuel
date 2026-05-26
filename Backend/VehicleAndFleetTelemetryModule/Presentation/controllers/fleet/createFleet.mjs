import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const createFleet = endpoint({
  method: 'post',
  path: '/api/fleets',
  description: 'Create a fleet for a fleet manager.',
  successStatus: 201,
  requestSample: {
    name: 'Dar es Salaam Delivery Fleet',
    fleetManagerId: 'manager-001'
  },
  responseSample: {
    id: 'fleet-001',
    name: 'Dar es Salaam Delivery Fleet',
    fleetManagerId: 'manager-001'
  },
  handler: (request) => services.fleet.createFleet(request.body ?? {})
});
