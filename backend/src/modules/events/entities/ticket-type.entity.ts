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

@Entity({ name: 'ticket_types' })
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Event, (event) => event.tiers, { onDelete: 'CASCADE' })
  eventId!: Event;

  @Column()
  name!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  remainingQuantity!: number;

  @OneToMany(() => Ticket, (t) => t.type)
  tickets!: Ticket[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default TicketType;
