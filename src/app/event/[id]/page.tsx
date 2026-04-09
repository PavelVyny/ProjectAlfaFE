// =============================================================================
// Детальная страница ивента — СЕРВЕРНЫЙ компонент
// =============================================================================
// Это СЕРВЕРНАЯ часть паттерна "Server Fetch + Client Hydration".
//
// ЗАЧЕМ два компонента (page.tsx + EventDetail.tsx)?
// Next.js App Router по умолчанию рендерит page.tsx на сервере.
// TanStack Query хуки (useQuery) работают ТОЛЬКО на клиенте.
// Поэтому мы разделяем:
//   - page.tsx (этот файл) — сервер, делает prefetch данных
//   - EventDetail.tsx — клиент, рендерит UI с теми же данными
//
// ПОТОК ДАННЫХ:
//   1. Юзер открыл /event/abc123
//   2. Next.js вызывает ЭТОТ файл на сервере
//   3. Мы создаём QueryClient, делаем prefetchQuery → данные в кеше сервера
//   4. dehydrate() превращает кеш в JSON
//   5. HydrationBoundary вкладывает JSON в HTML
//   6. Браузер получает HTML с данными (SEO: поисковик видит контент!)
//   7. React гидрирует → HydrationBoundary загружает JSON в клиентский кеш
//   8. EventDetail вызывает useEvent(id) → данные УЖЕ в кеше → isLoading = false
//   9. НОЛЬ лишних запросов к бэкенду
// =============================================================================

import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventQueryOptions } from '@/hooks/useEvent';
import { EventDetail } from '@/components/EventDetail';

interface Props {
  params: Promise<{ id: string }>;
}

// =============================================================================
// generateMetadata — Next.js вызывает это для <title> и <meta description>
// =============================================================================
// Тоже серверная функция. Получает данные ивента, чтобы в заголовке вкладки
// было "Neon Nights Music Festival | ProjectAlfa" а не просто "ProjectAlfa".
// Это важно для SEO и шеринга ссылок (Open Graph).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const queryClient = new QueryClient();
  try {
    const event = await queryClient.fetchQuery(eventQueryOptions(id));
    return {
      title: `${event.title} | ProjectAlfa`,
      description: event.description,
    };
  } catch {
    return { title: "Event not found" };
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;

  // Создаём НОВЫЙ QueryClient для этого серверного запроса.
  // Нельзя использовать общий (тот что в QueryProvider) — он клиентский.
  // Серверный QueryClient живёт только на время рендера этой страницы.
  const queryClient = new QueryClient();

  try {
    // prefetchQuery — загружает данные в кеш queryClient, но НЕ возвращает их.
    // Мы используем eventQueryOptions(id) — ТОТ ЖЕ объект, что в useEvent(id).
    // Это КРИТИЧЕСКИ ВАЖНО: queryKey должен совпасть, иначе гидрация не сработает.
    //
    // Что происходит:
    //   queryClient.prefetchQuery({
    //     queryKey: ['events', 'abc123'],     ← ключ
    //     queryFn: () => apiClient.get(...)    ← HTTP запрос на сервере
    //   })
    //   → GET http://localhost:4000/events/abc123
    //   → результат ложится в кеш под ключом ['events', 'abc123']
    await queryClient.prefetchQuery(eventQueryOptions(id));
  } catch {
    notFound();
  }

  // dehydrate() — "высушивает" кеш queryClient в сериализуемый JSON.
  // По сути, это { queries: [{ queryKey: ['events', 'abc123'], state: { data: Event } }] }
  // Этот JSON будет вставлен в HTML как <script> тег.
  const dehydratedState = dehydrate(queryClient);

  // HydrationBoundary — компонент TQ, который:
  //   1. На сервере: ничего не делает, просто рендерит children
  //   2. На клиенте: берёт dehydratedState и загружает его в клиентский QueryClient
  //      (тот, что в QueryProvider). После этого useEvent(id) в EventDetail
  //      найдёт данные в кеше и НЕ будет делать повторный запрос.
  return (
    <HydrationBoundary state={dehydratedState}>
      <EventDetail id={id} />
    </HydrationBoundary>
  );
}
