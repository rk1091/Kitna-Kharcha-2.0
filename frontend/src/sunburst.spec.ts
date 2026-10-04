import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SunburstSpendingChart,
  SunburstCategoryItem,
} from './components/charts/SunburstSpendingChart';

const mockData: SunburstCategoryItem[] = [
  {
    name: 'Food & Dining',
    value: 12000,
    color: '#10B981',
    merchants: [
      { name: 'Swiggy', value: 8000 },
      { name: 'Zomato', value: 4000 },
    ],
  },
  {
    name: 'Entertainment',
    value: 5000,
    color: '#6366F1',
    merchants: [{ name: 'Netflix', value: 5000 }],
  },
];

describe('SunburstSpendingChart Behavioral Tests', () => {
  it('renders sunburst breakdown, displays total spend, and fires onCategoryDrilldown', () => {
    const onDrilldown = vi.fn();

    render(
      <SunburstSpendingChart
        data={mockData}
        totalExpense={17000}
        onCategoryDrilldown={onDrilldown}
      />,
    );

    expect(screen.getByText('Hierarchical Sunburst Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Total Spend')).toBeInTheDocument();
    expect(screen.getByText('₹17,000')).toBeInTheDocument();

    // Verify category pill in legend
    const categoryButton = screen.getByRole('button', { name: /Food & Dining/i });
    expect(categoryButton).toBeInTheDocument();

    // Click category to zoom in / drilldown
    fireEvent.click(categoryButton);
    expect(onDrilldown).toHaveBeenCalledWith('Food & Dining');
  });

  it('renders empty state when no category data is provided', () => {
    render(<SunburstSpendingChart data={[]} />);

    expect(
      screen.getByText('No expense data available to construct sunburst'),
    ).toBeInTheDocument();
  });
});
