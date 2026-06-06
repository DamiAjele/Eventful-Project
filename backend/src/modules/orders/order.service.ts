import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order-status.enum';
import { EventsService } from '../events/events.service';
import { TicketTypeService } from './ticket-type.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventsService: EventsService,
    private readonly ticketTypeService: TicketTypeService,
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

      if (!ticketType || ticketType.available < item.quantity) {
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
    } as any);

    return order;
  }

  async markAsPaid(orderId: string) {
    const order = await this.orderRepo.findById(orderId);

    if (!order) throw new BadRequestException('Order not found');

    await this.orderRepo.updateStatus(orderId, OrderStatus.PAID);

    // generate tickets here
    const tickets: any[] = [];
    for (const item of order.items) {
      for (let i = 0; i < Number(item.quantity); i++) {
        tickets.push({
          eventId: order.eventId,
          userId: order.userId,
          qrCode: uuidv4(),
        });
      }
    }

    await this.orderRepo.saveTickets(tickets);

    return { message: 'Order paid and tickets issued' };
  }

  async markOrderAsPaidByReference(reference: string) {
    const order = await this.orderRepo.findByReference(reference as string);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status === OrderStatus.PAID) return { message: 'Already paid' };

    await this.orderRepo.updateStatus(order.id, OrderStatus.PAID);

    // generate tickets
    const tickets: any[] = [];
    for (const item of order.items) {
      for (let i = 0; i < Number(item.quantity); i++) {
        tickets.push({
          eventId: order.eventId,
          userId: order.userId,
          qrCode: uuidv4(),
        });
      }
    }

    await this.orderRepo.saveTickets(tickets);

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
