import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';

@EventSubscriber()
@Injectable()
export default class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  private readonly logger = new Logger(TicketSubscriber.name);

  constructor(private readonly analytics: AnalyticsService) {}

  listenTo() {
    return Ticket;
  }

  async afterInsert(event: InsertEvent<Ticket>) {
    try {
      this.logger.debug(`Ticket ${event.entity?.id} inserted; recording sale`);
      await this.analytics.recordTicketSale(event.entity as Ticket);
      this.logger.debug(`Recorded sale for ticket ${event.entity?.id}`);
    } catch (err) {
      this.logger.error('TicketSubscriber.afterInsert error: ' + err);
    }
  }
}
