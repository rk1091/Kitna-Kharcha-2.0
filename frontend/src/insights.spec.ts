import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsightsPanel } from './components/dashboard/InsightsPanel';
import { MemoryRouter } from 'react-router-dom';
import apiClient from './config/api';

describe('InsightsPanel Behavioral Tests', () => {
  it('renders insights feed and supports dismissing cards', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        {
          id: 'in-1',
          type: 'DISCRETIONARY_SPIKE',
          title: 'High Weekend Spending Spike',
          description: 'Discretionary spending jumped 40% on weekends.',
          severity: 'WARNING',
          actionableTip: 'Set a dining budget.',
          generatedAt: new Date().toISOString(),
        },
      ],
    });

    render(
      <MemoryRouter>
        <InsightsPanel />
      </MemoryRouter>,
    );

    expect(await screen.findByText('High Weekend Spending Spike')).toBeInTheDocument();
    expect(screen.getByText(/Discretionary spending jumped 40%/)).toBeInTheDocument();
    expect(screen.getByText(/Set a dining budget/)).toBeInTheDocument();

    const dismissButton = screen.getByTitle('Dismiss');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('High Weekend Spending Spike')).toBeNull();
  });
});
