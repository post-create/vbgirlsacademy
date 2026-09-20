const express = require("express");
const pool = require("../db");
const { POSITIONS } = require("../positions");

const router = express.Router();

const VALID_IDS = new Set(POSITIONS.map((p) => p.id));
const LABEL_BY_ID = new Map(POSITIONS.map((p) => [p.id, p]));

// Cleans up whatever a coach typed into the aliases field ("RM, RW rm" ->
// ["RM", "RW"]) — case-insensitive on input, but stored upper-case since
// that's how matchStats.js compares against the import file.
function normalizeAliases(aliases) {
  if (!Array.isArray(aliases)) return [];
  const seen = new Set();
  aliases.forEach((a) => {
    const trimmed = String(a || "").trim().toUpperCase();
    if (trimmed) seen.add(trimmed);
  });
  return [...seen];
}

// Always returns exactly the 11 formation slots, merging the fixed
// id/label/abbr catalog with whatever a coach has saved for aliases and
// characteristics — position_settings is seeded with all 11 rows by
// schema.sql, but this defends against a row missing regardless.
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("select id, aliases, characteristics from position_settings");
    const byId = new Map(rows.map((r) => [r.id, r]));
    res.json(
      POSITIONS.map((p) => {
        const row = byId.get(p.id);
        return {
          id: p.id,
          label: p.label,
          abbr: p.abbr,
          aliases: row?.aliases || [],
          characteristics: row?.characteristics || "",
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!VALID_IDS.has(req.params.id)) {
      return res.status(404).json({ error: "Ukendt position." });
    }
    const aliases = normalizeAliases(req.body.aliases);
    const characteristics = String(req.body.characteristics || "").trim();

    await pool.query(
      `insert into position_settings (id, aliases, characteristics) values ($1, $2, $3)
       on conflict (id) do update set aliases = excluded.aliases, characteristics = excluded.characteristics`,
      [req.params.id, aliases, characteristics]
    );

    const p = LABEL_BY_ID.get(req.params.id);
    res.json({ id: p.id, label: p.label, abbr: p.abbr, aliases, characteristics });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
