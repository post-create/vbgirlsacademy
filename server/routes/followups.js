const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router({ mergeParams: true });

// Mounted at /api/players/:playerId/followups
router.post("/", async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { coachId, note } = req.body;

    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `insert into followups (id, player_id, coach_id, note)
       values ($1, $2, $3, $4)
       returning id, player_id, coach_id, note, created_at`,
      [id, playerId, coachId || null, (note || "").slice(0, 500)]
    );
    const f = rows[0];
    res.status(201).json({
      id: f.id,
      playerId: f.player_id,
      coachId: f.coach_id,
      note: f.note || "",
      createdAt: f.created_at,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { playerId, id } = req.params;
    await pool.query("delete from followups where id = $1 and player_id = $2", [id, playerId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
