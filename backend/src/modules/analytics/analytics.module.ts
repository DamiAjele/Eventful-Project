import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import AnalyticsController from './analytics.controller';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import PaymentSubscriber from './subscribers/payment.subscriber';
import TicketSubscriber from '../analytics/subscribers/ticket.subscriber';
import { CacheService } from '../cache/cache.service';
import CacheModule from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsSnapshot, Payment, Ticket]),
    CacheModule,
  ],
  providers: [
    AnalyticsService,
    PaymentSubscriber,
    TicketSubscriber,
    CacheService,
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

export default AnalyticsModule;
