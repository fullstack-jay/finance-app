-- Fix the investment table structure to match the application schema
-- Drop columns that don't match the schema
ALTER TABLE "investment" DROP COLUMN IF EXISTS "symbol";
ALTER TABLE "investment" DROP COLUMN IF EXISTS "current_price";
ALTER TABLE "investment" DROP COLUMN IF EXISTS "performance";
ALTER TABLE "investment" DROP COLUMN IF EXISTS "dividend_yield";
ALTER TABLE "investment" DROP COLUMN IF EXISTS "sector";
ALTER TABLE "investment" DROP COLUMN IF EXISTS "notes";

-- Add missing columns that match the schema
ALTER TABLE "investment" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "investment" ADD COLUMN IF NOT EXISTS "roi" decimal(5,2); -- return on investment percentage
ALTER TABLE "investment" ADD COLUMN IF NOT EXISTS "category_id" integer 
  REFERENCES "category"("id") ON DELETE SET NULL;

-- Fix column types to match the schema
ALTER TABLE "investment" ALTER COLUMN "name" TYPE varchar(100);
ALTER TABLE "investment" ALTER COLUMN "type" TYPE varchar(50);
ALTER TABLE "investment" ALTER COLUMN "quantity" TYPE decimal(12,4);
ALTER TABLE "investment" ALTER COLUMN "purchase_price" TYPE decimal(12,2);
ALTER TABLE "investment" ALTER COLUMN "current_value" TYPE decimal(12,2);

-- Fix the purchase_date column
-- First, add a new column with the correct type
ALTER TABLE "investment" ADD COLUMN IF NOT EXISTS "purchase_date_new" date;

-- Copy data from old column to new column
UPDATE "investment" SET "purchase_date_new" = "purchase_date"::date WHERE "purchase_date_new" IS NULL;

-- Drop the old column
ALTER TABLE "investment" DROP COLUMN "purchase_date";

-- Rename the new column to the correct name
ALTER TABLE "investment" RENAME COLUMN "purchase_date_new" TO "purchase_date";

-- Make sure the column is not null
ALTER TABLE "investment" ALTER COLUMN "purchase_date" SET NOT NULL;