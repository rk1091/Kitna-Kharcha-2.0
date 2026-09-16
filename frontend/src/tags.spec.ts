import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagBadge, getTagPalette } from './components/ui/TagBadge';
import { CategoryBadge } from './components/ui/CategoryBadge';

describe('TagBadge & CategoryBadge Component System Behavioral Tests', () => {
  it('renders TagBadge with tag text and handles onRemove interaction', () => {
    const onRemove = vi.fn();
    render(<TagBadge tag="tax-deductible" onRemove={onRemove} />);

    expect(screen.getByText('#tax-deductible')).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remove tag #tax-deductible');
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('generates deterministic color classes for identical tag names', () => {
    const palette1 = getTagPalette('investments');
    const palette2 = getTagPalette('investments');
    expect(palette1).toBe(palette2);

    const palette3 = getTagPalette('groceries');
    expect(palette3).toContain('bg-');
    expect(palette3).toContain('text-');
  });

  it('renders CategoryBadge with category name and custom color indicator', () => {
    render(<CategoryBadge name="Dining Out" color="#10B981" />);

    expect(screen.getByText('Dining Out')).toBeInTheDocument();
  });
});
