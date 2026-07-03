import assert from 'node:assert/strict';
import test from 'node:test';

import { depositFuel } from '../FuelTransactionModule/Presentation/controllers/fuel-account/depositFuel.mjs';
import { simulateRefueling } from '../FuelTransactionModule/Presentation/controllers/fuel-account/simulateRefueling.mjs';
import { viewFuelAccount } from '../FuelTransactionModule/Presentation/controllers/fuel-account/viewFuelAccount.mjs';
import { viewFuelBalance } from '../FuelTransactionModule/Presentation/controllers/fuel-account/viewFuelBalance.mjs';
import { viewTransactionHistory } from '../FuelTransactionModule/Presentation/controllers/fuel-account/viewTransactionHistory.mjs';

test('FuelTransaction Presentation structure matches bfast expectations', () => {
  const endpoints = [
    { module: depositFuel, method: 'post', path: '/api/fuel-accounts/deposit' },
    { module: simulateRefueling, method: 'post', path: '/api/fuel-accounts/simulate-refueling' },
    { module: viewFuelAccount, method: 'get', path: '/api/fuel-accounts/:fleetCompanyId' },
    { module: viewFuelBalance, method: 'get', path: '/api/fuel-accounts/:fleetCompanyId/balance' },
    { module: viewTransactionHistory, method: 'get', path: '/api/fuel-accounts/:fleetCompanyId/transactions' }
  ];

  for (const ep of endpoints) {
    assert.equal(ep.module.method, ep.method, `Method should match for ${ep.path}`);
    assert.equal(ep.module.path, ep.path, `Path should match for ${ep.path}`);
    assert.equal(typeof ep.module.onRequest, 'function', `onRequest should be a function for ${ep.path}`);
  }
});
