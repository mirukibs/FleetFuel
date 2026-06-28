import { describe, it, expect } from "vitest";
import { splitFullName, getLatestFuelLevel, toFrontendVehicle } from "./fleetModule";

describe("fleetModule", () => {
  describe("splitFullName", () => {
    it("should handle empty or undefined strings", () => {
      expect(splitFullName("")).toEqual({ firstName: "", lastName: "" });
      expect(splitFullName(undefined)).toEqual({ firstName: "", lastName: "" });
      expect(splitFullName(null)).toEqual({ firstName: "", lastName: "" });
    });

    it("should handle a single name", () => {
      expect(splitFullName("Asha")).toEqual({ firstName: "Asha", lastName: "Asha" });
    });

    it("should split first and last names correctly", () => {
      expect(splitFullName("Asha Mollel")).toEqual({ firstName: "Asha", lastName: "Mollel" });
    });

    it("should handle multiple names properly", () => {
      expect(splitFullName("John Doe Smith")).toEqual({ firstName: "John", lastName: "Doe Smith" });
    });
  });

  describe("getLatestFuelLevel", () => {
    it("should return undefined if no readings or fuel level exist", () => {
      expect(getLatestFuelLevel({})).toBeUndefined();
    });

    it("should return the base fuelLevel if no readings exist", () => {
      expect(getLatestFuelLevel({ fuelLevel: 45 })).toBe(45);
    });

    it("should return the fuelLevel from the latest reading", () => {
      const vehicle = {
        readings: [
          { fuelLevel: 20 },
          { fuelLevel: 30 },
          { fuelLevel: 55 },
        ],
      };
      expect(getLatestFuelLevel(vehicle)).toBe(55);
    });

    it("should prioritize latest reading over base fuelLevel", () => {
      const vehicle = {
        fuelLevel: 10,
        readings: [
          { fuelLevel: 80 },
        ],
      };
      expect(getLatestFuelLevel(vehicle)).toBe(80);
    });
  });

  describe("toFrontendVehicle", () => {
    const fleets = [
      { id: "fleet-001", name: "Dar es Salaam Fleet" },
      { id: "fleet-002", name: "Arusha Fleet" }
    ];

    it("should map a vehicle correctly without sensor or fleet", () => {
      const backendVehicle = {
        id: "veh-123",
        licensePlate: "T123ABC",
        make: "Toyota",
        model: "Hilux",
        year: 2022,
        type: "TRUCK",
        fleetId: null,
      };

      const mapped = toFrontendVehicle(backendVehicle, fleets);
      expect(mapped).toEqual({
        id: "veh-123",
        plate: "T123ABC",
        make: "Toyota",
        model: "Hilux",
        year: 2022,
        type: "TRUCK",
        fleetId: null,
        fleet: "Unassigned",
        fuelLevel: undefined,
        sensor: null,
      });
    });

    it("should resolve fleet name and sensor correctly", () => {
      const backendVehicle = {
        id: "veh-124",
        licensePlate: "T999XYZ",
        fleetId: "fleet-001",
        sensor: { id: "FS-1234", serialNo: "FS-1234" },
        readings: [{ fuelLevel: 75 }]
      };

      const mapped = toFrontendVehicle(backendVehicle, fleets);
      expect(mapped.fleet).toBe("Dar es Salaam Fleet");
      expect(mapped.sensor).toBe("FS-1234");
      expect(mapped.fuelLevel).toBe(75);
    });
  });
});
