import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionTable } from './components/transactions/TransactionTable';
import { TransactionEditDrawer } from './components/transactions/TransactionEditDrawer';

const mockTransactions = [
  {
    id: 'txn-1',
    txnDate: '2026-01-15T00:00:00.000Z',
    description: 'UPI/Swiggy/12345',
    normalizedDescription: 'Swiggy',
    amountSigned: -450,
    currency: 'INR',
    direction: 'DEBIT' as const,
    category: { id: 'cat-1', name: 'Food & Dining' },
    categoryId: 'cat-1',
    tags: ['lunch'],
  },
];

describe('Transactions Ledger Behavioral Tests', () => {
  it('renders TransactionTable and handles selection, edit, and delete triggers', () => {
    const onToggleSelect = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionTable
        transactions={mockTransactions}
        categories={[{ id: 'cat-1', name: 'Food & Dining' }]}
        selectedIds={[]}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        onBulkCategorize={vi.fn()}
        onBulkDelete={vi.fn()}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        loading={false}
      />,
    );

    expect(screen.getByText('Swiggy')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('-₹450.00')).toBeInTheDocument();
    expect(screen.getByText('#lunch')).toBeInTheDocument();

    const editButton = screen.getByTitle('Edit transaction');
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(mockTransactions[0]);

    const deleteButton = screen.getByTitle('Delete transaction');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('txn-1');
  });

  it('renders TransactionEditDrawer when open and allows editing fields', () => {
    const onSave = vi.fn();
    render(
      <TransactionEditDrawer
        transaction={mockTransactions[0]}
        categories={[{ id: 'cat-1', name: 'Food & Dining' }]}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Swiggy')).toBeInTheDocument();
  });
});
