import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FleetCompanies from './FleetCompanies';
import { FleetFuelApi } from '@/lib/client';

// Mock the API client
vi.mock('@/lib/client', () => ({
  FleetFuelApi: {
    fleetCompanies: {
      list: vi.fn(),
      register: vi.fn(),
      updateDetails: vi.fn(),
    }
  }
}));

describe('FleetCompanies Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    FleetFuelApi.fleetCompanies.list.mockResolvedValue([
      { id: 'fc-1', companyName: 'TransLogistics', contactPerson: 'Jane Doe', email: 'test@test.com', phoneNumber: '123' }
    ]);
  });

  it('renders registered fleet companies', async () => {
    render(<FleetCompanies />);
    
    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe', { exact: false })).toBeInTheDocument();
    });
  });

  it('opens register company modal and calls API on submit', async () => {
    FleetFuelApi.fleetCompanies.register.mockResolvedValue({});
    
    render(<FleetCompanies />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Register Fleet Company'));
    
    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText('Register Fleet Company', { selector: 'h2' })).toBeInTheDocument();
    });
    
    const nameInput = screen.getByPlaceholderText('TransLogistics Inc');
    fireEvent.change(nameInput, { target: { value: 'New Company' } });
    
    const submitBtn = screen.getByText('Register', { selector: 'button' });
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(FleetFuelApi.fleetCompanies.register).toHaveBeenCalledWith(expect.objectContaining({
        companyName: 'New Company'
      }));
      // Should reload list
      expect(FleetFuelApi.fleetCompanies.list).toHaveBeenCalledTimes(2);
    });
  });

  it('opens edit company modal and calls API on submit', async () => {
    FleetFuelApi.fleetCompanies.updateDetails.mockResolvedValue({});
    
    render(<FleetCompanies />);
    
    await waitFor(() => {
      expect(screen.getByText('TransLogistics')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit'));
    
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
      expect(FleetFuelApi.fleetCompanies.list).toHaveBeenCalledTimes(2);
    });
  });
});
