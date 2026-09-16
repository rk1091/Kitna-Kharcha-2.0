import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CashFlowComparison, CashFlowTransaction } from './components/dashboard/CashFlowComparison';

const mockTransactions: CashFlowTransaction[] = [
  {
    id: 't1',
    txnDate: '2026-01-10T10:00:00Z',
    description: 'Monthly Salary',
    amountSigned: 100000,
    direction: 'CREDIT',
    category: { id: 'c1', name: 'Salary' },
  },
  {
    id: 't2',
    txnDate: '2026-01-15T12:00:00Z',
    description: 'House Rent',
    amountSigned: -30000,
    direction: 'DEBIT',
    category: { id: 'c2', name: 'Rent' },
  },
  {
    id: 't3',
    txnDate: '2026-01-20T14:00:00Z',
    description: 'Grocery Supermarket',
    amountSigned: -10000,
    direction: 'DEBIT',
    category: { id: 'c3', name: 'Groceries' },
  },
];

describe('CashFlowComparison Component Behavioral Tests', () => {
  it('calculates total inflows, outflows, net savings, and savings rate accurately', () => {
    render(<CashFlowComparison transactions={mockTransactions} />);

    // Inflows: ₹100,000, Outflows: ₹40,000, Net: ₹60,000, Rate: 60%
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹40,000')).toBeInTheDocument();
    expect(screen.getByText('+₹60,000')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('switches between Cash Flow and Income Sources tabs', () => {
    render(<CashFlowComparison transactions={mockTransactions} />);

    const sourcesButton = screen.getByRole('button', { name: /Income Sources/i });
    fireEvent.click(sourcesButton);

    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('(1 deposit)')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });
});
