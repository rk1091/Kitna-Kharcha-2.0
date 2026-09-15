import { describe, it, expect } from 'vitest';
import { KPICards } from './components/dashboard/KPICards';
import { CategoryPieChart } from './components/dashboard/CategoryPieChart';
import { MonthlyTrendBar } from './components/dashboard/MonthlyTrendBar';
import { TopMerchantsList } from './components/dashboard/TopMerchantsList';
import { DashboardPage } from './pages/DashboardPage';

describe('Analytical Dashboard Modular Components', () => {
  it('should export all modular dashboard components', () => {
    expect(KPICards).toBeDefined();
    expect(typeof KPICards).toBe('function');

    expect(CategoryPieChart).toBeDefined();
    expect(typeof CategoryPieChart).toBe('function');

    expect(MonthlyTrendBar).toBeDefined();
    expect(typeof MonthlyTrendBar).toBe('function');

    expect(TopMerchantsList).toBeDefined();
    expect(typeof TopMerchantsList).toBe('function');

    expect(DashboardPage).toBeDefined();
    expect(typeof DashboardPage).toBe('function');
  });
});
