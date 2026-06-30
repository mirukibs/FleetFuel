import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Suppliers from './Suppliers';
import { FleetFuelApi } from '@/lib/client';

// Mock the API client
vi.mock('@/lib/client', () => ({
  FleetFuelApi: {
    fuelSuppliers: {
      list: vi.fn(),
      register: vi.fn(),
      updateDetails: vi.fn(),
      addOffer: vi.fn(),
      updateOffer: vi.fn(),
      removeOffer: vi.fn()
    }
  }
}));

describe('Suppliers Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    FleetFuelApi.fuelSuppliers.list.mockResolvedValue([
      {
        id: 'supp-1',
        supplierName: 'Shell Global',
        contactPerson: 'John Shell',
        email: 'john@shell.com',
        phoneNumber: '123456789',
        fuelOffers: [
          { fuelType: 'DIESEL', pricePerUnit: 1.5, availableQuantityLitres: 10000, minimumOrderQuantityLitres: 500 }
        ]
      }
    ]);
  });

  it('renders a list of suppliers', async () => {
    render(<Suppliers />);
    
    // Wait for the suppliers to load
    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Shell')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 active offer
  });

  it('opens add supplier modal and calls API on submit', async () => {
    FleetFuelApi.fuelSuppliers.register.mockResolvedValue({});
    
    render(<Suppliers />);
    
    // Wait for load
    await waitFor(() => {
      expect(screen.getByText('Add Supplier')).toBeInTheDocument();
    });
    
    // Open modal
    fireEvent.click(screen.getByText('Add Supplier'));
    
    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Register a new fuel supplier on the marketplace.')).toBeInTheDocument();
    });
    
    // Fill form
    const inputs = screen.getAllByRole('textbox');
    // Index mapping depends on render order, using placeholders is safer
    fireEvent.change(screen.getByPlaceholderText('e.g., Shell Tanzania'), { target: { value: 'Total Energies' } });
    fireEvent.change(screen.getByPlaceholderText('contact@supplier.com'), { target: { value: 'info@total.com' } });
    
    // Submit
    const buttons = screen.getAllByRole('button', { name: /Add Supplier/i });
    const submitBtn = buttons[buttons.length - 1]; // The one in the dialog footer
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.fuelSuppliers.register).toHaveBeenCalledWith(expect.objectContaining({
        supplierName: 'Total Energies',
        email: 'info@total.com'
      }));
    });
  });

  it('opens view profile and shows offers', async () => {
    render(<Suppliers />);
    
    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });

    // Click on the card to expand it
    fireEvent.click(screen.getByText('Shell Global'));
    
    // Click View Profile
    const viewBtn = screen.getByText('View Profile & Offers');
    fireEvent.click(viewBtn);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('john@shell.com')).toBeInTheDocument();
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
      expect(screen.getByText('TZS 1.5')).toBeInTheDocument();
    });
  });

  it('opens edit supplier modal and calls API on submit', async () => {
    FleetFuelApi.fuelSuppliers.updateDetails.mockResolvedValue({});
    
    render(<Suppliers />);
    
    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Shell Global'));
    fireEvent.click(screen.getByText('View Profile & Offers'));

    await waitFor(() => {
      expect(screen.getByText('Supplier Profile & Fuel Offers')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Update Supplier Details', { selector: 'h2' })).toBeInTheDocument();
    });
    
    const nameInput = screen.getByDisplayValue('Shell Global');
    fireEvent.change(nameInput, { target: { value: 'Shell Inc' } });
    
    const updateBtn = screen.getByText('Update', { selector: 'button' });
    fireEvent.click(updateBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.fuelSuppliers.updateDetails).toHaveBeenCalledWith('supp-1', expect.objectContaining({
        supplierName: 'Shell Inc'
      }));
      expect(FleetFuelApi.fuelSuppliers.list).toHaveBeenCalledTimes(2);
    });
  });
});
