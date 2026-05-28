import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const updateVehicle = endpoint({
  method: 'put',
  path: '/api/vehicles/:id',
  description: 'Update vehicle details.',
  requestSample: {
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    type: 'Truck',
    licensePlate: 'T123ABC'
  },
  responseSample: {
    id: 'vehicle-001',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    type: 'Truck',
    licensePlate: 'T123ABC'
  },
  handler: (request) => services.vehicle.updateVehicleDetails(getParam(request, 'id'), request.body ?? {})
});
