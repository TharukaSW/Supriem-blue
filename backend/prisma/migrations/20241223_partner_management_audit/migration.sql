-- AlterTable: Add audit fields to suppliers table
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "created_by" BIGINT;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "updated_by" BIGINT;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "deactivated_at" TIMESTAMP(3);
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "deactivated_by" BIGINT;

-- AlterTable: Add audit fields to customers table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "created_by" BIGINT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "updated_by" BIGINT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deactivated_at" TIMESTAMP(3);
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deactivated_by" BIGINT;

-- AlterTable: Add end_date and audit fields to supplier_item_prices
ALTER TABLE "supplier_item_prices" ADD COLUMN IF NOT EXISTS "end_date" DATE;
ALTER TABLE "supplier_item_prices" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "supplier_item_prices" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "supplier_item_prices" ADD COLUMN IF NOT EXISTS "created_by" BIGINT;
ALTER TABLE "supplier_item_prices" ADD COLUMN IF NOT EXISTS "updated_by" BIGINT;

-- AlterTable: Add end_date and audit fields to customer_item_prices
ALTER TABLE "customer_item_prices" ADD COLUMN IF NOT EXISTS "end_date" DATE;
ALTER TABLE "customer_item_prices" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "customer_item_prices" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "customer_item_prices" ADD COLUMN IF NOT EXISTS "created_by" BIGINT;
ALTER TABLE "customer_item_prices" ADD COLUMN IF NOT EXISTS "updated_by" BIGINT;
