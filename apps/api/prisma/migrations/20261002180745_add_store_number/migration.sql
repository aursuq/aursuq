/*
  Warnings:

  - A unique constraint covering the columns `[storeNumber]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "storeNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stores_storeNumber_key" ON "stores"("storeNumber");
