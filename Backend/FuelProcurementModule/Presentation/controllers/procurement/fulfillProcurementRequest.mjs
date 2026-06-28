import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const fulfillProcurementRequest = endpoint({
  method: 'put',
  path: '/api/procurement-requests/:id/fulfill',
  description: 'Fulfill an accepted procurement request.',
  successStatus: 200,
  responseSample: {
    id: 'pr-001',
    procurementStatus: 'FULFILLED'
  },
  handler: (request) => services.procurement.fulfillProcurementRequest(getParam(request, 'id'))
});
