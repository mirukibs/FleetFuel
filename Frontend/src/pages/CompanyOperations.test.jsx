import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompanyOperations from "./CompanyOperations";
import { FleetFuelApi } from "@/lib/client";

vi.mock("@/lib/client", () => ({
  FleetFuelApi: {
    managers: {
      listByCompany: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
    },
    fleets: {
      listByCompany: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      updateName: vi.fn(),
      listVehicles: vi.fn(),
    },
  },
}));

const mockCompany = { id: "comp-1", companyName: "Test Company" };

describe("CompanyOperations Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays managers and fleets on open", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([
      { id: "m-1", firstName: "Jane", lastName: "Doe", email: "jane@test.com" }
    ]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([
      { id: "f-1", name: "Test Fleet", fleetManagerId: "m-1" }
    ]);

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("Test Fleet")).toBeInTheDocument();
    });
  });

  it("allows adding a manager", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([]);
    FleetFuelApi.managers.create.mockResolvedValue({ id: "m-new" });

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);
    
    // Open add manager modal
    const addBtn = screen.getByText("Add");
    fireEvent.click(addBtn);

    // Fill form
    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. Jane Doe")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Jane Doe"), { target: { value: "John Smith" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. jane@fleetfuel.co"), { target: { value: "john@smith.com" } });
    
    const submitBtn = screen.getByRole("button", { name: "Add Manager" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(FleetFuelApi.managers.create).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Smith",
        email: "john@smith.com",
        fleetCompanyId: "comp-1"
      });
    });
  });

  it("allows creating a fleet", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([
      { id: "m-1", firstName: "Jane", lastName: "Doe", fullName: "Jane Doe" }
    ]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([]);
    FleetFuelApi.fleets.create.mockResolvedValue({ id: "f-new" });

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);

    // Wait for manager to load in select
    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    const createBtn = screen.getByText("Create");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. Fleet Delta")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. Fleet Delta"), { target: { value: "New Fleet" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "m-1" } });

    fireEvent.click(screen.getByRole("button", { name: "Create Fleet" }));

    await waitFor(() => {
      expect(FleetFuelApi.fleets.create).toHaveBeenCalledWith({
        name: "New Fleet",
        fleetManagerId: "m-1",
        fleetCompanyId: "comp-1"
      });
    });
  });  it("allows renaming a fleet", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([
      { id: "f-1", name: "Test Fleet", fleetManagerId: "m-1" }
    ]);
    FleetFuelApi.fleets.updateName.mockResolvedValue({ id: "f-1" });

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);

    await waitFor(() => {
      expect(screen.getByText("Test Fleet")).toBeInTheDocument();
    });

    const renameBtn = screen.getByRole('button', { name: "Rename Test Fleet" });
    fireEvent.click(renameBtn);

    await waitFor(() => {
      expect(screen.getByText("Rename Fleet", { selector: 'h2' })).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Test Fleet");
    fireEvent.change(nameInput, { target: { value: "Updated Fleet" } });

    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));

    await waitFor(() => {
      expect(FleetFuelApi.fleets.updateName).toHaveBeenCalledWith("f-1", "Updated Fleet");
    });
  });

  it("displays fleet details", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([
      { id: "f-1", name: "Test Fleet", fleetManagerId: "m-1" }
    ]);
    FleetFuelApi.fleets.get.mockResolvedValue({ id: "f-1", name: "Test Fleet", fleetManagerId: "m-1" });
    FleetFuelApi.fleets.listVehicles.mockResolvedValue([
      { id: "v-1", licensePlate: "ABC-123" }
    ]);

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);

    await waitFor(() => {
      expect(screen.getByText("Test Fleet")).toBeInTheDocument();
    });

    const detailsBtn = screen.getByRole('button', { name: "View details for Test Fleet" });
    fireEvent.click(detailsBtn);

    await waitFor(() => {
      expect(screen.getByText("Fleet Details", { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText("ABC-123")).toBeInTheDocument();
    });
  });

  it("displays manager details", async () => {
    FleetFuelApi.managers.listByCompany.mockResolvedValue([
      { id: "m-1", firstName: "Jane", lastName: "Doe", email: "jane@test.com", name: "Jane Doe" }
    ]);
    FleetFuelApi.fleets.listByCompany.mockResolvedValue([]);
    FleetFuelApi.managers.get.mockResolvedValue({ id: "m-1", firstName: "Jane", lastName: "Doe", email: "jane@test.com", name: "Jane Doe" });

    render(<CompanyOperations open={true} onOpenChange={() => {}} company={mockCompany} />);

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    const detailsBtn = screen.getByRole('button', { name: "View details for Jane Doe" });
    fireEvent.click(detailsBtn);

    await waitFor(() => {
      expect(screen.getByText("Manager Details", { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    });
  });
});
