import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets.api';

export const useMyTickets = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['my-tickets', page, limit],
    queryFn: () => ticketsApi.getMyTickets({ page, limit }),
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
  });
