import { describe, it, expect } from 'vitest';
import { FileDropZone } from './components/upload/FileDropZone';
import { RawTextPaste } from './components/upload/RawTextPaste';
import { UploadPage } from './pages/UploadPage';

describe('Multi-Format Upload Modular Components', () => {
  it('should export FileDropZone, RawTextPaste, and UploadPage', () => {
    expect(FileDropZone).toBeDefined();
    expect(typeof FileDropZone).toBe('function');

    expect(RawTextPaste).toBeDefined();
    expect(typeof RawTextPaste).toBe('function');

    expect(UploadPage).toBeDefined();
    expect(typeof UploadPage).toBe('function');
  });
});
