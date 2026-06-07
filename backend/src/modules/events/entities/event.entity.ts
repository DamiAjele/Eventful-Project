import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  venue?: string;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  userId!: User;

  @OneToOne(() => Ticket, (ticket) => ticket.eventId, { cascade: true })
  ticket!: Ticket;

  @Column({ type: 'timestamptz' })
  startAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ default: false })
  isPublished!: boolean;

  @OneToMany(() => TicketType, (type) => type.eventId, {
    cascade: true,
    eager: true,
  })
  tiers?: TicketType[];

  @OneToMany(() => Order, (order) => order.eventId)
  orders?: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default Event;
