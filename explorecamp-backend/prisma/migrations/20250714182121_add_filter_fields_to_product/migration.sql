-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "freeCancellation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxGuests" INTEGER NOT NULL DEFAULT 4;
