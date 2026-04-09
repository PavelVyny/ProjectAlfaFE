// =============================================================================
// useEvents — хук для получения списка ивентов
// =============================================================================
// Используется на главной странице (MainSection) для отображения карточек.
// Данные кешируются TanStack Query — повторные визиты не тригерят новый запрос.
// =============================================================================

import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Event } from '@/types/event';

// Тип метаданных пагинации, которые приходят с бэкенда
interface EventsMeta {
  total: number;      // Общее кол-во опубликованных ивентов
  page: number;       // Текущая страница
  limit: number;      // Ивентов на страницу
  totalPages: number; // Всего страниц
}

// Результат, который хук возвращает компоненту
interface EventsResult {
  events: Event[];
  meta: EventsMeta | undefined;
}

// =============================================================================
// queryOptions() — фабрика конфигурации запроса
// =============================================================================
// Создаёт объект с queryKey + queryFn, который можно использовать:
//   1. В useQuery() — для клиентского запроса (MainSection)
//   2. В prefetchQuery() — для серверного prefetch (если понадобится)
//
// ЗАЧЕМ отдельно от useQuery?
// Чтобы один и тот же ключ кеша использовался и на сервере, и на клиенте.
// Если ключи разные — TQ не найдёт серверные данные и сделает лишний запрос.
// =============================================================================
export const eventsQueryOptions = queryOptions({
  // queryKey: ['events']
  // Уникальный идентификатор этих данных в кеше TanStack Query.
  // TQ использует его как "адрес" в хранилище:
  //   - Любой useQuery с ключом ['events'] получит ТЕ ЖЕ данные
  //   - invalidateQueries({ queryKey: ['events'] }) пометит их как устаревшие
  //   - Разные ключи = разные данные: ['events'] и ['events', 'abc'] — это два разных кеша
  queryKey: ['events'],

  // queryFn — функция, которая делает реальный HTTP запрос.
  // TQ вызывает её ТОЛЬКО когда:
  //   1. Данных нет в кеше (первая загрузка)
  //   2. Данные "протухли" (прошло больше staleTime секунд)
  //   3. Кто-то вызвал invalidateQueries для этого ключа
  queryFn: async (): Promise<EventsResult> => {
    const response = await apiClient.get('/events');

    // Бэкенд ResponseInterceptor оборачивает каждый ответ:
    //
    // axios response.data = {
    //   success: true,
    //   data: {                         ← response.data.data
    //     data: [Event, Event, ...],    ← response.data.data.data (массив ивентов)
    //     meta: {                       ← response.data.data.meta (пагинация)
    //       total: 9,
    //       page: 1,
    //       limit: 20,
    //       totalPages: 1
    //     }
    //   },
    //   timestamp: "2026-04-01T..."
    // }
    //
    // Три уровня .data — это не баг:
    //   1. response.data — axios разворачивает HTTP ответ
    //   2. .data — ResponseInterceptor бэкенда оборачивает в { success, data }
    //   3. .data — EventsController возвращает { data: events[], meta: {} }
    const payload = response.data.data;
    return {
      events: payload.data as Event[],
      meta: payload.meta as EventsMeta,
    };
  },

  // staleTime: 60 секунд — данные считаются "свежими" одну минуту.
  // См. подробное объяснение в QueryProvider.tsx
  staleTime: 60 * 1000,
});

// =============================================================================
// useEvents() — React хук для компонентов
// =============================================================================
// Компоненты вызывают ЭТОТ хук, а не useQuery напрямую.
// Это тонкая обёртка, которая:
//   1. Передаёт конфигурацию в useQuery
//   2. Возвращает удобный объект вместо "сырого" TQ ответа
//
// Что возвращает:
//   events   — массив ивентов (или [] пока грузится)
//   meta     — данные пагинации
//   isLoading — true ТОЛЬКО при первом запросе, когда кеша ещё нет.
//               При background refetch (когда данные stale) isLoading = false,
//               потому что TQ показывает старые данные пока грузятся новые.
//   isError   — true если запрос упал (сервер недоступен, 500, и т.д.)
//   error     — объект ошибки для отображения
// =============================================================================
export function useEvents() {
  const { data, isLoading, isError, error } = useQuery(eventsQueryOptions);
  return {
    events: data?.events ?? [],  // ?? [] — пока data = undefined (первая загрузка), возвращаем пустой массив
    meta: data?.meta,
    isLoading,
    isError,
    error,
  };
}
