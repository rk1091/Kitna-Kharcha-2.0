import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BudgetProgressBar } from './components/budgets/BudgetProgressBar';
import { BudgetsPage } from './pages/BudgetsPage';
import apiClient from './config/api';

describe('Budgets Behavioral Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('BudgetProgressBar displays Exceeded badge and calculates overspend when over budget', () => {
    const onDelete = vi.fn();
    render(
      <BudgetProgressBar
        id="b1"
        categoryName="Food & Dining"
        limit={10000}
        currentSpend={14500}
        remaining={0}
        percentageConsumed={145}
        isOverBudget={true}
        isWarning={false}
        isActive={true}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/Over budget by ₹4,500/)).toBeInTheDocument();
    expect(screen.getByText('145%')).toBeInTheDocument();

    screen.getByTitle('Delete budget').click();
    expect(onDelete).toHaveBeenCalledWith('b1');
  });

  it('BudgetProgressBar displays Warning badge when near limit', () => {
    render(
      <BudgetProgressBar
        id="b2"
        categoryName="Shopping"
        limit={10000}
        currentSpend={8500}
        remaining={1500}
        percentageConsumed={85}
        isOverBudget={false}
        isWarning={true}
        isActive={true}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText(/Remaining:/)).toBeInTheDocument();
    expect(screen.getByText('₹1,500')).toBeInTheDocument();
  });

  it('BudgetsPage loads budgets from API and displays over-budget alerts', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/budgets') {
        return {
          data: {
            budgets: [
              {
                id: 'b1',
                categoryName: 'Entertainment',
                limit: 5000,
                currentSpend: 7200,
                remaining: 0,
                percentageConsumed: 144,
                isOverBudget: true,
                isWarning: false,
                isActive: true,
              },
            ],
            summary: {
              totalBudget: 5000,
              totalSpend: 7200,
              remainingBudget: 0,
              overallPercentageConsumed: 144,
              overBudgetCount: 1,
              warningCount: 0,
            },
          },
        };
      }
      if (url === '/transactions/categories') {
        return { data: [{ id: 'cat-1', name: 'Entertainment' }] };
      }
      return { data: [] };
    });

    render(<BudgetsPage />);

    expect(await screen.findByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/Over budget by ₹2,200/)).toBeInTheDocument();
  });
});
