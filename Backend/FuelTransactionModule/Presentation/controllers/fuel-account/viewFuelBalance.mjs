import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const viewFuelBalance = endpoint({
  method: 'get',
  path: '/api/fuel-accounts/:fleetCompanyId/balance',
  description: 'Get the fuel account balance for a fleet company.',
  successStatus: 200,
  handler: (request) => services.fuelTransaction.viewFuelBalance(getParam(request, 'fleetCompanyId'))
});
