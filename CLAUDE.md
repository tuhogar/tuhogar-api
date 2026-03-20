# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build              # NestJS build (output: dist/)
npm run start:dev          # Development with watch mode
npm run start:debug        # Debug mode with watch
npm run start:prod         # Production (runs dist/main.js)
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

## Testing

```bash
npm run test               # Run all unit tests (Jest)
npm run test:watch         # Watch mode
npm run test:cov           # With coverage report
npm run test:e2e           # E2E tests (uses test/jest-e2e.json)
npx jest path/to/file.spec.ts  # Run a single test file
```

## Architecture

**Clean Architecture with 3 layers:**

- **Domain** (`src/domain/`) — Pure entities and enums. No framework dependencies. 34 domain entities.
- **Application** (`src/application/`) — Use cases (business logic) and repository interfaces. Each use case is an injectable class with a single `execute()` method, organized by feature (account, advertisement, user, subscription, etc.).
- **Infrastructure** (`src/infraestructure/`) — Framework and external service implementations: HTTP controllers, Mongoose repositories, DTOs, guards, payment gateways, Cloudinary, Algolia, Redis, OpenAI.

**Key patterns:**
- **Repository Pattern**: Interfaces in `application/interfaces/repositories/`, implementations in `infraestructure/persistence/mongoose/repositories/`
- **Mapper Pattern**: Bidirectional domain ↔ Mongoose transformations in `infraestructure/persistence/mongoose/mapper/`
- **Use Case Pattern**: One class per business operation in `application/use-cases/{feature}/`

## Tech Stack

- **Framework**: NestJS 10 + TypeScript 5
- **Database**: MongoDB via Mongoose (`MONGODB_URL` env var)
- **Cache**: Redis (caches GET endpoints via `RedisCacheInterceptor`)
- **Auth**: Firebase Admin SDK (token validation in `AuthGuard`, claims carry role/account/subscription data)
- **Payments**: ePayco + MercadoPago (both implement `IPaymentGateway` interface)
- **Search**: Algolia
- **Images**: Cloudinary
- **Runtime**: Node 20, port 3000

## Authentication & Authorization

The `@Auth(...roles)` decorator combines `AuthGuard` + role metadata + `StripRequestContextPipe`. Firebase ID tokens are validated and claims extracted into `request.user` (AuthenticatedUser). Access via `@Authenticated()` parameter decorator in controllers. Roles: MASTER, ADMIN, USER.

## Error Handling Conventions

Custom error messages use prefixed strings that `CustomExceptionFilter` maps to HTTP status codes:
- `invalid.*` → 400
- `notfound.*` → 404
- `Unauthorized` → 401

## DTO Validation

DTOs use `class-validator` decorators plus custom async validators (e.g., `IsExistingPlan`, `UserAlreadyExists`, `AccountDomainAlreadyExists`, `AccountDomainIsNotBlacklistWord`). The `@Property()` decorator marks allowed fields; `StripRequestContextPipe` removes unlisted fields to prevent field injection.

## Environment

Requires `.env` file with: Firebase service account vars, `MONGODB_URL`, `REDIS_URL`/`REDIS_PASSWORD`, Cloudinary/Algolia/ePayco/MercadoPago credentials, `OPENAI_KEY`, `BASE_URL`, `API_PREFIX` (`/api/v1`). See `.env.docker` for reference.

## Language

The codebase, variable names, and domain terms are primarily in English, but some infrastructure naming uses Spanish (e.g., `infraestructure` directory).
