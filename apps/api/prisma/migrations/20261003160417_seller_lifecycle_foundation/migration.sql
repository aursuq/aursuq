/*
  Warnings:

  - The values [PENDING,APPROVED] on the enum `SellerVerificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[governmentIdentityNumber]` on the table `seller_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SellerModerationStatus" AS ENUM ('ACTIVE', 'FROZEN', 'BLOCKED', 'PERMANENTLY_BLOCKED');

-- CreateEnum
CREATE TYPE "SellerVerificationFieldStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "SellerVerificationStatus_new" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'IN_VERIFICATION', 'REJECTED', 'VERIFIED');
ALTER TABLE "seller_profiles" ALTER COLUMN "verificationStatus" DROP DEFAULT;
ALTER TABLE "seller_profiles" ALTER COLUMN "verificationStatus" TYPE "SellerVerificationStatus_new" USING ("verificationStatus"::text::"SellerVerificationStatus_new");
ALTER TYPE "SellerVerificationStatus" RENAME TO "SellerVerificationStatus_old";
ALTER TYPE "SellerVerificationStatus_new" RENAME TO "SellerVerificationStatus";
DROP TYPE "SellerVerificationStatus_old";
ALTER TABLE "seller_profiles" ALTER COLUMN "verificationStatus" SET DEFAULT 'UNVERIFIED';
COMMIT;

-- AlterTable
ALTER TABLE "seller_profiles" ADD COLUMN     "archiveReason" TEXT,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedByUserId" TEXT,
ADD COLUMN     "governmentIdentityNumber" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderationStatus" "SellerModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "verificationReviewerId" TEXT,
ADD COLUMN     "verificationStartedAt" TIMESTAMP(3),
ALTER COLUMN "verificationStatus" SET DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "seller_verification_fields" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "status" "SellerVerificationFieldStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_verification_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_audit" (
    "id" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorRole" TEXT,
    "previousState" JSONB,
    "newState" JSONB,
    "reason" TEXT,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_verification_fields_sellerProfileId_fieldKey_key" ON "seller_verification_fields"("sellerProfileId", "fieldKey");

-- CreateIndex
CREATE INDEX "seller_audit_sellerProfileId_createdAt_idx" ON "seller_audit"("sellerProfileId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "government_identity_unique" ON "seller_profiles"("governmentIdentityNumber");

-- AddForeignKey
ALTER TABLE "seller_verification_fields" ADD CONSTRAINT "seller_verification_fields_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "seller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_audit" ADD CONSTRAINT "seller_audit_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "seller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
