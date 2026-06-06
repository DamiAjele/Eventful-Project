import { Injectable, Inject, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { REDIS_CLIENT } from '../cache/redis.provider';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepo: Repository<AnalyticsSnapshot>,
    private cache: CacheService,
    @Inject(REDIS_CLIENT) private readonly redisClient: any,
  ) {}

  // Record a successful payment fulfillment: increment revenue and tickets sold counters
  async recordPaymentEvent(payment: Payment) {
    try {
      const eventId =
        payment.type?.eventId?.id ?? (payment.type as any)?.event?.id;
      if (!eventId) return;
      const revenueKey = `analytics:revenue:event:${eventId}`;
      const salesKey = `analytics:sales:event:${eventId}`;
      const amount = Number(payment.amount || 0);
      // increment revenue (use INCRBYFLOAT if available)
      if (this.redisClient && this.redisClient.incrbyfloat) {
        await this.redisClient.incrbyfloat(revenueKey, amount);
      } else if (this.redisClient && this.redisClient.incrby) {
        await this.redisClient.incrby(revenueKey, Math.round(amount * 100));
      } else {
        // fallback: read, add, set
        const cur = Number((await this.cache.get<number>(revenueKey)) ?? 0);
        await this.cache.set(revenueKey, cur + amount);
      }
      // increment tickets sold by qty
      await this.redisClient.incrby(salesKey, payment.qty || 0);
    } catch (err) {
      this.logger.error('recordPaymentEvent error: ' + err);
    }
  }

  // Record ticket sale (direct ticket creation)
  async recordTicketSale(ticket: Ticket) {
    try {
      const eventId =
        ticket.type?.eventId?.id ?? (ticket.type as any)?.event?.id;
      if (!eventId) return;
      const salesKey = `analytics:sales:event:${eventId}`;
      await this.redisClient.incrby(salesKey, 1);
    } catch (err) {
      this.logger.error('recordTicketSale error: ' + err);
    }
  }

  // Record checkin
  async recordCheckin(ticketId: string, eventId: string, _auditor?: string) {
    try {
      const checkinKey = `analytics:checkins:event:${eventId}`;
      await this.redisClient.incrby(checkinKey, 1);
    } catch (err) {
      this.logger.error('recordCheckin error: ' + err);
    }
  }

  // Basic summary aggregation from Redis counters
  async getEventSummary(eventId: string) {
    const revenueKey = `analytics:revenue:event:${eventId}`;
    const salesKey = `analytics:sales:event:${eventId}`;
    const checkinKey = `analytics:checkins:event:${eventId}`;
    const revenue = (await this.cache.get<number>(revenueKey)) ?? 0;
    const sales = Number((await this.redisClient.get(salesKey)) ?? 0);
    const checkins = Number((await this.redisClient.get(checkinKey)) ?? 0);
    return { eventId, revenue, sales, checkins };
  }

  // create snapshot for window
  async createSnapshot(eventId: string, windowStart: Date, windowEnd: Date) {
    const summary = await this.getEventSummary(eventId);
    const snap = this.snapshotRepo.create({
      eventId,
      windowStart,
      windowEnd,
      revenue: String(summary.revenue),
      ticketsSold: summary.sales,
      checkins: summary.checkins,
    } as any);
    return this.snapshotRepo.save(snap);
  }
}

export default AnalyticsService;
