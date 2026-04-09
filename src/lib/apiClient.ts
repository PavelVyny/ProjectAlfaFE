import axios from 'axios';

// =============================================================================
// API клиент — общий axios instance для всех TanStack Query хуков
// =============================================================================
// Это НЕ тот axios, что используется для авторизации (authService.ts имеет свой).
// Два клиента разделены по принципу единой ответственности:
//   - authApi (в authService.ts) → логин, регистрация, рефреш токенов
//   - apiClient (этот файл) → всё остальное: ивенты, бронирования, админ
// =============================================================================

// Базовый URL бэкенда. NEXT_PUBLIC_ префикс означает, что переменная доступна
// и на сервере, и в браузере (Next.js компилирует её в клиентский бандл).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Создаём axios instance с дефолтными настройками.
// Все запросы через этот клиент автоматически получают:
//   - baseURL: не нужно писать полный URL в каждом запросе
//   - Content-Type: JSON по умолчанию
//   - withCredentials: браузер отправляет куки (нужно для refresh_token)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ВАЖНО: без этого httpOnly куки не отправляются кросс-домен
});

// =============================================================================
// Request Interceptor — выполняется ПЕРЕД каждым запросом
// =============================================================================
// Задача: автоматически добавлять JWT токен в заголовок Authorization.
// Без этого защищённые эндпоинты вернут 401 Unauthorized.
apiClient.interceptors.request.use(
  (config) => {
    // typeof window !== 'undefined' — защита от SSR.
    // Next.js рендерит компоненты на сервере, где нет localStorage.
    // Без этой проверки будет ReferenceError: localStorage is not defined.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Bearer — стандартный формат авторизации через JWT.
        // Бэкенд JwtStrategy извлекает токен из этого заголовка.
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
