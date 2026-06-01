import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { TicketTier } from './entities/ticket-tier.entity';
import { EventsService } from './events.service';
import EventsController from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, TicketTier])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}

export default EventsModule;
