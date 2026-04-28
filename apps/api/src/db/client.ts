import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "";
const usesSsl =
  process.env.DATABASE_SSL === "true" ||
  /sslmode=require/i.test(databaseUrl) ||
  databaseUrl.includes("supabase.co");

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: usesSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

// DB 接続の確認
export async function checkDbConnection() {
  if (!pool) {
    return {
      ok: false,
      reason: "DATABASE_URL is not configured",
    };
  }

  await pool.query("select 1");

  return {
    ok: true,
  };
}
