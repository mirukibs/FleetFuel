import { services } from '../../../Infrastructure/applicationContainer.mjs';
import { endpoint, getParam } from '../../shared/respond.mjs';

export const updateCompanyDetails = endpoint({
  method: 'put',
  path: '/api/fleet-companies/:id',
  description: 'Update the details of a Fleet Company.',
  successStatus: 200,
  requestSample: {
    companyName: 'Acme Super Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane.doe@acmesuper.com',
    phoneNumber: '555-4321'
  },
  responseSample: {
    id: 'fc-001',
    companyName: 'Acme Super Logistics',
    contactPerson: 'Jane Doe',
    email: 'jane.doe@acmesuper.com',
    phoneNumber: '555-4321',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  },
  handler: (request) => services.fleetCompany.updateCompanyDetails(
    getParam(request, 'id'),
    request.body ?? {}
  )
});
