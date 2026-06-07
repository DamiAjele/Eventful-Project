import { Injectable } from '@nestjs/common';
import { TicketType } from '../../modules/events/entities/ticket-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TicketTypeService {
  constructor(
    @InjectRepository(TicketType) private tiersRepo: Repository<TicketType>,
  ) {}

  async getTicketType(ticketTypeId: string) {
    return this.tiersRepo.findOneBy({ id: ticketTypeId });
  }

  async reserveStock(ticketTypeId: string, quantity: number) {
    const t = await this.tiersRepo.findOneBy({ id: ticketTypeId });
    if (!t) return false;
    if (t.remainingQuantity < quantity) return false;
    t.remainingQuantity -= quantity;
    await this.tiersRepo.save(t);
    return true;
  }

  async restoreStock(ticketTypeId: string, quantity: number) {
    const t = await this.tiersRepo.findOneBy({ id: ticketTypeId });
    if (!t) return false;
    t.remainingQuantity += quantity;
    await this.tiersRepo.save(t);
    return true;
  }
}

export default TicketTypeService;
