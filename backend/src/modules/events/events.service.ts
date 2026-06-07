import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTierDto } from './dto/ticket-type.dto';
import { CreateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(TicketType) private tiersRepo: Repository<TicketType>,
  ) {}

  async createEvent(data: CreateEventDto) {
    const ev = this.eventsRepo.create(data);
    return this.eventsRepo.save(ev);
  }

  async addTicketType(eventId: string, typeData: CreateTicketTierDto) {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException('Event not found');
    const tier = this.tiersRepo.create({
      ...typeData,
      eventId: event.id,
      remainingQuantity: typeData.quantity ?? 0,
    } as any);
    return this.tiersRepo.save(tier);
  }

  async validateEvent(eventId: string) {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException('Event not found');
    if (!event.isPublished) throw new NotFoundException('Event not published');
    return event;
  }

  async findEventById(id: string) {
    const ev = await this.eventsRepo.findOne({
      where: { id },
      relations: ['tiers'],
    });
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }

  async updateEvent(id: string, data: Partial<Event>) {
    const ev = await this.eventsRepo.findOneBy({ id });
    if (!ev) throw new NotFoundException('Event not found');
    Object.assign(ev, data);
    return this.eventsRepo.save(ev);
  }

  async findAllEvents() {
    return this.eventsRepo.find({ relations: ['tiers', 'ticket'] });
  }
}

export default EventsService;
