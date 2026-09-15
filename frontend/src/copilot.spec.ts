import { describe, it, expect } from 'vitest';
import { CopilotFloatingChat } from './components/copilot/CopilotFloatingChat';
import { QuickPromptPills, QUICK_PROMPTS } from './components/copilot/QuickPromptPills';

describe('Copilot UI System (Task C5)', () => {
  it('should export CopilotFloatingChat and QuickPromptPills', () => {
    expect(CopilotFloatingChat).toBeDefined();
    expect(typeof CopilotFloatingChat).toBe('function');

    expect(QuickPromptPills).toBeDefined();
    expect(typeof QuickPromptPills).toBe('function');
  });

  it('should have standard quick prompts configured', () => {
    expect(QUICK_PROMPTS.length).toBeGreaterThanOrEqual(4);
    const ids = QUICK_PROMPTS.map((p) => p.id);
    expect(ids).toContain('trends');
    expect(ids).toContain('budget');
    expect(ids).toContain('anomalies');
    expect(ids).toContain('recurring');
  });
});
