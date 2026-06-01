import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketTier } from '../events/entities/ticket-tier.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
    @InjectRepository(TicketTier) private tiersRepo: Repository<TicketTier>,
    private dataSource: DataSource,
  ) {}

  private generateCode() {
    return `TKT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  async purchaseTier(userId: string | null, tierId: string, qty = 1) {
    return this.dataSource.transaction(async (manager) => {
      const tier = await manager.findOne(TicketTier, {
        where: { id: tierId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!tier) throw new NotFoundException('Tier not found');
      if (tier.remainingQuantity < qty)
        throw new BadRequestException('Not enough tickets available');
      tier.remainingQuantity = tier.remainingQuantity - qty;
      await manager.save(tier);

      const tickets: Ticket[] = [];
      for (let i = 0; i < qty; i++) {
        const code = this.generateCode();
        const t = manager.create(Ticket, { tier, code } as any);
        if (userId) t.user = { id: userId } as User;
        tickets.push(await manager.save(t));
      }
      return tickets;
    });
  }
}

export default TicketsService;
