import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import AnalyticsController from './analytics.controller';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import PaymentSubscriber from './subscribers/payment.subscriber';
import TicketSubscriber from './subscribers/ticket.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsSnapshot, Payment, Ticket])],
  providers: [AnalyticsService, PaymentSubscriber, TicketSubscriber],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

export default AnalyticsModule;
