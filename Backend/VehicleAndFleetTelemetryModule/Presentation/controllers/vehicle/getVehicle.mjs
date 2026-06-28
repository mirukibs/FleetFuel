import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const getVehicle = endpoint({
  method: 'get',
  path: '/api/vehicles/:id',
  description: 'Get vehicle details.',
  responseSample: {
    id: 'vehicle-001',
    fleetId: 'fleet-001',
    licensePlate: 'T123ABC'
  },
  handler: (request) => services.vehicle.getVehicle(getParam(request, 'id'))
});
