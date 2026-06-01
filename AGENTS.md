# AGENTS — Eventful Backend Assistant Guide

## Purpose

Provide concise, actionable guidance for AI coding agents working on the Eventful NestJS backend.

## Quick Links

- Eventful prompt: Prompts/eventful-backend-prompt.md
- Repo instructions: eventful-backend.instructions.md

## Quick Start (Dev)

Install dependencies and run the dev server:

```bash
npm install
npm run start:dev
```

Run tests:

```bash
npm test
npm run test:watch
```

## Environment

Copy `.env.example` to `.env` and fill values for `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `PAYSTACK_*`, `CLOUDINARY_*`, and email provider keys.

## Key Conventions (short)

- TypeScript with `strict` enabled — explicit types for DTOs and public methods.
- Use `class-validator` + `class-transformer` for DTOs.
- Access DB via TypeORM repositories and entities under `src/modules/**/entities`.
- Use `CacheService` abstraction for Redis (`src/modules/cache`).
- Protect endpoints with `JwtAuthGuard` and `RolesGuard` as appropriate.
- Prefer `nanoid` for slugs and `EVT-` prefix for ticket/payment refs.
- Keep services thin; controllers orchestrate only.

## Where to look

- API entry & bootstrap: `src/main.ts` and `src/app.module.ts`.
- Modules under: `src/modules/*` (auth, events, payments, tickets, qr-codes, notifications, analytics, cache).
- Prompts and design notes: `Prompts/eventful-backend-prompt.md`.
- Agent rules: `eventful-backend.instructions.md`.

## Agent Tasks Suggestions

- Create DTOs and controllers following existing patterns.
- Add unit tests for services before implementation when non-trivial logic exists.
- When changing DB shape, add TypeORM migration under `database/migrations`.

## Minimal Advice for Webhooks & Payments

- Verify webhook signatures using configured secrets before processing.
- Treat payment fulfillment as idempotent — check and update payment status atomically.

## If unclear

Ask one targeted question (e.g., preferred logger: `winston` or `pino`), then proceed.
