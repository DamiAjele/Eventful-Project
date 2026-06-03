import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/events.api';
import { EventFilters } from '@/types/event';

export const useEvents = (filters: EventFilters) =>
  useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters),
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });

export const useEventBySlug = (slug: string) =>
  useQuery({
    queryKey: ['event', 'slug', slug],
    queryFn: () => eventsApi.getBySlug(slug),
    enabled: !!slug,
  });

export const useMyEvents = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['my-events', page, limit],
    queryFn: () => eventsApi.getMyEvents({ page, limit }),
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
};
