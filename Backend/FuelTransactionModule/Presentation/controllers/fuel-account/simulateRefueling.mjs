import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const simulateRefueling = endpoint({
  method: 'post',
  path: '/api/fuel-accounts/simulate-refueling',
  description: 'Simulate a refueling transaction for a vehicle.',
  successStatus: 200,
  requestSample: {
    fleetCompanyId: 'fleet-1',
    vehicleId: 'vehicle-1',
    fuelType: 'DIESEL',
    quantityLitres: 50,
    timestamp: '2026-07-01T12:00:00Z'
  },
  handler: (request) => {
    services.fuelTransaction.simulateRefueling(request.body ?? {});
    return { success: true };
  }
});
