import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const listFleets = endpoint({
  method: 'get',
  path: '/api/fleets',
  description: 'List all fleets.',
  responseSample: [
    {
      id: 'fleet-001',
      name: 'Dar es Salaam Delivery Fleet',
      fleetManagerId: 'manager-001'
    }
  ],
  handler: (request) => {
    if (request.query?.fleetCompanyId) {
      return services.fleet.listFleetsByCompany(request.query.fleetCompanyId);
    }
    return services.fleet.listFleets();
  }
});
