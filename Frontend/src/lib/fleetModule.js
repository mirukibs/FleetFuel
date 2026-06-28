export const vehicleTypeOptions = ["All Types", "TRUCK", "SUV", "SEDAN", "MOTORCYCLE"];

export function splitFullName(fullName) {
  const parts = `${fullName ?? ""}`.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }
  return { firstName: parts.shift(), lastName: parts.join(" ") };
}

export function getLatestFuelLevel(vehicle) {
  const latestReading = vehicle?.readings?.length ? vehicle.readings[vehicle.readings.length - 1] : null;
  if (latestReading?.fuelLevel !== undefined) return Number(latestReading.fuelLevel);
  if (vehicle?.fuelLevel !== undefined) return Number(vehicle.fuelLevel);
  return undefined;
}

export function toFrontendVehicle(vehicle, fleets = []) {
  const fleetNameById = Object.fromEntries(fleets.map((fleet) => [fleet.id, fleet.name]));
  return {
    id: vehicle.id,
    plate: vehicle.licensePlate ?? vehicle.plate ?? "—",
    make: vehicle.make ?? "",
    model: vehicle.model ?? "",
    year: Number(vehicle.year ?? 0),
    type: vehicle.type ?? "TRUCK",
    fleetId: vehicle.fleetId ?? null,
    fleet: fleetNameById[vehicle.fleetId] ?? vehicle.fleet ?? "Unassigned",
    fuelLevel: getLatestFuelLevel(vehicle),
    sensor: vehicle.sensor?.id ?? vehicle.sensor ?? null,
  };
}
