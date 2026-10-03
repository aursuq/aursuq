-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "archivedStoreNumber" INTEGER,
ALTER COLUMN "storeNumber" DROP NOT NULL;
