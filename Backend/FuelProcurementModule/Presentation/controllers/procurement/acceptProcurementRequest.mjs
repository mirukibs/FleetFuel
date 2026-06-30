import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const acceptProcurementRequest = endpoint({
  method: 'put',
  path: '/api/procurement-requests/:id/accept',
  description: 'Accept a submitted procurement request.',
  successStatus: 200,
  responseSample: {
    id: 'pr-001',
    procurementStatus: 'ACCEPTED'
  },
  handler: (request) => services.procurement.acceptProcurementRequest(getParam(request, 'id'))
});
