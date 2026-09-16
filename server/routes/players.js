const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

function makeSelfToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Per-match rows plus season totals computed on the fly from them — never
// stored separately, so there's nothing that can drift out of sync with
// what's actually been uploaded (see server/routes/matchStats.js).
router.get("/:id/stats", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select ms.*, mp.opponent, to_char(mp.match_date, 'YYYY-MM-DD') as match_date
       from match_stats ms join match_plans mp on mp.id = ms.match_plan_id
       where ms.player_id = $1
       order by mp.match_date desc`,
      [req.params.id]
    );

    const matches = rows.map((r) => ({
      matchPlanId: r.match_plan_id,
      opponent: r.opponent || "",
      matchDate: r.match_date,
      position: r.position || "",
      minutes: r.minutes,
      distanceMi: r.distance_mi,
      avgSpeedMph: r.avg_speed_mph,
      topSpeedMph: r.top_speed_mph,
      sprints: r.sprints,
      highIntensityRuns: r.high_intensity_runs,
      passes: r.passes,
      passSuccessPct: r.pass_success_pct,
      dribbles: r.dribbles,
      shots: r.shots,
      tackles: r.tackles,
      interceptions: r.interceptions,
      looseBallRecoveries: r.loose_ball_recoveries,
      goalKicks: r.goal_kicks,
      fouls: r.fouls,
      saves: r.saves,
      totalEvents: r.total_events,
    }));

    // Sums for counting stats, a passes-weighted average for the success
    // rate (not a plain average of per-match percentages — a 100% game on
    // 2 passes shouldn't count the same as a 45% game on 30 passes), max
    // for top speed, plain average for the rest.
    const sum = (key) => matches.reduce((s, m) => s + (m[key] || 0), 0);
    const totalPasses = sum("passes");
    const weightedSuccess = matches.reduce(
      (s, m) => s + ((m.passSuccessPct || 0) * (m.passes || 0)) / 100,
      0
    );

    const season =
      matches.length === 0
        ? null
        : {
            matches: matches.length,
            minutes: sum("minutes"),
            distanceMi: Math.round(sum("distanceMi") * 10) / 10,
            avgSpeedMph:
              Math.round((matches.reduce((s, m) => s + (m.avgSpeedMph || 0), 0) / matches.length) * 10) / 10,
            topSpeedMph: Math.max(...matches.map((m) => m.topSpeedMph || 0)),
            sprints: sum("sprints"),
            highIntensityRuns: sum("highIntensityRuns"),
            passes: totalPasses,
            passSuccessPct: totalPasses > 0 ? Math.round((weightedSuccess / totalPasses) * 10000) / 100 : null,
            dribbles: sum("dribbles"),
            shots: sum("shots"),
            tackles: sum("tackles"),
            interceptions: sum("interceptions"),
            looseBallRecoveries: sum("looseBallRecoveries"),
            goalKicks: sum("goalKicks"),
            fouls: sum("fouls"),
            saves: sum("saves"),
            totalEvents: sum("totalEvents"),
          };

    res.json({ season, matches });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, positions, number, email, teamId, skillGroupId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
    if (!skillGroupId) return res.status(400).json({ error: "skillGroupId is required" });

    const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
      skillGroupId,
    ]);
    if (!groupRows[0]) return res.status(400).json({ error: "skillGroupId not found" });

    const id = crypto.randomUUID();
    const selfToken = makeSelfToken();
    await pool.query(
      `insert into players (id, name, positions, number, email, team_id, self_token, skill_group_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        name.trim(),
        positions || [],
        (number || "").trim(),
        (email || "").trim(),
        teamId || null,
        selfToken,
        skillGroupId,
      ]
    );
    res.status(201).json({
      id,
      name: name.trim(),
      positions: positions || [],
      number: (number || "").trim(),
      email: (email || "").trim(),
      teamId: teamId || null,
      selfToken,
      skillGroupId,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query(
      `select id, name, positions, number, email, team_id, self_token, skill_group_id,
              participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y
       from players where id = $1`,
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Player not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const positions = req.body.positions !== undefined ? req.body.positions : existing.positions;
    const number = req.body.number !== undefined ? req.body.number : existing.number;
    const email = req.body.email !== undefined ? req.body.email : existing.email;
    const teamId = req.body.teamId !== undefined ? req.body.teamId : existing.team_id;
    const participationLevelId =
      req.body.participationLevelId !== undefined
        ? req.body.participationLevelId
        : existing.participation_level_id;
    const goal2to3y = req.body.goal2to3y !== undefined ? req.body.goal2to3y : existing.goal_2_3y;
    const goal1to2y = req.body.goal1to2y !== undefined ? req.body.goal1to2y : existing.goal_1_2y;
    const goalUnder1y =
      req.body.goalUnder1y !== undefined ? req.body.goalUnder1y : existing.goal_under_1y;

    let skillGroupId = existing.skill_group_id;
    if (req.body.skillGroupId !== undefined) {
      if (!req.body.skillGroupId) {
        return res.status(400).json({ error: "skillGroupId cannot be cleared — every player needs a group" });
      }
      const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
        req.body.skillGroupId,
      ]);
      if (!groupRows[0]) return res.status(400).json({ error: "skillGroupId not found" });
      skillGroupId = req.body.skillGroupId;
    }

    const { rows } = await pool.query(
      `update players set name = $2, positions = $3, number = $4, email = $5, team_id = $6,
              participation_level_id = $7, goal_2_3y = $8, goal_1_2y = $9, goal_under_1y = $10,
              skill_group_id = $11
       where id = $1
       returning id, name, positions, number, email, team_id, self_token, skill_group_id,
                 participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y`,
      [
        req.params.id,
        name,
        positions,
        number,
        email,
        teamId,
        participationLevelId,
        goal2to3y,
        goal1to2y,
        goalUnder1y,
        skillGroupId,
      ]
    );
    const p = rows[0];
    res.json({
      id: p.id,
      name: p.name,
      positions: p.positions || [],
      number: p.number || "",
      email: p.email || "",
      teamId: p.team_id,
      selfToken: p.self_token,
      skillGroupId: p.skill_group_id,
      participationLevelId: p.participation_level_id,
      goal2to3y: p.goal_2_3y || "",
      goal1to2y: p.goal_1_2y || "",
      goalUnder1y: p.goal_under_1y || "",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from players where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
