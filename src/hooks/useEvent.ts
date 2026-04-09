// =============================================================================
// useEvent — хук для получения ОДНОГО ивента по ID
// =============================================================================
// Используется на детальной странице ивента (EventDetail).
//
// КЛЮЧЕВАЯ ОСОБЕННОСТЬ: eventQueryOptions(id) экспортируется отдельно,
// чтобы ОДИН И ТОТ ЖЕ queryKey использовался:
//   - На СЕРВЕРЕ: prefetchQuery(eventQueryOptions(id)) в page.tsx
//   - На КЛИЕНТЕ: useQuery(eventQueryOptions(id)) в EventDetail.tsx
//
// Это то, что делает SSR + гидрацию возможной без двойного запроса.
// =============================================================================

import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Event } from '@/types/event';

// =============================================================================
// eventQueryOptions(id) — фабрика конфигурации запроса с параметром
// =============================================================================
// В отличие от eventsQueryOptions (статичный), здесь queryKey ЗАВИСИТ от id.
// Каждый ивент имеет свой собственный слот в кеше:
//   ['events', 'abc123'] — кеш для ивента abc123
//   ['events', 'def456'] — кеш для ивента def456
//
// Это значит: если юзер посмотрел ивент abc123, потом def456,
// а потом вернулся на abc123 — TQ отдаст из кеша мгновенно.
// =============================================================================
export const eventQueryOptions = (id: string) =>
  queryOptions({
    // queryKey: ['events', id]
    // Иерархический ключ. Удобство:
    //   invalidateQueries({ queryKey: ['events'] })         — сбросит ВСЁ: и список, и все детальные
    //   invalidateQueries({ queryKey: ['events', 'abc'] })  — сбросит только ивент 'abc'
    queryKey: ['events', id],

    queryFn: async (): Promise<Event> => {
      const response = await apiClient.get(`/events/${id}`);

      // Структура ответа бэкенда для одного ивента:
      // axios response.data = {
      //   success: true,
      //   data: { id, title, description, ... }  ← response.data.data
      // }
      return response.data.data as Event;
    },

    staleTime: 60 * 1000,
  });

// =============================================================================
// useEvent(id) — React хук для клиентских компонентов
// =============================================================================
// Когда EventDetail вызывает useEvent(id):
//
// СЦЕНАРИЙ 1 — Юзер перешёл по ссылке (серверный рендер):
//   1. page.tsx (сервер) уже вызвал prefetchQuery → данные в dehydratedState
//   2. HydrationBoundary загрузил их в клиентский кеш
//   3. useQuery находит данные по ключу ['events', id] → isLoading = false сразу!
//   4. Нулевой лишний HTTP запрос
//
// СЦЕНАРИЙ 2 — Клиентская навигация (SPA переход):
//   1. Серверного prefetch не было (Next.js не вызывает page.tsx при SPA навигации)
//   2. useQuery не находит данные в кеше → isLoading = true
//   3. TQ вызывает queryFn → GET /events/:id
//   4. Данные приходят → isLoading = false, data = Event
//
// СЦЕНАРИЙ 3 — Повторный визит (данные в кеше):
//   1. Данные уже есть от предыдущего визита
//   2. Если < 60 сек → отдаёт из кеша, запроса нет
//   3. Если > 60 сек → показывает кеш, но делает фоновый refetch
// =============================================================================
export function useEvent(id: string) {
  return useQuery(eventQueryOptions(id));
}
