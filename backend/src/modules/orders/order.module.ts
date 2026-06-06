import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { TicketTypeService } from './ticket-type.service';
import { PaystackWebhookController } from '../payments/paystack-webhook.controller';
import { EventsModule } from '../events/events.module';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Ticket]), EventsModule],
  providers: [OrderService, OrderRepository, TicketTypeService],
  controllers: [PaystackWebhookController, OrdersController],
  exports: [OrderService, OrderRepository],
})
export class OrderModule {}
