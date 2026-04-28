import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "";
const usesSsl =
  process.env.DATABASE_SSL === "true" ||
  /sslmode=require/i.test(databaseUrl) ||
  databaseUrl.includes("supabase.co");

const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: usesSsl ? { rejectUnauthorized } : undefined,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export async function checkDbConnection(): Promise<{ ok: boolean; reason?: string }> {
  if (!pool) {
    return { ok: false, reason: "DATABASE_URL is not configured" };
  }

  try {
    await pool.query("select 1");
    return { ok: true };
  } catch (error) {
    console.error("[checkDbConnection]", error);
    return { ok: false, reason: "Database connection failed" };
  }
}
