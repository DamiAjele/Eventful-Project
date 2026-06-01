import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { TicketTier } from '../../events/entities/ticket-tier.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TicketTier, (tier) => tier.tickets, { eager: true })
  tier!: TicketTier;

  @ManyToOne(() => User, { nullable: true, eager: true })
  user?: User | null;

  @Column({ unique: true })
  code!: string;

  @Column({ default: false })
  used!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

export default Ticket;
