import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecurringCard, RecurringGroupItem } from './components/recurring/RecurringCard';
import { SubscriptionAuditBanner } from './components/recurring/SubscriptionAuditBanner';

describe('Recurring Subscriptions Behavioral Tests', () => {
  it('SubscriptionAuditBanner calculates annualized commitment and handles rescan', () => {
    const onRunScan = vi.fn();
    render(
      <SubscriptionAuditBanner
        totalMonthlyCommitment={4500}
        activeCount={3}
        totalCount={5}
        onRunScan={onRunScan}
        isScanning={false}
      />,
    );

    expect(screen.getByText('₹4,500')).toBeInTheDocument();
    expect(screen.getByText(/₹54,000\/year/)).toBeInTheDocument();
    expect(screen.getByText(/across 3 active recurring services/)).toBeInTheDocument();

    const scanBtn = screen.getByRole('button', { name: /Re-scan Statements/i });
    fireEvent.click(scanBtn);
    expect(onRunScan).toHaveBeenCalled();
  });

  it('RecurringCard renders details and handles status toggle', () => {
    const onToggle = vi.fn();
    const item: RecurringGroupItem = {
      id: 'rec-1',
      merchantId: 'Netflix',
      categoryId: 'Entertainment',
      type: 'SUBSCRIPTION',
      frequency: 'MONTHLY',
      avgAmount: 649,
      currency: 'INR',
      lastSeenDate: '2026-01-15T00:00:00.000Z',
      isActive: true,
    };

    render(<RecurringCard item={item} onToggle={onToggle} />);

    expect(screen.getByText('SUBSCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('₹649')).toBeInTheDocument();
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Active Recurring/i });
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith('rec-1');
  });
});
