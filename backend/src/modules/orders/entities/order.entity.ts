import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.orders, { eager: true })
  userId!: User;

  @OneToOne(() => Event, (event) => event.orders, { eager: true })
  eventId!: Event;

  @OneToOne(() => Ticket, (ticket) => ticket.order, { eager: true })
  ticket!: Ticket;

  @Column({ type: 'enum', enum: OrderStatus })
  status!: OrderStatus;

  @Column('decimal')
  totalAmount?: number;

  @Column({ type: 'timestamp' })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Payment, (pay) => pay.order, {
    eager: true,
    nullable: true,
  })
  paymentReference?: Payment;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];
}
