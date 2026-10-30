const express = require("express");
const pool = require("../db");
const { buildConfig } = require("../config");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [
      teams,
      players,
      periods,
      skills,
      skillGroups,
      skillGroupMembers,
      participationLevels,
      evaluations,
      goals,
      goalProgressLog,
      coaches,
      followups,
      developmentPlans,
    ] = await Promise.all([
      pool.query("select id, name from teams order by name"),
      pool.query(
        `select id, name, primary_position, secondary_position, number, email, team_id, self_token, skill_group_id,
                participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y, active
         from players order by name`
      ),
      pool.query(
        "select id, label, to_char(date, 'YYYY-MM-DD') as date from periods order by date"
      ),
      pool.query("select id, category_key, name, enabled from skills order by category_key, sort_order"),
      pool.query("select id, name, sort_order from skill_groups order by sort_order"),
      pool.query("select skill_group_id, skill_id from skill_group_members"),
      pool.query("select id, name, numeric_value, expectations, sort_order from participation_levels order by sort_order"),
      pool.query("select player_id, period_id, skill_id, score from evaluations"),
      pool.query(
        "select player_id, period_id, skill_id, target, note, focus_areas, progress, to_char(created_date, 'YYYY-MM-DD') as created_date from goals"
      ),
      pool.query(
        "select player_id, period_id, skill_id, progress, created_at from goal_progress_log order by created_at"
      ),
      pool.query("select id, name, email, team_id from coaches order by name"),
      pool.query(
        "select id, player_id, coach_id, note, created_at from followups order by created_at"
      ),
      pool.query("select * from development_plans"),
    ]);

    const playersOut = players.rows.map((p) => ({
      id: p.id,
      name: p.name,
      primaryPosition: p.primary_position,
      secondaryPosition: p.secondary_position,
      number: p.number || "",
      email: p.email || "",
      teamId: p.team_id,
      selfToken: p.self_token,
      skillGroupId: p.skill_group_id,
      participationLevelId: p.participation_level_id,
      goal2to3y: p.goal_2_3y || "",
      goal1to2y: p.goal_1_2y || "",
      goalUnder1y: p.goal_under_1y || "",
      active: p.active !== false,
    }));

    const evaluationsOut = {};
    evaluations.rows.forEach((row) => {
      if (!evaluationsOut[row.player_id]) evaluationsOut[row.player_id] = {};
      if (!evaluationsOut[row.player_id][row.period_id]) {
        evaluationsOut[row.player_id][row.period_id] = { scores: {} };
      }
      evaluationsOut[row.player_id][row.period_id].scores[row.skill_id] = row.score;
    });

    const goalsOut = {};
    goals.rows.forEach((row) => {
      if (!goalsOut[row.player_id]) goalsOut[row.player_id] = {};
      if (!goalsOut[row.player_id][row.period_id]) goalsOut[row.player_id][row.period_id] = {};
      goalsOut[row.player_id][row.period_id][row.skill_id] = {
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
    goalProgressLog.rows.forEach((row) => {
      const goal = goalsOut[row.player_id]?.[row.period_id]?.[row.skill_id];
      if (goal) goal.progressLog.push({ progress: row.progress, createdAt: row.created_at });
    });

    const coachesOut = coaches.rows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || "",
      teamId: c.team_id,
    }));

    const followupsOut = {};
    followups.rows.forEach((row) => {
      if (!followupsOut[row.player_id]) followupsOut[row.player_id] = [];
      followupsOut[row.player_id].push({
        id: row.id,
        coachId: row.coach_id,
        note: row.note || "",
        createdAt: row.created_at,
      });
    });

    const developmentPlansOut = {};
    developmentPlans.rows.forEach((row) => {
      developmentPlansOut[row.player_id] = {
        playerId: row.player_id,
        seasonLabel: row.season_label || "",
        contentHtml: row.content_html || "",
        updatedAt: row.updated_at,
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
      config,
      players: playersOut,
      periods: periods.rows,
      teams: teams.rows,
      evaluations: evaluationsOut,
      goals: goalsOut,
      coaches: coachesOut,
      followups: followupsOut,
      developmentPlans: developmentPlansOut,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
