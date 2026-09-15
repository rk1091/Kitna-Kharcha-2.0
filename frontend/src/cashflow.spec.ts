import { describe, it, expect } from 'vitest';
import { CashFlowComparison } from './components/dashboard/CashFlowComparison';

describe('CashFlowComparison Component', () => {
  it('should export CashFlowComparison component', () => {
    expect(CashFlowComparison).toBeDefined();
    expect(typeof CashFlowComparison).toBe('function');
  });
});
