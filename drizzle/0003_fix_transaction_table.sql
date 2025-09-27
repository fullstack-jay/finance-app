-- Fix the transaction table structure to match the application schema completely
-- First, remove any extra columns that shouldn't be there
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "reference";
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "is_recurring";
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "recurring_interval";
ALTER TABLE "transaction" DROP COLUMN IF EXISTS "status";

-- Make sure all required columns exist with correct types
ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS "is_approved" boolean NOT NULL DEFAULT false;
ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS "receipt_url" text;
ALTER TABLE "transaction" ALTER COLUMN "type" TYPE varchar(20);

-- Fix the date column - we need to convert it to match the schema
-- First, add a new column with the correct type
ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS "date_new" date;

-- Copy data from old column to new column
UPDATE "transaction" SET "date_new" = "date"::date WHERE "date_new" IS NULL;

-- Drop the old column
ALTER TABLE "transaction" DROP COLUMN "date";

-- Rename the new column to the correct name
ALTER TABLE "transaction" RENAME COLUMN "date_new" TO "date";

-- Make sure the column is not null
ALTER TABLE "transaction" ALTER COLUMN "date" SET NOT NULL;