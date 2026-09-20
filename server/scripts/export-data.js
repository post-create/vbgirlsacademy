// Exports every row from every table to a JSON file, for copying data between
// environments (e.g. production -> local dev). Dates/timestamps are exported
// as Postgres's own canonical text via `::text` so re-importing them is a
// direct round-trip with no JS Date/timezone parsing involved on either end.
require("dotenv").config();
const fs = require("fs");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });

  const queries = {
    teams: "select id, name from teams",
    periods: "select id, label, date::text as date from periods",
    skills: "select id, category_key, name, enabled, sort_order from skills",
    players:
      "select id, name, primary_position, secondary_position, number, email, team_id, self_token from players",
    coaches: "select id, name, email, team_id from coaches",
    evaluations: "select player_id, period_id, skill_id, score from evaluations",
    goals:
      "select player_id, period_id, skill_id, target, note, focus_areas, progress, created_date::text as created_date from goals",
    followups: "select id, player_id, coach_id, note, created_at::text as created_at from followups",
  };

  const data = {};
  for (const [table, query] of Object.entries(queries)) {
    const { rows } = await pool.query(query);
    data[table] = rows;
  }

  const outPath = "data-export.json";
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(Object.entries(data).map(([t, rows]) => `${t}: ${rows.length}`).join(", "));
  console.log(`Written to ${outPath}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
