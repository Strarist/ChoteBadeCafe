-- CreateEnum
CREATE TYPE "MemoryPinStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "memory_pins" (
    "id" TEXT NOT NULL,
    "names" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "status" "MemoryPinStatus" NOT NULL DEFAULT 'pending',
    "staff_pick" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moderated_at" TIMESTAMP(3),
    "moderated_by_id" TEXT,
    "reject_reason" TEXT,

    CONSTRAINT "memory_pins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memory_pins_status_created_at_idx" ON "memory_pins"("status", "created_at");

-- CreateIndex
CREATE INDEX "memory_pins_staff_pick_idx" ON "memory_pins"("staff_pick");

-- AddForeignKey
ALTER TABLE "memory_pins" ADD CONSTRAINT "memory_pins_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
