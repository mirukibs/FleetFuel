import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const getFleetDashboard = endpoint({
  method: 'get',
  path: '/api/fleets/:fleetId/dashboard',
  description: 'View the fuel efficiency dashboard for vehicles in a fleet.',
  responseSample: {
    fleetId: 'fleet-001',
    vehicles: [
      {
        vehicleId: 'vehicle-001',
        licensePlate: 'T123ABC',
        latestFuelLevel: 62.5,
        alertTriggered: false
      }
    ]
  },
  handler: (request) => services.telemetry.viewFleetFuelEfficiencyDashboard(getParam(request, 'fleetId'))
});
