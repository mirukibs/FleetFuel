import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Procurement from './Procurement';
import { FleetFuelApi } from '@/lib/client';

// Mock the API client
vi.mock('@/lib/client', () => ({
  FleetFuelApi: {
    fleetCompanies: {
      list: vi.fn(),
      register: vi.fn(),
    },
    fuelSuppliers: {
      list: vi.fn(),
    },
    procurement: {
      listByCompany: vi.fn(),
      listBySupplier: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      submit: vi.fn(),
      accept: vi.fn(),
      reject: vi.fn(),
      fulfill: vi.fn()
    },
    fuelAccounts: {
      deposit: vi.fn(),
    }
  }
}));

describe('Procurement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([
      { id: 'fc-1', companyName: 'TransLogistics', contactEmail: 'test@test.com' }
    ]);
    FleetFuelApi.fuelSuppliers.list.mockResolvedValue([
      { id: 'supp-1', supplierName: 'Shell', fuelOffers: [{ fuelType: 'DIESEL', pricePerUnit: 1.5, minimumOrderQuantityLitres: 1000, availableQuantityLitres: 5000 }] }
    ]);
    FleetFuelApi.procurement.listByCompany.mockResolvedValue([
      { 
        id: 'req-1', 
        procurementStatus: 'DRAFT', 
        fuelQuantityLitres: 1000, 
        fuelType: 'DIESEL', 
        unitPrice: 1.5,
        fuelSupplierId: 'supp-1',
        deliveryDate: '2026-07-01T00:00:00Z'
      }
    ]);
    FleetFuelApi.procurement.listBySupplier.mockResolvedValue([
      { 
        id: 'req-2', 
        procurementStatus: 'SUBMITTED', 
        fuelQuantityLitres: 2000, 
        fuelType: 'DIESEL', 
        unitPrice: 1.5,
        fleetCompanyId: 'fc-1',
        deliveryDate: '2026-07-01T00:00:00Z'
      },
      { 
        id: 'req-3', 
        procurementStatus: 'ACCEPTED', 
        fuelQuantityLitres: 3000, 
        fuelType: 'PETROL', 
        unitPrice: 1.6,
        fleetCompanyId: 'fc-1',
        deliveryDate: '2026-07-02T00:00:00Z'
      }
    ]);
  });

  it('renders procurement requests', async () => {
    render(<Procurement />);
    
    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('1000L of DIESEL @ TZS 1.5/L')).toBeInTheDocument();
    });
  });

  it('submits a new procurement request', async () => {
    FleetFuelApi.procurement.create.mockResolvedValue({});
    
    render(<Procurement />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
      expect(screen.getByText('New Request')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('New Request'));
    
    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText('Create Procurement Request')).toBeInTheDocument();
    });
    
    // Select supplier
    const supplierSelect = screen.getByTestId('supplier-select');
    fireEvent.change(supplierSelect, { target: { value: 'supp-1' } });
    
    // Change quantity
    const quantityInput = screen.getByPlaceholderText('1000');
    fireEvent.change(quantityInput, { target: { value: '2000' } });
    
    // Just click create request
    const createBtn = screen.getByText('Create Request', { selector: 'button' });
    fireEvent.click(createBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.procurement.create).toHaveBeenCalledWith(expect.objectContaining({
        fleetCompanyId: 'fc-1',
        fuelSupplierId: 'supp-1',
        fuelQuantityLitres: 2000
      }));
    });
  });

  it('prevents creation if quantity is out of bounds', async () => {
    FleetFuelApi.procurement.create.mockResolvedValue({});
    
    render(<Procurement />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('New Request'));
    
    await waitFor(() => {
      expect(screen.getByText('Create Procurement Request')).toBeInTheDocument();
    });
    
    const supplierSelect = screen.getByTestId('supplier-select');
    fireEvent.change(supplierSelect, { target: { value: 'supp-1' } });
    
    // Change quantity to out of bounds (< 1000)
    const quantityInput = screen.getByPlaceholderText('1000');
    fireEvent.change(quantityInput, { target: { value: '500' } });
    
    const createBtn = screen.getByText('Create Request', { selector: 'button' });
    fireEvent.click(createBtn);
    
    // API should not be called
    expect(FleetFuelApi.procurement.create).not.toHaveBeenCalled();
    
    // Now change to > 5000
    fireEvent.change(quantityInput, { target: { value: '6000' } });
    fireEvent.click(createBtn);
    
    expect(FleetFuelApi.procurement.create).not.toHaveBeenCalled();
  });
  
  it('allows submitting a DRAFT request', async () => {
    FleetFuelApi.procurement.submit.mockResolvedValue({});
    
    render(<Procurement />);
    
    await waitFor(() => {
      expect(screen.getByText('1000L of DIESEL @ TZS 1.5/L')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(FleetFuelApi.procurement.submit).toHaveBeenCalledWith('req-1');
      // Should reload list
      expect(FleetFuelApi.procurement.listByCompany).toHaveBeenCalledTimes(2);
    });
  });

  it('can switch to Fuel Supplier view and accept a request', async () => {
    FleetFuelApi.procurement.accept.mockResolvedValue({});
    
    render(<Procurement />);
    
    // Switch to Fuel Supplier view
    fireEvent.click(screen.getByText('View as Fuel Supplier'));
    
    await waitFor(() => {
      expect(screen.getByText('2000L of DIESEL @ TZS 1.5/L')).toBeInTheDocument();
      expect(screen.getByText('Accept')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Accept'));
    
    await waitFor(() => {
      expect(FleetFuelApi.procurement.accept).toHaveBeenCalledWith('req-2');
      expect(FleetFuelApi.procurement.listBySupplier).toHaveBeenCalledTimes(2);
    });
  });

  it('can fulfill a request and allocate fuel via FuelAccounts', async () => {
    FleetFuelApi.procurement.fulfill.mockResolvedValue({});
    FleetFuelApi.fuelAccounts.deposit.mockResolvedValue({});
    
    render(<Procurement />);
    
    // Switch to Fuel Supplier view
    fireEvent.click(screen.getByText('View as Fuel Supplier'));
    
    await waitFor(() => {
      expect(screen.getByText('3000L of PETROL @ TZS 1.6/L')).toBeInTheDocument();
      expect(screen.getByText('Fulfill')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Fulfill'));
    
    await waitFor(() => {
      expect(FleetFuelApi.procurement.fulfill).toHaveBeenCalledWith('req-3');
      expect(FleetFuelApi.fuelAccounts.deposit).toHaveBeenCalledWith({
        fleetCompanyId: 'fc-1',
        fuelType: 'PETROL',
        quantityLitres: 3000
      });
    });
  });

  it('allows editing a DRAFT request in Fleet Company view', async () => {
    FleetFuelApi.procurement.update.mockResolvedValue({});
    
    render(<Procurement />);
    
    await waitFor(() => {
      expect(screen.getByText('1000L of DIESEL @ TZS 1.5/L')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit'));
    
    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText('Edit Procurement Request')).toBeInTheDocument();
    });
    
    // Change quantity
    const quantityInput = screen.getByDisplayValue('1000');
    fireEvent.change(quantityInput, { target: { value: '1500' } });
    
    // Save changes
    const saveBtn = screen.getByText('Save Changes', { selector: 'button' });
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.procurement.update).toHaveBeenCalledWith('req-1', expect.objectContaining({
        fuelQuantityLitres: 1500
      }));
      expect(FleetFuelApi.procurement.listByCompany).toHaveBeenCalledTimes(2);
    });
  });
});
