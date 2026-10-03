# Aursuq Open Decisions

These items are intentionally unresolved.

AI agents must not invent final answers.

Do not block unrelated development because of these items.

Ask the owner only when a current implementation task requires one of these decisions.

---

## Seller Lifecycle & Verification Technical Decisions

The core business rules and state machines for seller lifecycle, verification, moderation, archive, and store numbers are fully decided (see `docs/ai/DECISIONS.md`, `docs/ai/WORKFLOWS.md`, and `docs/STATUS_ENUMS.md`).

The following specific technical/product implementation choices remain open:

### 1. Evidence / Identity-Document Object Storage Provider
- **Confirmed requirement:** Evidence files (identity documents, verification attachments, moderation evidence) must be stored securely and must not be stored directly in PostgreSQL. Large evidence files require secure object storage.
- **What is still undecided:** The exact production object storage provider (e.g., AWS S3-compatible storage, Cloudflare R2, or another secure provider).
- **Decision needed before:** Implementation Phase 5 (Evidence attachment storage).

### 2. Government Identity Number Secure Storage & Indexing Design
- **Confirmed requirement:** One seller identity/account relationship per person for life. Government identity identifier is the core identity uniqueness key. Identity uniqueness survives archive, block, and permanent block.
- **What is still undecided:** The exact secure implementation mechanism for storage and lookup, such as:
  - Encryption at rest strategy
  - Keyed hash / tokenization for uniqueness lookup
  - Key management approach
- **Decision needed before:** Implementation Phase 1 / Phase 2 (Identity uniqueness foundation and data model).

### 3. Seller Authentication Method
- **Confirmed requirement:** Verified sellers with active moderation status require secure access to manage their stores and listings.
- **What is still undecided:** The exact seller login implementation method (distinct from OWNER Google authentication which is already implemented).
- **Decision needed before:** Implementation Phase 6 (Seller authentication/access).

### 4. Transactional Application Email Provider
- **Confirmed requirement:** The system must send transactional emails for seller approval, rejection/correction requests, and related application workflows.
- **What is still undecided:** The exact production email provider and technical delivery integration.
- **Decision needed before:** Implementation Phase 2 / Phase 5 (Application/review workflow and verification notifications).

### 5. Evidence Retention & Deletion Policy
- **Confirmed requirement:** Moderation and verification evidence, along with complete audit history, must be preserved during archive and lifecycle actions.
- **What is still undecided:** Exact retention duration requirements and automated cleanup/archival rules for evidence files if retention limits apply.
- **Decision needed before:** Production operations / Compliance review phase.

### 6. Exact Database Implementation of Lowest-Available Store Number Allocator
- **Confirmed requirement:** Archived sellers release their current Store Number. Store Number allocation must use the lowest available positive integer and must be concurrency-safe. Historical store numbers remain preserved in audit history.
- **What is still undecided:** The exact database concurrency mechanism (e.g., dedicated allocation table, row/advisory locks, or equivalent safe strategy).
- **Decision needed before:** Implementation Phase 1 (Lifecycle data model and store-number allocator design).
