import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExecutiveSummaryHeader } from './components/dashboard/ExecutiveSummaryHeader';
import { MemoryRouter } from 'react-router-dom';

describe('ExecutiveSummaryHeader Behavioral Tests', () => {
  it('renders storytelling narrative, status badge, and savings rate', () => {
    render(
      <MemoryRouter>
        <ExecutiveSummaryHeader
          totalIncome={100000}
          totalExpense={40000}
          netSavings={60000}
          transactionCount={25}
          topCategoryName="Housing"
          topCategoryPercentage={35}
          topMerchantName="HDFC Landlord"
          dateRangeLabel="this month"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('High Savings Rate')).toBeInTheDocument();
    expect(screen.getByText(/60% saved/)).toBeInTheDocument();
    expect(screen.getByText(/Housing/)).toBeInTheDocument();
    expect(screen.getByText(/HDFC Landlord/)).toBeInTheDocument();
  });

  it('triggers export modal callback when Export is clicked', () => {
    const onOpenExport = vi.fn();
    render(
      <MemoryRouter>
        <ExecutiveSummaryHeader
          totalIncome={50000}
          totalExpense={30000}
          netSavings={20000}
          transactionCount={10}
          onOpenExport={onOpenExport}
        />
      </MemoryRouter>,
    );

    const exportBtn = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportBtn);
    expect(onOpenExport).toHaveBeenCalled();
  });
});
