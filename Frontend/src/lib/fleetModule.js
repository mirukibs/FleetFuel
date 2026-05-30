import { FleetFuelApi } from "@/lib/client";

export const seedManagers = [
  { id: "MGR-001", name: "Amelia Cole", email: "amelia@fleetfuel.co", role: "Admin", fleet: "All Fleets" },
  { id: "MGR-002", name: "Joel Mwamba", email: "joel@fleetfuel.co", role: "Manager", fleet: "Fleet Alpha" },
  { id: "MGR-003", name: "Sara Njoroge", email: "sara@fleetfuel.co", role: "Manager", fleet: "Fleet Beta" },
  { id: "MGR-004", name: "Peter Kiondo", email: "peter@fleetfuel.co", role: "Analyst", fleet: "Fleet Gamma" },
  { id: "MGR-005", name: "Lena Makundi", email: "lena@fleetfuel.co", role: "Manager", fleet: "Fleet Beta" },
];

export const seedFleets = [
  { id: "FL-001", name: "Fleet Alpha", vehicles: 3, manager: "Joel Mwamba", managerId: "MGR-002", region: "Dar es Salaam" },
  { id: "FL-002", name: "Fleet Beta", vehicles: 3, manager: "Sara Njoroge", managerId: "MGR-003", region: "Mwanza" },
  { id: "FL-003", name: "Fleet Gamma", vehicles: 2, manager: "Peter Kiondo", managerId: "MGR-004", region: "Arusha" },
];

export const seedVehicles = [
  { id: "VH-001", plate: "KAZ 421B", make: "Isuzu", model: "FVR", year: 2021, type: "TRUCK", fleet: "Fleet Alpha", fleetId: "FL-001", fuelLevel: 78, sensor: "FS-AA1" },
  { id: "VH-002", plate: "DAR 087C", make: "Toyota", model: "HiAce", year: 2020, type: "SUV", fleet: "Fleet Beta", fleetId: "FL-002", fuelLevel: 34, sensor: null },
  { id: "VH-003", plate: "TZN 330A", make: "Scania", model: "P360", year: 2019, type: "TRUCK", fleet: "Fleet Alpha", fleetId: "FL-001", fuelLevel: 92, sensor: "FS-BB3" },
  { id: "VH-004", plate: "MOR 155F", make: "Toyota", model: "Land Cruiser", year: 2022, type: "SUV", fleet: "Fleet Gamma", fleetId: "FL-003", fuelLevel: 55, sensor: "FS-CC2" },
  { id: "VH-005", plate: "KAZ 812D", make: "Mercedes", model: "Sprinter", year: 2020, type: "SUV", fleet: "Fleet Beta", fleetId: "FL-002", fuelLevel: 12, sensor: "FS-DD5" },
  { id: "VH-006", plate: "DSM 901E", make: "Mitsubishi", model: "Canter", year: 2018, type: "TRUCK", fleet: "Fleet Gamma", fleetId: "FL-003", fuelLevel: 0, sensor: null },
  { id: "VH-007", plate: "ARU 204G", make: "Nissan", model: "Patrol", year: 2023, type: "SUV", fleet: "Fleet Alpha", fleetId: "FL-001", fuelLevel: 66, sensor: "FS-EE7" },
  { id: "VH-008", plate: "MWA 448H", make: "Isuzu", model: "NQR", year: 2021, type: "TRUCK", fleet: "Fleet Beta", fleetId: "FL-002", fuelLevel: 41, sensor: "FS-FF8" },
];

export const fleetNameById = Object.fromEntries(seedFleets.map((fleet) => [fleet.id, fleet.name]));

export const fleetOptions = ["All Fleets", ...seedFleets.map((fleet) => fleet.name)];

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
  return Number(latestReading?.fuelLevel ?? vehicle?.fuelLevel ?? 0);
}

export function toFrontendVehicle(vehicle) {
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

export async function bootstrapFleetModule() {
  for (const manager of seedManagers) {
    const { firstName, lastName } = splitFullName(manager.name);
    await FleetFuelApi.managers.create({
      id: manager.id,
      firstName,
      lastName,
      email: manager.email,
    });
  }

  for (const fleet of seedFleets) {
    await FleetFuelApi.fleets.create({
      id: fleet.id,
      name: fleet.name,
      fleetManagerId: fleet.managerId,
    });
  }

  for (const vehicle of seedVehicles) {
    const created = await FleetFuelApi.vehicles.register({
      id: vehicle.id,
      fleetId: vehicle.fleetId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      licensePlate: vehicle.plate,
    });

    if (vehicle.sensor) {
      await FleetFuelApi.vehicles.assignFuelSensor(created.id, {
        sensorId: vehicle.sensor,
        serialNo: vehicle.sensor,
      });
    }

    if (typeof vehicle.fuelLevel === "number") {
      await FleetFuelApi.telemetry.submitReading({
        vehicleId: created.id,
        fuelLevel: vehicle.fuelLevel,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
