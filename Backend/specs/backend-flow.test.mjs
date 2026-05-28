import assert from 'node:assert/strict';
import test from 'node:test';
import {createFleet} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet/createFleet.mjs';
import {createManager} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet-manager/createManager.mjs';
import {getFleetDashboard} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/getFleetDashboard.mjs';
import {receiveSimulatedReading} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/receiveSimulatedReading.mjs';
import {assignFuelSensor} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/assignFuelSensor.mjs';
import {registerVehicle} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/registerVehicle.mjs';
import {resetInMemoryDatabase} from '../VehicleAndFleetTelemetryModule/Infrastructure/database/inMemoryDatabase.mjs';

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
  return response;
};

const invoke = async (endpoint, {body = {}, params = {}} = {}) => {
  const response = createResponse();
  await endpoint.onRequest({body, params}, response);
  return response;
};

test('fleet manager, fleet, vehicle, sensor, telemetry, and dashboard flow uses in-memory persistence', async () => {
  resetInMemoryDatabase();

  const manager = await invoke(createManager, {
    body: {
      id: 'manager-001',
      firstName: 'Asha',
      lastName: 'Mollel',
      email: 'asha@example.com'
    }
  });
  assert.equal(manager.statusCode, 201);
  assert.equal(manager.body.fullName, 'Asha Mollel');

  const fleet = await invoke(createFleet, {
    body: {
      id: 'fleet-001',
      name: 'Dar es Salaam Delivery Fleet',
      fleetManagerId: 'manager-001'
    }
  });
  assert.equal(fleet.statusCode, 201);
  assert.equal(fleet.body.name, 'Dar es Salaam Delivery Fleet');

  const vehicle = await invoke(registerVehicle, {
    body: {
      id: 'vehicle-001',
      fleetId: 'fleet-001',
      make: 'Toyota',
      model: 'Hilux',
      year: 2022,
      type: 'Truck',
      licensePlate: 'T123ABC'
    }
  });
  assert.equal(vehicle.statusCode, 201);
  assert.equal(vehicle.body.fleetId, 'fleet-001');

  const sensor = await invoke(assignFuelSensor, {
    params: {id: 'vehicle-001'},
    body: {
      sensorId: 'sensor-001',
      serialNo: 'FF-SENSOR-001'
    }
  });
  assert.equal(sensor.statusCode, 200);
  assert.equal(sensor.body.sensor.serialNo, 'FF-SENSOR-001');

  const reading = await invoke(receiveSimulatedReading, {
    body: {
      vehicleId: 'vehicle-001',
      fuelLevel: 62.5,
      timestamp: '2026-05-24T18:57:21.121Z'
    }
  });
  assert.equal(reading.statusCode, 201);
  assert.equal(reading.body.fuelLevel, 62.5);
  assert.equal(reading.body.alertTriggered, false);

  const dashboard = await invoke(getFleetDashboard, {
    params: {fleetId: 'fleet-001'}
  });
  assert.equal(dashboard.statusCode, 200);
  assert.equal(dashboard.body.fleetId, 'fleet-001');
  assert.equal(dashboard.body.vehicles.length, 1);
  assert.equal(dashboard.body.vehicles[0].currentFuelLevel, 62.5);
});

test('endpoint handlers return validation errors instead of not-implemented responses', async () => {
  resetInMemoryDatabase();

  const response = await invoke(createFleet, {
    body: {
      name: ''
    }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'ValidationError');
});
