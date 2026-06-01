import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TicketTier } from './entities/ticket-tier.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(TicketTier) private tiersRepo: Repository<TicketTier>,
  ) {}

  async createEvent(data: Partial<Event>) {
    const ev = this.eventsRepo.create(data as Event);
    return this.eventsRepo.save(ev);
  }

  async addTier(eventId: string, tierData: Partial<TicketTier>) {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException('Event not found');
    const tier = this.tiersRepo.create({
      ...tierData,
      event,
      remainingQuantity: tierData.quantity ?? 0,
    } as any);
    return this.tiersRepo.save(tier);
  }

  async findEventById(id: string) {
    const ev = await this.eventsRepo.findOne({
      where: { id },
      relations: ['tiers'],
    });
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }
}

export default EventsService;
