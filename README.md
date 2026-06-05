# Eventful — Backend

This is the Eventful monolithic NestJS backend for an event ticketing platform. It provides REST APIs for authentication, events, tickets, payments (Paystack), QR generation/validation, notifications, and analytics.

### Swagger Docs
[Swagger Docs](http://localhost:4000/api/docs)

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

The API is served at `http://localhost:4000/api/v1` by default. Swagger UI is available at `http://localhost:4000/api/docs` when `NODE_ENV` is not `production`.

## Tests

Run unit and integration tests with:

```bash
cd backend
npm run test
```

Use `npm run test:watch` for iterative development.

## Linting & Formatting

Lint and auto-fix:

```bash
cd backend
npm run lint
```

## Logging & Error Handling

- A global `HttpExceptionFilter` (src/common/filters/http-exception.filter.ts) normalizes API error responses and logs unexpected errors.
- Class-scoped Nest `Logger` is used across services. Consider integrating `winston` or `pino` for structured logs in production.

## Rate Limiting

- Global rate limiting via `@nestjs/throttler` is enabled with defaults from `.env`.
- Sensitive endpoints (auth, payments) have per-endpoint throttles applied; webhooks are exempted.

## Contributing

- Follow existing code style (TypeScript, Nest patterns).
- Add migrations whenever you change entities.
- Add unit tests for new services and controllers.