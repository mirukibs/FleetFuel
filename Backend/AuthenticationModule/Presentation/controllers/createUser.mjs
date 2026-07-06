import { services } from '../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../shared/respond.mjs';

export const createUser = endpoint({
  method: 'post',
  path: '/api/auth/users',
  description: 'Create an application user for a fuel supplier or fleet company.',
  successStatus: 201,
  requestSample: {
    email: 'buyer@example.com',
    password: 'secret-123',
    role: 'fleet_company'
  },
  responseSample: {
    id: 'user-001',
    email: 'buyer@example.com',
    role: 'fleet_company',
    affiliatedServiceId: 'fc-001'
  },
  handler: request => services.auth.createUser(request.body ?? {})
});
