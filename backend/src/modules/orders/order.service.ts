import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order-status.enum';
import { EventsService } from '../events/events.service';
import { TicketTypeService } from './ticket-type.service';
import Ticket from '../tickets/entities/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventsService: EventsService,
    private readonly ticketTypeService: TicketTypeService,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    await this.eventsService.validateEvent(dto.eventId);

    let total = 0;

    const orderItems: any[] = [];

    // 1. Validate + reserve stock + compute total
    for (const item of dto.items) {
      const ticketType = await this.ticketTypeService.getTicketType(
        item.ticketTypeId as string,
      );

      if (!ticketType || ticketType.remainingQuantity < item.quantity) {
        throw new BadRequestException('Insufficient ticket availability');
      }

      const reserved = await this.ticketTypeService.reserveStock(
        item.ticketTypeId,
        item.quantity,
      );
      if (!reserved) throw new BadRequestException('Failed to reserve stock');

      total += Number(ticketType.price) * item.quantity;

      orderItems.push({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: ticketType.price,
      });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const order = await this.orderRepo.createOrder({
      userId,
      eventId: dto.eventId,
      status: OrderStatus.AWAITING_PAYMENT,
      totalAmount: total,
      expiresAt,
      items: orderItems,
    });

    return order;
  }

  async markAsPaid(orderId: string) {
    const order = await this.orderRepo.findById(orderId);

    if (!order) throw new BadRequestException('Order not found');

    await this.orderRepo.updateStatus(orderId, OrderStatus.PAID);

    // generate tickets here
    const ticket = this.ticketRepo.create({
      order,
      eventId: order.eventId,
      userId: order.userId,
    });
    await this.ticketRepo.save(ticket);

    return { message: 'Order paid and tickets issued' };
  }

  async markOrderAsPaidByReference(reference: string) {
    const order = await this.orderRepo.findByReference(reference);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if ((order.status as unknown as OrderStatus) === OrderStatus.PAID)
      return { message: 'Already paid' };

    await this.orderRepo.updateStatus(order.id, OrderStatus.PAID);

    // generate tickets

    return { message: 'Order marked paid and tickets generated' };
  }

  async failOrder(orderId: string) {
    const order = await this.orderRepo.findById(orderId);

    if (!order) return;

    // restore stock logic
    for (const item of order.items) {
      await this.ticketTypeService.restoreStock(
        item.ticketTypeId,
        Number(item.quantity),
      );
    }

    await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED);
  }
}
