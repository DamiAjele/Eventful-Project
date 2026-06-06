import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { TicketsService } from './tickets.service';
import TicketsController from './tickets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketType])],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}

export default TicketsModule;
