import api from './axios';
import { Event, EventFilters } from '@/types/event';

export const eventsApi = {
  getAll: (filters: EventFilters) =>
    api.get('/events', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Event>(`/events/${id}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<Event>(`/events/slug/${slug}`).then((r) => r.data),

  getMyEvents: (params: { page: number; limit: number }) =>
    api.get('/events/my-events', { params }).then((r) => r.data),

  create: (data: FormData) =>
    api.post<Event>('/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, data: Partial<Event>) =>
    api.patch<Event>(`/events/${id}`, data).then((r) => r.data),

  publish: (id: string) =>
    api.post<Event>(`/events/${id}/publish`).then((r) => r.data),

  getAttendees: (id: string) =>
    api.get(`/events/${id}/attendees`).then((r) => r.data),

  getShareLinks: (id: string) =>
    api.get(`/events/${id}/share`).then((r) => r.data),
};
