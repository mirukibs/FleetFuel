import {services} from '../../../Infrastructure/applicationContainer.mjs';
import {endpoint} from '../../shared/respond.mjs';

export const listManagers = endpoint({
  method: 'get',
  path: '/api/managers',
  description: 'List fleet managers.',
  responseSample: [
    {
      id: 'manager-001',
      fullName: 'Asha Mollel',
      email: 'asha@example.com'
    }
  ],
  handler: () => services.manager.listManagers()
});
