-- AlterTable
ALTER TABLE "orders" ADD COLUMN "offer_code" TEXT,
ADD COLUMN "offer_label" TEXT,
ADD COLUMN "discount_amount" INTEGER NOT NULL DEFAULT 0;
