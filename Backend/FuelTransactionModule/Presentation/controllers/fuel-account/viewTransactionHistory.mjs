import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const viewTransactionHistory = endpoint({
  method: 'get',
  path: '/api/fuel-accounts/:fleetCompanyId/transactions',
  description: 'Get the transaction history for a fleet company fuel account.',
  successStatus: 200,
  handler: (request) => services.fuelTransaction.viewTransactionHistory(getParam(request, 'fleetCompanyId'))
});
