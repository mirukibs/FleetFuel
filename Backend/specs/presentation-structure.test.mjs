import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import test from 'node:test';
import {getFunctions} from '../node_modules/bfast-function/src/controllers/resolver.mjs';

const presentationDir = new URL('../VehicleAndFleetTelemetryModule/Presentation/', import.meta.url);

const expectedEndpoints = [
  ['createFleet', 'post', '/api/fleets', 'controllers/fleet/createFleet.mjs'],
  ['updateFleetName', 'put', '/api/fleets/:id/name', 'controllers/fleet/updateFleetName.mjs'],
  ['createManager', 'post', '/api/managers', 'controllers/fleet-manager/createManager.mjs'],
  ['registerVehicle', 'post', '/api/vehicles', 'controllers/vehicle/registerVehicle.mjs'],
  ['updateVehicle', 'put', '/api/vehicles/:id', 'controllers/vehicle/updateVehicle.mjs'],
  ['assignVehicleToFleet', 'post', '/api/vehicles/:id/fleet', 'controllers/vehicle/assignVehicleToFleet.mjs'],
  ['removeVehicleFromFleet', 'delete', '/api/vehicles/:id', 'controllers/vehicle/removeVehicleFromFleet.mjs'],
  ['assignFuelSensor', 'post', '/api/vehicles/:id/fuel-sensor', 'controllers/vehicle/assignFuelSensor.mjs'],
  ['receiveSimulatedReading', 'post', '/api/telemetry/readings', 'controllers/telemetry/receiveSimulatedReading.mjs'],
  ['getFleetDashboard', 'get', '/api/fleets/:fleetId/dashboard', 'controllers/telemetry/getFleetDashboard.mjs']
];

test('presentation index does not re-export endpoint descriptors', async () => {
  const indexModule = await import(new URL('index.mjs', presentationDir));

  assert.deepEqual(Object.keys(indexModule), []);
});

test('bfast discovers every endpoint directly from its own module file', async () => {
  const functions = await getFunctions({
    bfastJsonPath: new URL('../bfast.json', import.meta.url).pathname,
    functionsDirPath: presentationDir.pathname
  });

  for (const [exportName, method, path] of expectedEndpoints) {
    const descriptor = functions[exportName];

    assert.equal(typeof descriptor, 'object', `${exportName} should be discovered`);
    assert.equal(descriptor.method, method);
    assert.equal(descriptor.path, path);
    assert.equal(typeof descriptor.onRequest, 'function');
  }
});

test('each documented HTTP endpoint is isolated in one endpoint module', async () => {
  for (const [exportName, method, path, relativeFile] of expectedEndpoints) {
    const endpointModule = await import(new URL(relativeFile, presentationDir));
    const entries = Object.entries(endpointModule);

    assert.deepEqual(
      entries.map(([name]) => name),
      [exportName],
      `${relativeFile} should export only ${exportName}`
    );

    const descriptor = endpointModule[exportName];
    assert.equal(descriptor.method, method);
    assert.equal(descriptor.path, path);
    assert.equal(typeof descriptor.onRequest, 'function');
  }
});

test('controller folders match the project presentation guideline', async () => {
  const controllersDir = new URL('controllers/', presentationDir);
  const folders = await readdir(controllersDir);
  const expectedFolders = ['fleet', 'fleet-manager', 'telemetry', 'vehicle'];

  assert.deepEqual(folders.sort(), expectedFolders);
});
