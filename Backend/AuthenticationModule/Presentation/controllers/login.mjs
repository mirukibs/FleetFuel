import { services } from '../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../shared/respond.mjs';

export const login = endpoint({
  method: 'post',
  path: '/api/auth/login',
  description: 'Authenticate a user and return a session token.',
  requestSample: {
    email: 'buyer@example.com',
    password: 'secret-123'
  },
  responseSample: {
    token: 'session-token',
    user: {
      email: 'buyer@example.com',
      role: 'fleet_company',
      affiliatedServiceId: 'fc-001'
    }
  },
  handler: request => services.auth.login(request.body ?? {})
});
