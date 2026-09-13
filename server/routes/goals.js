const express = require("express");
const pool = require("../db");

const router = express.Router({ mergeParams: true });

// Mounted at /api/players/:playerId/periods/:periodId/goals
router.put("/:skillId", async (req, res, next) => {
  try {
    const { playerId, periodId, skillId } = req.params;
    const { target, note, focusAreas } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const { rows } = await pool.query(
      `insert into goals (player_id, period_id, skill_id, target, note, focus_areas, progress, created_date)
       values ($1, $2, $3, $4, $5, $6, null, $7)
       on conflict (player_id, period_id, skill_id) do update
         set target = excluded.target, note = excluded.note, focus_areas = excluded.focus_areas
       returning target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date`,
      [
        playerId,
        periodId,
        skillId,
        target,
        (note || "").slice(0, 120),
        (focusAreas || "").slice(0, 200),
        today,
      ]
    );
    const g = rows[0];
    res.json({
      target: g.target,
      note: g.note || "",
      focusAreas: g.focus_areas || "",
      progress: g.progress,
      createdDate: g.created_date,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:skillId/progress", async (req, res, next) => {
  try {
    const { playerId, periodId, skillId } = req.params;
    const { progress } = req.body;
    const { rows } = await pool.query(
      `update goals set progress = $4 where player_id = $1 and period_id = $2 and skill_id = $3
       returning target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date`,
      [playerId, periodId, skillId, progress]
    );
    if (!rows[0]) return res.status(404).json({ error: "Goal not found" });
    const g = rows[0];
    res.json({
      target: g.target,
      note: g.note || "",
      focusAreas: g.focus_areas || "",
      progress: g.progress,
      createdDate: g.created_date,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:skillId", async (req, res, next) => {
  try {
    const { playerId, periodId, skillId } = req.params;
    await pool.query(
      "delete from goals where player_id = $1 and period_id = $2 and skill_id = $3",
      [playerId, periodId, skillId]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
