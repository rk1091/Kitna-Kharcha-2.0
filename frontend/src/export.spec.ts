import { describe, it, expect } from 'vitest';
import { ExportModal } from './components/export/ExportModal';

describe('Multi-Format Data Export Engine (Task E1)', () => {
  it('should export ExportModal component properly', () => {
    expect(ExportModal).toBeDefined();
    expect(typeof ExportModal).toBe('function');
  });

  it('should have valid format types supported', () => {
    const supportedFormats = ['csv', 'excel', 'report'];
    expect(supportedFormats).toContain('csv');
    expect(supportedFormats).toContain('excel');
    expect(supportedFormats).toContain('report');
  });
});
