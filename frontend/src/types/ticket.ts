// src/types/ticket.ts
import { Event, TicketTier } from './event';

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';

export interface Ticket {
  id: string;
  ticketCode: string;
  status: TicketStatus;
  qrCodeUrl: string;
  qrCodeData?: string;
  scannedAt?: string;
  pricePaid: number;
  event: Event;
  ticketTier: TicketTier;
  createdAt: string;
}
