-- Add new fields to purchase_orders table
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "updated_by" BIGINT;
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "received_at" TIMESTAMP(3);
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "received_by" BIGINT;
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "cancelled_by" BIGINT;
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT;

-- Add new fields to purchase_order_lines table
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "price_source" VARCHAR(30) NOT NULL DEFAULT 'SUPPLIER_PRICE';
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "override_reason" TEXT;
ALTER TABLE "purchase_order_lines" ADD COLUMN IF NOT EXISTS "overridden_by" BIGINT;

-- Add new field to stock_movements table for purchase relation
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "purchase_id" BIGINT;

-- Add foreign key constraint for stock_movements -> purchase_orders
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_purchase_id_fkey" 
  FOREIGN KEY ("purchase_id") REFERENCES "purchase_orders"("purchase_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index on purchase_id if it doesn't exist
CREATE INDEX IF NOT EXISTS "stock_movements_purchase_id_idx" ON "stock_movements"("purchase_id");
