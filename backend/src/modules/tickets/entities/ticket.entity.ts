import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { TicketType } from '../../events/entities/ticket-type.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TicketType, (type) => type.tickets, { eager: true })
  type!: TicketType;

  @ManyToOne(() => User, (user) => user.tickets, {
    nullable: true,
    eager: true,
  })
  userId?: User | null;

  @OneToOne(() => Event, (event) => event.ticket, { eager: true })
  eventId!: Event;

  @OneToOne(() => Order, (order) => order.ticket)
  order!: Order;

  @Column({ unique: true })
  code?: string;

  @Column({ default: false })
  used?: boolean;

  @Column({ type: 'text', nullable: true })
  qrCodeUrl?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  scannedAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  scannedBy?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

export default Ticket;
