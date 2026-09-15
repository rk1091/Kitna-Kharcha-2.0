import { describe, it, expect } from 'vitest';
import { TransactionTable } from './components/transactions/TransactionTable';
import { TransactionEditDrawer } from './components/transactions/TransactionEditDrawer';
import { TransactionsPage } from './pages/TransactionsPage';

describe('Transactions Ledger Modular Components', () => {
  it('should export all modular transaction components', () => {
    expect(TransactionTable).toBeDefined();
    expect(typeof TransactionTable).toBe('function');

    expect(TransactionEditDrawer).toBeDefined();
    expect(typeof TransactionEditDrawer).toBe('function');

    expect(TransactionsPage).toBeDefined();
    expect(typeof TransactionsPage).toBe('function');
  });
});
