-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('admin', 'manager', 'cashier');

-- AlterTable
ALTER TABLE "staff_users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "staff_users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
ALTER TABLE "staff_users" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Convert role TEXT -> StaffRole (init migration created it as TEXT)
ALTER TABLE "staff_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "staff_users"
  ALTER COLUMN "role" TYPE "StaffRole"
  USING (
    CASE
      WHEN "role" IN ('admin', 'manager', 'cashier') THEN "role"::"StaffRole"
      ELSE 'cashier'::"StaffRole"
    END
  );
ALTER TABLE "staff_users" ALTER COLUMN "role" SET DEFAULT 'cashier'::"StaffRole";
