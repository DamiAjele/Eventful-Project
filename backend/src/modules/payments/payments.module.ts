import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import PaymentsController from './payments.controller';
import { Payment } from './entities/payment.entity';
import { TicketTier } from '../events/entities/ticket-tier.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, TicketTier, Ticket])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

export default PaymentsModule;
