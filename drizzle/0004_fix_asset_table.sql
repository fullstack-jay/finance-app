-- Fix the asset table structure to match the application schema
-- Drop columns that don't match the schema
ALTER TABLE "asset" DROP COLUMN IF EXISTS "category";
ALTER TABLE "asset" DROP COLUMN IF EXISTS "depreciation_method";
ALTER TABLE "asset" DROP COLUMN IF EXISTS "salvage_value";
ALTER TABLE "asset" DROP COLUMN IF EXISTS "useful_life";
ALTER TABLE "asset" DROP COLUMN IF EXISTS "location";
ALTER TABLE "asset" DROP COLUMN IF EXISTS "status";

-- Add missing columns that match the schema
ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "category_id" integer 
  REFERENCES "category"("id") ON DELETE SET NULL;
ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "purchase_date" date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "maintenance_schedule" text;
ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "insurance_info" text;

-- Fix column types to match the schema
ALTER TABLE "asset" ALTER COLUMN "name" TYPE varchar(100);
ALTER TABLE "asset" ALTER COLUMN "purchase_price" TYPE numeric(12,2);
ALTER TABLE "asset" ALTER COLUMN "current_value" TYPE numeric(12,2);
ALTER TABLE "asset" ALTER COLUMN "depreciation_rate" TYPE numeric(5,2);

-- Fix the purchase_date column
-- First, add a new column with the correct type
ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "purchase_date_new" date;

-- Copy data from old column to new column
UPDATE "asset" SET "purchase_date_new" = "purchase_date"::date WHERE "purchase_date_new" IS NULL;

-- Drop the old column
ALTER TABLE "asset" DROP COLUMN "purchase_date";

-- Rename the new column to the correct name
ALTER TABLE "asset" RENAME COLUMN "purchase_date_new" TO "purchase_date";

-- Make sure the column is not null
ALTER TABLE "asset" ALTER COLUMN "purchase_date" SET NOT NULL;