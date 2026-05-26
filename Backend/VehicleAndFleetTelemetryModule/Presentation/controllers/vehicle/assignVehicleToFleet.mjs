import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const assignVehicleToFleet = endpoint({
  method: 'post',
  path: '/api/vehicles/:id/fleet',
  description: 'Assign a registered vehicle to a fleet.',
  requestSample: {
    fleetId: 'fleet-001'
  },
  responseSample: {
    vehicleId: 'vehicle-001',
    fleetId: 'fleet-001'
  },
  handler: (request) => services.vehicle.assignVehicleToFleet(getParam(request, 'id'), request.body?.fleetId)
});
