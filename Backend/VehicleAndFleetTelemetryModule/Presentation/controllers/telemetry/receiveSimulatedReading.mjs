import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const receiveSimulatedReading = endpoint({
  method: 'post',
  path: '/api/telemetry/readings',
  description: 'Receive a simulated fuel sensor reading.',
  successStatus: 201,
  requestSample: {
    vehicleId: 'vehicle-001',
    fuelLevel: 62.5,
    timestamp: '2026-05-24T18:57:21.121Z'
  },
  responseSample: {
    vehicleId: 'vehicle-001',
    fuelLevel: 62.5,
    alertTriggered: false
  },
  handler: (request) => services.telemetry.generateSimulatedFuelReading(request.body ?? {})
});
