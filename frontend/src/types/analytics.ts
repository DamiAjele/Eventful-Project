// src/types/analytics.ts

export interface CreatorOverallAnalytics {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalScanned: number;
  scanRate: string;
}

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  capacity: number;
  ticketsSold: number;
  scannedCount: number;
  revenue: number;
  ticketsByTier: Array<{ tierName: string; count: number }>;
  soldPercentage: string;
  scanPercentage: string;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  transactions: number;
}
