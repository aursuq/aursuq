# Aursuq Current Task

## Status

COMPLETED

## Current Phase

Phase 1A — Seller Lifecycle Data Model Foundation — COMPLETE

## Current Task

Phase 1A has been successfully implemented and validated.

### What Was Done in Phase 1A:
1. **Expanded Seller Verification Status** — Replaced `PENDING/APPROVED/REJECTED` with `UNVERIFIED`, `PENDING_REVIEW`, `IN_VERIFICATION`, `REJECTED`, `VERIFIED`.
2. **Added Seller Moderation Status** — Added `SellerModerationStatus` enum (`ACTIVE`, `FROZEN`, `BLOCKED`, `PERMANENTLY_BLOCKED`) and added `moderationStatus` to `SellerProfile`.
3. **Archive/Soft-Delete Foundation** — Added `isArchived`, `archivedAt`, `archivedByUserId`, and `archiveReason` fields to `SellerProfile`.
4. **Reviewer Assignment Foundation** — Added `verificationReviewerId` and `verificationStartedAt` fields to `SellerProfile`.
5. **Field Verification Model** — Created `SellerVerificationField` model and `SellerVerificationFieldStatus` enum (`PENDING`, `VERIFIED`, `REJECTED`).
6. **Seller Audit / History Model** — Created append-only `SellerAudit` model with JSON payload support.
7. **Government Identity Foundation (Security Corrected)** — Replaced raw plaintext `governmentIdentityNumber` with future-safe nullable `governmentIdentityLookupHash` with a unique index. Secure hashing/encryption design remains open per OPEN_DECISIONS.md.
8. **Store Number** — Preserved existing `storeNumber` allocator behavior per requirements (allocator replacement deferred to Phase 1B).
9. **Owner Manual Creation Rule** — Updated backend seller creation so OWNER-created sellers are created directly with `verificationStatus = VERIFIED` and `moderationStatus = ACTIVE`.
10. **Hard Delete Debt** — Preserved and marked the temporary destructive delete endpoint as implementation debt.
11. **Dashboard Counts & APIs** — Updated seller mapping and API responses to support verification and moderation statuses safely without exposing sensitive data.
12. **Migrations & Tests** — Created and applied Prisma migration, updated and passed all API typecheck, unit tests, web typecheck, and web build checks.

---

## Next Implementation Task

Phase 1B — Lowest-Available Store Number Allocator concurrency-safe implementation.
