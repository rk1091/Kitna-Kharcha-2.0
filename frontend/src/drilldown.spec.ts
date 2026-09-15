import { describe, it, expect } from 'vitest';
import { CategoryDrilldownModal } from './components/transactions/CategoryDrilldownModal';

describe('CategoryDrilldownModal Component', () => {
  it('should export CategoryDrilldownModal correctly', () => {
    expect(CategoryDrilldownModal).toBeDefined();
    expect(typeof CategoryDrilldownModal).toBe('function');
  });
});
