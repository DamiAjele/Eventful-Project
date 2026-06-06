import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { EventsService } from './events.service';
import EventsController from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, TicketType])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}

export default EventsModule;
