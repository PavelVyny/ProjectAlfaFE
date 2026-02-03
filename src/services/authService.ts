import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  SendPasswordResetDto,
  SendPasswordResetResponseDto,
} from '../types/auth';
import { tokenRefreshService } from './tokenRefreshService';
import {
  logAuthEvent,
  AuthEventType,
  logApiRequest,
  logApiResponse,
  logApiError,
} from '../utils/authLogger';

// Create axios instance with base URL - direct to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Enable sending cookies (for httpOnly refresh token)
});

/**
 * Request Interceptor
 * Adds authorization header and logs all requests
 */
// Extend axios config type to include custom metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
}

authApi.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    const startTime = Date.now();
    // Add custom property for timing
    config.metadata = { startTime };

    // Add access token to header
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request
    logApiRequest(config.method || 'unknown', config.url || 'unknown', !!token);

    return config;
  },
  (error) => {
    console.error('❌ [AUTH API] Request interceptor error:', error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles 401 errors with automatic token refresh and request retry
 * Implements request queuing to prevent race conditions
 */
authApi.interceptors.response.use(
  (response) => {
    // Access custom metadata
    const extendedConfig = response.config as ExtendedAxiosRequestConfig;
    const duration = extendedConfig.metadata?.startTime
      ? Date.now() - extendedConfig.metadata.startTime
      : undefined;

    // Log successful response
    logApiResponse(
      response.config.method || 'unknown',
      response.config.url || 'unknown',
      response.status,
      duration,
    );

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Access custom metadata
    const duration = originalRequest?.metadata?.startTime
      ? Date.now() - originalRequest.metadata.startTime
      : undefined;

    // Log error
    if (error.response) {
      logApiError(
        originalRequest?.method || 'unknown',
        originalRequest?.url || 'unknown',
        error.response.status,
        error,
        duration,
      );
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      console.log('🔒 [AUTH API] 401 Unauthorized - Attempting token refresh');

      // Check if refresh is already in progress
      if (tokenRefreshService.isCurrentlyRefreshing()) {
        console.log(
          '⏳ [AUTH API] Token refresh in progress, queueing request...',
        );

        // Add request to queue and wait for refresh to complete
        try {
          const updatedConfig = await tokenRefreshService.addToQueue(
            originalRequest,
          );
          return authApi(updatedConfig);
        } catch (queueError) {
          console.error('❌ [AUTH API] Queued request failed:', queueError);
          // Redirect to login on queue failure
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(queueError);
        }
      }

      // Mark request as retry to prevent infinite loops
      originalRequest._retry = true;

      // Attempt to refresh token
      const newAccessToken = await tokenRefreshService.refreshAccessToken();

      if (newAccessToken) {
        console.log('✅ [AUTH API] Token refreshed, retrying original request');

        // Update authorization header with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request with new token
        return authApi(originalRequest);
      } else {
        console.error(
          '❌ [AUTH API] Token refresh failed, redirecting to login',
        );

        // Clear auth data and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }

        return Promise.reject(error);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  },
);

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    logAuthEvent(AuthEventType.REGISTER, 'Registration attempt', {
      email: data.email,
    });
    const response = await authApi.post('/auth/register', data);
    const authData = response.data.data || response.data;
    logAuthEvent(AuthEventType.REGISTER, 'Registration successful', {
      userId: authData.user.id,
    });
    return authData;
  },

  async login(data: LoginDto): Promise<AuthResponseDto> {
    logAuthEvent(AuthEventType.LOGIN, 'Login attempt', { email: data.email });
    const response = await authApi.post('/auth/login', data);
    const authData = response.data.data || response.data;
    logAuthEvent(AuthEventType.LOGIN, 'Login successful', {
      userId: authData.user.id,
      email: authData.user.email,
    });
    return authData;
  },

  // Google login
  async googleLogin(idToken: string): Promise<AuthResponseDto> {
    logAuthEvent(AuthEventType.LOGIN, 'Google login attempt');
    const response = await authApi.post('/auth/google', {
      credential: idToken,
    });
    const authData = response.data.data || response.data;
    logAuthEvent(AuthEventType.LOGIN, 'Google login successful', {
      userId: authData.user.id,
      email: authData.user.email,
    });
    return authData;
  },

  // Change password
  async changePassword(
    data: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    const response = await authApi.post('/auth/change-password', data);
    return response.data.data || response.data;
  },

  // Send password reset email
  async sendPasswordReset(
    data: SendPasswordResetDto,
  ): Promise<SendPasswordResetResponseDto> {
    const response = await authApi.post('/auth/send-password-reset', data);
    return response.data.data || response.data;
  },

  // Update user profile
  async updateProfile(data: {
    nickname?: string;
    email?: string;
  }): Promise<{ user: AuthResponseDto['user'] }> {
    logAuthEvent(AuthEventType.REGISTER, 'Profile update attempt', data);
    const response = await authApi.post('/auth/profile', data);
    const result = response.data.data || response.data;
    logAuthEvent(AuthEventType.REGISTER, 'Profile update successful', {
      userId: result.user.id,
    });
    return result;
  },

  /**
   * Logout - Calls backend to revoke refresh token and clears local storage
   */
  async logout(): Promise<void> {
    logAuthEvent(AuthEventType.LOGOUT, 'Logout initiated');

    try {
      // Call backend logout to revoke refresh token
      await authApi.post('/auth/logout');
      logAuthEvent(AuthEventType.LOGOUT, 'Backend logout successful');
    } catch (error) {
      console.error('❌ [AUTH] Logout API call failed:', error);
      // Continue with local cleanup even if API fails
    }

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Reset token refresh service state
    tokenRefreshService.reset();

    logAuthEvent(
      AuthEventType.LOGOUT,
      'Logout completed - local storage cleared',
    );
  },

  /**
   * Save auth data to localStorage
   * Note: refresh_token is now in httpOnly cookie, not saved here
   */
  saveAuthData(data: AuthResponseDto): void {
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_data', JSON.stringify(data.user));

    console.log('💾 [AUTH] Auth data saved to localStorage', {
      userId: data.user.id,
      email: data.user.email,
      hasAccessToken: !!data.access_token,
    });
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Get user data
  getUser(): {
    id: string;
    email: string;
    nickname?: string;
    firebaseUid?: string;
    avatar?: string;
    googleId?: string;
  } | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Update locally stored user (client-side only helper)
  updateLocalUser(
    partial: Partial<{
      id: string;
      email: string;
      nickname?: string;
      firebaseUid?: string;
      avatar?: string;
      googleId?: string;
    }>,
  ): {
    id: string;
    email: string;
    nickname?: string;
    firebaseUid?: string;
    avatar?: string;
    googleId?: string;
  } | null {
    const current = this.getUser();
    if (!current) return null;
    const updated = { ...current, ...partial } as {
      id: string;
      email: string;
      nickname?: string;
      firebaseUid?: string;
      avatar?: string;
      googleId?: string;
    };
    localStorage.setItem('user_data', JSON.stringify(updated));
    return updated;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Delete account (placeholder: clear auth and simulate success)
  async deleteAccount(): Promise<void> {
    // Replace with real API call if backend supports account deletion
    await this.logout();
  },
};
