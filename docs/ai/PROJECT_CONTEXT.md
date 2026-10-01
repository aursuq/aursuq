# Aursuq Project Context

## Product

Aursuq is a marketplace platform initially intended for Israel.

The initial go-to-market audience is expected to include Arab communities in Israel, but the software architecture must not hard-code a specific ethnicity, language group, city, or community.

Domain:

aursuq.com

Aursuq is not only a website that connects buyers and sellers.

Aursuq also operates the logistics layer:

Seller → sends inventory to Aursuq → Aursuq receives and stores inventory → customer purchases → Aursuq picks, packs and ships the order.

The platform should be built as a real marketplace system while starting with a manageable MVP.

---

## Core Business Model

Independent sellers can open stores on Aursuq and sell products.

Sellers do not fulfill customer orders themselves.

Aursuq operates:

- Receiving
- Warehousing
- Inventory handling
- Picking
- Packing
- Shipping
- Fulfillment operations

Aursuq may earn revenue from:

- Marketplace services/commissions where applicable
- Delivery fees
- Paid promotional placements
- Future first-party/Aursuq-owned products
- Future reseller/affiliate commission system

Exact marketplace commissions outside confirmed features are not yet fixed.

---

## User Types

### Customer

Can:

- Create an account
- Browse products
- Search products
- Search stores
- View seller storefronts
- View independent product listings
- Add products to cart
- Checkout
- Pay
- View orders
- Track delivery
- Submit reviews where supported
- Contact support

### Seller

Can:

- Apply to become a seller
- Complete verification
- Create/manage store
- Customize storefront
- Create products/listings
- Create variants
- Set prices
- Set discounts
- Declare inventory being sent to Aursuq
- Receive carton barcodes
- Monitor warehouse inventory
- Configure low-stock thresholds
- View orders/sales
- View financial ledger
- View available/frozen balances
- Request payouts
- Receive notifications

### Support

A dedicated support role exists.

Support users handle:

- Customer complaints
- Seller complaints
- Order-related support
- Returns/support cases
- Escalations according to granted permissions

Support is not equivalent to Admin.

### Admin

Can manage platform operations according to assigned permissions.

Examples:

- Seller management
- Seller verification
- Catalog moderation
- Warehouse oversight
- Operational management
- Complaint escalation
- Platform administration

Admins may be able to create/add sellers.

### Owner

Owner is above Admin.

Owner has the highest platform-level privileges.

High-risk or business-critical actions may require Owner-only permissions.

### Warehouse Operator

Warehouse workers need operational access for:

- Shipment receiving
- Carton scanning
- Quantity verification
- Discrepancy recording
- Photo evidence
- Stock acceptance
- Warehouse locations
- Picking
- Packing

Permissions must be scoped to warehouse operations.

---

## Seller Storefront

Every seller has an Aursuq storefront.

Example URL structure:

aursuq.com/store/{slug}

or:

aursuq.com/s/{slug}

Final routing convention may be selected during implementation.

The storefront should eventually support:

- Store name
- Logo
- Theme
- Background/hero image
- Optional hero video
- Seller-controlled hero video enable/disable
- Product sections
- Custom informational pages
- About page
- Promotional pages
- Promotional video/content

A seller should be able to share the store URL on social media such as Instagram or TikTok.

Advanced Store Builder capabilities can be implemented incrementally.

---

## Product Listing Model

Seller listings are independent.

There is NO Amazon-style merged product page with multiple seller offers in the current Aursuq model.

Example:

If five sellers sell the same iPhone, search may show five separate listings.

Each seller controls their own listing.

A listing may include:

- Title
- Description
- Images
- Seller
- Store
- Category
- Price
- Discounted price
- Original/strike-through price
- Stock availability
- Variants
- Barcode information
- Product attributes
- Status

Each variant may have its own:

- SKU
- Barcode
- Size
- Color
- Weight
- Inventory

A seller can change the selling price when permitted by the listing type.

A seller can create discounts.

---

## Search

Customers should be able to search:

- Products
- Stores/store names

Search results keep seller listings independent.

Search/ranking should eventually consider signals such as:

- Textual relevance
- Orders
- Conversion
- Ratings/review quality
- Return/refund rate
- Stock reliability
- Fulfillment reliability
- Operational quality

Because fulfillment is handled by Aursuq, seller shipping speed must NOT be used as a seller ranking signal.

---

## Paid Promotion

Aursuq may provide paid promotional placements.

This can help new or launching sellers gain visibility.

Paid placements must be clearly identified as sponsored/promoted placements.

Paid ranking must remain distinguishable from organic ranking.

---

## Fulfillment

Aursuq handles fulfillment.

Seller shipping speed is therefore not part of marketplace ranking.

Customer order fulfillment includes:

Payment → inventory reservation → picking → packing → shipping → delivery.

Inventory is reserved only AFTER successful payment.

Adding an item to a cart or beginning checkout does NOT reserve stock.

---

## Multi-Seller Orders

A customer can buy products from multiple sellers in one checkout/order experience.

The customer sees one customer order.

Internally, Aursuq can split the order into seller-specific shares/suborders for:

- Inventory
- Accounting
- Settlement
- Reporting

The customer-facing experience should remain unified where possible.

---

## Warehouse Receiving

Before sending inventory to Aursuq, the seller creates an inbound declaration.

For each shipment/product/variant the seller may declare:

- Product/variant
- Product barcode
- Weight
- Planned quantity
- Outer carton count
- Units per carton
- Carton dimensions:
  - Length
  - Width
  - Height

The system validates platform-defined restrictions such as maximum weight/dimensions when applicable.

Aursuq generates ONE receiving barcode per outer carton.

Expected carton and unit counts must be recorded.

Receiving barcodes should be available for download and/or delivery to the seller by notification/email.

---

## Warehouse Arrival

When inventory arrives:

Warehouse staff compare actual shipment contents against the seller declaration.

Possible discrepancies include:

- Missing cartons
- Extra cartons
- Missing units
- Extra units
- Wrong product
- Damaged goods
- Incorrect declaration

Warehouse workers can record:

- Expected quantity
- Actual quantity
- Discrepancy type
- Notes
- Photos

Only accepted units become available warehouse inventory.

Aursuq responsibility for warehouse custody begins after inventory is formally received/accepted according to platform policy.

Loss or damage occurring after accepted warehouse receipt is an Aursuq operational responsibility according to final legal/policy terms.

---

## Inventory

Inventory exists per seller listing/variant.

Inventory must not be merged between sellers.

Inventory states may include:

- AVAILABLE
- RESERVED
- DAMAGED
- QUARANTINED

Physical stock changes should be auditable.

A seller can configure a low-stock threshold per product/variant.

Example:

If threshold = 15 and inventory reaches 15, notify the seller.

Notification channels may eventually include:

- Email
- In-app
- Phone/push where supported

---

## Seller Verification

Seller onboarding requires business/private information appropriate to seller type.

Expected information includes:

- Tax/business registration number where applicable
- Seller/private or business details
- Identity document/photo

Exact Israeli legal/KYC requirements must be implemented only after confirming applicable law and provider requirements.

The user has expressed interest in exploring whether lawful criminal-record screening can be used in Israel.

DO NOT assume criminal-record screening is legally available or appropriate.

This remains a legal/compliance question until verified.

---

## Payments

A customer pays Aursuq through the chosen payment flow.

Inventory is reserved only after confirmed successful payment.

Seller proceeds may remain frozen until order delivery/settlement conditions are met.

The system should support a seller financial ledger rather than relying only on a mutable balance field.

Exact production payment provider is not decided yet.

---

## Delivery Fee

A delivery fee may be added to the customer order.

An example discussed is approximately 20 NIS, but this is NOT a permanently fixed platform price.

Delivery pricing must be configurable.

Aursuq may earn revenue from the delivery service.

---

## Seller Funds

Relevant conceptual states:

- FROZEN
- AVAILABLE
- RESERVED
- PAID_OUT

Seller money should not become withdrawable immediately after checkout.

Release is tied to platform settlement/delivery rules.

---

## Returns

Returns must be supported by the system architecture.

Exact return windows, fees, responsibility rules, refund timing, damaged-item rules, and warehouse workflows are not fully finalized.

Do not invent return policy.

---

## Official Aursuq Store

Aursuq will eventually have an official first-party store.

Products in the official store are owned by Aursuq.

Aursuq controls:

- Product
- Inventory
- Price
- Warehousing
- Fulfillment
- Shipping

---

## Aursuq Reseller / Affiliate Feature

Future feature:

A seller may optionally add selected Aursuq-owned products to their own storefront.

The seller does NOT:

- Buy inventory
- Own inventory
- Send inventory
- Fulfill the product
- Set the product price

The displayed price must be the exact price defined by Aursuq.

Inventory ownership remains with Aursuq.

Warehousing and fulfillment remain with Aursuq.

If an Aursuq-owned product is purchased through a seller's storefront, the seller receives a commission.

A 10% commission has been discussed as an example.

The commission percentage must be configurable and must not be hard-coded to 10%.

---

## Initial Platform Strategy

Start small.

Prioritize a working MVP over premature infrastructure complexity.

Build the core marketplace and fulfillment cycle first.

The architecture should allow future expansion without building enterprise-scale infrastructure before it is needed.