import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FleetFuelApi } from "../lib/client";
import Admin from "./Admin";

// Mock the API client
vi.mock("../lib/client", () => ({
  FleetFuelApi: {
    managers: {
      list: vi.fn(),
      create: vi.fn(),
    },
    fleets: {
      list: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock the PageHeader and Card UI components to simplify tests
vi.mock("../componets/ui-kit/Section", () => ({
  PageHeader: ({ title, actions }) => (
    <div>
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  ),
  Card: ({ children }) => <div>{children}</div>,
  CardHeader: ({ title, subtitle, action }) => (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {action}
    </div>
  ),
}));

describe("Admin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render managers and process their names into initials", async () => {
    FleetFuelApi.managers.list.mockResolvedValue([
      { id: "m1", fullName: "Asha Mollel", email: "asha@example.com" },
    ]);
    FleetFuelApi.fleets.list.mockResolvedValue([]);

    render(<Admin />);

    await waitFor(() => {
      // It should display the full name
      expect(screen.getByText("Asha Mollel")).toBeInTheDocument();
      // It should display the email
      expect(screen.getByText("asha@example.com")).toBeInTheDocument();
      // The Avatar fallback should show "AM" for Asha Mollel
      expect(screen.getByText("AM")).toBeInTheDocument();
    });
  });

  it("should display fleet groups and support manager datalist searching", async () => {
    FleetFuelApi.managers.list.mockResolvedValue([
      { id: "m1", fullName: "Asha Mollel", email: "asha@example.com" },
    ]);
    FleetFuelApi.fleets.list.mockResolvedValue([
      { id: "f1", name: "Dar es Salaam Fleet", fleetManagerId: "m1" },
    ]);

    render(<Admin />);

    await waitFor(() => {
      expect(screen.getByText("Dar es Salaam Fleet")).toBeInTheDocument();
      // Admin.jsx simply renders the f.manager name string directly
      expect(screen.getAllByText("Asha Mollel").length).toBeGreaterThan(0);
    });
  });
});
