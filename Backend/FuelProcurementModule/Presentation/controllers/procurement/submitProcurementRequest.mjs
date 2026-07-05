import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const submitProcurementRequest = endpoint({
  method: 'put',
  path: '/api/procurement-requests/:id/submit',
  description: 'Submit a draft procurement request.',
  successStatus: 200,
  responseSample: {
    id: 'pr-001',
    procurementStatus: 'SUBMITTED'
  },
  handler: (request) => services.procurement.submitProcurementRequest(getParam(request, 'id'))
});
