'use client';

import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import type { AdminAuthState, AdminUser, AdminLoginResponse } from '../types/admin';
import { adminApiClient } from '../lib/adminApiClient';

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

interface AdminAuthContextType extends AdminAuthState {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface InitialAdminAuthState {
  authState: AdminAuthState;
  isLoading: boolean;
}

const getInitialAdminAuthState = (): InitialAdminAuthState => {
  if (typeof window === 'undefined') {
    return {
      authState: { admin: null, adminToken: null, isAdminAuthenticated: false },
      isLoading: true,
    };
  }

  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const userRaw = localStorage.getItem(ADMIN_USER_KEY);
    const admin: AdminUser | null = userRaw && userRaw !== 'undefined' ? (JSON.parse(userRaw) as AdminUser) : null;

    if (token && admin) {
      return {
        authState: { admin, adminToken: token, isAdminAuthenticated: true },
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error initializing admin auth:', error);
  }

  return {
    authState: { admin: null, adminToken: null, isAdminAuthenticated: false },
    isLoading: false,
  };
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialState = getInitialAdminAuthState();
  const [authState, setAuthState] = useState<AdminAuthState>(initialState.authState);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const { authState: newAuthState, isLoading: newIsLoading } = getInitialAdminAuthState();
      setAuthState(newAuthState);
      setIsLoading(newIsLoading);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await adminApiClient.post('/admin/auth/login', {
        email,
        password,
      });

      // Backend ResponseInterceptor wraps in { data: { access_token, admin }, success }
      const raw = response.data as Record<string, unknown>;
      const payload = (raw.data ?? raw) as AdminLoginResponse;
      const { access_token, admin } = payload;

      localStorage.setItem(ADMIN_TOKEN_KEY, access_token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));

      setAuthState({
        admin,
        adminToken: access_token,
        isAdminAuthenticated: true,
      });
    } catch (error) {
      console.error('[ADMIN AUTH] Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await adminApiClient.post('/admin/auth/logout');
    } catch (error) {
      // Fire-and-forget — backend may have already invalidated the token
      console.warn('[ADMIN AUTH] Logout backend call failed (ignoring):', error);
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);

      setAuthState({
        admin: null,
        adminToken: null,
        isAdminAuthenticated: false,
      });
    }
  };

  const value: AdminAuthContextType = {
    ...authState,
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
