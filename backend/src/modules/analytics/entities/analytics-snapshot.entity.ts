import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'analytics_snapshots' })
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  eventId!: string;

  @Column({ type: 'timestamptz' })
  windowStart!: Date;

  @Column({ type: 'timestamptz' })
  windowEnd!: Date;

  @Column({ type: 'numeric', default: 0 })
  revenue!: string;

  @Column({ type: 'int', default: 0 })
  ticketsSold!: number;

  @Column({ type: 'int', default: 0 })
  checkins!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

export default AnalyticsSnapshot;
