import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { KPICards } from './components/dashboard/KPICards';
import { TopMerchantsList } from './components/dashboard/TopMerchantsList';
import { DashboardPage } from './pages/DashboardPage';
import { MemoryRouter } from 'react-router-dom';
import apiClient from './config/api';

describe('Analytical Dashboard Behavioral Suite', () => {
  it('KPICards renders financial metrics correctly formatted', () => {
    render(
      <KPICards
        totalIncome={100000}
        totalExpense={45000}
        netSavings={55000}
        transactionCount={20}
        categorizedRatio={85}
        categorizedCount={17}
      />,
    );

    expect(screen.getByText('₹1,00,000.00')).toBeInTheDocument();
    expect(screen.getByText('₹45,000.00')).toBeInTheDocument();
    expect(screen.getByText('+₹55,000.00')).toBeInTheDocument();
    expect(screen.getByText('85% Categorized')).toBeInTheDocument();
    expect(screen.getByText('17 of 20 classified')).toBeInTheDocument();
  });

  it('TopMerchantsList renders top spending merchants and percentage share', () => {
    const mockMerchants = [
      { merchant: 'Amazon India', totalSpent: 15000, count: 5, percentageOfTotal: 50 },
      { merchant: 'Swiggy', totalSpent: 6000, count: 8, percentageOfTotal: 20 },
    ];

    render(<TopMerchantsList merchants={mockMerchants} totalExpense={30000} />);

    expect(screen.getByText('Amazon India')).toBeInTheDocument();
    expect(screen.getByText('Swiggy')).toBeInTheDocument();
    expect(screen.getByText('₹15,000')).toBeInTheDocument();
    expect(screen.getByText('₹6,000')).toBeInTheDocument();
    expect(screen.getByText(/5 txns/)).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('DashboardPage loads and displays title and executive summary', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Kitna Kharcha Financial Analytics/i),
    ).toBeInTheDocument();
  });
});
