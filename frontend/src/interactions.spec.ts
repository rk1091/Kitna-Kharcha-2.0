import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Skeleton } from './components/ui/Skeleton';
import { EmptyState } from './components/ui/EmptyState';

describe('Micro-Interactions & UI Feedback Behavioral Tests', () => {
  it('renders Skeleton with pulse animations and custom class', () => {
    const { container } = render(<Skeleton className="h-10 w-48 custom-test-class" />);
    const skeletonEl = container.firstChild as HTMLElement;
    expect(skeletonEl).toHaveClass('animate-pulse');
    expect(skeletonEl).toHaveClass('custom-test-class');
  });

  it('renders EmptyState with title, description, and triggers onAction callback', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Transactions Available"
        description="Please upload your bank statement to start analyzing."
        actionLabel="Upload Now"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('No Transactions Available')).toBeInTheDocument();
    expect(
      screen.getByText('Please upload your bank statement to start analyzing.'),
    ).toBeInTheDocument();

    const actionButton = screen.getByRole('button', { name: /Upload Now/i });
    fireEvent.click(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
