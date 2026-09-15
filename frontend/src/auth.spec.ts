import { describe, it, expect } from 'vitest';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import apiClient, { API_BASE_URL } from './config/api';

describe('Auth Flow & Protected Route Architecture', () => {
  it('should export AuthProvider and useAuth hook', () => {
    expect(AuthProvider).toBeDefined();
    expect(typeof AuthProvider).toBe('function');
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });

  it('should export ProtectedRoute component', () => {
    expect(ProtectedRoute).toBeDefined();
    expect(typeof ProtectedRoute).toBe('function');
  });

  it('should configure apiClient with base URL and interceptors', () => {
    expect(apiClient).toBeDefined();
    expect(API_BASE_URL).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });
});
