const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const { buildConfig } = require("../config");

const router = express.Router();

// Scoped strictly to the one player matching :token. Never touches other
// players' rows, unlike the old prototype which loaded the entire dataset
// into the browser and filtered by token client-side.
async function loadPlayerByToken(token) {
  const { rows } = await pool.query(
    `select id, name, primary_position, secondary_position, number, team_id, skill_group_id, participation_level_id,
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

    const [skills, skillGroups, skillGroupMembers, participationLevels, periods, evaluations, goals, progressLog, developmentPlan] =
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
        pool.query(
          "select period_id, skill_id, progress, created_at from goal_progress_log where player_id = $1 order by created_at",
          [player.id]
        ),
        pool.query("select * from development_plans where player_id = $1", [player.id]),
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
        progressLog: [],
      };
    });
    // Already ordered by created_at (see the query above) — every entry the
    // player has ever submitted, oldest first, exactly as it should print.
    progressLog.rows.forEach((row) => {
      const goal = goalsOut[row.period_id]?.[row.skill_id];
      if (goal) goal.progressLog.push({ progress: row.progress, createdAt: row.created_at });
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
        primaryPosition: player.primary_position,
        secondaryPosition: player.secondary_position,
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
      developmentPlan: developmentPlan.rows[0]
        ? {
            seasonLabel: developmentPlan.rows[0].season_label || "",
            contentHtml: developmentPlan.rows[0].content_html || "",
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// The player's self-evaluation of her goals in one period, submitted as one
// set: every goal in the period needs a value (1-10), otherwise nothing is
// saved. Each value becomes the goal's current progress and a row in
// goal_progress_log (the history the coach sees), all in one transaction so
// a failure can't leave half the goals saved — which a retry would then log
// twice.
router.post("/:token/periods/:periodId/self-eval", async (req, res, next) => {
  try {
    const player = await loadPlayerByToken(req.params.token);
    if (!player) return res.status(404).json({ error: "Invalid link" });

    const values = req.body && req.body.progress;
    if (!values || typeof values !== "object" || Array.isArray(values)) {
      return res.status(400).json({ error: "Mangler vurderinger." });
    }

    const { rows: goalRows } = await pool.query(
      "select skill_id from goals where player_id = $1 and period_id = $2",
      [player.id, req.params.periodId]
    );
    if (goalRows.length === 0) return res.status(404).json({ error: "Der er ingen mål i perioden." });

    const skillIds = goalRows.map((g) => g.skill_id);
    const valid = (v) => Number.isInteger(v) && v >= 1 && v <= 10;
    if (!skillIds.every((id) => valid(values[id]))) {
      return res.status(400).json({ error: "Du skal vurdere alle dine udviklingsmål, før du kan gemme." });
    }
    if (Object.keys(values).some((id) => !skillIds.includes(id))) {
      return res.status(400).json({ error: "Ukendt mål i vurderingen." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const skillId of skillIds) {
        await client.query(
          "update goals set progress = $4 where player_id = $1 and period_id = $2 and skill_id = $3",
          [player.id, req.params.periodId, skillId, values[skillId]]
        );
        await client.query(
          `insert into goal_progress_log (id, player_id, period_id, skill_id, progress)
           values ($1, $2, $3, $4, $5)`,
          [crypto.randomUUID(), player.id, req.params.periodId, skillId, values[skillId]]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const [goals, log] = await Promise.all([
      pool.query(
        `select skill_id, target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date
         from goals where player_id = $1 and period_id = $2`,
        [player.id, req.params.periodId]
      ),
      pool.query(
        `select skill_id, progress, created_at from goal_progress_log
         where player_id = $1 and period_id = $2 order by created_at`,
        [player.id, req.params.periodId]
      ),
    ]);
    const out = {};
    goals.rows.forEach((g) => {
      out[g.skill_id] = {
        target: g.target,
        note: g.note || "",
        focusAreas: g.focus_areas || "",
        progress: g.progress,
        createdDate: g.created_date,
        progressLog: [],
      };
    });
    log.rows.forEach((r) => {
      if (out[r.skill_id]) out[r.skill_id].progressLog.push({ progress: r.progress, createdAt: r.created_at });
    });
    res.json({ goals: out });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
