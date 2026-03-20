import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import {
  logTokenRefresh,
  logRequestQueued,
  logQueueProcess,
} from '../utils/authLogger';

/**
 * Token Refresh Service - Singleton Pattern
 *
 * Handles token refresh with request queuing to prevent race conditions.
 * When multiple requests fail with 401, only one refresh request is made,
 * and all other requests are queued and retried after refresh completes.
 *
 * Benefits:
 * - Prevents multiple simultaneous refresh calls
 * - Queues failed requests and retries them with new token
 * - Handles concurrent requests gracefully
 * - Provides centralized refresh logic
 */

interface QueuedRequest {
  resolve: (value: AxiosRequestConfig) => void;
  reject: (reason: unknown) => void;
  config: AxiosRequestConfig;
}

class TokenRefreshService {
  // Singleton instance
  private static instance: TokenRefreshService;

  // Flag to track if a refresh is currently in progress
  private isRefreshing: boolean = false;

  // Queue of requests waiting for token refresh to complete
  private failedQueue: QueuedRequest[] = [];

  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  /**
   * Process the queue after token refresh
   * @param error - Error if refresh failed, null if successful
   * @param token - New access token if refresh succeeded
   */
  private processQueue(error: Error | null, token: string | null = null): void {
    const queueLength = this.failedQueue.length;

    logQueueProcess(!error, queueLength, token || undefined);

    // Process all queued requests
    this.failedQueue.forEach((queuedRequest) => {
      if (error) {
        // Refresh failed - reject all queued requests
        queuedRequest.reject(error);
      } else {
        // Refresh succeeded - retry all queued requests with new token
        if (token && queuedRequest.config.headers) {
          queuedRequest.config.headers.Authorization = `Bearer ${token}`;
        }
        queuedRequest.resolve(queuedRequest.config);
      }
    });

    // Clear the queue
    this.failedQueue = [];
  }

  /**
   * Add a request to the queue
   * @param config - Axios request config
   * @returns Promise that resolves with updated config or rejects on error
   */
  public addToQueue(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject, config });
      logRequestQueued(config.url || 'unknown', this.failedQueue.length);
    });
  }

  /**
   * Check if a refresh is currently in progress
   */
  public isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Refresh the access token using the httpOnly cookie
   * @returns Promise with new access token or null on failure
   */
  public async refreshAccessToken(): Promise<string | null> {
    // If already refreshing, don't start another refresh
    if (this.isRefreshing) {
      console.warn(
        '🔄 [TOKEN REFRESH] Refresh already in progress, skipping...',
      );

      return null;
    }

    this.isRefreshing = true;
    const startTime = Date.now();

    console.log('🔄 [TOKEN REFRESH] Starting token refresh...', {
      timestamp: new Date().toISOString(),
      queuedRequests: this.failedQueue.length,
    });

    try {
      // Call refresh endpoint - refresh_token is in httpOnly cookie
      const response = await axios.post(
        `${this.API_BASE_URL}/auth/refresh`,
        {}, // Empty body - token is in cookie
        {
          withCredentials: true, // Important: send cookies
          timeout: 10000, // 10 second timeout
        },
      );

      const { access_token } = response.data.data || response.data;
      const duration = Date.now() - startTime;

      console.log('✅ [TOKEN REFRESH] Token refresh successful', {
        duration: `${duration}ms`,
        hasNewToken: !!access_token,
      });

      // Store new token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access_token);
      }

      // Process queue with new token
      this.processQueue(null, access_token);
      logTokenRefresh(true);

      return access_token;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const axiosError = error as AxiosError;

      console.error('❌ [TOKEN REFRESH] Token refresh failed', {
        error: axiosError?.message || 'Unknown error',
        status: axiosError?.response?.status,
        duration: `${duration}ms`,
      });

      // Process queue with error
      this.processQueue(error as Error, null);
      logTokenRefresh(false, axiosError?.message || 'Refresh failed');

      // Clear tokens on refresh failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }

      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Reset the service state (useful for logout)
   */
  public reset(): void {
    console.log('🔄 [TOKEN REFRESH] Resetting service state');
    this.isRefreshing = false;
    this.failedQueue = [];
  }
}

// Export singleton instance
export const tokenRefreshService = TokenRefreshService.getInstance();
