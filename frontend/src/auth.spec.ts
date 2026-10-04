import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import apiClient from './config/api';

const TestAuthConsumer: React.FC = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'guest'}</span>
      <span data-testid="user-email">{user?.email || 'none'}</span>
      <span data-testid="user-token">{token || 'none'}</span>
      <button onClick={() => login('test@example.com', 'secret')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Auth Flow & Protected Route Behavioral Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders guest state initially when no token is present', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('guest');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
  });

  it('authenticates user and persists token on successful login', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        token: 'jwt-test-token-123',
        user: { id: 'u1', email: 'test@example.com', name: 'Test User' },
      },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'secret',
    });
    expect(localStorage.getItem('token')).toBe('jwt-test-token-123');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('clears state and removes token on logout', async () => {
    localStorage.setItem('token', 'existing-token');
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { id: 'u1', email: 'existing@example.com' },
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('authenticated');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
  });

  it('ProtectedRoute redirects unauthenticated users to login', async () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page Mock</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Login Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).toBeNull();
  });
});
