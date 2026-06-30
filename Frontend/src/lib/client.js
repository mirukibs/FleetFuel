/**
 * FleetFuel API Client
 * Encapsulates communication with the BFast Backend (Port 3003)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.status !== 204 ? response.json() : null;
}

export const FleetFuelApi = {
  managers: {
    list: () => request('/api/managers'),
    get: (id) => request(`/api/managers/${id}`),
    create: (data) => request('/api/managers', { method: 'POST', body: JSON.stringify(data) }),
  },
  fleets: {
    list: () => request('/api/fleets'),
    get: (id) => request(`/api/fleets/${id}`),
    create: (data) => request('/api/fleets', { method: 'POST', body: JSON.stringify(data) }),
    updateName: (id, name) => request(`/api/fleets/${id}/name`, { method: 'PUT', body: JSON.stringify({ name }) }),
    getDashboard: (fleetId) => request(`/api/fleets/${fleetId}/dashboard`),
    listVehicles: (fleetId) => request(`/api/fleets/${fleetId}/vehicles`),
  },
  vehicles: {
    list: () => request('/api/vehicles'),
    get: (id) => request(`/api/vehicles/${id}`),
    register: (data) => request('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    assignToFleet: (id, fleetId) => request(`/api/vehicles/${id}/fleet`, { method: 'POST', body: JSON.stringify({ fleetId }) }),
    removeFromFleet: (id) => request(`/api/vehicles/${id}/fleet`, { method: 'DELETE' }),
    assignFuelSensor: (id, sensorData) => request(`/api/vehicles/${id}/fuel-sensor`, { method: 'POST', body: JSON.stringify(sensorData) }),
  },
  telemetry: {
    listReadings: () => request('/api/telemetry/readings'),
    listVehicleReadings: (vehicleId) => request(`/api/vehicles/${vehicleId}/telemetry/readings`),
    submitReading: (data) => request('/api/telemetry/readings', { method: 'POST', body: JSON.stringify(data) }),
  },
  system: {
    /**
     * Useful for debugging: Checks if the BFast engine is responsive
     * and lists all discovered endpoint descriptors.
     */
    health: () => request('/functions-health'),
    listEndpoints: () => request('/functions-all?format=json'),
  },
  fleetCompanies: {
    list: () => request('/api/fleet-companies'),
    get: (id) => request(`/api/fleet-companies/${id}`),
    register: (data) => request('/api/fleet-companies', { method: 'POST', body: JSON.stringify(data) }),
    updateDetails: (id, data) => request(`/api/fleet-companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  fuelSuppliers: {
    list: () => request('/api/fuel-suppliers'),
    getOffers: (id) => request(`/api/fuel-suppliers/${id}/offers`),
    register: (data) => request('/api/fuel-suppliers', { method: 'POST', body: JSON.stringify(data) }),
    updateDetails: (id, data) => request(`/api/fuel-suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    addOffer: (id, data) => request(`/api/fuel-suppliers/${id}/offers`, { method: 'POST', body: JSON.stringify(data) }),
    updateOffer: (id, data) => request(`/api/fuel-suppliers/${id}/offers`, { method: 'PUT', body: JSON.stringify(data) }),
    removeOffer: (id, fuelType) => request(`/api/fuel-suppliers/${id}/offers/${fuelType}`, { method: 'DELETE' }),
    comparePrices: (fuelType) => request(`/api/fuel-offers/compare/${fuelType}`),
  },
  procurement: {
    listByCompany: (companyId) => request(`/api/fleet-companies/${companyId}/procurement-requests`),
    listBySupplier: (supplierId) => request(`/api/fuel-suppliers/${supplierId}/procurement-requests`),
    get: (id) => request(`/api/procurement-requests/${id}`),
    create: (data) => request('/api/procurement-requests', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/procurement-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    submit: (id) => request(`/api/procurement-requests/${id}/submit`, { method: 'PUT' }),
    accept: (id) => request(`/api/procurement-requests/${id}/accept`, { method: 'PUT' }),
    reject: (id) => request(`/api/procurement-requests/${id}/reject`, { method: 'PUT' }),
    fulfill: (id) => request(`/api/procurement-requests/${id}/fulfill`, { method: 'PUT' }),
  }
};
