/**
 * Centralized authentication logging utility
 * Provides color-coded console logs for different auth events
 */

export enum AuthEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  API_REQUEST = 'API_REQUEST',
  API_RESPONSE = 'API_RESPONSE',
  API_ERROR = 'API_ERROR',
  QUEUE_REQUEST = 'QUEUE_REQUEST',
  QUEUE_PROCESS = 'QUEUE_PROCESS',
}

interface LogData {
  [key: string]: unknown;
}

/**
 * Color codes for different event types
 */
const EVENT_COLORS: Record<AuthEventType, string> = {
  [AuthEventType.LOGIN]: '#4CAF50', // Green
  [AuthEventType.LOGOUT]: '#FF9800', // Orange
  [AuthEventType.REGISTER]: '#2196F3', // Blue
  [AuthEventType.TOKEN_REFRESH]: '#9C27B0', // Purple
  [AuthEventType.TOKEN_EXPIRED]: '#F44336', // Red
  [AuthEventType.API_REQUEST]: '#00BCD4', // Cyan
  [AuthEventType.API_RESPONSE]: '#8BC34A', // Light Green
  [AuthEventType.API_ERROR]: '#D32F2F', // Dark Red
  [AuthEventType.QUEUE_REQUEST]: '#FFC107', // Amber
  [AuthEventType.QUEUE_PROCESS]: '#673AB7', // Deep Purple
};

/**
 * Emoji prefixes for different event types
 */
const EVENT_EMOJIS: Record<AuthEventType, string> = {
  [AuthEventType.LOGIN]: '🔐',
  [AuthEventType.LOGOUT]: '👋',
  [AuthEventType.REGISTER]: '📝',
  [AuthEventType.TOKEN_REFRESH]: '🔄',
  [AuthEventType.TOKEN_EXPIRED]: '⏰',
  [AuthEventType.API_REQUEST]: '📤',
  [AuthEventType.API_RESPONSE]: '📥',
  [AuthEventType.API_ERROR]: '❌',
  [AuthEventType.QUEUE_REQUEST]: '📋',
  [AuthEventType.QUEUE_PROCESS]: '⚙️',
};

/**
 * Format timestamp for logging
 */
function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

/**
 * Log an authentication event with color coding and formatting
 */
export function logAuthEvent(
  event: AuthEventType,
  message: string,
  data?: LogData,
): void {
  const timestamp = formatTimestamp();
  const emoji = EVENT_EMOJIS[event];
  const color = EVENT_COLORS[event];

  const prefix = `${emoji} [${event}] ${timestamp}`;

  if (data && Object.keys(data).length > 0) {
    console.log(
      `%c${prefix} ${message}`,
      `color: ${color}; font-weight: bold;`,
      '\nData:',
      data,
    );
  } else {
    console.log(
      `%c${prefix} ${message}`,
      `color: ${color}; font-weight: bold;`,
    );
  }
}

/**
 * Log API request with details
 */
export function logApiRequest(
  method: string,
  url: string,
  hasAuth: boolean,
): void {
  logAuthEvent(AuthEventType.API_REQUEST, `${method.toUpperCase()} ${url}`, {
    method,
    url,
    hasAuthToken: hasAuth,
  });
}

/**
 * Log API response with details
 */
export function logApiResponse(
  method: string,
  url: string,
  status: number,
  duration?: number,
): void {
  logAuthEvent(
    AuthEventType.API_RESPONSE,
    `${method.toUpperCase()} ${url} - ${status}`,
    {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : 'N/A',
    },
  );
}

/**
 * Log API error with details
 */
export function logApiError(
  method: string,
  url: string,
  status: number | string,
  error: unknown,
  duration?: number,
): void {
  const errorMessage = (error as Error)?.message || String(error);
  logAuthEvent(
    AuthEventType.API_ERROR,
    `${method.toUpperCase()} ${url} - Error ${status}`,
    {
      method,
      url,
      status,
      error: errorMessage,
      duration: duration ? `${duration}ms` : 'N/A',
      stack: (error as Error)?.stack,
    },
  );
}

/**
 * Log token refresh event
 */
export function logTokenRefresh(success: boolean, reason?: string): void {
  if (success) {
    logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Token refreshed successfully');
  } else {
    logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Token refresh failed', {
      reason,
    });
  }
}

/**
 * Log request queued during token refresh
 */
export function logRequestQueued(url: string, queueLength: number): void {
  logAuthEvent(AuthEventType.QUEUE_REQUEST, `Request queued: ${url}`, {
    url,
    queueLength,
  });
}

/**
 * Log queue processing
 */
export function logQueueProcess(
  success: boolean,
  queueLength: number,
  newToken?: string,
): void {
  if (success) {
    logAuthEvent(
      AuthEventType.QUEUE_PROCESS,
      `Processing ${queueLength} queued requests`,
      {
        queueLength,
        hasNewToken: !!newToken,
      },
    );
  } else {
    logAuthEvent(
      AuthEventType.QUEUE_PROCESS,
      `Failing ${queueLength} queued requests`,
      {
        queueLength,
      },
    );
  }
}
