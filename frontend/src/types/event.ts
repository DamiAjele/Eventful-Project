// src/types/event.ts
import { User } from './user';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface TicketTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerImage?: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  isFeatured: boolean;
  tags: string[];
  category?: string;
  shareableSlug: string;
  defaultReminderOffsets: number[];
  creator: User;
  ticketTiers: TicketTier[];
  createdAt: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  startDate?: string;
  page?: number;
  limit?: number;
}
