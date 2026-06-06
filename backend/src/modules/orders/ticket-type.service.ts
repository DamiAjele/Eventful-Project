import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketTypeService {
  // This is a very small in-memory stand-in. Replace with real logic that
  // checks/updates persistent stock (DB or Redis lock) in production.

  private mockStore = new Map<string, { price: number; available: number }>();

  constructor() {
    // seed some mock ticket types for local development
    this.mockStore.set('default', { price: 100, available: 50 });
  }

  async getTicketType(ticketTypeId: string) {
    return (
      this.mockStore.get(ticketTypeId) || {
        id: ticketTypeId,
        price: 100,
        available: 0,
      }
    );
  }

  async reserveStock(ticketTypeId: string, quantity: number) {
    const t = this.mockStore.get(ticketTypeId);
    if (!t) return false;
    if (t.available < quantity) return false;
    t.available -= quantity;
    this.mockStore.set(ticketTypeId, t);
    return true;
  }

  async restoreStock(ticketTypeId: string, quantity: number) {
    const t = this.mockStore.get(ticketTypeId) || { price: 100, available: 0 };
    t.available += quantity;
    this.mockStore.set(ticketTypeId, t);
    return true;
  }
}
