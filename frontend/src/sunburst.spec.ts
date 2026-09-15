import { describe, it, expect } from 'vitest';
import { SunburstSpendingChart } from './components/charts/SunburstSpendingChart';

describe('SunburstSpendingChart Component', () => {
  it('should export SunburstSpendingChart correctly', () => {
    expect(SunburstSpendingChart).toBeDefined();
    expect(typeof SunburstSpendingChart).toBe('function');
  });
});
