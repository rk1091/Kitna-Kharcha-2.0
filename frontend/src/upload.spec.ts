import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDropZone } from './components/upload/FileDropZone';
import { RawTextPaste } from './components/upload/RawTextPaste';
import { UploadPage } from './pages/UploadPage';
import { MemoryRouter } from 'react-router-dom';

describe('Multi-Format Upload Behavioral Tests', () => {
  it('renders FileDropZone and accepts allowed formats', () => {
    render(<FileDropZone onUpload={vi.fn()} isUploading={false} />);

    expect(
      screen.getByText(/Click to browse or drag and drop statement file/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supports Bank PDF/i),
    ).toBeInTheDocument();
  });

  it('RawTextPaste loads sample statement text and clears text on demand', () => {
    const onImport = vi.fn();
    render(<RawTextPaste onImport={onImport} isImporting={false} />);

    const loadSampleBtn = screen.getByRole('button', { name: /Load Sample Text/i });
    fireEvent.click(loadSampleBtn);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toContain('UPI-SWIGGY-BANGALORE');

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    expect(textarea.value).toBe('');
  });

  it('UploadPage renders ingestion tabs and headings', () => {
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Upload Statements Hub/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Statement File/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Raw Text Paste/i }),
    ).toBeInTheDocument();
  });
});
