# Aursuq Current Task

## Status

COMPLETED

## Current Phase

Seller lifecycle documentation phase — COMPLETE

## Current Task

Seller lifecycle documentation phase is complete. All seller business rules and state machines are permanently defined in:
- `docs/ai/DECISIONS.md` (owner-confirmed decisions D-001 through D-056)
- `docs/ai/WORKFLOWS.md` (core workflows for application, verification, moderation, archive)
- `docs/ai/ARCHITECTURE.md` (architecture sections 9–14 covering seller domain)
- `docs/STATUS_ENUMS.md` (verification, moderation, archive, store number, access eligibility)
- `docs/ai/OPEN_DECISIONS.md` (only 6 genuine technical open decisions remain)

## Permanently Defined Seller Business Rules

The following seller business rules are now fully documented and confirmed:

- Verification and moderation are **separate state machines**
- Seller verification lifecycle is documented (UNVERIFIED → PENDING_REVIEW → IN_VERIFICATION → VERIFIED / REJECTED)
- Moderation lifecycle is documented (ACTIVE → FROZEN → BLOCKED → PERMANENTLY_BLOCKED)
- **ADMIN cannot create sellers**
- **OWNER is the only role that can manually create a seller**
- OWNER-created seller becomes **VERIFIED immediately**
- Field-by-field verification is required
- Reviewer locking/assignment is required (one ADMIN reviewer at a time; OWNER may override/reassign)
- Seller audit/history is **persistent and append-only**
- Deletion is **archive (soft delete)**, not hard delete
- Store Number uses **lowest-available allocation** direction
- Store Number **remains reserved** for FROZEN, BLOCKED, PERMANENTLY_BLOCKED sellers
- Store Number is **released only after archive**
- **One seller identity/account per person for life**
- Government identity identifier is the **core identity uniqueness key**
- Identity uniqueness **survives archive, block, and permanent block**
- Warnings / Freeze / Block / Permanent Block / Unblock Request workflows are documented
- Archived seller history remains **accessible in dedicated archival views**
- Owner Dashboard seller-count definitions are documented (TOTAL vs ACTIVE per lifecycle rules, not simple User.role counts)

## Next Implementation Task

### PHASE 1 — Seller Lifecycle Data Model Foundation

Phase 1 should later implement:

1. **Expanded seller verification statuses** (UNVERIFIED, PENDING_REVIEW, IN_VERIFICATION, REJECTED, VERIFIED)
2. **Separate seller moderation status** (ACTIVE, FROZEN, BLOCKED, PERMANENTLY_BLOCKED)
3. **Field verification data model** (per-field PENDING/VERIFIED/REJECTED with notes)
4. **Seller audit/history model** (append-only events with actor, role, timestamp, reason, evidence refs)
5. **Archive/soft-delete foundation** (isArchived flag, archivedAt, archive reason, evidence, snapshot)
6. **Lifetime identity uniqueness foundation** (unique constraints on government ID, email, business registration that survive archive)
7. **Lowest-available Store Number allocator foundation** (concurrency-safe allocation with number reuse)
8. **Migration path from the current simplified Seller/Store implementation**

---

### Phase 1 Must NOT Yet Implement

The following belong to **later phases** and must NOT be implemented in Phase 1:

- Full verification UI (Phase 2)
- Reviewer workflow UI (Phase 2)
- Warnings UI (Phase 3)
- Block/Freeze UI (Phase 3)
- Seller authentication/access (Phase 6)
- Transactional emails (Phase 5)
- Evidence file upload / object storage integration (Phase 5)
- Finance / Warehouse / Product / Catalog domains (separate domain phases)

---

## Current Implementation Debt (Do NOT Fix in This Task)

The following current implementation behaviors are **documented debt** relative to the confirmed architecture. They will need migration in Phase 1 and later. **Do NOT fix them now.**

- **Simplified SellerVerificationStatus** — Current enum may only have `PENDING/APPROVED/REJECTED` (superseded by 5-state + field-level model)
- **Destructive seller delete** — Current behavior hard-deletes `Store` + `SellerProfile` + `User` (superseded by archive)
- **SERIAL Store Number** — Current PostgreSQL `SERIAL` continually increasing without reuse (superseded by lowest-available allocator)
- **OWNER-created seller PENDING behavior** — Current OWNER creation may start in `PENDING` (superseded by immediate `VERIFIED`)
- **Seller counts based on User.role** — Current dashboard counts `User` with `role=SELLER` (superseded by lifecycle-domain queries)

---

## Next

Owner will select when to begin Phase 1 implementation.

The implementation order after Phase 1 should generally follow the phased plan in `docs/ai/DECISIONS.md` (D-055):

- Phase 2: Application/review workflow, verification assignment/locking, field-by-field verification, rejection/correction
- Phase 3: Warnings, freeze/unfreeze, block, unblock request, permanent block, archive workflow
- Phase 4: Owner/Admin seller-management UI, filters, seller details, history, moderation actions, archived sellers view
- Phase 5: Evidence attachment storage, seller verification result emails
- Phase 6: Seller authentication/access, verified/moderation-based access control
- Subsequent phases: Store, Catalog, Inbound, Warehouse, Customer Marketplace, Checkout, Orders, Fulfillment, Ledger/Payouts, etc.

---

## Branch

Use a dedicated development branch for implementation work unless the owner specifies otherwise.

## Last Updated

2026-10-03 - Seller lifecycle documentation phase complete. Next implementation: Phase 1 — Seller Lifecycle Data Model Foundation.