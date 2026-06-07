import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { TicketType } from '../../events/entities/ticket-type.entity';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  reference!: string;

  @ManyToOne(() => TicketType, { eager: true })
  type!: TicketType;

  @OneToOne(() => Order, (order) => order.paymentReference, {
    eager: true,
    cascade: true,
  })
  order!: Order;

  @Column({ type: 'int', default: 1 })
  qty!: number;

  @Column({ type: 'numeric' })
  amount!: string;

  @Column({ type: 'varchar', nullable: true })
  payerEmail?: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  providerResponse?: any;

  @Column({ default: false })
  fulfilled!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

export default Payment;
