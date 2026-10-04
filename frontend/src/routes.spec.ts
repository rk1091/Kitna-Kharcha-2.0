import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
import * as pages from './pages';

describe('React Router & Application Routing Behavioral Tests', () => {
  it('renders LoginPage when navigating to /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Kitna Kharcha 2.0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated unknown paths to login page', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Kitna Kharcha 2.0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('exports all 10 modular page components as valid React components', () => {
    expect(typeof pages.DashboardPage).toBe('function');
    expect(typeof pages.TransactionsPage).toBe('function');
    expect(typeof pages.StatementsPage).toBe('function');
    expect(typeof pages.RulesPage).toBe('function');
    expect(typeof pages.UploadPage).toBe('function');
    expect(typeof pages.RecurringPage).toBe('function');
    expect(typeof pages.BudgetsPage).toBe('function');
    expect(typeof pages.InsightsPage).toBe('function');
    expect(typeof pages.SettingsPage).toBe('function');
    expect(typeof pages.LoginPage).toBe('function');
  });
});
