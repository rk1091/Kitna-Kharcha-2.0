import { describe, it, expect } from 'vitest';
import { RulesTable } from './components/rules/RulesTable';
import { RuleFormModal } from './components/rules/RuleFormModal';
import { RulesPage } from './pages/RulesPage';

describe('Rules Management Modular Components', () => {
  it('should export all modular rules components', () => {
    expect(RulesTable).toBeDefined();
    expect(typeof RulesTable).toBe('function');

    expect(RuleFormModal).toBeDefined();
    expect(typeof RuleFormModal).toBe('function');

    expect(RulesPage).toBeDefined();
    expect(typeof RulesPage).toBe('function');
  });
});
