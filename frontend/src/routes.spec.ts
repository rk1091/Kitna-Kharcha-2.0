import { describe, it, expect } from 'vitest';
import * as pages from './pages';
import { AppRoutes } from './routes';

describe('React Router & Page Skeletons', () => {
  it('should export all 10 required page components', () => {
    expect(pages.DashboardPage).toBeDefined();
    expect(pages.TransactionsPage).toBeDefined();
    expect(pages.StatementsPage).toBeDefined();
    expect(pages.RulesPage).toBeDefined();
    expect(pages.UploadPage).toBeDefined();
    expect(pages.RecurringPage).toBeDefined();
    expect(pages.BudgetsPage).toBeDefined();
    expect(pages.InsightsPage).toBeDefined();
    expect(pages.SettingsPage).toBeDefined();
    expect(pages.LoginPage).toBeDefined();
  });

  it('should define AppRoutes as a valid React component function', () => {
    expect(AppRoutes).toBeDefined();
    expect(typeof AppRoutes).toBe('function');
  });

  it('should contain all 10 expected page modules in the pages index', () => {
    const exportedKeys = Object.keys(pages);
    expect(exportedKeys).toContain('DashboardPage');
    expect(exportedKeys).toContain('TransactionsPage');
    expect(exportedKeys).toContain('StatementsPage');
    expect(exportedKeys).toContain('RulesPage');
    expect(exportedKeys).toContain('UploadPage');
    expect(exportedKeys).toContain('RecurringPage');
    expect(exportedKeys).toContain('BudgetsPage');
    expect(exportedKeys).toContain('InsightsPage');
    expect(exportedKeys).toContain('SettingsPage');
    expect(exportedKeys).toContain('LoginPage');
  });
});
