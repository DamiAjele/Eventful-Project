import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import PaymentsController from './payments.controller';
import { OrderModule } from '../orders/order.module';
import { Payment } from './entities/payment.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, TicketType, Ticket]),
    forwardRef(() => OrderModule),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [TypeOrmModule, PaymentsService],
})
export class PaymentsModule {}

export default PaymentsModule;
