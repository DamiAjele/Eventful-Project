import api from './axios';
import { Ticket } from '@/types/ticket';

export const ticketsApi = {
  getMyTickets: (params: { page: number; limit: number }) =>
    api.get('/tickets/my-tickets', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`).then((r) => r.data),

  validateQR: (qrData: string) =>
    api.post('/qr-codes/validate', { qrData }).then((r) => r.data),
};
