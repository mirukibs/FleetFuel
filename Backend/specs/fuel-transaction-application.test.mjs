import test from "node:test";
import assert from "node:assert";

import { FuelType } from "../SharedKernel/enums/FuelType.mjs";
import { FuelTransactionApplicationService } from "../FuelTransactionModule/Application/services/FuelTransactionApplicationService.mjs";
import { InMemoryFuelAccountRepository } from "../FuelTransactionModule/Infrastructure/repositories/InMemoryFuelAccountRepository.mjs";
import { resetInMemoryDatabase } from "../FuelTransactionModule/Infrastructure/database/inMemoryDatabase.mjs";

test("FuelTransaction Application Service", async (t) => {
  let appService;
  let repo;

  t.beforeEach(() => {
    resetInMemoryDatabase();
    repo = new InMemoryFuelAccountRepository();
    appService = new FuelTransactionApplicationService({ fuelAccountRepository: repo });
  });

  await t.test("depositFuel creates new account if it doesn't exist", () => {
    appService.depositFuel({
      fleetCompanyId: "fleet-1",
      fuelType: FuelType.DIESEL,
      quantityLitres: 1000
    });

    const account = repo.findByFleetCompanyId("fleet-1");
    assert.ok(account, "Account should be created");
    assert.strictEqual(account.balances[FuelType.DIESEL], 1000);
  });

  await t.test("depositFuel adds to existing account", () => {
    appService.depositFuel({
      fleetCompanyId: "fleet-1",
      fuelType: FuelType.DIESEL,
      quantityLitres: 500
    });
    
    appService.depositFuel({
      fleetCompanyId: "fleet-1",
      fuelType: FuelType.DIESEL,
      quantityLitres: 200
    });

    const account = appService.viewFuelAccount("fleet-1");
    assert.strictEqual(account.balances[FuelType.DIESEL], 700);
  });

  await t.test("simulateRefueling deducts balance and records transaction", () => {
    appService.depositFuel({
      fleetCompanyId: "fleet-1",
      fuelType: FuelType.PETROL,
      quantityLitres: 1000
    });

    const timestamp = new Date().toISOString();
    appService.simulateRefueling({
      fleetCompanyId: "fleet-1",
      vehicleId: "vehicle-A",
      fuelType: FuelType.PETROL,
      quantityLitres: 300,
      timestamp
    });

    const account = appService.viewFuelAccount("fleet-1");
    assert.strictEqual(account.balances[FuelType.PETROL], 700);

    const history = appService.viewTransactionHistory("fleet-1");
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].vehicleId, "vehicle-A");
    assert.strictEqual(history[0].fuelType, FuelType.PETROL);
    assert.strictEqual(history[0].quantityLitres, 300);
  });

  await t.test("simulateRefueling throws if account not found", () => {
    assert.throws(
      () => appService.simulateRefueling({
        fleetCompanyId: "non-existent",
        vehicleId: "vehicle-B",
        fuelType: FuelType.DIESEL,
        quantityLitres: 50
      }),
      /FuelAccount for FleetCompany non-existent not found/
    );
  });
  
  await t.test("viewFuelAccount throws if account not found", () => {
    assert.throws(
      () => appService.viewFuelAccount("ghost-fleet"),
      /FuelAccount for FleetCompany ghost-fleet not found/
    );
  });
});
