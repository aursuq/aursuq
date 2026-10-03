/*
  Security correction: replace plaintext governmentIdentityNumber with future-safe lookup hash field.
  No real identity data exists yet, so this migration is non-destructive.
  The unique index name is preserved for continuity.
*/
-- DropIndex
DROP INDEX "government_identity_unique";

-- AlterTable: rename column to avoid implying plaintext storage
ALTER TABLE "seller_profiles" RENAME COLUMN "governmentIdentityNumber" TO "governmentIdentityLookupHash";

-- CreateIndex: recreate unique index on renamed column with same index name
CREATE UNIQUE INDEX "government_identity_unique" ON "seller_profiles"("governmentIdentityLookupHash");
