import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  channel!: string; // e.g., 'email'

  @Column({ type: 'varchar' })
  recipient!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  sent!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

export default Notification;
