# Aursuq Architecture

## Current Architecture Direction

Aursuq is built as a TypeScript monorepo.

Current repository layout:

apps/
- api
- web
- mobile

packages/
- api-client
- config
- types
- ui-tokens
- validation

---

## Monorepo

Package manager:

pnpm

Build/task orchestration:

Turborepo

Shared code should live in packages only when it is genuinely reusable.

Avoid turning packages into a dumping ground for application-specific logic.

---

## Backend

Framework:

NestJS

Language:

TypeScript

Architecture:

Modular monolith.

Initial domain modules may include:

- identity
- sellers
- stores
- catalog
- inbound
- warehouse
- inventory
- cart
- checkout
- orders
- fulfillment
- payments
- ledger
- payouts
- promotions
- advertising
- reviews
- notifications
- support
- admin
- audit

Domain boundaries should remain clean enough to allow future extraction if ever necessary.

Do not create microservices now.

---

## Web

Framework:

Next.js

UI:

React

Language:

TypeScript

The web application will eventually support interfaces for:

- Customer
- Seller
- Support
- Admin
- Owner
- Warehouse staff

These can share one Next.js application initially where appropriate.

Do not split into separate deployments without a practical reason.

---

## Mobile

Planned:

React Native + Expo.

Mobile comes after the core platform.

Backend APIs must not depend on browser-only behavior so mobile clients can reuse them later.

---

## Database

Database:

PostgreSQL

ORM:

Prisma

PostgreSQL is the transactional source of truth.

Use database constraints and transactions for important invariants.

Examples:

- Inventory consistency
- Payment state
- Order state
- Unique barcodes where required
- Financial records
- Seller ownership boundaries

---

## Inventory Model

Inventory must remain seller + variant aware.

Never merge inventory between sellers.

Stock changes should be auditable.

Prefer inventory movement records for stock changes rather than unexplained balance mutation.

Concurrency must be handled when reserving stock after payment.

---

## Financial Model

Seller financial activity should be represented through auditable ledger entries.

Avoid making a mutable `balance` column the only source of financial truth.

Derived balances may exist for performance, but must be reconcilable with ledger history.

---

## Authentication

Expected direction:

JWT access + refresh token architecture.

Permissions must support at least:

- CUSTOMER
- SELLER
- SUPPORT
- WAREHOUSE
- ADMIN
- OWNER

Do not rely only on broad roles where fine-grained permissions are needed.

---

## Shared Validation

Shared request/data validation can use Zod through:

packages/validation

Shared TypeScript contracts can use:

packages/types

Avoid duplicating the same validation rules independently across web and API when they can safely be shared.

---

## API Client

packages/api-client

will provide a reusable client for Aursuq APIs.

It should eventually support both web and mobile consumers.

---

## Storage

Planned object storage:

Cloudflare R2.

Possible stored objects:

- Product images
- Store assets
- Hero media
- Receiving discrepancy photos
- Shipping/warehouse documents

Do not store large binary objects directly inside PostgreSQL unless specifically justified.

---

## Redis / Async Jobs

Redis + BullMQ are planned for workloads that actually benefit from asynchronous processing.

Examples may include:

- Notifications
- Emails
- Image processing
- Background jobs
- Webhook retry jobs

Do not require Redis for simple synchronous operations when unnecessary.

---

## API Design

Use clear REST APIs initially.

Maintain consistent:

- Resource naming
- Error shapes
- Validation
- Pagination
- Authentication
- Authorization

OpenAPI/Swagger can be generated from NestJS.

Exact public API versioning policy can be finalized when needed.

---

## Security

Mandatory principles:

- Validate all external input.
- Authorize every sensitive operation.
- Never trust client-provided seller/user ownership identifiers.
- Verify resource ownership server-side.
- Protect admin/owner endpoints.
- Do not expose secrets.
- Hash passwords with a modern password hashing algorithm.
- Store refresh tokens securely.
- Protect payment/webhook endpoints against replay/forgery.
- Audit sensitive administrative and financial actions.

---

## Git

Main branch must remain stable.

AI work should preferably happen on a dedicated branch.

Before commit:

- inspect git diff
- inspect git status
- run relevant checks

Never force-push unless explicitly instructed by the owner.

---

## Development Environment

The user develops on Windows with Ubuntu WSL available.

When Cline executes shell commands for this repository, use Linux/WSL-compatible commands and relative repository paths.

Avoid Windows paths inside Linux commands.

---

## Current Scale Philosophy

Build for correctness and reasonable growth.

Do not design for hypothetical Amazon-scale load today.

Choose designs that can evolve without introducing unnecessary operational complexity.