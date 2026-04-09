// =============================================================================
// useBookEvent — мутация для бронирования места на ивент
// =============================================================================
// МУТАЦИЯ ≠ ЗАПРОС
//
// useQuery  = "дай мне данные"    (GET)  → кеширует, авто-рефетчит
// useMutation = "измени данные"   (POST) → НЕ кеширует, НЕ рефетчит
//
// Мутации — это действия: создать, обновить, удалить.
// После успеха мы ВРУЧНУЮ говорим TQ, какие кеши обновить.
// =============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface BookEventPayload {
  eventId: string;
  email: string;
  participant_count: number;
}

export function useBookEvent() {
  // useQueryClient() — доступ к тому же экземпляру QueryClient,
  // который создан в QueryProvider. Через него мы управляем кешем:
  // инвалидируем, обновляем, читаем.
  const queryClient = useQueryClient();

  return useMutation({
    // ===========================================================================
    // mutationFn — HTTP запрос на бронирование
    // ===========================================================================
    // Вызывается когда компонент делает bookEvent.mutate({ eventId, email, ... })
    // POST /events/:id/book → бэкенд проверяет capacity, создаёт бронь
    // Если мест не хватает → бэкенд вернёт 400 → TQ вызовет onError
    mutationFn: async ({ eventId, email, participant_count }: BookEventPayload) => {
      const response = await apiClient.post(`/events/${eventId}/book`, {
        email,
        participant_count,
      });
      return response.data.data;
    },

    // ===========================================================================
    // onSuccess — вызывается ПОСЛЕ успешного бронирования
    // ===========================================================================
    // Задача: сказать TQ, что данные в кеше устарели.
    //
    // invalidateQueries НЕ удаляет данные из кеша. Он помечает их как "stale"
    // (устаревшие). Если какой-то компонент сейчас отображает эти данные,
    // TQ мгновенно делает фоновый refetch и обновляет UI.
    //
    // Результат для юзера:
    //   1. Нажал "Book Now" → запрос улетел
    //   2. Бронь создана → onSuccess
    //   3. TQ рефетчит GET /events/:id → remaining_capacity обновился
    //   4. Текст "248 seats left" плавно стал "246 seats left"
    //   5. Никакой перезагрузки страницы, никакого ручного setState
    onSuccess: (_data, variables) => {
      // Инвалидировать конкретный ивент → обновит remaining_capacity на детальной
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      // Инвалидировать список ивентов → обновит remaining_capacity на главной
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// =============================================================================
// КАК JUNIOR ПОДКЛЮЧИТ ЭТОТ ХУК К ФОРМЕ БРОНИРОВАНИЯ:
// =============================================================================
//
// import { useBookEvent } from '@/hooks/useBookEvent';
// import { useToast } from '@/contexts/ToastContext';
//
// function BookingForm({ eventId }: { eventId: string }) {
//   const bookEvent = useBookEvent();
//   const { showToast } = useToast();
//
//   const onSubmit = (data: { email: string; count: number }) => {
//     bookEvent.mutate(
//       {
//         eventId,
//         email: data.email,
//         participant_count: data.count,
//       },
//       {
//         // Колбэки можно указать и тут — они добавятся к тем, что в хуке
//         onSuccess: () => showToast('Booking confirmed!', 'success'),
//         onError: (err) => showToast(err.message, 'error'),
//       }
//     );
//   };
//
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <input name="email" type="email" />
//       <input name="count" type="number" min={1} />
//       <button disabled={bookEvent.isPending}>
//         {bookEvent.isPending ? 'Booking...' : 'Book Now'}
//       </button>
//     </form>
//   );
// }
// =============================================================================
