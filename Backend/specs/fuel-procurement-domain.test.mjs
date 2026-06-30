import test from "node:test";
import assert from "node:assert";

import { FuelType } from "../FuelProcurementModule/Domain/enums/FuelType.mjs";
import { ProcurementRequestStatus } from "../FuelProcurementModule/Domain/enums/ProcurementRequestStatus.mjs";
import { FuelOffer } from "../FuelProcurementModule/Domain/value-objects/FuelOffer.mjs";
import { ProcurementRequest } from "../FuelProcurementModule/Domain/entities/ProcurementRequest.mjs";

test("FuelProcurement Domain Rules", async (t) => {
  
  await t.test("FuelOffer validates negative values", () => {
    assert.throws(
      () => FuelOffer.create(FuelType.DIESEL, -10, 1000, 100),
      /Price per unit must be greater than zero/,
      "Should reject negative price"
    );

    assert.throws(
      () => FuelOffer.create(FuelType.DIESEL, 10, -500, 100),
      /Available quantity cannot be negative/,
      "Should reject negative available quantity"
    );

    const validOffer = FuelOffer.create(FuelType.PETROL, 2500, 5000, 500);
    assert.strictEqual(validOffer.getFuelType(), FuelType.PETROL);
    assert.strictEqual(validOffer.getPricePerUnit(), 2500);
  });

  await t.test("ProcurementRequest calculates total cost", () => {
    const request = ProcurementRequest.create(
      "fleet-1",
      "supplier-1",
      FuelType.DIESEL,
      2000,
      3000
    );

    assert.strictEqual(request.getFuelQuantityLitres(), 2000);
    assert.strictEqual(request.getUnitPrice(), 3000);
    assert.strictEqual(request.getTotalCost(), 6000000); // 2000 * 3000
  });

  await t.test("ProcurementRequest enforces state transitions", () => {
    const request = ProcurementRequest.create(
      "fleet-1",
      "supplier-1",
      FuelType.PETROL,
      1000,
      3200
    );

    assert.strictEqual(request.procurementStatus, ProcurementRequestStatus.DRAFT);

    // Can only submit from DRAFT
    request.submit();
    assert.strictEqual(request.procurementStatus, ProcurementRequestStatus.SUBMITTED);

    // Cannot submit again
    assert.throws(
      () => request.submit(),
      /Cannot submit a request from status/,
      "Should not allow double submit"
    );

    // Reject it
    request.reject();
    assert.strictEqual(request.procurementStatus, ProcurementRequestStatus.REJECTED);

    // Guard: [REJECTED -> ACCEPTED] is invalid
    assert.throws(
      () => request.accept(),
      /Cannot accept a request from status: REJECTED/,
      "Should prevent illegal transition to ACCEPTED from REJECTED"
    );
  });

  await t.test("ProcurementRequest guards updateDetails after submission", () => {
    const request = ProcurementRequest.create(
      "fleet-1",
      "supplier-1",
      FuelType.DIESEL,
      500,
      2500
    );

    // Can update while in DRAFT
    request.updateDetails(600, 2600);
    assert.strictEqual(request.getFuelQuantityLitres(), 600);
    assert.strictEqual(request.getTotalCost(), 1560000);

    // Submit the request
    request.submit();

    // Updating after submission is forbidden
    assert.throws(
      () => request.updateDetails(700, 2700),
      /Cannot update details for a request in status: SUBMITTED/,
      "Should prevent detail changes after submission"
    );
  });
});
