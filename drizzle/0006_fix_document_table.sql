-- Fix the document table structure to match the application schema
-- Drop columns that don't match the schema
ALTER TABLE "document" DROP COLUMN IF EXISTS "file_type";
ALTER TABLE "document" DROP COLUMN IF EXISTS "file_size";
ALTER TABLE "document" DROP COLUMN IF EXISTS "related_entity_type";
ALTER TABLE "document" DROP COLUMN IF EXISTS "related_entity_id";
ALTER TABLE "document" DROP COLUMN IF EXISTS "uploaded_at";

-- Add missing columns that match the schema
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "type" varchar(50) NOT NULL DEFAULT '';
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "related_id" integer;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "related_type" varchar(20);
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "upload_date" timestamp NOT NULL DEFAULT NOW();
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "created_at" timestamp NOT NULL DEFAULT NOW();
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT NOW();

-- Fix column types to match the schema
ALTER TABLE "document" ALTER COLUMN "name" TYPE varchar(255);
ALTER TABLE "document" ALTER COLUMN "url" TYPE text;

-- Remove the default value for type column since it should be provided
ALTER TABLE "document" ALTER COLUMN "type" DROP DEFAULT;