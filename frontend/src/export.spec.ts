import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './components/export/ExportModal';

describe('Multi-Format Data Export Modal Behavioral Tests', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ExportModal isOpen={false} onClose={vi.fn()} categories={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all export formats and date options when open', () => {
    const onClose = vi.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        categories={[{ id: 'c1', name: 'Food' }]}
      />,
    );

    expect(screen.getByText('Export Financial Data')).toBeInTheDocument();
    expect(screen.getByText('CSV Table')).toBeInTheDocument();
    expect(screen.getByText('Excel XLSX')).toBeInTheDocument();
    expect(screen.getByText('PDF / Report')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
