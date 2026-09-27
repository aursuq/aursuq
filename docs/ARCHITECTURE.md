# Architecture Decisions

## 1. System style

Aursuq starts as a modular monolith in NestJS. Modules communicate through explicit application/domain boundaries. This keeps development manageable for a small team while preserving a path to split high-load domains later.

## 2. Data

PostgreSQL is the primary database. Prisma is the planned ORM.

Financial state must be modeled through ledger entries rather than only mutable balance fields. Inventory must be tracked through inventory movements, with denormalized balances allowed for fast reads.

## 3. Frontends

The customer, seller and admin web experiences start in Next.js. Mobile is planned with React Native + Expo and will consume the same REST/OpenAPI contract.

## 4. External systems

Cloudflare R2 is planned for product/store media. Redis + BullMQ are planned for asynchronous jobs, queues and selected caches when needed.

## 5. Reliability rules

- Payment and shipping webhooks must be idempotent.
- Critical multi-write operations use database transactions.
- Sensitive actions are audit logged.
- Secrets never enter Git.
- Development, staging and production remain separate environments.
