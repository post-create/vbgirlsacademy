const express = require("express");
const pool = require("../db");
const { buildConfig } = require("../config");

const router = express.Router();

// Scoped strictly to the one player matching :token. Never touches other
// players' rows, unlike the old prototype which loaded the entire dataset
// into the browser and filtered by token client-side.
async function loadPlayerByToken(token) {
  const { rows } = await pool.query(
    `select id, name, positions, number, team_id, skill_group_id, participation_level_id,
            goal_2_3y, goal_1_2y, goal_under_1y
     from players where self_token = $1`,
    [token]
  );
  return rows[0] || null;
}

router.get("/:token", async (req, res, next) => {
  try {
    const player = await loadPlayerByToken(req.params.token);
    if (!player) return res.status(404).json({ error: "Invalid link" });

    const [skills, skillGroups, skillGroupMembers, participationLevels, periods, evaluations, goals] =
      await Promise.all([
        pool.query("select id, category_key, name, enabled from skills order by category_key, sort_order"),
        pool.query("select id, name, sort_order from skill_groups order by sort_order"),
        pool.query("select skill_group_id, skill_id from skill_group_members"),
        pool.query("select id, name, numeric_value, expectations, sort_order from participation_levels order by sort_order"),
        pool.query("select id, label, to_char(date, 'YYYY-MM-DD') as date from periods order by date"),
        pool.query("select period_id, skill_id, score from evaluations where player_id = $1", [
          player.id,
        ]),
        pool.query(
          "select period_id, skill_id, target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date from goals where player_id = $1",
          [player.id]
        ),
      ]);

    const evaluationsOut = {};
    evaluations.rows.forEach((row) => {
      if (!evaluationsOut[row.period_id]) evaluationsOut[row.period_id] = { scores: {} };
      evaluationsOut[row.period_id].scores[row.skill_id] = row.score;
    });

    const goalsOut = {};
    goals.rows.forEach((row) => {
      if (!goalsOut[row.period_id]) goalsOut[row.period_id] = {};
      goalsOut[row.period_id][row.skill_id] = {
        target: row.target,
        note: row.note || "",
        focusAreas: row.focus_areas || "",
        progress: row.progress,
        createdDate: row.created_date,
      };
    });

    const config = buildConfig(skills.rows, skillGroups.rows, skillGroupMembers.rows);
    config.participationLevels = participationLevels.rows.map((l) => ({
      id: l.id,
      name: l.name,
      numericValue: l.numeric_value,
      expectations: l.expectations || "",
      sortOrder: l.sort_order,
    }));

    res.json({
      player: {
        id: player.id,
        name: player.name,
        positions: player.positions || [],
        number: player.number || "",
        teamId: player.team_id,
        skillGroupId: player.skill_group_id,
        participationLevelId: player.participation_level_id,
        goal2to3y: player.goal_2_3y || "",
        goal1to2y: player.goal_1_2y || "",
        goalUnder1y: player.goal_under_1y || "",
      },
      config,
      periods: periods.rows,
      evaluations: evaluationsOut,
      goals: goalsOut,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:token/periods/:periodId/goals/:skillId/progress", async (req, res, next) => {
  try {
    const player = await loadPlayerByToken(req.params.token);
    if (!player) return res.status(404).json({ error: "Invalid link" });

    const { progress } = req.body;
    const { rows } = await pool.query(
      `update goals set progress = $4 where player_id = $1 and period_id = $2 and skill_id = $3
       returning target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date`,
      [player.id, req.params.periodId, req.params.skillId, progress]
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

module.exports = router;
