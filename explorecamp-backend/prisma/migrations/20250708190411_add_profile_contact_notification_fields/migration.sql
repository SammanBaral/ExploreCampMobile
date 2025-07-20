-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "notificationSettings" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "location" DROP NOT NULL;
