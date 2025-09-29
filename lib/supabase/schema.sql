-- Create tables based on the schema provided in app_summary_v2.md

-- Create User table
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "image" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT PRIMARY KEY,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

-- Create Account table
CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP WITH TIME ZONE,
    "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE,
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Verification table
CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Category table
CREATE TABLE IF NOT EXISTS "category" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "transaction" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "category_id" INTEGER NOT NULL REFERENCES "category"("id") ON DELETE SET NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT FALSE,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Asset table
CREATE TABLE IF NOT EXISTS "asset" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "purchase_date" DATE NOT NULL,
    "purchase_price" DECIMAL(12, 2) NOT NULL,
    "current_value" DECIMAL(12, 2),
    "depreciation_rate" DECIMAL(5, 2),
    "category_id" INTEGER NOT NULL REFERENCES "category"("id") ON DELETE SET NULL,
    "maintenance_schedule" TEXT,
    "insurance_info" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Investment table
CREATE TABLE IF NOT EXISTS "investment" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "purchase_date" DATE NOT NULL,
    "purchase_price" DECIMAL(12, 2) NOT NULL,
    "current_value" DECIMAL(12, 2),
    "quantity" DECIMAL(12, 4),
    "roi" DECIMAL(5, 2),
    "category_id" INTEGER NOT NULL REFERENCES "category"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Document table
CREATE TABLE IF NOT EXISTS "document" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "related_id" INTEGER,
    "related_type" VARCHAR(20),
    "upload_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create User Profile table
CREATE TABLE IF NOT EXISTS "user_profile" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for relevant tables
ALTER TABLE "transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "investment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_profile" ENABLE ROW LEVEL SECURITY;

-- Transaction RLS policies
CREATE POLICY "Users can view their own transactions"
ON "public"."transaction"
FOR SELECT
TO authenticated
USING ((auth.uid()::text) = user_id);

CREATE POLICY "Users can insert their own transactions"
ON "public"."transaction"
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can update their own transactions"
ON "public"."transaction"
FOR UPDATE
TO authenticated
USING ((auth.uid()::text) = user_id)
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can delete their own transactions"
ON "public"."transaction"
FOR DELETE
TO authenticated
USING ((auth.uid()::text) = user_id);

-- Asset RLS policies
CREATE POLICY "Users can view their own assets"
ON "public"."asset"
FOR SELECT
TO authenticated
USING ((auth.uid()::text) = user_id);

CREATE POLICY "Users can insert their own assets"
ON "public"."asset"
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can update their own assets"
ON "public"."asset"
FOR UPDATE
TO authenticated
USING ((auth.uid()::text) = user_id)
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can delete their own assets"
ON "public"."asset"
FOR DELETE
TO authenticated
USING ((auth.uid()::text) = user_id);

-- Investment RLS policies
CREATE POLICY "Users can view their own investments"
ON "public"."investment"
FOR SELECT
TO authenticated
USING ((auth.uid()::text) = user_id);

CREATE POLICY "Users can insert their own investments"
ON "public"."investment"
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can update their own investments"
ON "public"."investment"
FOR UPDATE
TO authenticated
USING ((auth.uid()::text) = user_id)
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can delete their own investments"
ON "public"."investment"
FOR DELETE
TO authenticated
USING ((auth.uid()::text) = user_id);

-- Document RLS policies
CREATE POLICY "Users can view their own documents"
ON "public"."document"
FOR SELECT
TO authenticated
USING ((auth.uid()::text) = user_id);

CREATE POLICY "Users can insert their own documents"
ON "public"."document"
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can update their own documents"
ON "public"."document"
FOR UPDATE
TO authenticated
USING ((auth.uid()::text) = user_id)
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can delete their own documents"
ON "public"."document"
FOR DELETE
TO authenticated
USING ((auth.uid()::text) = user_id);

-- User Profile RLS policies
CREATE POLICY "Users can view their own profile"
ON "public"."user_profile"
FOR SELECT
TO authenticated
USING ((auth.uid()::text) = user_id);

CREATE POLICY "Users can insert their own profile"
ON "public"."user_profile"
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::text) = user_id);

CREATE POLICY "Users can update their own profile"
ON "public"."user_profile"
FOR UPDATE
TO authenticated
USING ((auth.uid()::text) = user_id)
WITH CHECK ((auth.uid()::text) = user_id);