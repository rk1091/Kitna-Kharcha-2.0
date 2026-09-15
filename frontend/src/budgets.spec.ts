import { describe, it, expect } from 'vitest';
import { BudgetsPage } from './pages/BudgetsPage';
import { BudgetProgressBar } from './components/budgets/BudgetProgressBar';
import { CreateBudgetModal } from './components/budgets/CreateBudgetModal';

describe('Budgets Page & Modular Components', () => {
  it('should export all modular budget components', () => {
    expect(BudgetsPage).toBeDefined();
    expect(typeof BudgetsPage).toBe('function');

    expect(BudgetProgressBar).toBeDefined();
    expect(typeof BudgetProgressBar).toBe('function');

    expect(CreateBudgetModal).toBeDefined();
    expect(typeof CreateBudgetModal).toBe('function');
  });
});
