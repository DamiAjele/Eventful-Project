import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { OrderRepository } from '../orders/order.repository';
import { OrderStatus } from '../orders/entities/order-status.enum';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly base =
    process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

  constructor(
    private readonly config: ConfigService,
    private dataSource: DataSource,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(TicketType) private tiersRepo: Repository<TicketType>,
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
    private readonly orderRepo: OrderRepository,
  ) {}

  private authHeaders() {
    const sk =
      this.config.get<string>('PAYSTACK_SECRET_KEY') ||
      process.env.PAYSTACK_SECRET_KEY;
    return { Authorization: `Bearer ${sk}` };
  }

  // Initialize payment for an existing Order
  async initializePaymentForOrder(orderId: string, payerEmail: string) {
    if (!this.orderRepo)
      throw new BadRequestException('OrderRepository not available');

    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.AWAITING_PAYMENT)
      throw new BadRequestException('Order not payable');

    const amount = Math.round(Number(order.totalAmount) * 100); // in kobo

    const reference = `ORDER_${order.id}_${Date.now()}`;

    const body = {
      email: payerEmail,
      amount,
      reference,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        eventId: order.eventId,
      },
      currency: 'NGN',
    };

    const resp = await axios.post(`${this.base}/transaction/initialize`, body, {
      headers: this.authHeaders(),
    });

    const data = resp.data?.data;
    if (!data) throw new BadRequestException('Payment initialization failed');

    // save reference to order
    await this.orderRepo.updatePaymentReference(order.id, reference);

    return {
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference,
    };
  }

  async verifyAndFulfill(reference: string) {
    const resp = await axios.get(
      `${this.base}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: this.authHeaders() },
    );
    const data = resp.data?.data;
    if (!data) throw new BadRequestException('Invalid verification response');

    const payment = await this.paymentsRepo.findOne({ where: { reference } });
    if (!payment) throw new NotFoundException('Payment record not found');

    // Update provider response and status
    payment.providerResponse = data;
    payment.status =
      data.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    await this.paymentsRepo.save(payment);

    if (payment.status !== PaymentStatus.SUCCESS) return { success: false };

    if (payment.fulfilled)
      return { success: true, message: 'Already fulfilled' };

    // Fulfill: decrement tier and create tickets atomically
    const createdTickets = await this.dataSource.transaction(
      async (manager) => {
        const tier = await manager.findOne(TicketType, {
          where: { id: payment.type.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!tier)
          throw new NotFoundException('Tier not found during fulfillment');
        if (tier.remainingQuantity < payment.qty)
          throw new BadRequestException('Not enough tickets available');
        tier.remainingQuantity = tier.remainingQuantity - payment.qty;
        await manager.save(tier);

        const tickets: Ticket[] = [];
        for (let i = 0; i < payment.qty; i++) {
          const code = `TKT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          const t = manager.create(Ticket, { tier, code } as any);
          tickets.push(await manager.save(t));
        }

        payment.fulfilled = true;
        await manager.save(payment);
        return tickets;
      },
    );

    return { success: true, tickets: createdTickets };
  }

  // Handle webhook payload: expects raw body and signature header
  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY') || '';
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');
    if (hash !== signature) {
      this.logger.warn('Invalid Paystack webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const reference = payload.data?.reference;
    if (event === 'charge.success' && reference) {
      return this.verifyAndFulfill(reference);
    }
    return { received: true };
  }
}

export default PaymentsService;
