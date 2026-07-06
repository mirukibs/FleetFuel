import { FuelSupplier } from '../../Domain/entities/FuelSupplier.mjs';
import { FuelOffer } from '../../Domain/value-objects/FuelOffer.mjs';
import { NotFoundError } from '../../Domain/errors.mjs';

export class FuelSupplierApplicationService {
  constructor({ fuelSupplierRepo }) {
    this.fuelSupplierRepo = fuelSupplierRepo;
  }

  registerFuelSupplier(input) {
    const existing = this.fuelSupplierRepo.findAll();
    if (existing.some(s => s.email === input.email)) {
      throw new Error("A supplier with this email is already registered.");
    }

    const supplier = new FuelSupplier({
      id: input.id,
      supplierName: input.supplierName,
      contactPerson: input.contactPerson,
      email: input.email,
      phoneNumber: input.phoneNumber
    });

    this.fuelSupplierRepo.save(supplier);
    return supplier.toJSON();
  }

  updateSupplierDetails(id, input) {
    const supplier = this.fuelSupplierRepo.findById(id);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${id} not found.`);
    }

    supplier.updateDetails(
      input.supplierName,
      input.contactPerson,
      input.email,
      input.phoneNumber
    );

    this.fuelSupplierRepo.save(supplier);
    return supplier.toJSON();
  }

  addFuelOffer(supplierId, offerInput) {
    const supplier = this.fuelSupplierRepo.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${supplierId} not found.`);
    }

    const offer = new FuelOffer({
      fuelType: offerInput.fuelType,
      pricePerUnit: offerInput.pricePerUnit,
      availableQuantityLitres: offerInput.availableQuantityLitres,
      minimumOrderQuantityLitres: offerInput.minimumOrderQuantityLitres
    });

    supplier.addFuelOffer(offer);
    this.fuelSupplierRepo.save(supplier);
    return supplier.toJSON();
  }

  updateFuelOffer(supplierId, offerInput) {
    const supplier = this.fuelSupplierRepo.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${supplierId} not found.`);
    }

    const offer = new FuelOffer({
      fuelType: offerInput.fuelType,
      pricePerUnit: offerInput.pricePerUnit,
      availableQuantityLitres: offerInput.availableQuantityLitres,
      minimumOrderQuantityLitres: offerInput.minimumOrderQuantityLitres
    });

    // addFuelOffer inherently updates if the fuel type already exists
    supplier.addFuelOffer(offer);
    this.fuelSupplierRepo.save(supplier);
    return supplier.toJSON();
  }

  removeFuelOffer(supplierId, fuelType) {
    const supplier = this.fuelSupplierRepo.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${supplierId} not found.`);
    }

    supplier.removeFuelOffer(fuelType);
    this.fuelSupplierRepo.save(supplier);
    return supplier.toJSON();
  }

  listFuelSuppliers() {
    const suppliers = this.fuelSupplierRepo.findAll();
    return suppliers.map(s => s.toJSON());
  }

  getSupplierFuelOffers(supplierId) {
    const supplier = this.fuelSupplierRepo.findById(supplierId);
    if (!supplier) {
      throw new NotFoundError(`FuelSupplier with ID ${supplierId} not found.`);
    }
    return supplier.getFuelOffers().map(o => o.toJSON());
  }

  compareFuelPrices(fuelType) {
    const suppliers = this.fuelSupplierRepo.findAll();
    const offers = [];

    for (const supplier of suppliers) {
      for (const offer of supplier.getFuelOffers()) {
        if (offer.getFuelType() === fuelType) {
          offers.push({
            supplierId: supplier.id,
            supplierName: supplier.supplierName,
            ...offer.toJSON()
          });
        }
      }
    }

    // Sort by cheapest price
    return offers.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
  }
}
