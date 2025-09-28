import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import 'dotenv/config';
import * as auth from "./schema/auth"
import * as finance from "./schema/finance"
import * as profile from "./schema/profile"

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Drizzle ORM instance
export const db = drizzle(pool, {
  schema: {
    ...auth,
    ...finance,
    ...profile
  }
});

export type Database = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];