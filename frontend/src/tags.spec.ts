import { describe, it, expect } from 'vitest';
import { TagBadge, getTagPalette } from './components/ui/TagBadge';
import { CategoryBadge } from './components/ui/CategoryBadge';

describe('TagBadge & CategoryBadge Component System', () => {
  it('should export TagBadge and CategoryBadge components', () => {
    expect(TagBadge).toBeDefined();
    expect(typeof TagBadge).toBe('function');

    expect(CategoryBadge).toBeDefined();
    expect(typeof CategoryBadge).toBe('function');
  });

  it('should generate deterministic color classes for tags', () => {
    const palette1 = getTagPalette('tax-deductible');
    const palette2 = getTagPalette('tax-deductible');
    expect(palette1).toBe(palette2);

    const palette3 = getTagPalette('impulse');
    expect(typeof palette3).toBe('string');
    expect(palette3.length).toBeGreaterThan(0);
  });
});
