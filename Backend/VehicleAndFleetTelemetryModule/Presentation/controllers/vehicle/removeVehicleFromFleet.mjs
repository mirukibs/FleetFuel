import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const removeVehicleFromFleet = endpoint({
  method: 'delete',
  path: '/api/vehicles/:id/fleet',
  description: 'Remove a vehicle from its assigned fleet.',
  responseSample: {
    id: 'vehicle-001',
    fleetId: null
  },
  handler: (request) => services.vehicle.removeVehicleFromFleet(getParam(request, 'id'))
});
