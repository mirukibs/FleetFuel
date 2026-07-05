import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const getFleetCompany = endpoint({
  method: 'get',
  path: '/api/fleet-companies/:id',
  description: 'Get details of a specific Fleet Company.',
  successStatus: 200,
  responseSample: {
    id: 'fc-001',
    companyName: 'Acme Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane@acme.com',
    phoneNumber: '555-1234',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  handler: (request) => services.fleetCompany.getFleetCompany(getParam(request, 'id'))
});
