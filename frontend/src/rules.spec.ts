import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RulesTable, ClassificationRuleItem } from './components/rules/RulesTable';

const mockRules: ClassificationRuleItem[] = [
  {
    id: 'rule-1',
    name: 'Food Deliveries',
    conditions: { keyword: 'swiggy' },
    categoryId: 'cat-food',
    category: { id: 'cat-food', name: 'Food & Dining' },
    tags: ['food', 'online'],
    priority: 10,
    isActive: true,
    isSystem: false,
    source: 'USER',
    hitCount: 42,
    createdAt: new Date().toISOString(),
  },
];

describe('Classification Rules Behavioral Tests', () => {
  it('renders rule list with conditions, priority, category and hit count', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onToggleActive = vi.fn();

    render(
      <RulesTable
        rules={mockRules}
        loading={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    expect(screen.getByText('Food Deliveries')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();

    const deleteButton = screen.getByTitle('Delete Rule');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('rule-1');

    const toggleCheckbox = screen.getByTitle('Toggle rule active state');
    fireEvent.click(toggleCheckbox);
    expect(onToggleActive).toHaveBeenCalledWith('rule-1', true);
  });

  it('renders loading indicator when rules are fetching', () => {
    render(
      <RulesTable
        rules={[]}
        loading={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    expect(screen.getByText('Loading classification rules...')).toBeInTheDocument();
  });
});
