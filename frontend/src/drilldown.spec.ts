import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryDrilldownModal } from './components/transactions/CategoryDrilldownModal';
import { MemoryRouter } from 'react-router-dom';

const mockTransactions = [
  {
    id: 't1',
    txnDate: '2026-01-15T10:00:00Z',
    description: 'Swiggy Order',
    amountSigned: -500,
    direction: 'DEBIT' as const,
    category: { name: 'Food & Dining' },
  },
  {
    id: 't2',
    txnDate: '2026-01-16T10:00:00Z',
    description: 'Zomato Dining',
    amountSigned: -1500,
    direction: 'DEBIT' as const,
    category: { name: 'Food & Dining' },
  },
  {
    id: 't3',
    txnDate: '2026-01-17T10:00:00Z',
    description: 'Zara Shopping',
    amountSigned: -3000,
    direction: 'DEBIT' as const,
    category: { name: 'Shopping' },
  },
];

describe('CategoryDrilldownModal Component Behavioral Tests', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <CategoryDrilldownModal
          categoryName="Food & Dining"
          isOpen={false}
          onClose={vi.fn()}
          transactions={mockTransactions}
        />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('filters transactions by category and displays aggregate metrics when open', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <CategoryDrilldownModal
          categoryName="Food & Dining"
          isOpen={true}
          onClose={onClose}
          transactions={mockTransactions}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText(/2 transactions/)).toBeInTheDocument();
    expect(screen.getByText('₹2,000')).toBeInTheDocument();
    expect(screen.getAllByText('Swiggy Order').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Zomato Dining').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Zara Shopping')).toBeNull();

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
