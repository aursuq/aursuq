-- CreateEnum
CREATE TYPE "StoreNumberReservationStatus" AS ENUM ('RESERVED', 'RELEASED');

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "storeNumber" DROP DEFAULT;
DROP SEQUENCE "stores_storeNumber_seq";

-- CreateTable
CREATE TABLE "store_number_reservations" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "StoreNumberReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "storeId" TEXT,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_number_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_number_reservations_number_key" ON "store_number_reservations"("number");
