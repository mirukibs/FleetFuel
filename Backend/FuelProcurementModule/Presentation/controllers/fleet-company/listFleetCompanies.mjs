import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint } from '../../shared/respond.mjs';

export const listFleetCompanies = endpoint({
  method: 'get',
  path: '/api/fleet-companies',
  description: 'List all registered Fleet Companies.',
  successStatus: 200,
  responseSample: [{
    id: 'fc-001',
    companyName: 'Acme Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.com',
    phoneNumber: '555-1234',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }],
  handler: () => services.fleetCompany.listFleetCompanies()
});
