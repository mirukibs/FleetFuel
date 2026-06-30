import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint, getParam} from '../../shared/respond.mjs';

export const getManager = endpoint({
  method: 'get',
  path: '/api/managers/:id',
  description: 'Get fleet manager details.',
  responseSample: {
    id: 'manager-001',
    fullName: 'Asha Mollel',
    email: 'asha@example.com'
  },
  handler: (request) => services.manager.getManager(getParam(request, 'id'))
});
