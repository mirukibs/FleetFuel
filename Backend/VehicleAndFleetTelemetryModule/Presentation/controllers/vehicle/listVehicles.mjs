import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const listVehicles = endpoint({
  method: 'get',
  path: '/api/vehicles',
  description: 'List registered vehicles.',
  responseSample: [
    {
      id: 'vehicle-001',
      fleetId: 'fleet-001',
      licensePlate: 'T123ABC'
    }
  ],
  handler: () => services.vehicle.listVehicles()
});
