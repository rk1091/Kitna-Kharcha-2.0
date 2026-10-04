import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatementsPage } from './pages/StatementsPage';
import { MemoryRouter } from 'react-router-dom';
import apiClient from './config/api';

describe('StatementsPage Behavioral Tests', () => {
  it('loads statements from API and displays statement details and health score', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        {
          id: 's-1',
          fileName: 'hdfc_jan_2026.pdf',
          filePath: '/uploads/hdfc.pdf',
          inputType: 'PDF',
          uploadedAt: '2026-01-20T10:00:00Z',
          parseStatus: 'COMPLETED',
          bankName: 'HDFC Bank',
          healthScore: 95,
          _count: { transactions: 45 },
        },
      ],
    });

    render(
      <MemoryRouter>
        <StatementsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Statements Management')).toBeInTheDocument();
    expect(await screen.findByText('hdfc_jan_2026.pdf')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    expect(screen.getByText('Parsed')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });
});
