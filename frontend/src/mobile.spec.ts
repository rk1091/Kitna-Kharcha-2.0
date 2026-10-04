import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from './components/layout/MobileNav';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

describe('Mobile Navigation & Touch Drawer Behavioral Tests', () => {
  it('renders bottom bar with mobile navigation items', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNav />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Ledger')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('opens touch drawer when Menu button is tapped', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNav />
        </AuthProvider>
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole('button', { name: /Menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByText('All Modules')).toBeInTheDocument();
    expect(screen.getByText('Bank Statements')).toBeInTheDocument();
    expect(screen.getByText('Rules Management')).toBeInTheDocument();
    expect(screen.getByText('Recurring & EMIs')).toBeInTheDocument();
    expect(screen.getByText('Budgets Tracker')).toBeInTheDocument();
  });
});
