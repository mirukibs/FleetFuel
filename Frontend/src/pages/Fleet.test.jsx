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
});
