import test from "node:test";
import assert from "node:assert";

import { FuelType } from "../SharedKernel/enums/FuelType.mjs";
import { FuelTransaction } from "../FuelTransactionModule/Domain/entities/FuelTransaction.mjs";
import { FuelAccount } from "../FuelTransactionModule/Domain/entities/FuelAccount.mjs";

test("FuelTransaction Domain Rules", async (t) => {
  
  await t.test("FuelTransaction validates required fields and quantity", () => {
    assert.throws(
      () => FuelTransaction.create("", FuelType.DIESEL, 50),
      /Vehicle ID is required/,
      "Should reject empty vehicle ID"
    );

    assert.throws(
      () => FuelTransaction.create("vehicle-1", FuelType.DIESEL, -10),
      /Quantity in litres must be greater than zero/,
      "Should reject negative quantity"
    );

    const tx = FuelTransaction.create("vehicle-1", FuelType.DIESEL, 50, new Date().toISOString());
    assert.strictEqual(tx.getVehicleId(), "vehicle-1");
    assert.strictEqual(tx.fuelType, FuelType.DIESEL);
    assert.strictEqual(tx.getQuantityLitres(), 50);
    assert.ok(tx.getTimestamp());
  });

  await t.test("FuelAccount validates creation", () => {
    assert.throws(
      () => FuelAccount.create(""),
      /Fleet company ID is required/,
      "Should reject empty fleet company ID"
    );

    const account = FuelAccount.create("fleet-1");
    assert.strictEqual(account.fleetCompanyId, "fleet-1");
    assert.strictEqual(account.balances[FuelType.DIESEL] || 0, 0);
  });

  await t.test("FuelAccount handles fuel deposit", () => {
    const account = FuelAccount.create("fleet-1");
    
    assert.throws(
      () => account.depositFuel(FuelType.DIESEL, -10),
      /Deposit quantity must be greater than zero/,
      "Should reject negative deposit"
    );

    assert.throws(
      () => account.depositFuel("INVALID_FUEL", 100),
      /Invalid fuel type/,
      "Should reject invalid fuel type"
    );

    account.depositFuel(FuelType.DIESEL, 1000);
    assert.strictEqual(account.balances[FuelType.DIESEL], 1000);
    
    account.depositFuel(FuelType.DIESEL, 500);
    assert.strictEqual(account.balances[FuelType.DIESEL], 1500);

    account.depositFuel(FuelType.PETROL, 200);
    assert.strictEqual(account.balances[FuelType.PETROL], 200);

    // Limit to 2 fuel types test
    assert.throws(
      () => account.depositFuel(FuelType.ELECTRICITY, 100),
      /A fuel account cannot hold more than 2 fuel types/,
      "Should reject more than 2 fuel types"
    );
  });

  await t.test("FuelAccount handles simulateRefueling", () => {
    const account = FuelAccount.create("fleet-1");
    account.depositFuel(FuelType.PETROL, 500);
    
    // Cannot refuel more than balance
    assert.throws(
      () => account.simulateRefueling("vehicle-1", FuelType.PETROL, 600, new Date().toISOString()),
      /Insufficient PETROL fuel balance for refueling/,
      "Should guard against overdrawing fuel"
    );

    // Negative refueling
    assert.throws(
      () => account.simulateRefueling("vehicle-1", FuelType.PETROL, -50, new Date().toISOString()),
      /Refueling quantity must be greater than zero/,
      "Should guard against negative refueling"
    );

    // Successful refueling
    const timestamp = new Date().toISOString();
    account.simulateRefueling("vehicle-1", FuelType.PETROL, 100, timestamp);
    
    assert.strictEqual(account.balances[FuelType.PETROL], 400, "Balance should be deducted");
    
    const txs = account.getTransactions();
    assert.strictEqual(txs.length, 1);
    assert.strictEqual(txs[0].getVehicleId(), "vehicle-1");
    assert.strictEqual(txs[0].fuelType, FuelType.PETROL);
    assert.strictEqual(txs[0].getQuantityLitres(), 100);
    assert.strictEqual(txs[0].getTimestamp(), timestamp);
  });
});
