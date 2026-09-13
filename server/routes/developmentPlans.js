const express = require("express");
const pool = require("../db");

const router = express.Router();

function toOut(row) {
  if (!row) return null;
  return {
    playerId: row.player_id,
    seasonLabel: row.season_label || "",
    intro: row.intro || "",
    matchPath: row.match_path || [],
    selfTraining: row.self_training || "",
    statsIntro: row.stats_intro || "",
    statsItems: row.stats_items || [],
    followups: row.followups || [],
    updatedAt: row.updated_at,
  };
}

router.get("/:playerId", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "select * from development_plans where player_id = $1",
      [req.params.playerId]
    );
    res.json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

// One plan per player — always an upsert, no separate create/update split
// (mirrors match_performance's on-conflict pattern rather than goals'
// PUT-per-field pattern, since here the whole document is edited at once).
router.put("/:playerId", async (req, res, next) => {
  try {
    const b = req.body || {};
    const { rows } = await pool.query(
      `insert into development_plans (
         player_id, season_label, intro, match_path, self_training, stats_intro, stats_items, followups
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (player_id) do update set
         season_label = excluded.season_label,
         intro = excluded.intro,
         match_path = excluded.match_path,
         self_training = excluded.self_training,
         stats_intro = excluded.stats_intro,
         stats_items = excluded.stats_items,
         followups = excluded.followups,
         updated_at = now()
       returning *`,
      [
        req.params.playerId,
        b.seasonLabel || "",
        b.intro || "",
        JSON.stringify(b.matchPath || []),
        b.selfTraining || "",
        b.statsIntro || "",
        JSON.stringify(b.statsItems || []),
        JSON.stringify(b.followups || []),
      ]
    );
    res.json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:playerId", async (req, res, next) => {
  try {
    await pool.query("delete from development_plans where player_id = $1", [req.params.playerId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
