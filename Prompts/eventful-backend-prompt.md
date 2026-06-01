# Eventful — NestJS Backend Implementation Prompt

## Project Overview

Build **Eventful**, a monolithic NestJS (TypeScript) backend for an event ticketing platform. The application uses a single PostgreSQL database (Neon DB) via TypeORM, Redis for caching, and follows REST API conventions documented with Swagger.

---

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Runtime       | Node.js 20+                             |
| Framework     | NestJS (TypeScript)                     |
| Database      | PostgreSQL via Neon DB                  |
| ORM           | TypeORM                                 |
| Cache         | Redis (ioredis)                         |
| Auth          | JWT + Passport.js                       |
| Payments      | Paystack                                |
| QR Codes      | `qrcode` npm package                    |
| Notifications | node-cron + nodemailer (or Resend)      |
| File Storage  | Cloudinary (for event images)           |
| Rate Limiting | `@nestjs/throttler`                     |
| Validation    | `class-validator` + `class-transformer` |
| Testing       | Jest (unit + integration)               |
| API Docs      | Swagger (`@nestjs/swagger`)             |
| Logging       | Winston or Pino                         |

---

## Monolith Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── jwt.config.ts
│   ├── paystack.config.ts
│   └── app.config.ts
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── optional-jwt.guard.ts
│   ├── interceptors/
│   │   ├── cache.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── parse-uuid.pipe.ts
│   ├── enums/
│   │   ├── user-role.enum.ts
│   │   ├── event-status.enum.ts
│   │   ├── ticket-status.enum.ts
│   │   └── payment-status.enum.ts
│   └── types/
│       └── pagination.type.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── events/
│   ├── tickets/
│   ├── payments/
│   ├── qr-codes/
│   ├── notifications/
│   ├── analytics/
│   └── cache/
└── database/
    └── migrations/
```

---

## Environment Variables

```env
# App
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database (Neon DB)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxx
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret

# Email (Resend or SMTP)
RESEND_API_KEY=re_xxxx
EMAIL_FROM=noreply@eventful.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

## Implementation status (auto-updated)

- Rate limiting: Implemented via `@nestjs/throttler` with global defaults and per-endpoint `@Throttle` overrides (auth, payments, notifications).
- Global error handling: Implemented `HttpExceptionFilter` at `src/common/filters/http-exception.filter.ts` and registered globally.
- Swagger: Setup added in `src/main.ts` and exposed at `/api/docs` in non-production environments.
- Notes: Update `.env.example` with `THROTTLE_TTL` and `THROTTLE_LIMIT` to tune rate limits.

```

---

## Database Entities (TypeORM)

### 1. User Entity

```typescript
// src/modules/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { UserRole } from "../../../common/enums/user-role.enum";
import { Event } from "../../events/entities/event.entity";
import { Ticket } from "../../tickets/entities/ticket.entity";
import { Notification } from "../../notifications/entities/notification.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.EVENTEE })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  emailVerificationToken: string;

  @Column({ nullable: true, select: false })
  passwordResetToken: string;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @OneToMany(() => Event, (event) => event.creator)
  createdEvents: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

### 2. Event Entity

```typescript
// src/modules/events/entities/event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { EventStatus } from "../../../common/enums/event-status.enum";
import { User } from "../../users/entities/user.entity";
import { Ticket } from "../../tickets/entities/ticket.entity";
import { TicketTier } from "./ticket-tier.entity";
import { EventReminder } from "../../notifications/entities/event-reminder.entity";

@Entity("events")
@Index(["status", "startDate"])
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column()
  venue: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  latitude: number;

  @Column({ nullable: true })
  longitude: number;

  @Column({ type: "timestamptz" })
  startDate: Date;

  @Column({ type: "timestamptz" })
  endDate: Date;

  @Column({ type: "enum", enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: "simple-array", nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  shareableSlug: string;

  // Creator-set default reminder (in hours before event)
  @Column({ type: "int", array: true, default: [] })
  defaultReminderOffsets: number[];

  @ManyToOne(() => User, (user) => user.createdEvents, { eager: false })
  @JoinColumn({ name: "creatorId" })
  creator: User;

  @Column()
  creatorId: string;

  @OneToMany(() => TicketTier, (tier) => tier.event, { cascade: true })
  ticketTiers: TicketTier[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];

  @OneToMany(() => EventReminder, (reminder) => reminder.event)
  reminders: EventReminder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3. TicketTier Entity

```typescript
// src/modules/events/entities/ticket-tier.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Event } from "./event.entity";

@Entity("ticket_tiers")
export class TicketTier {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string; // e.g. VIP, General, Early Bird

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  totalQuantity: number;

  @Column({ default: 0 })
  soldQuantity: number;

  @Column({ nullable: true })
  saleStartDate: Date;

  @Column({ nullable: true })
  saleEndDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Event, (event) => event.ticketTiers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column()
  eventId: string;

  get availableQuantity(): number {
    return this.totalQuantity - this.soldQuantity;
  }
}
```

### 4. Ticket Entity

```typescript
// src/modules/tickets/entities/ticket.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { TicketStatus } from "../../../common/enums/ticket-status.enum";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";
import { TicketTier } from "../../events/entities/ticket-tier.entity";
import { Payment } from "../../payments/entities/payment.entity";

@Entity("tickets")
@Index(["ticketCode"], { unique: true })
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  ticketCode: string; // e.g. EVT-2024-XXXXXX

  @Column({ type: "enum", enum: TicketStatus, default: TicketStatus.ACTIVE })
  status: TicketStatus;

  @Column({ nullable: true })
  qrCodeUrl: string; // Cloudinary URL of QR code image

  @Column({ nullable: true })
  qrCodeData: string; // The encoded data string

  @Column({ nullable: true })
  scannedAt: Date;

  @Column({ nullable: true })
  scannedByUserId: string;

  @ManyToOne(() => User, (user) => user.tickets, { eager: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Event, (event) => event.tickets, { eager: false })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column()
  eventId: string;

  @ManyToOne(() => TicketTier, { eager: false })
  @JoinColumn({ name: "ticketTierId" })
  ticketTier: TicketTier;

  @Column()
  ticketTierId: string;

  @ManyToOne(() => Payment, (payment) => payment.tickets, { eager: false })
  @JoinColumn({ name: "paymentId" })
  payment: Payment;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  pricePaid: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 5. Payment Entity

```typescript
// src/modules/payments/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { PaymentStatus } from "../../../common/enums/payment-status.enum";
import { User } from "../../users/entities/user.entity";
import { Event } from "../../events/entities/event.entity";
import { Ticket } from "../../tickets/entities/ticket.entity";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  reference: string; // Paystack reference

  @Column({ nullable: true })
  paystackTransactionId: string;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ default: "NGN" })
  currency: string;

  @Column({ nullable: true, type: "jsonb" })
  paystackResponse: object;

  @Column({ nullable: true })
  paidAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Event, { eager: false })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column()
  eventId: string;

  @OneToMany(() => Ticket, (ticket) => ticket.payment)
  tickets: Ticket[];

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column()
  ticketTierId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 6. Notification & Reminder Entities

```typescript
// src/modules/notifications/entities/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  eventId: string;

  @Column({ nullable: true })
  type: string; // 'reminder', 'ticket_purchased', 'event_update', etc.

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// src/modules/notifications/entities/event-reminder.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Event } from "../../events/entities/event.entity";
import { User } from "../../users/entities/user.entity";

@Entity("event_reminders")
export class EventReminder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  userId: string; // null = creator-set default for all attendees

  @Column()
  eventId: string;

  @Column({ type: "int" })
  offsetHours: number; // hours before event to send reminder

  @Column({ default: false })
  isSent: boolean;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ type: "timestamptz" })
  scheduledFor: Date; // actual datetime to send

  @ManyToOne(() => Event, (event) => event.reminders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Module Implementations

---

### Auth Module

```typescript
// src/modules/auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN") },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email already in use");

    const user = await this.usersService.create(dto);
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Invalidate cached profile on login
    await this.cacheService.del(`user:${user.id}`);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
    await this.cacheService.del(`user:${userId}`);
    await this.cacheService.del(`refresh:${userId}`);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.refreshToken) throw new UnauthorizedException();

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) throw new UnauthorizedException("Invalid refresh token");

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN"),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
    // Also cache in Redis for quick lookup
    await this.cacheService.set(`refresh:${userId}`, hashed, 60 * 60 * 24 * 30);
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, emailVerificationToken, ...rest } =
      user as any;
    return rest;
  }
}
```

```typescript
// src/modules/auth/auth.controller.ts
@ApiTags("Auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user (creator or eventee)" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login and receive JWT tokens" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current authenticated user" })
  async getMe(@CurrentUser() user: User) {
    return user;
  }
}
```

**DTOs:**

```typescript
// src/modules/auth/dto/register.dto.ts
export class RegisterDto {
  @IsEmail() email: string;
  @MinLength(8) @IsStrongPassword() password: string;
  @IsString() @MinLength(2) firstName: string;
  @IsString() @MinLength(2) lastName: string;
  @IsEnum(UserRole) role: UserRole; // CREATOR or EVENTEE
  @IsOptional() @IsPhoneNumber() phoneNumber?: string;
}

// src/modules/auth/dto/login.dto.ts
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
```

---

### Events Module

```typescript
// src/modules/events/events.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, TicketTier]),
    CacheModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
```

```typescript
// src/modules/events/events.service.ts
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(TicketTier)
    private readonly tierRepo: Repository<TicketTier>,
    private readonly cacheService: CacheService,
  ) {}

  async create(dto: CreateEventDto, creatorId: string): Promise<Event> {
    const slug = this.generateSlug(dto.title);

    const event = this.eventRepo.create({
      ...dto,
      creatorId,
      shareableSlug: slug,
    });
    const saved = await this.eventRepo.save(event);

    if (dto.ticketTiers?.length) {
      const tiers = dto.ticketTiers.map((t) =>
        this.tierRepo.create({ ...t, eventId: saved.id }),
      );
      await this.tierRepo.save(tiers);
    }

    // Invalidate creator events cache
    await this.cacheService.del(`creator_events:${creatorId}`);

    return this.findById(saved.id);
  }

  async findAll(filters: EventFilterDto): Promise<PaginatedResult<Event>> {
    const cacheKey = `events:list:${JSON.stringify(filters)}`;
    const cached =
      await this.cacheService.get<PaginatedResult<Event>>(cacheKey);
    if (cached) return cached;

    const qb = this.eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.creator", "creator")
      .leftJoinAndSelect("event.ticketTiers", "tiers")
      .where("event.status = :status", { status: EventStatus.PUBLISHED });

    if (filters.category)
      qb.andWhere("event.category = :category", { category: filters.category });
    if (filters.city)
      qb.andWhere("event.city ILIKE :city", { city: `%${filters.city}%` });
    if (filters.search) {
      qb.andWhere(
        "(event.title ILIKE :search OR event.description ILIKE :search)",
        {
          search: `%${filters.search}%`,
        },
      );
    }
    if (filters.startDate)
      qb.andWhere("event.startDate >= :startDate", {
        startDate: filters.startDate,
      });

    qb.orderBy("event.startDate", "ASC")
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    const [data, total] = await qb.getManyAndCount();
    const result: PaginatedResult<Event> = {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };

    await this.cacheService.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  async findById(id: string): Promise<Event> {
    const cacheKey = `event:${id}`;
    const cached = await this.cacheService.get<Event>(cacheKey);
    if (cached) return cached;

    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ["creator", "ticketTiers"],
    });
    if (!event) throw new NotFoundException("Event not found");

    await this.cacheService.set(cacheKey, event, 600);
    return event;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { shareableSlug: slug },
      relations: ["creator", "ticketTiers"],
    });
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  async findByCreator(
    creatorId: string,
    filters: PaginationDto,
  ): Promise<PaginatedResult<Event>> {
    const cacheKey = `creator_events:${creatorId}:${filters.page}`;
    const cached =
      await this.cacheService.get<PaginatedResult<Event>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await this.eventRepo.findAndCount({
      where: { creatorId },
      relations: ["ticketTiers"],
      order: { createdAt: "DESC" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    const result = {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findById(id);
    if (event.creatorId !== userId)
      throw new ForbiddenException("Not your event");

    Object.assign(event, dto);
    const updated = await this.eventRepo.save(event);

    // Invalidate caches
    await this.cacheService.del(`event:${id}`);
    await this.cacheService.del(`creator_events:${userId}`);

    return updated;
  }

  async publish(id: string, userId: string): Promise<Event> {
    return this.update(id, { status: EventStatus.PUBLISHED }, userId);
  }

  async getEventAttendees(eventId: string, creatorId: string) {
    const event = await this.findById(eventId);
    if (event.creatorId !== creatorId) throw new ForbiddenException();

    const cacheKey = `event_attendees:${eventId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    // Return from ticket data
    const attendees = await this.eventRepo
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.tickets", "ticket")
      .leftJoinAndSelect("ticket.user", "user")
      .where("event.id = :eventId", { eventId })
      .getOne();

    await this.cacheService.set(cacheKey, attendees, 60);
    return attendees;
  }

  getShareableLinks(event: Event): Record<string, string> {
    const url = `${process.env.FRONTEND_URL}/events/${event.shareableSlug}`;
    const text = encodeURIComponent(`Check out "${event.title}" on Eventful!`);
    return {
      directLink: url,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${text}`,
      copyLink: url,
    };
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      nanoid(8)
    );
  }
}
```

```typescript
// src/modules/events/events.controller.ts
@ApiTags("Events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: "Create a new event (creators only)" })
  create(@Body() dto: CreateEventDto, @CurrentUser() user: User) {
    return this.eventsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: "List all published events with filters" })
  findAll(@Query() filters: EventFilterDto) {
    return this.eventsService.findAll(filters);
  }

  @Get("my-events")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: "Get events created by current creator" })
  getMyEvents(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    return this.eventsService.findByCreator(user.id, pagination);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by ID" })
  findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get event by shareable slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.update(id, dto, user.id);
  }

  @Post(":id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  publish(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.eventsService.publish(id, user.id);
  }

  @Get(":id/attendees")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: "Get attendees for an event (creator only)" })
  getAttendees(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.getEventAttendees(id, user.id);
  }

  @Get(":id/share")
  @ApiOperation({ summary: "Get shareable links for an event" })
  getShareLinks(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventsService
      .findById(id)
      .then((e) => this.eventsService.getShareableLinks(e));
  }
}
```

---

### Payments Module (Paystack)

```typescript
// src/modules/payments/payments.service.ts
@Injectable()
export class PaymentsService {
  private readonly paystackBaseUrl = "https://api.paystack.co";

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketTier)
    private readonly tierRepo: Repository<TicketTier>,
    private readonly qrCodeService: QrCodeService,
    private readonly notificationsService: NotificationsService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async initializePayment(dto: InitializePaymentDto, userId: string) {
    const tier = await this.tierRepo.findOne({
      where: { id: dto.ticketTierId },
      relations: ["event"],
    });
    if (!tier) throw new NotFoundException("Ticket tier not found");
    if (tier.availableQuantity < dto.quantity) {
      throw new BadRequestException("Not enough tickets available");
    }

    const amount = tier.price * dto.quantity * 100; // Paystack uses kobo
    const reference = `EVT-${nanoid(12).toUpperCase()}`;

    // Create pending payment record
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        reference,
        amount: tier.price * dto.quantity,
        currency: "NGN",
        status: PaymentStatus.PENDING,
        userId,
        eventId: tier.eventId,
        ticketTierId: dto.ticketTierId,
        quantity: dto.quantity,
      }),
    );

    // Initialize with Paystack
    const user = await this.getUser(userId);
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: user.email,
          amount,
          reference,
          callback_url: `${this.configService.get("FRONTEND_URL")}/payment/verify`,
          metadata: {
            paymentId: payment.id,
            eventId: tier.eventId,
            ticketTierId: dto.ticketTierId,
            quantity: dto.quantity,
            userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get("PAYSTACK_SECRET_KEY")}`,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    return {
      paymentId: payment.id,
      reference,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
    };
  }

  async verifyPayment(reference: string) {
    const payment = await this.paymentRepo.findOne({ where: { reference } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === PaymentStatus.SUCCESS) {
      return { message: "Payment already verified", payment };
    }

    const response = await firstValueFrom(
      this.httpService.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get("PAYSTACK_SECRET_KEY")}`,
          },
        },
      ),
    );

    const txn = response.data.data;
    if (txn.status === "success") {
      return this.fulfillPayment(payment, txn);
    } else {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      throw new BadRequestException("Payment verification failed");
    }
  }

  async handleWebhook(payload: any, signature: string) {
    // Validate Paystack webhook signature
    const hash = crypto
      .createHmac("sha512", this.configService.get("PAYSTACK_WEBHOOK_SECRET"))
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature)
      throw new UnauthorizedException("Invalid webhook signature");

    if (payload.event === "charge.success") {
      const { reference } = payload.data;
      const payment = await this.paymentRepo.findOne({ where: { reference } });
      if (payment && payment.status !== PaymentStatus.SUCCESS) {
        await this.fulfillPayment(payment, payload.data);
      }
    }
  }

  private async fulfillPayment(payment: Payment, txnData: any) {
    // Update payment
    payment.status = PaymentStatus.SUCCESS;
    payment.paystackTransactionId = txnData.id?.toString();
    payment.paystackResponse = txnData;
    payment.paidAt = new Date();
    await this.paymentRepo.save(payment);

    // Decrement tier stock
    await this.tierRepo.decrement(
      { id: payment.ticketTierId },
      "soldQuantity",
      payment.quantity,
    );

    // Generate tickets
    const tickets: Ticket[] = [];
    for (let i = 0; i < payment.quantity; i++) {
      const ticketCode = `EVT-${Date.now()}-${nanoid(6).toUpperCase()}`;
      const qrData = JSON.stringify({
        ticketCode,
        eventId: payment.eventId,
        userId: payment.userId,
        paymentRef: payment.reference,
      });

      const qrCodeUrl = await this.qrCodeService.generateAndUpload(
        qrData,
        ticketCode,
      );

      const ticket = this.ticketRepo.create({
        ticketCode,
        status: TicketStatus.ACTIVE,
        qrCodeUrl,
        qrCodeData: qrData,
        userId: payment.userId,
        eventId: payment.eventId,
        ticketTierId: payment.ticketTierId,
        paymentId: payment.id,
        pricePaid: payment.amount / payment.quantity,
      });
      tickets.push(ticket);
    }
    await this.ticketRepo.save(tickets);

    // Send notification + email
    await this.notificationsService.sendTicketConfirmation(
      payment.userId,
      payment.eventId,
      tickets,
    );

    // Invalidate analytics cache
    await this.cacheService.del(`analytics:creator:${payment.eventId}`);

    return payment;
  }

  async getCreatorPayments(creatorId: string, pagination: PaginationDto) {
    const cacheKey = `creator_payments:${creatorId}:${pagination.page}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const qb = this.paymentRepo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.event", "event")
      .leftJoinAndSelect("payment.user", "user")
      .where("event.creatorId = :creatorId", { creatorId })
      .andWhere("payment.status = :status", { status: PaymentStatus.SUCCESS })
      .orderBy("payment.paidAt", "DESC")
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();
    const result = {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };

    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }
}
```

```typescript
// src/modules/payments/payments.controller.ts
@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("initialize")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Initialize Paystack payment for ticket purchase" })
  initialize(@Body() dto: InitializePaymentDto, @CurrentUser() user: User) {
    return this.paymentsService.initializePayment(dto, user.id);
  }

  @Get("verify/:reference")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Verify payment after redirect from Paystack" })
  verify(@Param("reference") reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post("webhook")
  @ApiOperation({ summary: "Paystack webhook endpoint" })
  webhook(
    @Body() payload: any,
    @Headers("x-paystack-signature") signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Get("creator/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: "Get all payments for creator events" })
  getCreatorPayments(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ) {
    return this.paymentsService.getCreatorPayments(user.id, pagination);
  }
}
```

---

### QR Code Module

```typescript
// src/modules/qr-codes/qr-codes.service.ts
@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  async generateAndUpload(data: string, ticketCode: string): Promise<string> {
    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: "H",
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadBuffer(
      qrBuffer,
      `qrcodes/${ticketCode}`,
      "image/png",
    );

    return result.secure_url;
  }

  async validateQrCode(
    qrData: string,
    scannerId: string,
  ): Promise<QrValidationResult> {
    let parsed: { ticketCode: string; eventId: string; userId: string };
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return { valid: false, message: "Invalid QR code format" };
    }

    const cacheKey = `ticket:scanned:${parsed.ticketCode}`;
    const alreadyScanned = await this.cacheService.get(cacheKey);
    if (alreadyScanned) {
      return { valid: false, message: "Ticket already scanned" };
    }

    const ticket = await this.ticketRepo.findOne({
      where: { ticketCode: parsed.ticketCode },
      relations: ["user", "event", "ticketTier"],
    });

    if (!ticket) return { valid: false, message: "Ticket not found" };
    if (ticket.status !== TicketStatus.ACTIVE) {
      return { valid: false, message: `Ticket is ${ticket.status}` };
    }
    if (ticket.scannedAt) {
      return {
        valid: false,
        message: "Ticket already used",
        scannedAt: ticket.scannedAt,
      };
    }

    // Mark as scanned
    ticket.scannedAt = new Date();
    ticket.scannedByUserId = scannerId;
    ticket.status = TicketStatus.USED;
    await this.ticketRepo.save(ticket);

    // Cache scan status to prevent double-scan race conditions
    await this.cacheService.set(cacheKey, true, 86400);

    return {
      valid: true,
      message: "Access granted",
      ticket: {
        ticketCode: ticket.ticketCode,
        holderName: ticket.user.fullName,
        tierName: ticket.ticketTier.name,
        eventTitle: ticket.event.title,
        scannedAt: ticket.scannedAt,
      },
    };
  }
}
```

```typescript
// src/modules/qr-codes/qr-codes.controller.ts
@ApiTags("QR Codes")
@Controller("qr-codes")
export class QrCodesController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post("validate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: "Validate a scanned QR code at event entry" })
  validate(@Body() dto: ValidateQrDto, @CurrentUser() user: User) {
    return this.qrCodeService.validateQrCode(dto.qrData, user.id);
  }
}
```

---

### Notifications Module

```typescript
// src/modules/notifications/notifications.service.ts
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(EventReminder)
    private readonly reminderRepo: Repository<EventReminder>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly mailerService: MailerService,
    private readonly cacheService: CacheService,
  ) {}

  // Called when a creator sets default reminders for all attendees
  async setCreatorReminders(
    eventId: string,
    creatorId: string,
    offsetHours: number[],
  ) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId, creatorId },
    });
    if (!event) throw new NotFoundException("Event not found");

    event.defaultReminderOffsets = offsetHours;
    await this.eventRepo.save(event);
    return event;
  }

  // Called when an eventee sets their own reminder for an event
  async setEventeeReminder(
    userId: string,
    eventId: string,
    offsetHours: number[],
  ) {
    // Delete existing user reminders for this event
    await this.reminderRepo.delete({ userId, eventId });

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException("Event not found");

    const reminders = offsetHours.map((hours) => {
      const scheduledFor = new Date(
        event.startDate.getTime() - hours * 60 * 60 * 1000,
      );
      return this.reminderRepo.create({
        userId,
        eventId,
        offsetHours: hours,
        scheduledFor,
      });
    });

    await this.reminderRepo.save(reminders);
    return { message: "Reminders set", reminders };
  }

  // Called after ticket purchase - seed default creator reminders for this user
  async seedDefaultRemindersForUser(userId: string, eventId: string) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event?.defaultReminderOffsets?.length) return;

    const existing = await this.reminderRepo.findOne({
      where: { userId, eventId },
    });
    if (existing) return; // User already has custom reminders

    const reminders = event.defaultReminderOffsets.map((hours) => {
      const scheduledFor = new Date(
        event.startDate.getTime() - hours * 60 * 60 * 1000,
      );
      return this.reminderRepo.create({
        userId,
        eventId,
        offsetHours: hours,
        scheduledFor,
      });
    });

    await this.reminderRepo.save(reminders);
  }

  async sendTicketConfirmation(
    userId: string,
    eventId: string,
    tickets: Ticket[],
  ) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });

    // In-app notification
    await this.notificationRepo.save(
      this.notificationRepo.create({
        userId,
        title: "Ticket Purchase Confirmed! 🎉",
        message: `Your ${tickets.length} ticket(s) for "${event.title}" are confirmed.`,
        eventId,
        type: "ticket_purchased",
      }),
    );

    // Seed default reminders
    await this.seedDefaultRemindersForUser(userId, eventId);

    // Email confirmation (async, non-blocking)
    this.sendTicketEmail(userId, event, tickets).catch(console.error);
  }

  private async sendTicketEmail(
    userId: string,
    event: Event,
    tickets: Ticket[],
  ) {
    // Fetch user email
    // Build HTML email with QR code images
    // Send via nodemailer/Resend
  }

  async getUserNotifications(userId: string, pagination: PaginationDto) {
    const cacheKey = `notifications:${userId}:${pagination.page}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const [data, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const result = {
      data,
      total,
      unreadCount: data.filter((n) => !n.isRead).length,
    };
    await this.cacheService.set(cacheKey, result, 30);
    return result;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException();
    notification.isRead = true;
    await this.notificationRepo.save(notification);
    await this.cacheService.del(`notifications:${userId}:1`);
    return notification;
  }

  // CRON: runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledReminders() {
    const now = new Date();
    const upcoming = new Date(now.getTime() + 60 * 1000); // next 1 minute window

    const dueReminders = await this.reminderRepo
      .createQueryBuilder("reminder")
      .leftJoinAndSelect("reminder.event", "event")
      .leftJoinAndSelect("reminder.user", "user")
      .where("reminder.isSent = false")
      .andWhere("reminder.scheduledFor BETWEEN :now AND :upcoming", {
        now,
        upcoming,
      })
      .getMany();

    for (const reminder of dueReminders) {
      await this.sendReminderNotification(reminder);
      reminder.isSent = true;
      reminder.sentAt = new Date();
      await this.reminderRepo.save(reminder);
    }
  }

  private async sendReminderNotification(reminder: EventReminder) {
    await this.notificationRepo.save(
      this.notificationRepo.create({
        userId: reminder.userId,
        title: `Upcoming Event Reminder 🔔`,
        message: `"${reminder.event.title}" starts in ${reminder.offsetHours < 24 ? reminder.offsetHours + " hour(s)" : Math.round(reminder.offsetHours / 24) + " day(s)"}!`,
        eventId: reminder.eventId,
        type: "reminder",
      }),
    );
    // Also send email reminder
  }
}
```

```typescript
// src/modules/notifications/notifications.controller.ts
@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get current user notifications" })
  getNotifications(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationsService.getUserNotifications(user.id, pagination);
  }

  @Patch(":id/read")
  markAsRead(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch("mark-all-read")
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Post("events/:eventId/reminders")
  @ApiOperation({ summary: "Set custom reminders for an event (eventee)" })
  setReminder(
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: SetReminderDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.setEventeeReminder(
      user.id,
      eventId,
      dto.offsetHours,
    );
  }

  @Post("events/:eventId/creator-reminders")
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({
    summary: "Set default reminders for all attendees (creator only)",
  })
  setCreatorReminders(
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Body() dto: SetReminderDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.setCreatorReminders(
      eventId,
      user.id,
      dto.offsetHours,
    );
  }
}
```

---

### Analytics Module

```typescript
// src/modules/analytics/analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    private readonly cacheService: CacheService,
  ) {}

  async getCreatorOverallAnalytics(creatorId: string) {
    const cacheKey = `analytics:overall:${creatorId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const [totalEvents, totalRevenue, totalTicketsSold, totalScanned] =
      await Promise.all([
        this.eventRepo.count({ where: { creatorId } }),

        this.paymentRepo
          .createQueryBuilder("payment")
          .leftJoin("payment.event", "event")
          .where("event.creatorId = :creatorId", { creatorId })
          .andWhere("payment.status = :status", {
            status: PaymentStatus.SUCCESS,
          })
          .select("SUM(payment.amount)", "total")
          .getRawOne()
          .then((r) => parseFloat(r?.total || "0")),

        this.ticketRepo
          .createQueryBuilder("ticket")
          .leftJoin("ticket.event", "event")
          .where("event.creatorId = :creatorId", { creatorId })
          .getCount(),

        this.ticketRepo
          .createQueryBuilder("ticket")
          .leftJoin("ticket.event", "event")
          .where("event.creatorId = :creatorId", { creatorId })
          .andWhere("ticket.scannedAt IS NOT NULL")
          .getCount(),
      ]);

    const result = {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
      totalScanned,
      scanRate:
        totalTicketsSold > 0
          ? ((totalScanned / totalTicketsSold) * 100).toFixed(2) + "%"
          : "0%",
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async getEventAnalytics(eventId: string, creatorId: string) {
    const cacheKey = `analytics:event:${eventId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const event = await this.eventRepo.findOne({
      where: { id: eventId, creatorId },
      relations: ["ticketTiers"],
    });
    if (!event) throw new NotFoundException("Event not found or unauthorized");

    const [ticketsSold, scannedCount, revenue, ticketsByTier] =
      await Promise.all([
        this.ticketRepo.count({ where: { eventId } }),

        this.ticketRepo.count({
          where: { eventId, status: TicketStatus.USED },
        }),

        this.paymentRepo
          .createQueryBuilder("payment")
          .where("payment.eventId = :eventId", { eventId })
          .andWhere("payment.status = :status", {
            status: PaymentStatus.SUCCESS,
          })
          .select("SUM(payment.amount)", "total")
          .getRawOne()
          .then((r) => parseFloat(r?.total || "0")),

        this.ticketRepo
          .createQueryBuilder("ticket")
          .where("ticket.eventId = :eventId", { eventId })
          .leftJoin("ticket.ticketTier", "tier")
          .groupBy("tier.name")
          .select(["tier.name AS tierName", "COUNT(ticket.id) AS count"])
          .getRawMany(),
      ]);

    const capacity = event.ticketTiers.reduce(
      (sum, t) => sum + t.totalQuantity,
      0,
    );

    const result = {
      eventId,
      eventTitle: event.title,
      capacity,
      ticketsSold,
      scannedCount,
      revenue,
      ticketsByTier,
      soldPercentage:
        capacity > 0 ? ((ticketsSold / capacity) * 100).toFixed(2) : "0",
      scanPercentage:
        ticketsSold > 0 ? ((scannedCount / ticketsSold) * 100).toFixed(2) : "0",
    };

    await this.cacheService.set(cacheKey, result, 120);
    return result;
  }

  async getRevenueOverTime(
    creatorId: string,
    period: "daily" | "weekly" | "monthly",
  ) {
    const cacheKey = `analytics:revenue:${creatorId}:${period}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const format =
      period === "daily"
        ? "YYYY-MM-DD"
        : period === "weekly"
          ? "IYYY-IW"
          : "YYYY-MM";

    const data = await this.paymentRepo
      .createQueryBuilder("payment")
      .leftJoin("payment.event", "event")
      .where("event.creatorId = :creatorId", { creatorId })
      .andWhere("payment.status = :status", { status: PaymentStatus.SUCCESS })
      .groupBy(`TO_CHAR(payment.paidAt, '${format}')`)
      .select([
        `TO_CHAR(payment.paidAt, '${format}') AS period`,
        "SUM(payment.amount) AS revenue",
        "COUNT(*) AS transactions",
      ])
      .orderBy("period", "ASC")
      .getRawMany();

    await this.cacheService.set(cacheKey, data, 600);
    return data;
  }
}
```

```typescript
// src/modules/analytics/analytics.controller.ts
@ApiTags("Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CREATOR)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Get creator overall analytics (all events)" })
  getOverview(@CurrentUser() user: User) {
    return this.analyticsService.getCreatorOverallAnalytics(user.id);
  }

  @Get("events/:eventId")
  @ApiOperation({ summary: "Get analytics for a specific event" })
  getEventAnalytics(
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.analyticsService.getEventAnalytics(eventId, user.id);
  }

  @Get("revenue")
  @ApiOperation({ summary: "Get revenue over time (daily/weekly/monthly)" })
  getRevenue(
    @CurrentUser() user: User,
    @Query("period") period: "daily" | "weekly" | "monthly" = "monthly",
  ) {
    return this.analyticsService.getRevenueOverTime(user.id, period);
  }
}
```

---

### Tickets Module

```typescript
// src/modules/tickets/tickets.controller.ts
@ApiTags("Tickets")
@Controller("tickets")
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get("my-tickets")
  @ApiOperation({ summary: "Get all tickets for the current eventee" })
  getMyTickets(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    return this.ticketsService.getUserTickets(user.id, pagination);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ticket details with QR code" })
  getTicket(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.ticketsService.getTicketById(id, user.id);
  }
}
```

---

### Cache Service

```typescript
// src/modules/cache/cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) await this.redis.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) > 0;
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }
}
```

---

## App Module & main.ts

```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get("DATABASE_URL"),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: config.get("NODE_ENV") !== "production",
        migrations: [__dirname + "/database/migrations/*{.ts,.js}"],
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    EventsModule,
    TicketsModule,
    PaymentsModule,
    QrCodesModule,
    NotificationsModule,
    AnalyticsModule,
    CacheModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Eventful API")
    .setDescription("Eventful Ticketing Platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth")
    .addTag("Events")
    .addTag("Tickets")
    .addTag("Payments")
    .addTag("QR Codes")
    .addTag("Notifications")
    .addTag("Analytics")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Eventful API running on port ${process.env.PORT || 3000}`);
  console.log(`📚 Swagger docs at /api/docs`);
}
bootstrap();
```

---

## Testing

```typescript
// src/modules/auth/tests/auth.service.spec.ts (Unit Test)
describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByEmail: jest.fn(), create: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue("token") },
        },
        { provide: CacheService, useValue: { set: jest.fn(), del: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  describe("register", () => {
    it("should throw ConflictException if email exists", async () => {
      usersService.findByEmail.mockResolvedValue({ id: "1" } as any);
      await expect(
        service.register({ email: "test@test.com" } as any),
      ).rejects.toThrow(ConflictException);
    });

    it("should create and return user with tokens on success", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: "1",
        email: "test@test.com",
        role: UserRole.EVENTEE,
      } as any);
      const result = await service.register({
        email: "test@test.com",
        password: "pass",
      } as any);
      expect(result).toHaveProperty("accessToken");
    });
  });
});

// src/modules/payments/tests/payments.integration.spec.ts (Integration Test)
describe("PaymentsModule (Integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it("POST /api/v1/payments/initialize - should require auth", () => {
    return request(app.getHttpServer())
      .post("/api/v1/payments/initialize")
      .expect(401);
  });

  afterAll(() => app.close());
});
```

---

## API Endpoints Summary

| Method | Endpoint                                           | Auth | Role    | Description           |
| ------ | -------------------------------------------------- | ---- | ------- | --------------------- |
| POST   | /api/v1/auth/register                              | —    | Any     | Register              |
| POST   | /api/v1/auth/login                                 | —    | Any     | Login                 |
| POST   | /api/v1/auth/logout                                | JWT  | Any     | Logout                |
| POST   | /api/v1/auth/refresh                               | JWT  | Any     | Refresh tokens        |
| GET    | /api/v1/auth/me                                    | JWT  | Any     | Get current user      |
| POST   | /api/v1/events                                     | JWT  | Creator | Create event          |
| GET    | /api/v1/events                                     | —    | —       | List public events    |
| GET    | /api/v1/events/my-events                           | JWT  | Creator | Creator's events      |
| GET    | /api/v1/events/:id                                 | —    | —       | Get event             |
| GET    | /api/v1/events/slug/:slug                          | —    | —       | Get by slug           |
| PATCH  | /api/v1/events/:id                                 | JWT  | Creator | Update event          |
| POST   | /api/v1/events/:id/publish                         | JWT  | Creator | Publish event         |
| GET    | /api/v1/events/:id/attendees                       | JWT  | Creator | Get attendees         |
| GET    | /api/v1/events/:id/share                           | —    | —       | Get share links       |
| POST   | /api/v1/payments/initialize                        | JWT  | Eventee | Start payment         |
| GET    | /api/v1/payments/verify/:ref                       | JWT  | Eventee | Verify payment        |
| POST   | /api/v1/payments/webhook                           | —    | System  | Paystack webhook      |
| GET    | /api/v1/payments/creator/all                       | JWT  | Creator | Creator payments      |
| GET    | /api/v1/tickets/my-tickets                         | JWT  | Eventee | User's tickets        |
| GET    | /api/v1/tickets/:id                                | JWT  | Eventee | Ticket + QR code      |
| POST   | /api/v1/qr-codes/validate                          | JWT  | Creator | Scan/validate QR      |
| GET    | /api/v1/notifications                              | JWT  | Any     | Get notifications     |
| PATCH  | /api/v1/notifications/:id/read                     | JWT  | Any     | Mark as read          |
| POST   | /api/v1/notifications/events/:id/reminders         | JWT  | Eventee | Set own reminder      |
| POST   | /api/v1/notifications/events/:id/creator-reminders | JWT  | Creator | Set default reminders |
| GET    | /api/v1/analytics/overview                         | JWT  | Creator | Overall analytics     |
| GET    | /api/v1/analytics/events/:id                       | JWT  | Creator | Event analytics       |
| GET    | /api/v1/analytics/revenue                          | JWT  | Creator | Revenue chart data    |

---

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/axios": "^3.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "ioredis": "^5.3.0",
    "bcryptjs": "^2.4.3",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "qrcode": "^1.5.3",
    "cloudinary": "^2.0.0",
    "nanoid": "^3.3.0",
    "nodemailer": "^6.9.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.0.0"
  }
}
```
