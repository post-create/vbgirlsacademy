// Imports a JSON file produced by export-data.js, replacing everything
// currently in the target database's tables. Run as:
//   node server/scripts/import-data.js <path-to-export.json>
require("dotenv").config();
const fs = require("fs");
const { Pool } = require("pg");

async function insertRows(pool, table, columns, rows) {
  for (const row of rows) {
    const values = columns.map((c) => row[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    await pool.query(
      `insert into ${table} (${columns.join(", ")}) values (${placeholders})`,
      values
    );
  }
  console.log(`Imported ${rows.length} rows into ${table}`);
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error("Usage: node import-data.js <path-to-export.json>");
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });

  console.log("Truncating existing data...");
  await pool.query(
    "truncate teams, players, periods, skills, evaluations, goals, coaches, followups restart identity cascade"
  );

  await insertRows(pool, "teams", ["id", "name"], data.teams || []);
  await insertRows(pool, "periods", ["id", "label", "date"], data.periods || []);
  await insertRows(
    pool,
    "skills",
    ["id", "category_key", "name", "enabled", "sort_order"],
    data.skills || []
  );
  await insertRows(
    pool,
    "players",
    ["id", "name", "positions", "number", "email", "team_id", "self_token"],
    data.players || []
  );
  await insertRows(pool, "coaches", ["id", "name", "email", "team_id"], data.coaches || []);
  await insertRows(
    pool,
    "evaluations",
    ["player_id", "period_id", "skill_id", "score"],
    data.evaluations || []
  );
  await insertRows(
    pool,
    "goals",
    ["player_id", "period_id", "skill_id", "target", "note", "focus_areas", "progress", "created_date"],
    data.goals || []
  );
  await insertRows(
    pool,
    "followups",
    ["id", "player_id", "coach_id", "note", "created_at"],
    data.followups || []
  );

  console.log("Import complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
