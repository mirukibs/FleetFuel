import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const assignFuelSensor = endpoint({
  method: 'post',
  path: '/api/vehicles/:id/fuel-sensor',
  description: 'Assign a simulated fuel sensor to a vehicle.',
  requestSample: {
    sensorId: 'sensor-001',
    serialNo: 'FF-SENSOR-001'
  },
  responseSample: {
    vehicleId: 'vehicle-001',
    sensorId: 'sensor-001',
    serialNo: 'FF-SENSOR-001'
  },
  handler: (request) => services.vehicle.assignFuelSensor(
    getParam(request, 'id'),
    request.body?.sensorId,
    request.body?.serialNo
  )
});
