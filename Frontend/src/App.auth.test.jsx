import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { FleetFuelApi } from '@/lib/client';

vi.mock('@/lib/client', () => ({
  FleetFuelApi: {
    auth: {
      login: vi.fn(),
      logout: vi.fn()
    },
    fleetCompanies: {
      list: vi.fn().mockResolvedValue([])
    },
    fuelSuppliers: {
      list: vi.fn().mockResolvedValue([])
    },
    procurement: {
      listByCompany: vi.fn().mockResolvedValue([]),
      listBySupplier: vi.fn().mockResolvedValue([])
    }
  }
}));

describe('App authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('requires login before entering the app', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('logs in a fleet company user and shows only fleet-company workspace routes', async () => {
    FleetFuelApi.auth.login.mockResolvedValue({
      token: 'token-123',
      user: {
        email: 'buyer@example.com',
        role: 'fleet_company',
        affiliatedServiceId: 'fc-001'
      }
    });

    render(<App />);

    fireEvent.change(screen.getAllByLabelText('Email')[0], {
      target: { value: 'buyer@example.com' }
    });
    fireEvent.change(screen.getAllByLabelText('Password')[0], {
      target: { value: 'secret-123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });

    expect(screen.getByText('Fleet')).toBeInTheDocument();
    expect(screen.getByText('Company Profile')).toBeInTheDocument();
    expect(screen.getAllByText('Procurement').length).toBeGreaterThan(0);
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(localStorage.getItem('fleetfuel.auth')).toContain('buyer@example.com');
  });

  it('logs in a fuel supplier user and shows only supplier workspace routes', async () => {
    FleetFuelApi.auth.login.mockResolvedValue({
      token: 'token-456',
      user: {
        email: 'supplier@example.com',
        role: 'fuel_supplier',
        affiliatedServiceId: 'supplier-001'
      }
    });

    render(<App />);

    fireEvent.change(screen.getAllByLabelText('Email')[0], {
      target: { value: 'supplier@example.com' }
    });
    fireEvent.change(screen.getAllByLabelText('Password')[0], {
      target: { value: 'secret-123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Supplier Dashboard' })).toBeInTheDocument();
    });

    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(screen.getAllByText('Procurement').length).toBeGreaterThan(0);
    expect(screen.queryByText('Company Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Fleet')).not.toBeInTheDocument();
  });
});
