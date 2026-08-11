-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "claim_locked_by" TEXT,
ADD COLUMN     "claim_locked_until" TIMESTAMP(3),
ADD COLUMN     "petpooja_push_error" TEXT,
ADD COLUMN     "petpooja_push_failed" BOOLEAN NOT NULL DEFAULT false;
