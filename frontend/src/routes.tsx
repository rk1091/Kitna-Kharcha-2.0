import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  DashboardPage,
  TransactionsPage,
  StatementsPage,
  RulesPage,
  UploadPage,
  RecurringPage,
  BudgetsPage,
  InsightsPage,
  SettingsPage,
  LoginPage,
} from '@/pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Main Authenticated Layout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="statements" element={<StatementsPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="recurring" element={<RecurringPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
