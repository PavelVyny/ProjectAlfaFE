'use client';

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import {
  AuthState,
  ChangePasswordDto,
  SendPasswordResetDto,
} from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nickname?: string,
  ) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (partial: {
    email?: string;
    nickname?: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  sendPasswordReset: (data: SendPasswordResetDto) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getInitialAuthState = (): {
  authState: AuthState;
  isLoading: boolean;
} => {
  if (typeof window === 'undefined') {
    return {
      authState: { user: null, token: null, isAuthenticated: false },
      isLoading: true,
    };
  }

  try {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token && user) {
      return {
        authState: { user, token, isAuthenticated: true },
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }

  return {
    authState: { user: null, token: null, isAuthenticated: false },
    isLoading: false,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialState = getInitialAuthState();
  const [authState, setAuthState] = useState<AuthState>(initialState.authState);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const { authState: newAuthState, isLoading: newIsLoading } =
        getInitialAuthState();
      setAuthState(newAuthState);
      setIsLoading(newIsLoading);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 [AUTH CONTEXT] Login initiated', { email });

      const response = await authService.login({ email, password });
      authService.saveAuthData(response);

      setAuthState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });

      console.log('✅ [AUTH CONTEXT] Login successful, state updated', {
        userId: response.user.id,
      });
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    nickname?: string,
  ) => {
    try {
      console.log('📝 [AUTH CONTEXT] Registration initiated', { email });

      const response = await authService.register({
        email,
        password,
        nickname,
      });
      authService.saveAuthData(response);

      setAuthState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });

      console.log('✅ [AUTH CONTEXT] Registration successful, state updated', {
        userId: response.user.id,
      });
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Register error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      console.log('🔵 [AUTH CONTEXT] Google login initiated');

      const response = await authService.googleLogin(idToken);
      authService.saveAuthData(response);

      setAuthState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
      });

      console.log('✅ [AUTH CONTEXT] Google login successful, state updated', {
        userId: response.user.id,
      });
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('👋 [AUTH CONTEXT] Logout initiated');

    // Call async logout (calls backend and clears storage)
    await authService.logout();

    // Update state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    console.log('✅ [AUTH CONTEXT] Logout completed, state cleared');
  };

  const updateProfile = async (partial: {
    email?: string;
    nickname?: string;
  }) => {
    try {
      console.log('📝 [AUTH CONTEXT] Profile update initiated', partial);

      // Call backend endpoint to update profile
      const response = await authService.updateProfile(partial);

      // Update local storage with new data
      authService.updateLocalUser(response.user);

      // Update state
      setAuthState(
        (prev) =>
          ({
            ...prev,
            user: response.user,
          } as AuthState),
      );

      console.log('✅ [AUTH CONTEXT] Profile updated successfully', {
        userId: response.user.id,
      });
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Update profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  const changePassword = async (data: ChangePasswordDto) => {
    try {
      await authService.changePassword(data);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (
    data: SendPasswordResetDto,
  ): Promise<string> => {
    try {
      const response = await authService.sendPasswordReset(data);
      return response.message;
    } catch (error) {
      console.error('Send password reset error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    deleteAccount,
    changePassword,
    sendPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
