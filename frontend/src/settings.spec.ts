import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsPage } from './pages/SettingsPage';
import apiClient from './config/api';

describe('SettingsPage Behavioral Tests', () => {
  it('renders general settings, LLM configuration, and category manager', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/transactions/categories/all') {
        return {
          data: [
            { id: 'cat-1', name: 'Food & Dining', type: 'EXPENSE', color: '#EF4444' },
          ],
        };
      }
      return { data: {} };
    });

    render(<SettingsPage />);

    expect(screen.getByText('System & User Settings')).toBeInTheDocument();
    expect(screen.getByText('General & Currency Preferences')).toBeInTheDocument();
    expect(screen.getByText('AI Intelligence & Copilot Engine')).toBeInTheDocument();
    expect(await screen.findByText('Food & Dining')).toBeInTheDocument();
  });
});
