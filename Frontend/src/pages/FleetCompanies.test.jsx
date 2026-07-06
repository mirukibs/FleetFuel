import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FleetCompanies from './FleetCompanies';
import { FleetFuelApi } from '@/lib/client';

// Mock the API client
vi.mock('@/lib/client', () => ({
  FleetFuelApi: {
    fleetCompanies: {
      get: vi.fn(),
      updateDetails: vi.fn(),
    },
    fuelAccounts: {
      get: vi.fn(),
      getTransactions: vi.fn(),
    }
  }
}));

describe('FleetCompanies Page', () => {
  const mockUser = { affiliatedServiceId: 'fc-1', role: 'fleet_company' };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    FleetFuelApi.fleetCompanies.get.mockResolvedValue(
      { id: 'fc-1', companyName: 'TransLogistics', contactPerson: 'Jane Doe', email: 'test@test.com', phoneNumber: '123' }
    );
    FleetFuelApi.fuelAccounts.get.mockResolvedValue({
      id: 'acc-1', balances: { DIESEL: 5000 }
    });
  });

  it('renders the registered fleet company for the user', async () => {
    render(<FleetCompanies user={mockUser} />);
    
    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe', { exact: false })).toBeInTheDocument();
    });
  });

  it('opens edit company modal and calls API on submit', async () => {
    FleetFuelApi.fleetCompanies.updateDetails.mockResolvedValue({});
    
    render(<FleetCompanies user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    await waitFor(() => {
      expect(screen.getByText('Update Company Details', { selector: 'h2' })).toBeInTheDocument();
    });
    
    const nameInput = screen.getByDisplayValue('TransLogistics');
    fireEvent.change(nameInput, { target: { value: 'Updated TransLogistics' } });
    
    const updateBtn = screen.getByText('Update', { selector: 'button' });
    fireEvent.click(updateBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.fleetCompanies.updateDetails).toHaveBeenCalledWith('fc-1', expect.objectContaining({
        companyName: 'Updated TransLogistics'
      }));
      expect(FleetFuelApi.fleetCompanies.get).toHaveBeenCalledTimes(2);
    });
  });

  it('opens manage fuel dialog and loads account/history', async () => {
    FleetFuelApi.fuelAccounts.getTransactions.mockResolvedValue([
      { id: 'tx-1', type: 'DEPOSIT', fuelType: 'DIESEL', quantityLitres: 5000, timestamp: new Date().toISOString() }
    ]);

    render(<FleetCompanies user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Manage Fuel/i));

    await waitFor(() => {
      expect(screen.getByText('Fuel Account Details')).toBeInTheDocument();
      // Should show the loaded balance
      expect(screen.getAllByText('DIESEL')[0]).toBeInTheDocument();
      expect(screen.getAllByText('5,000')[0]).toBeInTheDocument();
    });
  });

  it('opens operations dialog', async () => {
    render(<FleetCompanies user={mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Manage Operations/i));

    await waitFor(() => {
      // CompanyOperations component dialog will render
      expect(screen.getByText('TransLogistics - Operations')).toBeInTheDocument();
    });
  });
});
