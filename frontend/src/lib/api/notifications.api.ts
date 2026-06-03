import api from './axios';

export const notificationsApi = {
  getAll: (params: { page: number; limit: number }) =>
    api.get('/notifications', { params }).then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/mark-all-read').then((r) => r.data),

  setReminder: (eventId: string, offsetHours: number[]) =>
    api.post(`/notifications/events/${eventId}/reminders`, { offsetHours }).then((r) => r.data),
};
