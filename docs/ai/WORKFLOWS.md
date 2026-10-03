# Aursuq Core Workflows

## Seller Application & Onboarding Workflows

### 1. Public Application Path (PATH A)
Applicant applies for seller account
→ fills required personal/business/identity details
→ submits application → UNVERIFIED
→ submits for review → PENDING_REVIEW
→ ADMIN/OWNER reviewer starts verification → IN_VERIFICATION (reviewer locked)
→ field-by-field verification (each field PENDING → VERIFIED or REJECTED)
→ if all fields VERIFIED → application becomes VERIFIED
→ if any field REJECTED → application REJECTED with field notes + reviewer message
→ seller may correct and resubmit → retains full history → returns to PENDING_REVIEW
→ VERIFIED seller + ACTIVE moderation → seller access enabled

### 2. OWNER Manual Creation Path (PATH B)
OWNER creates seller internally (ADMIN cannot)
→ seller immediately becomes VERIFIED
→ audit event records OWNER manual creation with actor/role/timestamp
→ public review queue is skipped
→ normal seller access enabled according to moderation/store rules

### 3. Verification Workflow
ADMIN/OWNER opens verification queue (filters: UNVERIFIED, PENDING_REVIEW, IN_VERIFICATION, REJECTED, VERIFIED).
Reviewer starts verification:
- Application moves to IN_VERIFICATION
- Reviewer assigned (user ID + role)
- Verification start timestamp recorded
- Other ADMINs prevented from simultaneous processing
- OWNER may override/reassign

Field-by-field review:
- Each reviewable field: PENDING → VERIFIED or REJECTED
- Rejected fields store correction/rejection note
- Fields include: legal name, government identity number, identity document, business/legal details, tax/business registration number, phone, business address, other required fields

Final decision:
- All fields VERIFIED → VERIFIED
- Any field REJECTED → REJECTED with complete field notes + reviewer message

### 4. Rejection / Correction / Resubmission Workflow
ADMIN/OWNER rejects application: records actor, role, timestamp, reason, rejected fields, optional reviewer message. Application moves to REJECTED. Seller sees what is missing and what to correct.
Seller corrects and resubmits: previous verification/rejection history preserved (NOT erased). Application returns to PENDING_REVIEW.

### 5. Freeze Workflow (Temporary Review)
OWNER/ADMIN freezes seller: requires reason, records actor/role/timestamp/reason. Seller moderation status → FROZEN. Store Number retained. Full history preserved. Freeze visible internally. Resolution returns seller to ACTIVE.

### 6. Block Workflow (OWNER-Controlled)
OWNER blocks seller: seller moderation status → BLOCKED. Store Number retained. Complete history retained. ADMIN cannot directly unblock OWNER-blocked seller. ADMIN may submit UNBLOCK REQUEST to OWNER (records requesting ADMIN, reason, timestamp, seller, current block info). OWNER approves or rejects. Decision + reason enters history.

### 7. Permanent Block Workflow (OWNER Only, Irreversible)
OWNER applies PERMANENTLY_BLOCKED: irreversible — no code path transitions back to ACTIVE. ADMIN cannot unblock. OWNER cannot unblock. Store Number remains reserved. Seller history fully accessible. Stronger than normal BLOCKED.

### 8. Archive / Delete Workflow (No Hard Delete)
OWNER chooses "Delete Seller" → system ARCHIVES instead of destroying. Archive flow stores: archive timestamp, OWNER who archived, optional reason, optional evidence references, seller/store snapshot, history event. Reason and evidence are optional. Archived sellers remain internally viewable in "Deleted / Archived Stores". Historical Store Number preserved even if later reassigned. Store number released only when archived; historical store number remains in history.

### 9. Transactional Verification-Result Email Direction
VERIFIED outcome → approval email sent to seller.
REJECTED/corrections outcome → rejection email with: rejected fields list, correction notes per field, reviewer message. Email is transactional (tied to the verification decision event).

---

## Product Creation

Verified seller
→ creates listing
→ uploads images
→ defines category/details
→ creates variants
→ assigns variant barcode where applicable
→ defines price
→ defines optional discount
→ listing begins as DRAFT
→ listing becomes ACTIVE when platform requirements are satisfied.

Listings belonging to different sellers remain independent.

---

## Inbound Inventory

Seller selects product variants
→ enters planned quantity
→ enters weight
→ enters carton dimensions
→ enters carton count
→ enters units per carton
→ confirms shipment declaration
→ Aursuq creates inbound shipment
→ one receiving barcode generated per outer carton
→ seller downloads/receives barcodes
→ seller sends cartons to Aursuq.

Suggested lifecycle:

DRAFT
→ CREATED
→ AWAITING_ARRIVAL
→ RECEIVED
→ INSPECTING
→ ACCEPTED / PARTIALLY_ACCEPTED
→ STOCKED

Exact transitions should be enforced by domain logic.

---

## Warehouse Receiving

Warehouse worker scans receiving barcode
→ system identifies expected carton
→ worker verifies carton
→ system shows expected content
→ worker records actual content
→ discrepancies can be recorded
→ evidence/photos can be attached
→ accepted quantities are confirmed
→ accepted stock enters warehouse inventory.

Rejected/damaged/discrepant units must not silently become AVAILABLE.

---

## Customer Purchase

Customer searches/browses
→ opens independent seller listing
→ selects variant
→ adds to cart.

Adding to cart does not reserve inventory.

Customer proceeds to checkout
→ payment attempt created
→ payment succeeds
→ backend performs concurrency-safe inventory reservation
→ order becomes paid/reserved.

If stock reservation cannot be completed after payment, the system must enter a controlled recovery/refund flow rather than silently overselling.

---

## Order Lifecycle

Working lifecycle:

PENDING_PAYMENT
→ PAID
→ STOCK_RESERVED
→ PREPARING
→ PICKED
→ PACKED
→ SHIPPED
→ DELIVERED

Cancellation/refund/return paths should be modeled separately as requirements become finalized.

---

## Multi-Seller Checkout

Customer may have items from multiple sellers.

Checkout creates one customer-facing order.

Internally:

Order
→ Seller Share A
→ Seller Share B
→ Seller Share C

Each seller share tracks seller-specific:

- Items
- Revenue
- Fees
- Settlement
- Refund impact

Warehouse fulfillment may still combine shipments when operationally appropriate.

---

## Seller Settlement

Customer payment succeeds
→ relevant seller proceeds recorded
→ funds remain FROZEN
→ order is fulfilled
→ delivery is confirmed
→ settlement conditions are checked
→ eligible funds become AVAILABLE
→ seller can request payout
→ payout processed
→ funds become PAID_OUT.

Financial events must remain auditable.

---

## Low Stock

Seller configures threshold per product/variant.

Inventory decreases.

When available stock crosses/reaches threshold according to notification rules:

→ low-stock event
→ seller notification.

Avoid repeatedly spamming the seller for every subsequent unit unless notification policy requires it.

---

## Paid Promotion

Seller creates promotion/ad campaign
→ campaign is validated
→ budget/status rules applied
→ eligible listing receives paid placement
→ UI labels placement clearly as sponsored/promoted.

Paid promotion must not masquerade as organic ranking.

---

## Official Aursuq Product Reselling

Aursuq owns product
→ Aursuq defines price
→ Aursuq owns warehouse inventory.

Seller chooses to add eligible Aursuq product to storefront
→ seller storefront references the Aursuq-owned product
→ seller cannot change official price
→ customer purchases through seller storefront
→ Aursuq inventory is reserved
→ Aursuq fulfills order
→ seller receives configured commission.

Do not duplicate physical inventory ownership to the seller.

---

## Returns

Architecture must permit:

Customer return request
→ eligibility evaluation
→ return shipment/warehouse receiving
→ inspection
→ refund decision
→ inventory disposition
→ seller ledger adjustment where applicable.

Exact business rules remain OPEN and must not be invented.