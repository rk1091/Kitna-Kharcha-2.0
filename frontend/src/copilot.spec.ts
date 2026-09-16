import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopilotFloatingChat } from './components/copilot/CopilotFloatingChat';
import { QuickPromptPills, QUICK_PROMPTS } from './components/copilot/QuickPromptPills';

import { MemoryRouter } from 'react-router-dom';

describe('Copilot UI System Behavioral Tests', () => {
  it('renders quick prompt pills and triggers selection callback', () => {
    const onSelectPrompt = vi.fn();
    render(<QuickPromptPills onSelectPrompt={onSelectPrompt} />);

    expect(screen.getByText('Analyze Trends')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Subscriptions'));
    expect(onSelectPrompt).toHaveBeenCalledWith(
      'What are my active recurring subscriptions and monthly commitment?',
    );
  });

  it('has standard quick prompts configured with required keys', () => {
    expect(QUICK_PROMPTS.length).toBeGreaterThanOrEqual(4);
    const ids = QUICK_PROMPTS.map((p) => p.id);
    expect(ids).toContain('trends');
    expect(ids).toContain('budget');
    expect(ids).toContain('anomalies');
    expect(ids).toContain('recurring');
  });

  it('renders CopilotFloatingChat floating trigger button', () => {
    render(
      <MemoryRouter>
        <CopilotFloatingChat />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });
});
