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

---

## D-029 — Seller Verification vs Moderation: Separate Concerns

Seller verification status and seller moderation/account status are DIFFERENT concepts.

**Verification** describes whether Aursuq has verified the seller/business information.

**Moderation** describes whether an existing seller is currently allowed to operate.

### Verification Lifecycle
- UNVERIFIED — seller/application exists but verification has not yet been submitted/completed
- PENDING_REVIEW — seller application was submitted and is waiting for an ADMIN/OWNER reviewer
- IN_VERIFICATION — an ADMIN/OWNER has already started handling this verification and has not completed it; Arabic UI: "إكمال التوثيق"; prevents duplicate reviewer assignment
- REJECTED — verification/application was rejected or requires corrections
- VERIFIED — seller successfully passed verification

### Seller Moderation/Account Lifecycle
- ACTIVE
- FROZEN
- BLOCKED
- PERMANENTLY_BLOCKED

Archived/deleted state is represented separately through archival metadata and history, not by erasing records.

---

## D-030 — Verification Filters for OWNER/ADMIN

OWNER and ADMIN seller-management UI must support filtering applications by verification status:
- UNVERIFIED
- PENDING_REVIEW
- IN_VERIFICATION / "إكمال التوثيق"
- REJECTED
- VERIFIED

---

## D-031 — Verification Claim / Reviewer Lock

When an ADMIN starts verification:
- Application moves to IN_VERIFICATION
- Store which ADMIN started it
- Store verification start timestamp
- Prevent another ADMIN from simultaneously processing the same verification

OWNER may view, override, or reassign verification when necessary.

Actions include:
- Start Verification
- Continue Verification
- Reject Application
- Complete Verification

All reviewer assignment/reassignment actions must be auditable.

---

## D-032 — Field-by-Field Verification

Verification is NOT only one final approve button.

Each important identity/business field must be individually reviewed:
- Legal/person name
- Government identity number
- Identity document
- Business/legal details
- Tax/business registration number
- Phone where applicable
- Business address
- Other required onboarding fields added later

Each reviewable field needs a state: PENDING, VERIFIED, REJECTED

ADMIN/OWNER must be able to choose Verify or Reject for each field.

If a field is rejected, store a correction/rejection note explaining what is incorrect or what the seller must fix.

Final verification is based on these reviewed fields.

---

## D-033 — Application Rejection / Correction

ADMIN/OWNER may reject an application.

A rejection must record:
- Actor
- Actor role
- Timestamp
- Reason
- Rejected/affected fields
- Optional additional reviewer message

The seller must later be able to know exactly:
- What information is missing
- Which fields were rejected
- What must be corrected

A rejected application may later be corrected and resubmitted.

Do NOT erase previous verification/rejection history when resubmitted.

---

## D-034 — Email After Verification Result

After a verification decision, the seller/applicant must eventually receive a transactional email.

If VERIFIED:
- Tell seller the seller account was approved
- Seller access may then become available according to seller authentication/access rules

If corrections/rejection are required:
- Explain which fields need correction
- Include stored field rejection notes
- Include reviewer message

This is an APPLICATION transactional-email workflow, separate from the existing Cline/developer task notification email system.

---

## D-035 — Manually Created Sellers: OWNER ONLY

ONLY OWNER may manually create a seller from the internal Aursuq management interface.

ADMIN is NOT allowed to create seller accounts.

If OWNER manually creates a seller:
- Seller becomes VERIFIED immediately
- Normal public application review is skipped
- Audit history must record:
  - OWNER who created the seller
  - Actor role
  - Timestamp
  - That verification was granted through internal manual OWNER creation

This supersedes the previous rule where OWNER-created sellers started PENDING.

ADMIN-created sellers must NOT exist because ADMIN cannot create seller accounts.

---

## D-036 — ADMIN Role in Seller Onboarding

ADMIN does NOT create sellers.

ADMIN's seller-onboarding responsibilities are:
- View incoming seller applications
- Start verification
- Continue verification
- Verify/reject individual fields
- Complete verification
- Reject an application with reasons
- Review corrections/resubmissions
- Freeze seller for review when permitted
- Submit unblock request to OWNER where applicable

ADMIN must never bypass OWNER-only authority.

---

## D-037 — Seller Login / Access

An applicant must NOT receive normal seller access merely because an application record exists.

Normal seller access becomes available only after:
- verificationStatus = VERIFIED
- Seller moderation/account state allows access/selling

Exact restricted behavior for FROZEN/BLOCKED accounts may be implemented later.

A seller being VERIFIED does not automatically mean all moderation restrictions are cleared.

---

## D-038 — Freeze for Review

OWNER and ADMIN may freeze a seller account for review according to their permissions.

When freezing:
- Require a reason
- Persist reason
- Persist actor
- Persist actor role
- Persist timestamp
- Make freeze reason visible internally
- Preserve Store Number

The purpose is temporary investigation/review. Seller may later return to selling.

FROZEN does NOT release the Store Number.

Freeze and resolution actions must enter seller history.

---

## D-039 — Blocked Seller

OWNER can BLOCK a seller.

BLOCKED is separate from FROZEN.

A blocked seller:
- Keeps Store Number
- Keeps complete history
- Is not active
- Is not deleted

ADMIN cannot directly unblock an OWNER-blocked seller.

ADMIN may submit an UNBLOCK REQUEST to OWNER.

Unblock request must record:
- Requesting ADMIN
- Reason
- Timestamp
- Seller/account
- Current block information

OWNER may approve or reject the unblock request.

Decision and reason must enter history.

---

## D-040 — Permanent Block

OWNER can apply PERMANENTLY_BLOCKED.

PERMANENTLY_BLOCKED is irreversible.

Once permanently blocked:
- ADMIN cannot unblock
- OWNER cannot unblock
- No normal code path may transition seller back to ACTIVE
- Store Number remains reserved
- Seller history remains fully accessible

This is intentionally stronger than normal BLOCKED.

---

## D-041 — Warnings

OWNER must be able to issue seller warnings.

Warning should include:
- Reason
- Timestamp
- Actor
- Optional evidence references/files

A warning alone does not necessarily change account status.

Before blocking/permanently blocking a seller, OWNER must be able to inspect seller history.

History may show:
- Warnings
- Freezes
- Previous blocks
- Unblock decisions
- Reasons
- Verification events
- Other moderation events

Repeated misconduct may influence OWNER's decision to permanently block.

Do NOT automatically permanently block based only on number of warnings.

OWNER makes the final decision.

---

## D-042 — Complete Seller History / Audit Trail

Every important seller action must create a persistent audit/history event.

Where relevant, store:
- Event/action type
- Previous state
- New state
- Actor user ID
- Actor role
- Timestamp
- Reason
- Notes/message
- Evidence references
- Relevant metadata

Examples:
- Application created
- Application submitted
- Verification started
- Reviewer assigned
- Reviewer changed
- Field verified
- Field rejected
- Application rejected
- Corrections submitted
- Seller verified
- Seller manually created by OWNER
- Warning issued
- Account frozen
- Freeze resolved
- Account blocked
- Unblock requested
- Unblock approved
- Unblock rejected
- Permanent block applied
- Seller archived/deleted

History must survive all future state changes.

---

## D-043 — Delete / Archive: No Destructive Hard Delete

The previous hard-delete behavior is superseded.

When OWNER chooses "Delete Seller" / "Delete Request":
- The system must ARCHIVE the seller instead of destroying seller history.

Delete/archive UI must ask for:
- Optional reason
- Optional supporting evidence/files

Reason is NOT mandatory. Evidence is NOT mandatory.

Persist:
- Archive timestamp
- OWNER who archived
- Optional reason
- Optional evidence references
- Relevant seller/store snapshot
- History event

Archived sellers must remain internally searchable/viewable in: Deleted / Archived Stores.

Do not destroy seller identity/history.

---

## D-044 — Moderation / Delete Evidence Files

Actions such as warning, freeze, block, archive/delete may include evidence/supporting files.

Do NOT store large binary files directly in PostgreSQL.

Store:
- Secure object/file reference
- Filename/metadata
- Uploader
- Timestamp
- Relation to moderation/history event

Actual object storage implementation can be a later task.

---

## D-045 — Store Number: Lowest Available Number

Store Number is:
- Human-friendly
- Integer internally
- Displayed padded, e.g. 000001
- Separate from internal UUID

The current simple SERIAL-only behavior is NOT the final rule.

When assigning a new Store Number:
- Aursuq must allocate the LOWEST AVAILABLE positive number.

Example: currently reserved numbers 1, 2, 4, 5 → new store receives 3.

Do NOT implement race-condition-prone MAX + 1 logic.

Future implementation must use database-safe concurrency/locking/reservation logic.

---

## D-046 — When Store Number Is Released

Store Number remains reserved while seller is:
- ACTIVE
- FROZEN
- BLOCKED
- PERMANENTLY_BLOCKED

These states do NOT release the number.

Only when a seller/store is ARCHIVED/DELETED is the current Store Number released for future reuse.

Before releasing: store the historical Store Number in seller/archive/history records.

A future new seller may receive that number.

Therefore: an archived seller may historically show Store Number 000002, while a newer current seller may later also use current Store Number 000002.

Current lookup and historical lookup must distinguish them correctly.

---

## D-047 — One Seller Account Per Person for Life

One person may have only ONE seller identity/account relationship with Aursuq for life.

This rule remains true even if their seller later becomes:
- Archived/deleted
- Frozen
- Blocked
- Permanently blocked
- Rejected after seller identity registration according to finalized onboarding rules

Primary uniqueness key is the person's government identity number / identity identifier.

Before creating/approving a seller:
- Backend must verify that this identity number has never previously belonged to another seller identity in Aursuq.

Deleting/archiving must NOT make the identity number reusable.

Do not rely only on email uniqueness.

Identity uniqueness must be:
- Server-side
- Database-safe
- Protected from race conditions

Sensitive identity information must not be logged or exposed in normal list endpoints.

Document that secure handling/storage of identity numbers is required.

---

## D-048 — Seller Details Page

OWNER/ADMIN must eventually be able to open any seller/store and view detailed information according to permissions.

**PERSONAL / BUSINESS:**
- Legal/personal seller information
- Identity/verification details where authorized
- Business information
- Tax/business registration data
- Verification fields and results

**STORE:**
- Store Number
- Store Name
- Slug
- What store sells / categories/products when catalog exists
- Current store state

**FINANCE:**
- Available seller balance
- Frozen seller balance
- Future finance data

**WAREHOUSE:**
- Seller inventory stored by Aursuq
- Inventory/warehouse overview when implemented

**ACCOUNT:**
- Verification status
- Moderation/account status
- Warnings
- Audit/history
- Allowed moderation actions

Unimplemented domains must show empty/unknown: —

Never mock real business data.

---

## D-049 — OWNER Dashboard Seller Counts

Define counts clearly.

**TOTAL SELLERS** should count seller accounts relevant to the current platform, including:
- VERIFIED sellers that are not BLOCKED/PERMANENTLY_BLOCKED/ARCHIVED
- Seller applications currently in an active application/review lifecycle
- FROZEN sellers

Do NOT count:
- Archived/deleted sellers
- BLOCKED sellers
- PERMANENTLY_BLOCKED sellers
- Fully rejected/closed applications with no active resubmission

Avoid double-counting.

**ACTIVE SELLERS** should count only sellers that are:
- VERIFIED
- Moderation/account status ACTIVE
- Not archived
- Not blocked
- Not permanently blocked

If Store activation is required for actual selling eligibility, active seller count should also require store.isActive = true.

Document this explicitly.

---

## D-050 — OWNER Permissions

OWNER has highest authority.

OWNER may:
- Manually create seller accounts
- Manually created seller becomes VERIFIED immediately
- View all seller applications/accounts/history
- Start verification
- Continue verification
- Reassign verification
- Verify/reject individual fields
- Verify/reject applications
- Issue warnings
- Freeze sellers
- Block sellers
- Decide unblock requests
- Permanently block
- Archive/delete according to rules
- View archived/deleted stores
- View history/evidence

All actions must be auditable.

---

## D-051 — ADMIN Permissions

ADMIN may:
- View seller applications/accounts according to permissions
- View verification queues
- Start verification
- Continue verification
- Verify/reject individual fields
- Verify/reject applications
- Review corrected/resubmitted applications
- Freeze seller for review with reason where allowed
- Submit unblock request to OWNER

ADMIN must NOT:
- Create seller accounts
- Manually onboard a seller
- Grant verification through account creation
- Override OWNER block
- Directly unblock an OWNER-blocked seller
- Override permanent block
- Bypass OWNER-only permanent moderation decisions

All ADMIN actions must be auditable.

---

## D-052 — Archived / Deleted Sellers View

Seller management must eventually include: Archived / Deleted Stores

This should show:
- Seller/store identity
- Historical Store Number
- Archive date
- Archived by OWNER
- Optional archive reason
- Evidence references
- Previous states
- Complete history

Historical Store Number remains visible even if that number has been reassigned to a newer current store.

---

## D-053 — Superseded Existing Implementation Rules

Explicitly document that these existing/current behaviors are no longer final:

**A. Hard-delete:** Store + SellerProfile + User permanently deleted
→ **SUPERSEDED BY:** Archive + history retention.

**B. Store Number:** PostgreSQL SERIAL continually increasing without reuse
→ **SUPERSEDED BY:** Lowest-available-number allocation when archived Store Numbers are released.

**C. OWNER-created seller starts PENDING**
→ **SUPERSEDED BY:** OWNER-created seller becomes VERIFIED immediately.

**D. ADMIN manually creates seller**
→ **NOT ALLOWED.** ADMIN only processes seller applications and verification.

Do NOT remove code in this documentation task. Only document the new confirmed rules so future implementation tasks can safely migrate current code.

---

## D-054 — Public Seller Application vs OWNER Creation

Clearly distinguish the two onboarding paths.

**PATH A — Seller applies themselves:**
Applicant → seller application created → UNVERIFIED / submission preparation → PENDING_REVIEW → ADMIN/OWNER starts review → IN_VERIFICATION → individual fields reviewed → VERIFIED or REJECTED/correction required → if VERIFIED and moderation allows it, seller access becomes available

**PATH B — OWNER manually creates seller:**
OWNER creates seller internally → seller is VERIFIED immediately → audit event records OWNER manual creation → normal seller access may be enabled according to moderation/store rules

ADMIN does NOT have PATH B.

---

## D-055 — Implementation Phase Plan

Record a staged implementation plan. Do NOT implement these phases yet.

**Phase 1:** Lifecycle data model, verification statuses, moderation statuses, identity uniqueness foundation, audit/history model, archive foundation, store-number allocator design.

**Phase 2:** Application/review workflow, verification assignment/locking, field-by-field verification, verification status filters, rejection/correction workflow.

**Phase 3:** Warnings, freeze/unfreeze, block, unblock request, permanent block, archive/delete workflow.

**Phase 4:** Owner/Admin seller-management UI, filters, seller details, history, moderation actions, archived sellers view.

**Phase 5:** Evidence attachment storage, seller verification result emails.

**Phase 6:** Seller authentication/access, verified/moderation-based access control.

---

## D-056 — True Open Decisions Only

Do not invent unresolved questions if the OWNER already decided them.

Only place genuinely unresolved implementation/product choices into OPEN_DECISIONS.md.

Examples that may still require later technical decisions:
- Exact secure object storage provider for evidence/ID documents
- Exact encryption/tokenization approach for identity number storage
- Exact seller authentication method
- Exact production transactional email provider

Business rules described in this task are NOT open decisions.