import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
} from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';

@EventSubscriber()
@Injectable()
export default class PaymentSubscriber implements EntitySubscriberInterface<Payment> {
  private readonly logger = new Logger(PaymentSubscriber.name);

  constructor(private readonly analytics: AnalyticsService) {}

  listenTo() {
    return Payment;
  }

  async afterUpdate(event: UpdateEvent<Payment>) {
    try {
      const oldFulfilled = (event.databaseEntity as any)?.fulfilled;
      const newFulfilled = (event.entity as any)?.fulfilled;
      const newStatus = (event.entity as any)?.status;
      if (newStatus === 'success' && !oldFulfilled && newFulfilled) {
        this.logger.debug(
          `Payment ${event.entity?.id} fulfilled; recording analytics`,
        );
        await this.analytics.recordPaymentEvent(event.entity as Payment);
        this.logger.debug(`Recorded analytics for payment ${event.entity?.id}`);
      }
    } catch (err) {
      this.logger.error('PaymentSubscriber.afterUpdate error: ' + err);
    }
  }
}
