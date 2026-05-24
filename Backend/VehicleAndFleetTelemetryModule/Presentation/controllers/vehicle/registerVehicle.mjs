import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const registerVehicle = endpoint({
  method: 'post',
  path: '/api/vehicles',
  description: 'Register a vehicle in the telemetry module.',
  successStatus: 201,
  requestSample: {
    fleetId: 'fleet-001',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    type: 'Truck',
    licensePlate: 'T123ABC'
  },
  responseSample: {
    id: 'vehicle-001',
    fleetId: 'fleet-001',
    licensePlate: 'T123ABC'
  },
  handler: (request) => services.vehicle.registerVehicle(request.body ?? {})
});
