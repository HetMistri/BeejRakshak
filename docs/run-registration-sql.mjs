#!/usr/bin/env node
/** Run registration-table.sql against Postgres. Uses DATABASE_URL from env. */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://agri_v0hw_user:8qBjxOpifu4vDs8isjAqNNJg4pFpkTWY@dpg-d635ad24d50c73ab0uk0-a.singapore-postgres.render.com/agri_v0hw?sslmode=require";

async function main() {
  const sqlPath = join(__dirname, "registration-table.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  const client = new pg.Client({ connectionString: DB_URL });
  try {
    await client.connect();
    await client.query(sql);
    console.log("SQL executed successfully.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
