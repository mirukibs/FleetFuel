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

  it('adds a new fuel offer to a supplier', async () => {
    FleetFuelApi.fuelSuppliers.addOffer.mockResolvedValue({});

    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Shell Global'));
    fireEvent.click(screen.getByText('View Profile & Offers'));

    await waitFor(() => {
      expect(screen.getByText('Supplier Profile & Fuel Offers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Offer'));

    await waitFor(() => {
      expect(screen.getByText('Add Fuel Offer', { selector: 'h2' })).toBeInTheDocument();
    });

    // The other inputs: price, quantity, moq
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '2.5' } }); // Price
    fireEvent.change(numberInputs[1], { target: { value: '5000' } }); // Quantity
    fireEvent.change(numberInputs[2], { target: { value: '100' } }); // MOQ

    const submitBtn = screen.getByRole('button', { name: 'Save Offer' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(FleetFuelApi.fuelSuppliers.addOffer).toHaveBeenCalledWith('supp-1', expect.objectContaining({
        fuelType: 'DIESEL',
        pricePerUnit: 2.5,
        availableQuantityLitres: 5000,
        minimumOrderQuantityLitres: 100
      }));
    });
  });

  it('updates an existing fuel offer', async () => {
    FleetFuelApi.fuelSuppliers.updateOffer.mockResolvedValue({});

    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Shell Global'));
    fireEvent.click(screen.getByText('View Profile & Offers'));

    await waitFor(() => {
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByRole('button', { name: /Edit/i });
    // Assuming the second 'Edit' button is for the offer (the first is for supplier details)
    fireEvent.click(editBtns[1]);

    await waitFor(() => {
      expect(screen.getByText('Edit Fuel Offer (DIESEL)', { selector: 'h2' })).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '1.8' } }); // Price

    const updateBtn = screen.getByRole('button', { name: 'Update Offer' });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(FleetFuelApi.fuelSuppliers.updateOffer).toHaveBeenCalledWith('supp-1', expect.objectContaining({
        pricePerUnit: 1.8
      }));
    });
  });

  it('removes a fuel offer', async () => {
    FleetFuelApi.fuelSuppliers.removeOffer.mockResolvedValue({});
    
    // We mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Shell Global')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Shell Global'));
    fireEvent.click(screen.getByText('View Profile & Offers'));

    await waitFor(() => {
      expect(screen.getByText('DIESEL')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button', { name: /Remove/i });
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(FleetFuelApi.fuelSuppliers.removeOffer).toHaveBeenCalledWith('supp-1', 'DIESEL');
    });

    confirmSpy.mockRestore();
  });
});
