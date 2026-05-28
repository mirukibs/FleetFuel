import {FleetApplicationService} from '../Application/services/FleetApplicationService.mjs';
import {FleetManagerApplicationService} from '../Application/services/FleetManagerApplicationService.mjs';
import {TelemetryApplicationService} from '../Application/services/TelemetryApplicationService.mjs';
import {VehicleApplicationService} from '../Application/services/VehicleApplicationService.mjs';
import {InMemoryFleetManagerRepository} from './repositories/InMemoryFleetManagerRepository.mjs';
import {InMemoryFleetRepository} from './repositories/InMemoryFleetRepository.mjs';
import {InMemoryVehicleRepository} from './repositories/InMemoryVehicleRepository.mjs';

const fleetRepo = new InMemoryFleetRepository();
const managerRepo = new InMemoryFleetManagerRepository();
const vehicleRepo = new InMemoryVehicleRepository();

export const services = {
  fleet: new FleetApplicationService({fleetRepo, managerRepo}),
  manager: new FleetManagerApplicationService({managerRepo}),
  vehicle: new VehicleApplicationService({vehicleRepo, fleetRepo}),
  telemetry: new TelemetryApplicationService({vehicleRepo, fleetRepo})
};
