# Aursuq Core Workflows

## Seller Onboarding

Seller creates/applies for account
→ enters required details
→ submits identity/business information
→ platform reviews verification
→ seller becomes VERIFIED or is REJECTED
→ verified seller can operate store according to platform permissions.

Possible conceptual states:

PENDING
VERIFIED
REJECTED
SUSPENDED

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