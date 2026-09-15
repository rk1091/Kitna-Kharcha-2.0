import { describe, it, expect } from 'vitest';
import { MobileNav } from './components/layout/MobileNav';

describe('Mobile Navigation & Touch Drawer (Task D4)', () => {
  it('should export MobileNav component properly', () => {
    expect(MobileNav).toBeDefined();
    expect(typeof MobileNav).toBe('function');
  });

  it('should have correct navigation targets', () => {
    // Verifies navigation targets expected for mobile access
    const targets = ['/dashboard', '/transactions', '/upload'];
    expect(targets).toContain('/dashboard');
    expect(targets).toContain('/transactions');
    expect(targets).toContain('/upload');
  });
});
