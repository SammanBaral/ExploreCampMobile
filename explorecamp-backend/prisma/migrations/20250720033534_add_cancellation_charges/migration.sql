-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancellationCharge" DOUBLE PRECISION,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'pending';
