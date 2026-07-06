import { services } from '../../Infrastructure/applicationContainer.mjs';
import { endpoint, getBearerToken } from '../shared/respond.mjs';

export const getSession = endpoint({
  method: 'get',
  path: '/api/auth/session',
  description: 'Return the current authenticated user for a bearer session token.',
  responseSample: {
    user: {
      email: 'buyer@example.com',
      role: 'fleet_company',
      affiliatedServiceId: 'fc-001'
    }
  },
  handler: request => services.auth.getSession(getBearerToken(request))
});
