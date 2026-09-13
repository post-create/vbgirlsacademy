const express = require("express");
const pool = require("../db");

const router = express.Router({ mergeParams: true });

// Mounted at /api/players/:playerId/periods/:periodId/scores
router.put("/:skillId", async (req, res, next) => {
  try {
    const { playerId, periodId, skillId } = req.params;
    const { value } = req.body;

    if (value === null || value === undefined) {
      await pool.query(
        "delete from evaluations where player_id = $1 and period_id = $2 and skill_id = $3",
        [playerId, periodId, skillId]
      );
      return res.json({ value: null });
    }

    await pool.query(
      `insert into evaluations (player_id, period_id, skill_id, score)
       values ($1, $2, $3, $4)
       on conflict (player_id, period_id, skill_id) do update set score = excluded.score`,
      [playerId, periodId, skillId, value]
    );
    res.json({ value });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
