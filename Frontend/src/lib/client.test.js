import { describe, it, expect, vi, beforeEach } from "vitest";
import { FleetFuelApi } from "./client";

describe("FleetFuelApi", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  it("should fetch vehicles successfully", async () => {
    const mockVehicles = [{ id: "v1", plate: "T123" }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVehicles,
    });

    const result = await FleetFuelApi.vehicles.list();
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3003/api/vehicles", expect.any(Object));
    expect(result).toEqual(mockVehicles);
  });

  it("should assign a fuel sensor successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sensor: { id: "FS-123", serialNo: "FS-123" } }),
    });

    const payload = { sensorId: "FS-123", serialNo: "FS-123" };
    const result = await FleetFuelApi.vehicles.assignFuelSensor("veh-1", payload);

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3003/api/vehicles/veh-1/fuel-sensor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ sensor: { id: "FS-123", serialNo: "FS-123" } });
  });

  it("should throw an error on failed request", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Validation Error: ID required" }),
    });

    await expect(FleetFuelApi.vehicles.assignFuelSensor("veh-1", {})).rejects.toThrow("Validation Error: ID required");
  });
});
