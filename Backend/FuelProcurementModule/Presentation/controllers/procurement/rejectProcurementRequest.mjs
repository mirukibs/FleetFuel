import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const rejectProcurementRequest = endpoint({
  method: 'put',
  path: '/api/procurement-requests/:id/reject',
  description: 'Reject a submitted procurement request.',
  successStatus: 200,
  responseSample: {
    id: 'pr-001',
    procurementStatus: 'REJECTED'
  },
  handler: (request) => services.procurement.rejectProcurementRequest(getParam(request, 'id'))
});
