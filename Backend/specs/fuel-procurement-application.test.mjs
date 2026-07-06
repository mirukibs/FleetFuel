import test from "node:test";
import assert from "node:assert";

import { FleetCompanyApplicationService } from "../FuelProcurementModule/Application/services/FleetCompanyApplicationService.mjs";
import { FuelSupplierApplicationService } from "../FuelProcurementModule/Application/services/FuelSupplierApplicationService.mjs";
import { ProcurementApplicationService } from "../FuelProcurementModule/Application/services/ProcurementApplicationService.mjs";
import { FuelType } from "../SharedKernel/enums/FuelType.mjs";
import { ProcurementRequestStatus } from "../FuelProcurementModule/Domain/enums/ProcurementRequestStatus.mjs";
import { DomainError } from "../FuelProcurementModule/Domain/errors.mjs";

class MockFleetCompanyRepo {
  constructor() {
    this.companies = new Map();
  }
  save(company) {
    this.companies.set(company.id, company);
  }
  findById(id) {
    return this.companies.get(id) || null;
  }
  findAll() {
    return Array.from(this.companies.values());
  }
}

class MockFuelSupplierRepo {
  constructor() {
    this.suppliers = new Map();
  }
  save(supplier) {
    this.suppliers.set(supplier.id, supplier);
  }
  findById(id) {
    return this.suppliers.get(id) || null;
  }
  findAll() {
    return Array.from(this.suppliers.values());
  }
}

class MockProcurementRepo {
  constructor() {
    this.requests = new Map();
  }
  save(request) {
    this.requests.set(request.id, request);
  }
  findById(id) {
    return this.requests.get(id) || null;
  }
  findByFleetCompanyId(fleetCompanyId) {
    return Array.from(this.requests.values()).filter(r => r.fleetCompanyId === fleetCompanyId);
  }
  findByFuelSupplierId(fuelSupplierId) {
    return Array.from(this.requests.values()).filter(r => r.fuelSupplierId === fuelSupplierId);
  }
}

test("FuelProcurement Application Layer", async (t) => {

  const fleetRepo = new MockFleetCompanyRepo();
  const supplierRepo = new MockFuelSupplierRepo();
  const procurementRepo = new MockProcurementRepo();

  const fleetAppService = new FleetCompanyApplicationService({ fleetCompanyRepo: fleetRepo });
  const supplierAppService = new FuelSupplierApplicationService({ fuelSupplierRepo: supplierRepo });
  const procurementAppService = new ProcurementApplicationService({ 
    procurementRepo, 
    fleetCompanyRepo: fleetRepo, 
    fuelSupplierRepo: supplierRepo 
  });

  await t.test("FleetCompanyApplicationService registers and updates companies", () => {
    const fc = fleetAppService.registerFleetCompany({
      id: "fc-1",
      companyName: "Acme Logistics",
      contactPerson: "John Doe",
      email: "john@acme.com",
      phoneNumber: "123-456"
    });
    assert.strictEqual(fc.id, "fc-1");
    assert.strictEqual(fc.companyName, "Acme Logistics");

    const updatedFc = fleetAppService.updateCompanyDetails("fc-1", {
      companyName: "Acme Super Logistics",
      contactPerson: "Jane Doe",
      email: "jane@acme.com",
      phoneNumber: "987-654"
    });
    assert.strictEqual(updatedFc.companyName, "Acme Super Logistics");

    const list = fleetAppService.listFleetCompanies();
    assert.strictEqual(list.length, 1);

    assert.throws(() => {
      fleetAppService.registerFleetCompany({
        id: "fc-2",
        companyName: "Duplicate",
        contactPerson: "Dup",
        email: "dup@acme.com",
        phoneNumber: "000-000"
      });
    }, /A fleet company is already registered on this instance/);
  });

  await t.test("FuelSupplierApplicationService registers suppliers and manages offers", () => {
    supplierAppService.registerFuelSupplier({
      id: "fs-1",
      supplierName: "Global Fuels",
      contactPerson: "Alice",
      email: "alice@globalfuels.com",
      phoneNumber: "555-1234"
    });

    assert.throws(() => {
      supplierAppService.registerFuelSupplier({
        id: "fs-1-dup",
        supplierName: "Global Fuels Dup",
        contactPerson: "Alice 2",
        email: "alice@globalfuels.com",
        phoneNumber: "555-0000"
      });
    }, /A supplier with this email is already registered/);

    supplierAppService.addFuelOffer("fs-1", {
      fuelType: FuelType.DIESEL,
      pricePerUnit: 1500,
      availableQuantityLitres: 100000,
      minimumOrderQuantityLitres: 500
    });

    const offers = supplierAppService.getSupplierFuelOffers("fs-1");
    assert.strictEqual(offers.length, 1);
    assert.strictEqual(offers[0].fuelType, FuelType.DIESEL);
    assert.strictEqual(offers[0].pricePerUnit, 1500);

    // Register second supplier to test comparison
    supplierAppService.registerFuelSupplier({
      id: "fs-2",
      supplierName: "Cheap Fuels",
      contactPerson: "Bob",
      email: "bob@cheapfuels.com",
      phoneNumber: "555-5678"
    });
    supplierAppService.addFuelOffer("fs-2", {
      fuelType: FuelType.DIESEL,
      pricePerUnit: 1400, // Cheaper!
      availableQuantityLitres: 50000,
      minimumOrderQuantityLitres: 1000
    });

    const comparison = supplierAppService.compareFuelPrices(FuelType.DIESEL);
    assert.strictEqual(comparison.length, 2);
    // Cheap fuels should be first because 1400 < 1500
    assert.strictEqual(comparison[0].supplierName, "Cheap Fuels");
    assert.strictEqual(comparison[1].supplierName, "Global Fuels");
  });

  await t.test("ProcurementApplicationService enforces quantity bounds", () => {
    // fs-2 offers diesel: min 1000, max 50000
    assert.throws(() => procurementAppService.createProcurementRequest({
      id: "pr-invalid-1",
      fleetCompanyId: "fc-1",
      fuelSupplierId: "fs-2",
      fuelType: FuelType.DIESEL,
      fuelQuantityLitres: 500,
      unitPrice: 1400
    }), /Requested quantity is below the minimum/);

    assert.throws(() => procurementAppService.createProcurementRequest({
      id: "pr-invalid-2",
      fleetCompanyId: "fc-1",
      fuelSupplierId: "fs-2",
      fuelType: FuelType.DIESEL,
      fuelQuantityLitres: 60000,
      unitPrice: 1400
    }), /Requested quantity exceeds the available/);
  });

  await t.test("ProcurementApplicationService coordinates procurement workflow", () => {
    // 1. Create a request
    const request = procurementAppService.createProcurementRequest({
      id: "pr-1",
      fleetCompanyId: "fc-1",
      fuelSupplierId: "fs-2",
      fuelType: FuelType.DIESEL,
      fuelQuantityLitres: 2000,
      unitPrice: 1400
    });
    
    assert.strictEqual(request.procurementStatus, ProcurementRequestStatus.DRAFT);
    assert.strictEqual(request.totalCost, 2800000); // 2000 * 1400

    // 2. Submit the request
    const submitted = procurementAppService.submitProcurementRequest("pr-1");
    assert.strictEqual(submitted.procurementStatus, ProcurementRequestStatus.SUBMITTED);

    // 3. Trying to submit again should throw DomainError natively bubbled up
    assert.throws(
      () => procurementAppService.submitProcurementRequest("pr-1"),
      DomainError
    );

    // 4. Accept the request
    const accepted = procurementAppService.acceptProcurementRequest("pr-1");
    assert.strictEqual(accepted.procurementStatus, ProcurementRequestStatus.ACCEPTED);

    // 5. Fulfill the request
    const fulfilled = procurementAppService.fulfillProcurementRequest("pr-1");
    assert.strictEqual(fulfilled.procurementStatus, ProcurementRequestStatus.FULFILLED);
  });
  await t.test("ProcurementApplicationService handles not found errors and rejections", () => {
    assert.throws(() => procurementAppService.getProcurementRequest("missing"), /not found/);
    assert.throws(() => procurementAppService.updateProcurementRequest("missing", {}), /not found/);
    assert.throws(() => procurementAppService.submitProcurementRequest("missing"), /not found/);
    assert.throws(() => procurementAppService.acceptProcurementRequest("missing"), /not found/);
    assert.throws(() => procurementAppService.rejectProcurementRequest("missing"), /not found/);
    assert.throws(() => procurementAppService.fulfillProcurementRequest("missing"), /not found/);
    assert.throws(() => procurementAppService.listRequestsByFleetCompany("missing"), /not found/);
    assert.throws(() => procurementAppService.listRequestsBySupplier("missing"), /not found/);

    const request = procurementAppService.createProcurementRequest({
      id: "pr-2",
      fleetCompanyId: "fc-1",
      fuelSupplierId: "fs-2",
      fuelType: FuelType.DIESEL,
      fuelQuantityLitres: 2000,
      unitPrice: 1400
    });

    procurementAppService.submitProcurementRequest("pr-2");
    const rejected = procurementAppService.rejectProcurementRequest("pr-2");
    assert.strictEqual(rejected.procurementStatus, ProcurementRequestStatus.REJECTED);
  });

  await t.test("ProcurementApplicationService update details", () => {
    const request = procurementAppService.createProcurementRequest({
      id: "pr-3",
      fleetCompanyId: "fc-1",
      fuelSupplierId: "fs-2",
      fuelType: FuelType.DIESEL,
      fuelQuantityLitres: 2000,
      unitPrice: 1400
    });

    assert.throws(() => procurementAppService.updateProcurementRequest("pr-3", { fuelQuantityLitres: 500, unitPrice: 1400 }), /below the minimum/);
    assert.throws(() => procurementAppService.updateProcurementRequest("pr-3", { fuelQuantityLitres: 60000, unitPrice: 1400 }), /exceeds the available/);

    const updated = procurementAppService.updateProcurementRequest("pr-3", { fuelQuantityLitres: 3000, unitPrice: 1450 });
    assert.strictEqual(updated.fuelQuantityLitres, 3000);
    assert.strictEqual(updated.unitPrice, 1450);
  });

  await t.test("ProcurementApplicationService lists requests", () => {
    const byCompany = procurementAppService.listRequestsByFleetCompany("fc-1");
    assert.ok(byCompany.length > 0);

    const bySupplier = procurementAppService.listRequestsBySupplier("fs-2");
    assert.ok(bySupplier.length > 0);
  });

});
