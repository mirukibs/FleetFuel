import { services } from '../../Infrastructure/applicationContainer.mjs';
import { endpoint, getBearerToken } from '../shared/respond.mjs';

export const logout = endpoint({
  method: 'post',
  path: '/api/auth/logout',
  description: 'Invalidate the current bearer session token.',
  responseSample: {
    loggedOut: true
  },
  handler: request => services.auth.logout(getBearerToken(request))
});
