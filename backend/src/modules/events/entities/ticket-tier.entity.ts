import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from './event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity({ name: 'ticket_tiers' })
export class TicketTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Event, (event) => event.tiers, { onDelete: 'CASCADE' })
  event!: Event;

  @Column()
  name!: string;

  @Column({ type: 'numeric', default: 0 })
  price!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  remainingQuantity!: number;

  @OneToMany(() => Ticket, (t) => t.tier)
  tickets!: Ticket[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default TicketTier;
