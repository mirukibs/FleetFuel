import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const deleteVehicle = endpoint({
  method: 'delete',
  path: '/api/vehicles/:id',
  description: 'Delete a vehicle from the telemetry module.',
  responseSample: {
    id: 'vehicle-001',
    deleted: true
  },
  handler: (request) => services.vehicle.deleteVehicle(getParam(request, 'id'))
});
