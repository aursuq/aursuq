# Aursuq

Aursuq is a multi-seller marketplace with centralized warehousing, fulfillment, seller storefronts, wallet/settlement flows, advertising, and future affiliate-reselling capabilities.

## Architecture

- `apps/web` — React + Next.js + TypeScript
- `apps/api` — NestJS + TypeScript REST API
- `apps/mobile` — React Native + Expo (planned after the web MVP)
- `packages/api-client` — generated/shared API client
- `packages/types` — shared types
- `packages/validation` — shared Zod schemas
- `packages/config` — shared configuration
- `packages/ui-tokens` — shared design tokens

## Core backend domains

Identity, Sellers, Stores, Catalog, Inbound, Warehouse, Inventory, Cart, Checkout, Orders, Fulfillment, Payments, Ledger, Payouts, Promotions, Reviews, Notifications, Admin, Audit.

## Engineering principles

- Modular monolith first; preserve clean domain boundaries for later service extraction.
- PostgreSQL as source of truth.
- Inventory movements and financial ledger entries are append-oriented and auditable.
- Reserve stock only after successful payment.
- Seller proceeds remain frozen until delivery is confirmed.
- Every product variant owns independent barcode and inventory state.
- Seller listings remain independent even when multiple sellers offer the same real-world product.
- Affiliate/reseller placements never transfer inventory ownership; the source seller controls price and stock.

## Status

Repository scaffold created. Implementation starts with architecture foundations, authentication/authorization, seller onboarding, catalog, inbound warehouse flows, and inventory.
