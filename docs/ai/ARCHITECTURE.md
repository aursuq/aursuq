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

## Seller Lifecycle Domain Direction

This section defines the architectural direction for the seller domain. Future implementation tasks must follow these principles.

---

### 1. Separate Seller Domain Concerns

The seller domain must be modeled as distinct, separated concerns rather than a single monolithic entity. Do not overload `UserStatus` or any single model to represent all seller lifecycle states.

**Separate concerns include:**
- **User / Authentication Identity** — Core authentication, roles, credentials
- **SellerProfile** — Business/personal details, identity documents, government identity number
- **Store** — Storefront, settings, catalog, store number
- **Seller Verification Lifecycle** — Application, review, field-level verification, rejection/resubmission
- **Seller Moderation Lifecycle** — Active, frozen, blocked, permanently blocked
- **Seller Audit/History** — Append-only event log of all lifecycle changes
- **Verification Field Review** — Per-field verification records with status, reviewer, notes
- **Archive State** — Soft-delete/archival metadata (separate from moderation)
- **Moderation Evidence** — File references linked to moderation/history events
- **Store Number Allocation** — Concurrency-safe allocator for human-friendly store numbers

---

### 2. Verification vs Moderation

Architecture must keep verification and moderation as **separate state machines** with distinct responsibilities.

**SellerVerificationStatus** (identity/business information verification):
- `UNVERIFIED` — Initial state for self-registered sellers
- `PENDING_REVIEW` — Submitted, waiting for reviewer
- `IN_VERIFICATION` — Reviewer actively processing (reviewer lock applies)
- `REJECTED` — Rejected or requires correction; field-level details stored
- `VERIFIED` — All required fields verified

**SellerModerationStatus** (operational permission):
- `ACTIVE` — Normal operations allowed
- `FROZEN` — Temporary review/investigation; store number retained
- `BLOCKED` — OWNER decision; store number retained; ADMIN may request unblock only
- `PERMANENTLY_BLOCKED` — Irreversible OWNER decision; no transition back

**Archive** is separate from both — a distinct archival concept, not a moderation status.

These state machines operate independently. A seller can be `VERIFIED` but `BLOCKED`, or `UNVERIFIED` but `ACTIVE` (temporarily during onboarding). **Seller access requires both `VERIFIED` AND a permissive moderation state (`ACTIVE`).**

### 3. Audit / History Model

Future data model must include an **append-only seller audit/history mechanism**. Each event stores:

- Seller/profile reference
- Event type (e.g., `APPLICATION_SUBMITTED`, `FIELD_VERIFIED`, `FREEZE_APPLIED`, `ARCHIVE`)
- Previous state
- New state
- Actor user ID
- Actor role
- Timestamp
- Reason
- Notes/message
- Optional metadata (JSON)
- Optional evidence references

**History must survive all transitions:**
- Verification changes (including rejection/resubmission)
- Freeze, warning, block, unblock
- Permanent block
- Archive

Do not rely only on current state fields; history is the source of truth for what happened and when.

---

### 4. Verification Field Review Model

Architecture must support **per-field verification records**, not a single boolean flag.

A field review represents:
- Which seller field/document is being reviewed (e.g., legal name, government identity number, identity document, business registration, tax number, phone, business address)
- **Status:** `PENDING`, `VERIFIED`, `REJECTED`
- Reviewer (user ID + role)
- `reviewedAt` timestamp
- Rejection/correction note (when `REJECTED`)

Each field tracks its own lifecycle. Rejected fields must support correction/resubmission with full history preserved.

---

### 5. Verification Reviewer Lock

Architecture must support assigning **one active reviewer** to a verification application.

**Required data:**
- Reviewer/admin user ID
- `assignedAt` / `startedAt` timestamp
- Current review ownership indicator

**Concurrency requirements:**
- Two ADMIN reviewers must not process the same verification simultaneously
- OWNER must be able to override or reassign the lock at any time

Exact locking implementation (database row lock, advisory lock, dedicated column, etc.) may be chosen later, but the architecture must preserve this requirement.

---

### 6. Archive Instead of Hard Delete

Seller deletion must use **archival/soft-delete architecture**. Future models should support:

- `isArchived` (boolean)
- `archivedAt` (timestamp)
- `archivedBy` (user ID)
- `archiveReason` (optional text)
- Optional evidence references

**Archiving must:**
- Preserve seller/store history
- Preserve identity history (government ID, email, etc.)
- Preserve historical Store Number in audit/archive
- Exclude archived sellers from current active queries (storefront, search, admin lists by default)
- Allow internal viewing in dedicated "Deleted / Archived Stores" view

Do not cascade-delete `SellerProfile`, `User`, or `Store` just because OWNER chooses Delete.

---

### 7. Identity Uniqueness for Life

**One person may have only one seller identity/account relationship with Aursuq for life.**

Architecture must enforce durable uniqueness using the **government identity identifier** (primary key).

**Critical rules:**
- Archive does **NOT** release identity uniqueness
- Block does **NOT** release identity uniqueness
- Permanent block does **NOT** release identity uniqueness
- Email alone is **insufficient** for uniqueness

**Sensitive identity information must:**
- Not be logged
- Not be exposed in ordinary seller list endpoints
- Use a secure storage/indexing approach (encryption/tokenization — see OPEN_DECISIONS for exact design)

Backend must verify the identity number has never belonged to another seller identity in Aursuq. Uniqueness must be server-side, database-safe, protected from race conditions.

---

### 8. Store Number Allocator

Current `SERIAL`-only allocation is superseded. Future architecture must include a **concurrency-safe Store Number allocator** that:

- Assigns the **LOWEST AVAILABLE positive integer** (e.g., reserved 1,2,4,5 → new store receives 3)
- Keeps number reserved for: `ACTIVE`, `FROZEN`, `BLOCKED`, `PERMANENTLY_BLOCKED`
- Releases number **only when archived**
- Preserves historical Store Number in audit/archive history

**Do NOT use:**
- `MAX(storeNumber) + 1`
- Other race-prone application-only logic

The allocator must eventually use a **database-safe strategy** such as:
- Dedicated allocation/reservation table
- Transactional locking (e.g., `SELECT FOR UPDATE` on allocation table)
- Equivalent concurrency-safe design

Do not choose a final low-level implementation unless already confirmed.

---

### 9. Evidence / File References

Warnings, freezes, blocks, archive actions, and verification may have supporting evidence/files.

Architecture must:
- **NOT store large binaries directly in PostgreSQL**
- Store object/file references and metadata (filename, uploader, timestamp, content type, size)
- Link evidence to the relevant audit/moderation/verification event

Actual object-storage provider (e.g., Cloudflare R2, S3, etc.) remains a future technical decision (see OPEN_DECISIONS).

---

### 10. Seller Access Eligibility

Architecture must make seller access decisions using **BOTH** verification status and moderation status.

**Normal seller access requires ALL:**
1. `verificationStatus = VERIFIED`
2. `moderationStatus = ACTIVE`
3. Not archived (`isArchived = false`)
4. Store active (if store activation is a separate concept)

Do not infer seller access from `User.role` alone. `FROZEN`, `BLOCKED`, and `PERMANENTLY_BLOCKED` are not normal active-selling states.

---

### 11. OWNER / ADMIN Permissions

Architecture must preserve the following authority boundaries:

**OWNER:**
- May manually create seller (bypasses public application queue)
- OWNER-created seller becomes `VERIFIED` immediately
- Highest moderation authority
- May apply `PERMANENTLY_BLOCKED`
- May block/unblock
- May archive
- May override/reassign verification reviewer lock

**ADMIN:**
- **Cannot create sellers**
- May process seller applications (verification queue)
- May verify/reject individual fields
- May verify/reject applications
- May freeze for review where allowed
- May request unblock (OWNER approves/rejects)
- **Cannot override permanent block**

Authorization must remain **server-side**.

---

### 12. Dashboard Query Direction

Owner Dashboard seller counts must eventually query the **seller lifecycle domain**, not simply count `User` rows with `role = SELLER`.

**TOTAL SELLERS and ACTIVE SELLERS must follow definitions in STATUS_ENUMS / DECISIONS:**
- `TOTAL SELLERS` includes: VERIFIED+ACTIVE, applications in review (PENDING_REVIEW, IN_VERIFICATION), FROZEN
- `TOTAL SELLERS` excludes: Archived, BLOCKED, PERMANENTLY_BLOCKED, fully closed REJECTED
- `ACTIVE SELLERS` includes ONLY: VERIFIED + ACTIVE moderation + not archived + store active

Do not duplicate business logic in frontend; backend must expose correct counts.

---

### 13. Seller Detail Aggregation

Future seller detail API/page will aggregate data from **multiple domains**:

- Seller identity/profile
- Verification (status, field reviews, reviewer lock)
- Store (storefront, settings, store number)
- Moderation/history (audit events, evidence)
- Finance (ledger, payouts, balances)
- Warehouse (inventory, inbound, fulfillment)
- Products/catalog

**Domains not yet implemented must return empty/unknown states rather than mock values.**

Avoid putting all seller-detail data into one giant database table. Preserve domain boundaries.

---

### 14. Current Implementation Debt

The following current implementation areas are **implementation debt** relative to the OWNER-confirmed architecture above. They will need migration in future phases. **Do NOT fix them in this documentation task.**

- **Simplified SellerVerificationStatus** — Current enum may only have `PENDING/APPROVED/REJECTED` (superseded by 5-state + field-level model)
- **Destructive seller delete** — Current behavior hard-deletes `Store` + `SellerProfile` + `User` (superseded by archive)
- **SERIAL storeNumber** — Current PostgreSQL `SERIAL` continually increasing without reuse (superseded by lowest-available allocator)
- **OWNER-created seller PENDING behavior** — Current OWNER creation may start in `PENDING` (superseded by immediate `VERIFIED`)
- **Seller counts based on User.role** — Current dashboard counts `User` with `role=SELLER` (superseded by lifecycle-domain queries)

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