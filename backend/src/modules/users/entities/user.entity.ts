import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum UserRole {
  ATTENDEE = 'attendee',
  CREATOR = 'creator',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', default: UserRole.ATTENDEE })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @OneToMany(() => Event, (event) => event.userId)
  events?: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.userId)
  tickets?: Ticket[];

  @Column({ type: 'text', nullable: true })
  refreshTokenHash?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default User;
