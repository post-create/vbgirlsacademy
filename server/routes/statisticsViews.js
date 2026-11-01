const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const { STAT_COLUMNS } = require("./matchStats");

// Saved setups for the Statistik page (filters, which charts are shown, ...),
// kept per coach so a coach's own setups follow them to any device and other
// coaches' setups never show up in their list.
const router = express.Router();

// Keep in step with the chart keys in the client (KAMP_*_CHARTS in App.jsx):
// "score" plus every tracked stat column (STAT_COLUMNS in matchStats.js).
const CHART_KEYS = new Set(["score", ...STAT_COLUMNS]);
const CHART_MODES = new Set(["auto", "each", "avg"]);
const SORT_MODES = new Set(["avg", "alpha"]);

const strList = (v, max) =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.length <= 64).slice(0, max) : [];

// Keeps only the fields the page knows about, in the shapes it expects — the
// page reads this back and applies it, so nothing else is stored.
function cleanConfig(raw) {
  const c = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    filterPlayers: strList(c.filterPlayers, 200),
    filterPositions: strList(c.filterPositions, 20),
    filterLevels: strList(c.filterLevels, 20),
    charts: strList(c.charts, 10).filter((k) => CHART_KEYS.has(k)),
    chartMode: CHART_MODES.has(c.chartMode) ? c.chartMode : "auto",
    sortMode: SORT_MODES.has(c.sortMode) ? c.sortMode : "avg",
    // null = the chart players follow the filters.
    selectedIds: Array.isArray(c.selectedIds) ? strList(c.selectedIds, 200) : null,
  };
}

const toOut = (r) => ({ id: r.id, name: r.name, config: r.config });

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "select id, name, config from statistics_views where coach_id = $1 order by lower(name)",
      [req.session.coachId]
    );
    res.json(rows.map(toOut));
  } catch (err) {
    next(err);
  }
});

// Saving under a name that already exists (for this coach) replaces it.
router.post("/", async (req, res, next) => {
  try {
    const name = String((req.body && req.body.name) || "").trim();
    if (!name) return res.status(400).json({ error: "Opsætningen skal have et navn." });
    if (name.length > 60) return res.status(400).json({ error: "Navnet må højst være 60 tegn." });
    const config = cleanConfig(req.body && req.body.config);
    const { rows } = await pool.query(
      `insert into statistics_views (id, coach_id, name, config) values ($1, $2, $3, $4)
       on conflict (coach_id, (lower(name))) do update set name = excluded.name, config = excluded.config
       returning id, name, config`,
      [crypto.randomUUID(), req.session.coachId, name, JSON.stringify(config)]
    );
    res.status(201).json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from statistics_views where id = $1 and coach_id = $2", [
      req.params.id,
      req.session.coachId,
    ]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
