const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const { POSITIONS } = require("../positions");

const router = express.Router();

const VALID_POSITIONS = new Set(POSITIONS.map((p) => p.id));

// A Kampplan stores a formation's *name* (match_plans.formation, free text
// before this feature existed), so older plans say "4-4-2" where the
// catalog says "1-4-4-2" — comparing without case, spaces and a leading
// goalkeeper "1-" lets both resolve to the same layout.
function normalizeFormationName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/^1-/, "");
}

// Returns the cleaned slot array, or null when anything is off — the
// editor always sends well-formed data, so this is a guard against a
// hand-built request, not a user-facing validation path.
function cleanSlots(slots) {
  if (!Array.isArray(slots) || slots.length < 1 || slots.length > 11) return null;
  const out = [];
  for (const s of slots) {
    const position = String(s?.position ?? "");
    const x = Number(s?.x);
    const y = Number(s?.y);
    if (!VALID_POSITIONS.has(position) || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    out.push({
      position,
      x: Math.round(Math.min(100, Math.max(0, x)) * 10) / 10,
      y: Math.round(Math.min(100, Math.max(0, y)) * 10) / 10,
    });
  }
  return out;
}

function toOut(row) {
  return { id: row.id, name: row.name, slots: row.slots };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "select id, name, slots from formations order by sort_order, created_at, name"
    );
    res.json(rows.map(toOut));
  } catch (err) {
    next(err);
  }
});

async function nameTaken(name, exceptId) {
  const { rows } = await pool.query("select id, name from formations");
  const wanted = normalizeFormationName(name);
  return rows.some((r) => r.id !== exceptId && normalizeFormationName(r.name) === wanted);
}

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const slots = cleanSlots(req.body.slots);
    if (!name) return res.status(400).json({ error: "Formationen skal have et navn." });
    if (!slots) return res.status(400).json({ error: "Formationen skal have 1-11 gyldige pladser." });
    if (await nameTaken(name, null)) {
      return res.status(409).json({ error: "Der findes allerede en formation med det navn." });
    }
    const { rows: max } = await pool.query("select coalesce(max(sort_order), -1) + 1 as next from formations");
    const id = crypto.randomUUID();
    await pool.query(
      "insert into formations (id, name, slots, sort_order) values ($1, $2, $3, $4)",
      [id, name, JSON.stringify(slots), max[0].next]
    );
    res.status(201).json({ id, name, slots });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const slots = cleanSlots(req.body.slots);
    if (!name) return res.status(400).json({ error: "Formationen skal have et navn." });
    if (!slots) return res.status(400).json({ error: "Formationen skal have 1-11 gyldige pladser." });
    if (await nameTaken(name, req.params.id)) {
      return res.status(409).json({ error: "Der findes allerede en formation med det navn." });
    }
    const { rows } = await pool.query(
      "update formations set name = $2, slots = $3 where id = $1 returning id, name, slots",
      [req.params.id, name, JSON.stringify(slots)]
    );
    if (!rows[0]) return res.status(404).json({ error: "Formationen findes ikke." });
    res.json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from formations where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.normalizeFormationName = normalizeFormationName;
