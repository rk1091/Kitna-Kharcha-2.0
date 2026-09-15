import { describe, it, expect } from 'vitest';
import { RecurringPage } from './pages/RecurringPage';
import { RecurringCard } from './components/recurring/RecurringCard';
import { SubscriptionAuditBanner } from './components/recurring/SubscriptionAuditBanner';

describe('Recurring Subscriptions Page & Components', () => {
  it('should export all modular recurring components', () => {
    expect(RecurringPage).toBeDefined();
    expect(typeof RecurringPage).toBe('function');

    expect(RecurringCard).toBeDefined();
    expect(typeof RecurringCard).toBe('function');

    expect(SubscriptionAuditBanner).toBeDefined();
    expect(typeof SubscriptionAuditBanner).toBe('function');
  });
});
