import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const viewFuelAccount = endpoint({
  method: 'get',
  path: '/api/fuel-accounts/:fleetCompanyId',
  description: 'Get the fuel account details for a fleet company.',
  successStatus: 200,
  handler: (request) => services.fuelTransaction.viewFuelAccount(getParam(request, 'fleetCompanyId'))
});
