# Aursuq Status Enums

## 1. Seller Verification Status
Verification describes whether Aursuq has verified the seller/business identity and information.

### States:
- **UNVERIFIED** - Seller/application exists but has not entered/completed review. Initial state for self-registered sellers.
- **PENDING_REVIEW** - Seller application was submitted and is waiting for an ADMIN or OWNER reviewer.
- **IN_VERIFICATION** - A reviewer (ADMIN or OWNER) has claimed/started the verification. Only one ADMIN should actively own the review at a time. OWNER may override or reassign.
- **REJECTED** - Application/verification was rejected or requires correction. Rejection notes and field-level details are stored.
- **VERIFIED** - Seller successfully passed verification.

### Common Transitions:
```
UNVERIFIED → PENDING_REVIEW
PENDING_REVIEW → IN_VERIFICATION
IN_VERIFICATION → VERIFIED
IN_VERIFICATION → REJECTED
REJECTED → PENDING_REVIEW (after correction/resubmission)
```

### Special Creation Path:
- **OWNER manual seller creation** -> VERIFIED directly
- **ADMIN cannot manually create sellers**

---

## 2. Verification Field Status
Each reviewable seller field (e.g., business license, tax ID, identity document) carries its own field-level verification status:

- **PENDING** - Field not yet reviewed
- **VERIFIED** - Field approved
- **REJECTED** - Field rejected; must support correction/rejection notes for the seller to address

Rejected fields must support correction/resubmission with notes.

---

## 3. Seller Moderation Status
Moderation describes whether an existing, verified seller is currently allowed to operate on the platform.

### States:
- **ACTIVE** - Seller is not under moderation restriction; normal operations allowed.
- **FROZEN** - Temporarily frozen for review/investigation. Store Number stays reserved. Requires reason, actor, and timestamp.
- **BLOCKED** - Blocked by OWNER. Store Number stays reserved. ADMIN may only request unblock; OWNER approves/rejects unblock request.
- **PERMANENTLY_BLOCKED** - Irreversible OWNER decision. Store Number stays reserved. No transition back to ACTIVE is allowed (even by OWNER). History retained.

### Common Transitions:
```
ACTIVE → FROZEN
FROZEN → ACTIVE

ACTIVE → BLOCKED
FROZEN → BLOCKED

BLOCKED → ACTIVE (ONLY after OWNER approves unblock)

ACTIVE → PERMANENTLY_BLOCKED
FROZEN → PERMANENTLY_BLOCKED
BLOCKED → PERMANENTLY_BLOCKED
(OWNER only)

PERMANENTLY_BLOCKED → (no outgoing transitions)
```

---

## 4. Archive State
Archive/delete is NOT a moderation status. It is a separate archival concept.

### Implementation Direction:
- Use a separate isArchived boolean flag and archivedAt timestamp (or equivalent).

### Archived Means:
- Seller/store removed from current active platform views (storefront, search, admin lists by default)
- Records/history fully retained for audit, legal, and analytics
- Current Store Number released for reuse by new sellers
- Historical Store Number preserved in history/archive record
- Identity uniqueness (email, national ID, business registration) remains reserved for life

### Key Principle:
- Do NOT represent archive by destroying or hard-deleting records.
- Archived sellers can be viewed in dedicated archival/admin views.

---

## 5. Store Number Status Rule
Store Number is retained/reserved while seller is in any of these moderation states:
- ACTIVE
- FROZEN
- BLOCKED
- PERMANENTLY_BLOCKED

Store Number is released ONLY when seller/store is ARCHIVED.

Historical Store Number remains in audit/history even after release.

---

## 6. Seller Access Eligibility
Normal seller access (ability to log in, manage store, sell) requires ALL of the following:

1. verificationStatus = VERIFIED
2. moderationStatus = ACTIVE
3. Seller is not archived (isArchived = false)

If store activation is a separate concept, the store must also be active.

FROZEN, BLOCKED, and PERMANENTLY_BLOCKED are not normal active-selling states.

---

## 7. Owner Dashboard Count Definitions
Count semantics for Owner Dashboard KPIs:

### TOTAL SELLERS includes:
- VERIFIED eligible sellers (ACTIVE moderation, not archived)
- Applications in active application/review lifecycle (PENDING_REVIEW, IN_VERIFICATION)
- FROZEN sellers

### TOTAL SELLERS excludes:
- Archived sellers
- BLOCKED sellers
- PERMANENTLY_BLOCKED sellers
- Fully closed REJECTED applications without active resubmission (i.e., REJECTED with no pending correction)

### ACTIVE SELLERS includes ONLY:
- VERIFIED
- moderationStatus = ACTIVE
- Not archived
- Not BLOCKED / PERMANENTLY_BLOCKED
- Store active (if store activation is required for selling eligibility)

---

## 8. Superseded Status Rules
The following previous/simplified assumptions are superseded by this document:

- verificationStatus with only PENDING / APPROVED / REJECTED is no longer sufficient
- UserStatus alone must not represent seller verification/moderation lifecycle
- Hard delete is not a lifecycle state; use Archive instead
- OWNER-created seller does not start in PENDING - goes directly to VERIFIED
- ADMIN cannot create sellers
- ARCHIVED is not a moderation status
- PERMANENTLY_BLOCKED has no outgoing transition (not even OWNER can revert)

---

## 9. Other Status Enums (Unchanged)

### Order
PENDING_PAYMENT -> PAID -> STOCK_RESERVED -> PREPARING -> PICKED -> PACKED -> SHIPPED -> DELIVERED

### Inbound Shipment
DRAFT -> CREATED -> AWAITING_ARRIVAL -> RECEIVED -> INSPECTING -> ACCEPTED | PARTIALLY_ACCEPTED -> STOCKED

### Inventory
AVAILABLE | RESERVED | DAMAGED | QUARANTINED

### Payment
PENDING | SUCCEEDED | FAILED | REFUNDED

### Seller Funds
FROZEN | AVAILABLE | RESERVED | PAID_OUT

### Payout
REQUESTED | APPROVED | PROCESSING | PAID | REJECTED

### Listing
DRAFT | ACTIVE | HIDDEN | SUSPENDED | OUT_OF_STOCK
