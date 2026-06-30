import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const registerFleetCompany = endpoint({
  method: 'post',
  path: '/api/fleet-companies',
  description: 'Register a new Fleet Company acting as a fuel buyer.',
  successStatus: 201,
  requestSample: {
    companyName: 'Acme Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.com',
    phoneNumber: '555-1234'
  },
  responseSample: {
    id: 'fc-001',
    companyName: 'Acme Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.com',
    phoneNumber: '555-1234',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  handler: (request) => services.fleetCompany.registerFleetCompany(request.body ?? {})
});
