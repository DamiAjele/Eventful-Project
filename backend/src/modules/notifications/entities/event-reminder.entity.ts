import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity({ name: 'event_reminders' })
export class EventReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE', eager: true })
  event: Event;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamptz' })
  sendAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  recipients?: { email: string; name?: string }[];

  @Column({ default: false })
  sent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

export default EventReminder;
