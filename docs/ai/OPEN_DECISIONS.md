# Aursuq Open Decisions

These items are intentionally unresolved.

AI agents must not invent final answers.

Do not block unrelated development because of these items.

Ask the owner only when a current implementation task requires one of these decisions.

---

## Payments

OPEN:

Production payment gateway/provider for Israel.

Requirements should eventually include:

- Card payments
- Refunds
- Webhooks
- Marketplace-compatible settlement flow
- Israeli business/legal requirements

---

## Shipping

OPEN:

Final shipping carrier(s) and API integrations.

The architecture should isolate shipping behind an internal abstraction so carriers can be changed.

---

## Email / Notifications

OPEN:

Production email provider.

Possible requirements include:

- Account verification
- Seller notifications
- Receiving barcodes
- Low-stock alerts
- Order updates
- Support communication

Provider must remain replaceable.

---

## Returns Policy

OPEN:

- Return window
- Customer fees
- Seller responsibility
- Aursuq responsibility
- Damaged item handling
- Refund timing
- Restocking rules

Do not hard-code policy until decided.

---

## Seller Fees

OPEN:

General marketplace seller commission/fees.

Do not assume a percentage.

The reseller feature's discussed 10% is only an example for that specific future concept.

---

## Delivery Pricing

OPEN:

Exact production delivery pricing.

Approximately 20 NIS has been discussed as an example only.

Keep configurable.

---

## Seller Verification / Israeli Compliance

OPEN:

Exact legal KYC/document verification requirements.

OPEN:

Whether criminal-record screening is legally available/permitted/appropriate.

Do not implement criminal-record screening without legal confirmation.

---

## Taxes / Invoicing

OPEN:

Exact invoicing, VAT, tax documentation and marketplace accounting flow required for operation in Israel.

Financial architecture must remain auditable and adaptable.

---

## Production Deployment

OPEN:

Final production hosting/deployment provider.

Do not introduce Kubernetes or complex infrastructure solely because this is unresolved.

---

## Search Infrastructure

For MVP, begin with the simplest solution sufficient for current scale.

Do not introduce Elasticsearch/Meilisearch/Typesense unless actual requirements justify it.

A future dedicated search engine remains possible.

---

## Final Store URL

Candidate forms:

aursuq.com/store/{slug}

aursuq.com/s/{slug}

Final route is not yet confirmed.

---

## Support / Dispute Policy

OPEN:

Detailed operational policies for:

- Complaints
- Disputes
- Escalations
- Refund approvals
- Seller appeals

Build permissions/workflows so policy can evolve.