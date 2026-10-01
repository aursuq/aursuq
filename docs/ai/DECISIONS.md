# Aursuq Owner-Confirmed Decisions

This file contains owner-confirmed product decisions.

These decisions override assumptions made by AI agents.

Do not change these decisions without explicit owner approval.

---

## D-001 — Independent Seller Listings

Listings from different sellers remain independent.

Do not merge identical real-world products from multiple sellers into one shared product page with multiple offers.

Example:

Five sellers selling the same iPhone may produce five separate marketplace listings.

---

## D-002 — Seller Inventory Ownership

Each seller's inventory is independent.

Inventory belonging to Seller A must never be treated as interchangeable with Seller B inventory.

---

## D-003 — Aursuq Operates Fulfillment

Aursuq handles:

- Warehousing
- Picking
- Packing
- Shipping
- Fulfillment

Normal marketplace sellers do not ship customer orders directly.

---

## D-004 — Stock Reservation Timing

Stock is reserved only after successful payment.

Do not reserve stock merely because:

- Product entered cart
- Checkout started
- Payment is pending

Concurrency-safe stock reservation is required.

---

## D-005 — Unified Customer Order

A customer purchasing from multiple sellers sees one customer-facing order.

Internally the system may create seller-specific order shares/suborders.

---

## D-006 — Seller Storefront

Every seller has a shareable storefront.

The storefront can be expanded with customization such as:

- Theme
- Hero/background image
- Optional hero video
- Custom pages
- About page
- Promotional content

---

## D-007 — Seller Pricing

Normal sellers can control prices for their own listings.

They can also create discounts according to platform rules.

The system must preserve original price and discounted price where relevant.

---

## D-008 — Variant Barcodes

Variants may have independent barcodes.

Inventory must be tracked at the correct variant level.

---

## D-009 — Inbound Declaration

Before shipping inventory to Aursuq, the seller declares expected shipment details including:

- Product/variant
- Product barcode
- Weight
- Quantity
- Number of outer cartons
- Units per carton
- Carton dimensions

---

## D-010 — Receiving Barcode

Aursuq generates one receiving barcode per outer carton.

The barcode represents the expected carton in the inbound shipment.

---

## D-011 — Receiving Discrepancies

Warehouse staff compare expected vs actual shipment.

Discrepancies must be recordable.

Photo evidence must be supported.

Only accepted inventory becomes sellable inventory.

---

## D-012 — Warehouse Responsibility Boundary

Aursuq's warehouse custody responsibility starts after formal receipt/acceptance according to final operational/legal policy.

The system must preserve evidence of receiving and discrepancies.

---

## D-013 — Low Stock Alerts

Sellers may configure inventory alert thresholds.

A notification should be triggered when stock reaches the configured threshold according to defined notification logic.

---

## D-014 — Seller Shipping Speed Is Not Ranking Input

Sellers do not control customer fulfillment speed because Aursuq handles fulfillment.

Therefore seller shipping speed must not be used as a ranking signal.

Operational Aursuq fulfillment performance can be measured separately.

---

## D-015 — Organic Ranking

Marketplace ranking may use signals such as:

- Relevance
- Orders
- Conversion
- Ratings
- Review quality
- Return/refund rate
- Stock reliability
- Operational reliability

Exact algorithm weights remain configurable.

---

## D-016 — Sponsored Results

Paid promotion is allowed.

Sponsored/promoted placements must be clearly distinguishable from organic results.

---

## D-017 — Store Search

Customers must be able to search for stores by store name.

---

## D-018 — Seller Verification

Seller onboarding requires identity/business verification.

Expected information includes:

- Business/tax registration information where applicable
- Personal/business details
- Identity documentation

Exact legal implementation remains compliance-dependent.

---

## D-019 — Criminal Record Screening

Do not implement criminal-record screening by assumption.

Whether this is lawful/available in Israel requires legal verification.

---

## D-020 — Support Role

Support is a separate role from Admin.

Support permissions should be restricted to support-related operations.

---

## D-021 — Owner Role

Owner is above Admin.

Owner can have platform-level permissions that ordinary Admin accounts do not have.

---

## D-022 — Official Aursuq Store

Aursuq may own and sell first-party products through an official Aursuq store.

These products are inventory owned by Aursuq.

---

## D-023 — Aursuq Reseller Feature

A seller may eventually add selected Aursuq-owned products to their own storefront.

The seller:

- Does not own the inventory
- Does not purchase inventory
- Does not send inventory
- Does not fulfill orders
- Cannot change the Aursuq-defined price

Aursuq owns and fulfills the inventory.

The referring/reselling seller receives a configurable commission.

10% is an example, not a hard-coded rule.

---

## D-024 — Delivery Fee

Delivery fee must be configurable.

20 NIS has been discussed only as an example.

Do not hard-code it.

---

## D-025 — Technology Direction

Web:

React / Next.js / TypeScript

Backend:

Node.js / TypeScript / NestJS

Mobile:

React Native + Expo later

Database:

PostgreSQL

ORM:

Prisma

Repository:

pnpm workspace + Turborepo

Backend architecture:

Modular monolith first.

---

## D-026 — Mobile Is Not First Priority

Do not build the full mobile application before the core web/backend marketplace works unless explicitly requested.

The architecture should remain mobile-friendly through reusable APIs and shared packages.

---

## D-027 — MVP First

Do not introduce unnecessary enterprise infrastructure.

Prefer a correct, maintainable MVP.

Avoid premature:

- Microservices
- Kubernetes
- Service mesh
- Database sharding
- Multi-region architecture
- Event sourcing

unless a real requirement appears.

---

## D-028 — Secrets

Never commit:

- API keys
- Tokens
- Passwords
- Real .env files
- Payment secrets
- Database credentials
- Customer personal data

Only templates such as .env.example may be committed.