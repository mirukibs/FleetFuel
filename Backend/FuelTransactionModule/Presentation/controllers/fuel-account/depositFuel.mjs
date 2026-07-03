import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const depositFuel = endpoint({
  method: 'post',
  path: '/api/fuel-accounts/deposit',
  description: 'Deposit fuel to a fleet company.',
  successStatus: 200,
  requestSample: {
    fleetCompanyId: 'fleet-1',
    fuelType: 'DIESEL',
    quantityLitres: 1000
  },
  handler: (request) => {
    services.fuelTransaction.depositFuel(request.body ?? {});
    return { success: true };
  }
});
