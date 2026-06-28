import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const listTelemetryReadings = endpoint({
  method: 'get',
  path: '/api/telemetry/readings',
  description: 'List telemetry readings, optionally filtered by vehicleId.',
  responseSample: [
    {
      id: 'reading-001',
      vehicleId: 'vehicle-001',
      fuelLevel: 62.5,
      timestamp: '2026-05-24T18:57:21.121Z'
    }
  ],
  handler: (request) => services.telemetry.listTelemetryReadings({
    vehicleId: request?.query?.vehicleId
  })
});
