import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const listFleetVehicles = endpoint({
  method: 'get',
  path: '/api/fleets/:fleetId/vehicles',
  description: 'List vehicles assigned to a fleet.',
  responseSample: [
    {
      id: 'vehicle-001',
      fleetId: 'fleet-001',
      licensePlate: 'T123ABC'
    }
  ],
  handler: (request) => services.vehicle.listVehiclesByFleet(getParam(request, 'fleetId'))
});
