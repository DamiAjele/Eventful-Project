import api from './axios';

export const paymentsApi = {
  initialize: (data: { ticketTierId: string; quantity: number }) =>
    api.post('/payments/initialize', data).then((r) => r.data),

  verify: (reference: string) =>
    api.get(`/payments/verify/${reference}`).then((r) => r.data),

  getCreatorPayments: (params: { page: number; limit: number }) =>
    api.get('/payments/creator/all', { params }).then((r) => r.data),
};
