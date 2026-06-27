import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const listVehicleTelemetryReadings = endpoint({
  method: 'get',
  path: '/api/vehicles/:id/telemetry/readings',
  description: 'List telemetry readings for one vehicle.',
  responseSample: [
    {
      id: 'reading-001',
      vehicleId: 'vehicle-001',
      fuelLevel: 62.5,
      timestamp: '2026-05-24T18:57:21.121Z'
    }
  ],
  handler: (request) => services.telemetry.listVehicleTelemetryReadings(getParam(request, 'id'))
});
