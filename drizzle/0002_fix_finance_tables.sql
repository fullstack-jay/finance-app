-- Fix the user_id type in transaction table
ALTER TABLE "transaction" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;

-- Fix the category table structure
ALTER TABLE "category" DROP COLUMN IF EXISTS "color";
ALTER TABLE "category" DROP COLUMN IF EXISTS "icon";
ALTER TABLE "category" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "category" ALTER COLUMN "type" TYPE varchar(20);

-- Add missing foreign key constraint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;

-- Fix the investment table user_id type if it exists
ALTER TABLE "investment" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;

-- Fix the asset table user_id type if it exists
ALTER TABLE "asset" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;

-- Fix the document table user_id type if it exists
ALTER TABLE "document" ALTER COLUMN "user_id" TYPE text USING "user_id"::text;