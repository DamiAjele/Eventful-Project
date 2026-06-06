import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketTypeId!: string;

  @Column()
  quantity!: number;

  @Column('decimal')
  unitPrice!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;
}
