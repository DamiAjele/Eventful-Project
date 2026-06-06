import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { OrderStatus } from './entities/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,

    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async createOrder(
    orderData: CreateOrderDto & { userId: string; status: OrderStatus },
  ) {
    const order = this.orderRepo.create(orderData as any);
    await this.orderRepo.save(order);
    return order;
  }

  async createOrderItems(items: Partial<OrderItem>[]) {
    return this.itemRepo.save(items as any);
  }

  async findById(id: string) {
    return this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async findByReference(reference: string) {
    return this.orderRepo.findOne({
      where: { paymentReference: reference },
      relations: ['items'],
    });
  }

  async updatePaymentReference(orderId: string, reference: string) {
    return this.orderRepo.update(
      { id: orderId } as any,
      { paymentReference: reference } as any,
    );
  }

  async updateStatus(id: string, status: OrderStatus) {
    return this.orderRepo.update({ id } as any, { status } as any);
  }

  async saveTickets(tickets: Partial<Ticket>[]) {
    return this.ticketRepo.save(tickets as any);
  }
}
