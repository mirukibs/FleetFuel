import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const createManager = endpoint({
  method: 'post',
  path: '/api/managers',
  description: 'Create a fleet manager profile.',
  successStatus: 201,
  requestSample: {
    firstName: 'Asha',
    lastName: 'Mollel',
    email: 'asha@example.com'
  },
  responseSample: {
    id: 'manager-001',
    fullName: 'Asha Mollel',
    email: 'asha@example.com'
  },
  handler: (request) => services.manager.createManager(request.body ?? {})
});
