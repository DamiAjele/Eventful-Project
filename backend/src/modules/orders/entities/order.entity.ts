import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  eventId: string;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column('decimal')
  totalAmount: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  paymentReference?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
