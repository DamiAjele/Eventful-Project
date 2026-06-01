# Eventful — Backend

This is the Eventful monolithic NestJS backend for an event ticketing platform. It provides REST APIs for authentication, events, tickets, payments (Paystack), QR generation/validation, notifications, and analytics.

### Frontend
[Frontend URL]("")

## Tech stack

- Node.js 20+
- NestJS (TypeScript)
- PostgreSQL (TypeORM)
- Redis (ioredis) for cache
- Paystack for payments
- Cloudinary for QR/image uploads (optional)
- Jest + Supertest for tests

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL (or a connection string such as Neon)
- Redis server
- Optional: Cloudinary account (for uploads), SMTP access (for emails)

## Environment

Copy `.env.example` to `.env` and fill the values.

Important vars:

- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — JWT signing secret
- `PAYSTACK_SECRET_KEY` and `PAYSTACK_WEBHOOK_SECRET`
- `CLOUDINARY_*` — optional Cloudinary credentials
- `SMTP_*` — optional email SMTP credentials
- `THROTTLE_TTL`, `THROTTLE_LIMIT` — rate limiting defaults

## Setup

Install dependencies:

```bash
cd backend
npm install
```

Create `.env` from the example and set your values.

## Development

Start the development server (uses `nest start:dev`):

```bash
cd backend
npm run start:dev
```

The API is served at `http://localhost:3000/api/v1` by default. Swagger UI is available at `http://localhost:3000/api/docs` when `NODE_ENV` is not `production`.

Notes:

- The application preserves raw request body for webhook signature verification (Paystack); keep `express.json` verify middleware enabled.
- Rate limiting is configured with `@nestjs/throttler`. Tune via `THROTTLE_TTL` and `THROTTLE_LIMIT` environment variables.

## Database migrations

This project uses TypeORM migrations. Generate and run migrations as follows:

```bash
cd backend
npx typeorm migration:generate -n AddSomething
npx typeorm migration:run
```

(If using the project TypeORM CLI, ensure `ts-node` is available or use compiled migrations.)

## Tests

Run unit and integration tests with:

```bash
cd backend
npm test
```

Use `npm run test:watch` for iterative development.

## Linting & Formatting

Lint and auto-fix:

```bash
cd backend
npm run lint
```

Formatting is controlled by Prettier config in the repo.

## Logging & Error Handling

- A global `HttpExceptionFilter` (src/common/filters/http-exception.filter.ts) normalizes API error responses and logs unexpected errors.
- Class-scoped Nest `Logger` is used across services. Consider integrating `winston` or `pino` for structured logs in production.

## Rate Limiting

- Global rate limiting via `@nestjs/throttler` is enabled with defaults from `.env`.
- Sensitive endpoints (auth, payments) have per-endpoint throttles applied; webhooks are exempted.

## Swagger

- API docs are generated with `@nestjs/swagger` and available at `/api/docs` in non-production.

## Contributing

- Follow existing code style (TypeScript, Nest patterns).
- Add migrations whenever you change entities.
- Add unit tests for new services and controllers.

## Notes & Next Steps

- Consider adding Redis-backed throttler store for distributed rate-limiting in cluster deployments.
- CI should run `npm run lint` and `npm test` on PRs.

---

If you'd like, I can add a simple e2e test demonstrating throttling behavior or scaffold production logging (winston) integration.
