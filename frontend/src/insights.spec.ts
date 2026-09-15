import { describe, it, expect } from 'vitest';
import { InsightsPanel } from './components/dashboard/InsightsPanel';

describe('InsightsPanel Component', () => {
  it('should export InsightsPanel component properly', () => {
    expect(InsightsPanel).toBeDefined();
    expect(typeof InsightsPanel).toBe('function');
  });
});
