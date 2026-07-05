import assert from 'node:assert/strict';
import test from 'node:test';
import {createFleet} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet/createFleet.mjs';
import {getFleet} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet/getFleet.mjs';
import {listFleetVehicles} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet/listFleetVehicles.mjs';
import {listFleets} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet/listFleets.mjs';
import {createManager} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet-manager/createManager.mjs';
import {getManager} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet-manager/getManager.mjs';
import {listManagers} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/fleet-manager/listManagers.mjs';
import {getFleetDashboard} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/getFleetDashboard.mjs';
import {listTelemetryReadings} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/listTelemetryReadings.mjs';
import {listVehicleTelemetryReadings} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/listVehicleTelemetryReadings.mjs';
import {receiveSimulatedReading} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/telemetry/receiveSimulatedReading.mjs';
import {assignFuelSensor} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/assignFuelSensor.mjs';
import {deleteVehicle} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/deleteVehicle.mjs';
import {getVehicle} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/getVehicle.mjs';
import {listVehicles} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/listVehicles.mjs';
import {registerVehicle} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/registerVehicle.mjs';
import {removeVehicleFromFleet} from '../VehicleAndFleetTelemetryModule/Presentation/controllers/vehicle/removeVehicleFromFleet.mjs';
import {resetInMemoryDatabase} from '../VehicleAndFleetTelemetryModule/Infrastructure/database/inMemoryDatabase.mjs';
import {FuelSensor} from '../VehicleAndFleetTelemetryModule/Domain/entities/FuelSensor.mjs';
import {FuelSensorReading} from '../VehicleAndFleetTelemetryModule/Domain/entities/FuelSensorReading.mjs';

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

const invoke = async (endpoint, {body = {}, params = {}, query = {}} = {}) => {
  const response = createResponse();
  await endpoint.onRequest({body, params, query}, response);
  return response;
};

test('fleet manager, fleet, vehicle, sensor, telemetry, and dashboard flow uses in-memory persistence', async () => {
  resetInMemoryDatabase();

  const manager = await invoke(createManager, {
    body: {
      id: 'manager-001',
      firstName: 'Asha',
      lastName: 'Mollel',
      email: 'asha@example.com',
      fleetCompanyId: 'fc-test-001'
    }
  });
  assert.equal(manager.statusCode, 201);
  assert.equal(manager.body.fullName, 'Asha Mollel');

  const fleet = await invoke(createFleet, {
    body: {
      id: 'fleet-001',
      name: 'Dar es Salaam Delivery Fleet',
      fleetManagerId: 'manager-001',
      fleetCompanyId: 'fc-test-001'
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
      sensorId: 'FS-1234',
      serialNo: 'FS-1234'
    }
  });
  assert.equal(sensor.statusCode, 200);
  assert.equal(sensor.body.sensor.serialNo, 'FS-1234');
  assert.equal(sensor.body.sensor.entityType, 'FuelSensor');

  const reading = await invoke(receiveSimulatedReading, {
    body: {
      vehicleId: 'vehicle-001',
      fuelLevel: 62.5,
      timestamp: '2026-05-24T18:57:21.121Z'
    }
  });
  assert.equal(reading.statusCode, 201);
  assert.equal(reading.body.fuelLevel, 62.5);
  assert.equal(reading.body.entityType, 'FuelSensorReading');
  assert.equal(reading.body.alertTriggered, false);

  const dashboard = await invoke(getFleetDashboard, {
    params: {fleetId: 'fleet-001'}
  });
  assert.equal(dashboard.statusCode, 200);
  assert.equal(dashboard.body.fleetId, 'fleet-001');
  assert.equal(dashboard.body.vehicles.length, 1);
  assert.equal(dashboard.body.vehicles[0].currentFuelLevel, 62.5);

  const managers = await invoke(listManagers);
  assert.equal(managers.statusCode, 200);
  assert.equal(managers.body.length, 1);

  const managerDetail = await invoke(getManager, {
    params: {id: 'manager-001'}
  });
  assert.equal(managerDetail.statusCode, 200);
  assert.equal(managerDetail.body.email, 'asha@example.com');

  const fleets = await invoke(listFleets);
  assert.equal(fleets.statusCode, 200);
  assert.equal(fleets.body.length, 1);

  const fleetDetail = await invoke(getFleet, {
    params: {id: 'fleet-001'}
  });
  assert.equal(fleetDetail.statusCode, 200);
  assert.equal(fleetDetail.body.name, 'Dar es Salaam Delivery Fleet');

  const vehicles = await invoke(listVehicles);
  assert.equal(vehicles.statusCode, 200);
  assert.equal(vehicles.body.length, 1);

  const vehicleDetail = await invoke(getVehicle, {
    params: {id: 'vehicle-001'}
  });
  assert.equal(vehicleDetail.statusCode, 200);
  assert.equal(vehicleDetail.body.sensor.serialNo, 'FS-1234');

  const fleetVehicles = await invoke(listFleetVehicles, {
    params: {fleetId: 'fleet-001'}
  });
  assert.equal(fleetVehicles.statusCode, 200);
  assert.equal(fleetVehicles.body.length, 1);

  const vehicleReadings = await invoke(listVehicleTelemetryReadings, {
    params: {id: 'vehicle-001'}
  });
  assert.equal(vehicleReadings.statusCode, 200);
  assert.equal(vehicleReadings.body.length, 1);
  assert.equal(vehicleReadings.body[0].fuelLevel, 62.5);

  const queryReadings = await invoke(listTelemetryReadings, {
    query: {vehicleId: 'vehicle-001'}
  });
  assert.equal(queryReadings.statusCode, 200);
  assert.equal(queryReadings.body.length, 1);

  const removedFromFleet = await invoke(removeVehicleFromFleet, {
    params: {id: 'vehicle-001'}
  });
  assert.equal(removedFromFleet.statusCode, 200);
  assert.equal(removedFromFleet.body.fleetId, null);

  const emptyFleetVehicles = await invoke(listFleetVehicles, {
    params: {fleetId: 'fleet-001'}
  });
  assert.equal(emptyFleetVehicles.statusCode, 200);
  assert.equal(emptyFleetVehicles.body.length, 0);

  const deletedVehicle = await invoke(deleteVehicle, {
    params: {id: 'vehicle-001'}
  });
  assert.equal(deletedVehicle.statusCode, 200);
  assert.equal(deletedVehicle.body.deleted, true);
});

test('endpoint handlers return validation errors instead of not-implemented responses', async () => {
  resetInMemoryDatabase();

  const response = await invoke(createFleet, {
    body: {
      name: '',
      fleetCompanyId: 'fc-test-001'
    }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'ValidationError');
});

test('fuel sensor and fuel sensor reading are explicit domain entities', () => {
  const sensor = new FuelSensor({
    id: 'FS-1234',
    serialNo: 'FS-1234'
  });
  const reading = new FuelSensorReading({
    id: 'reading-001',
    vehicleId: 'vehicle-001',
    fuelLevel: 62.5,
    timestamp: '2026-05-24T18:57:21.121Z'
  });

  assert.equal(sensor.getId(), 'FS-1234');
  assert.equal(sensor.getSerialNo(), 'FS-1234');
  assert.equal(sensor.toJSON().entityType, 'FuelSensor');
  assert.equal(reading.getFuelLevel(), 62.5);
  assert.equal(reading.toJSON().entityType, 'FuelSensorReading');
});
