import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FleetFuelApi } from "../lib/client";
import Fleet from "./Fleet";

// Mock the API client
vi.mock("../lib/client", () => ({
  FleetFuelApi: {
    vehicles: {
      list: vi.fn(),
      register: vi.fn(),
      assignFuelSensor: vi.fn(),
    },
    fleets: {
      list: vi.fn(),
    },
    telemetry: {
      submitReading: vi.fn(),
    },
    fleetCompanies: {
      list: vi.fn(),
    },
    fuelAccounts: {
      simulateRefueling: vi.fn(),
    },
  },
}));

// Provide mocks for some UI components to simplify DOM testing
vi.mock("../componets/ui-kit/Section", () => ({
  PageHeader: ({ title, actions }) => (
    <div>
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  ),
  Card: ({ children }) => <div>{children}</div>,
  CardHeader: ({ title, subtitle }) => (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

// Mock Recharts to avoid DOM calculation errors in JSDOM
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: ({ children }) => <div>{children}</div>,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  };
});

describe("Fleet Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render vehicle list and disabled telemetry for unassigned vehicles", async () => {
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: null },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);

    render(<Fleet />);

    await waitFor(() => {
      // Vehicle plate should render
      expect(screen.getByText(/T123/)).toBeInTheDocument();
      // "No Sensor Data" should render since sensor is null
      expect(screen.getByText("No Sensor Data")).toBeInTheDocument();
    });

    // Expand the vehicle row
    fireEvent.click(screen.getByText("Toyota"));

    await waitFor(() => {
      // The View Telemetry button should exist and be disabled
      const viewTelemetryBtn = screen.getByText("View Telemetry");
      expect(viewTelemetryBtn).toBeInTheDocument();
      expect(viewTelemetryBtn).toBeDisabled();
      
      // The Assign Sensor button should be available
      expect(screen.getByText("Assign Sensor")).toBeInTheDocument();
    });
  });

  it("should support assigning a sensor and updating UI to Replace Sensor", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: null },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.assignFuelSensor.mockResolvedValue({
      sensor: { id: "FS-TEST", serialNo: "FS-TEST" }
    });
    FleetFuelApi.telemetry.submitReading.mockResolvedValue({});

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    // Open row
    await user.click(screen.getByText("Toyota"));
    
    // Click Assign Sensor
    const assignBtn = await screen.findByText("Assign Sensor");
    await user.click(assignBtn);

    // Click Proceed
    const proceedBtn = await screen.findByText("Proceed & Assign");
    await user.click(proceedBtn);

    // Verify API calls
    await waitFor(() => {
      expect(FleetFuelApi.vehicles.assignFuelSensor).toHaveBeenCalled();
      expect(FleetFuelApi.telemetry.submitReading).toHaveBeenCalled();
      // Button should now be enabled since sensor exists
      // Wait actually, because we updated state dynamically, the UI should swap to Replace Sensor
      expect(screen.getByText("Replace Sensor")).toBeInTheDocument();
    });
  });

  it("should open refuel dialog and call simulateRefueling", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([
      { id: "comp-1", companyName: "Test Company" }
    ]);
    FleetFuelApi.fuelAccounts.simulateRefueling.mockResolvedValue({});
    FleetFuelApi.telemetry.submitReading.mockResolvedValue({});

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    // Open row
    await user.click(screen.getByText("Toyota"));

    // Click Refuel
    const refuelBtn = await screen.findByText("Refuel");
    await user.click(refuelBtn);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText(/Simulate refueling for/)).toBeInTheDocument();
    });

    // Select fleet company
    const compSelect = screen.getByText("Select company account...").closest("select");
    await user.selectOptions(compSelect, "comp-1");

    // Enter quantity
    const qtyInput = screen.getByPlaceholderText(/e.g. 50/i);
    await user.type(qtyInput, "30");

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Refuel Now/i });
    await user.click(submitBtn);

    // Verify simulateRefueling called
    await waitFor(() => {
      expect(FleetFuelApi.fuelAccounts.simulateRefueling).toHaveBeenCalledWith(expect.objectContaining({
        fleetCompanyId: "comp-1",
        vehicleId: "v1",
        fuelType: "DIESEL",
        quantityLitres: 30
      }));
      // Also telemetry should be updated
      expect(FleetFuelApi.telemetry.submitReading).toHaveBeenCalled();
    });
  });

  it("should open View Telemetry dialog", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.get = vi.fn().mockResolvedValue({ id: "v1", make: "Toyota", model: "Corolla", licensePlate: "T123" });
    FleetFuelApi.telemetry.listVehicleReadings = vi.fn().mockResolvedValue([]);

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    // Open row
    await user.click(screen.getByText("Toyota"));

    // Click View Telemetry
    const viewTelemetryBtn = await screen.findByText("View Telemetry");
    expect(viewTelemetryBtn).not.toBeDisabled();
    await user.click(viewTelemetryBtn);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText(/Vehicle Telemetry History/)).toBeInTheDocument();
    });
  });

  it("should display telemetry history with readings", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.get = vi.fn().mockResolvedValue({ id: "v1", make: "Toyota", model: "Corolla", licensePlate: "T123" });
    FleetFuelApi.telemetry.listVehicleReadings = vi.fn().mockResolvedValue([
      { timestamp: "2023-10-01T10:00:00Z", fuelLevel: 45 },
      { timestamp: "2023-10-01T11:00:00Z", fuelLevel: 40 }
    ]);

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    // Open row
    await user.click(screen.getByText("Toyota"));

    // Click View Telemetry
    const viewTelemetryBtn = await screen.findByText("View Telemetry");
    await user.click(viewTelemetryBtn);

    // Dialog should open and show readings
    await waitFor(() => {
      expect(screen.getByText(/45%/)).toBeInTheDocument();
      expect(screen.getByText(/40%/)).toBeInTheDocument();
    });
  });
});
  it("should close refuel dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Toyota"));
    const refuelBtn = await screen.findByText("Refuel");
    await user.click(refuelBtn);

    await waitFor(() => {
      expect(screen.getByText(/Simulate refueling for/)).toBeInTheDocument();
    });

    // Close using cancel button
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Simulate refueling for/)).not.toBeInTheDocument();
    });
  });

  it("should close telemetry dialog when close is clicked", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.get = vi.fn().mockResolvedValue({ id: "v1", make: "Toyota", model: "Corolla", licensePlate: "T123" });
    FleetFuelApi.telemetry.listVehicleReadings = vi.fn().mockResolvedValue([]);

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Toyota"));
    const viewTelemetryBtn = await screen.findByText("View Telemetry");
    await user.click(viewTelemetryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Vehicle Telemetry History/)).toBeInTheDocument();
    });

    // Close using close button
    const closeBtns = screen.getAllByRole("button", { name: "Close" });
    await user.click(closeBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText(/Vehicle Telemetry History/)).not.toBeInTheDocument();
    });
  });

  it("should allow changing fuel type in refuel dialog", async () => {
    const user = userEvent.setup();
    FleetFuelApi.fleets.list.mockResolvedValue([]);
    FleetFuelApi.vehicles.list.mockResolvedValue([
      { id: "v1", licensePlate: "T123", make: "Toyota", sensor: "FS-001", fuelLevel: 50 },
    ]);
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([
      { id: "comp-1", companyName: "Test Company" }
    ]);
    FleetFuelApi.fuelAccounts.simulateRefueling.mockResolvedValue({});

    render(<Fleet />);

    await waitFor(() => {
      expect(screen.getByText(/T123/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Toyota"));
    const refuelBtn = await screen.findByText("Refuel");
    await user.click(refuelBtn);

    await waitFor(() => {
      expect(screen.getByText(/Simulate refueling for/)).toBeInTheDocument();
    });

    const fuelTypeSelect = screen.getByText("Diesel").closest("select");
    await user.selectOptions(fuelTypeSelect, "PETROL");

    expect(fuelTypeSelect.value).toBe("PETROL");
  });
