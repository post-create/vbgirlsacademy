const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const { POSITIONS } = require("../positions");

const router = express.Router();

const VALID_POSITION_IDS = new Set(POSITIONS.map((p) => p.id));

function makeSelfToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Returns an error string, or null if { primaryPosition, secondaryPosition }
// is acceptable — either left out entirely (existing value kept, handled by
// the caller), or one of the 11 formation numbers, with the two not equal
// to each other (the picker in App.jsx already excludes that, this is the
// server-side backstop).
function validatePositions(primaryPosition, secondaryPosition) {
  if (primaryPosition != null && !VALID_POSITION_IDS.has(primaryPosition)) {
    return "Ugyldig primær position.";
  }
  if (secondaryPosition != null && !VALID_POSITION_IDS.has(secondaryPosition)) {
    return "Ugyldig sekundær position.";
  }
  if (primaryPosition != null && primaryPosition === secondaryPosition) {
    return "Primær og sekundær position kan ikke være den samme.";
  }
  return null;
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
      distanceKm: r.distance_km,
      avgSpeedKmh: r.avg_speed_kmh,
      topSpeedKmh: r.top_speed_kmh,
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
      assists: r.assists,
      conversionRate: r.conversion_rate,
      passesSuccessful: r.passes_successful,
      passesUnsuccessful: r.passes_unsuccessful,
      goals: r.goals,
      goalInvolvements: r.goal_involvements,
      totalAttempts: r.total_attempts,
      corners: r.corners,
      penaltyKicks: r.penalty_kicks,
      freeKicks: r.free_kicks,
      throwIns: r.throw_ins,
      starts: r.starts,
      captaincies: r.captaincies,
      playerOfTheMatch: r.player_of_the_match,
    }));

    // Sums for counting stats, a passes-weighted average for the success
    // rate (not a plain average of per-match percentages — a 100% game on
    // 2 passes shouldn't count the same as a 45% game on 30 passes), max
    // for top speed, plain average for the rest. Conversion rate gets the
    // same weighted treatment, by total attempts rather than passes.
    const sum = (key) => matches.reduce((s, m) => s + (m[key] || 0), 0);
    const totalPasses = sum("passes");
    const weightedSuccess = matches.reduce(
      (s, m) => s + ((m.passSuccessPct || 0) * (m.passes || 0)) / 100,
      0
    );
    const totalAttempts = sum("totalAttempts");
    const weightedConversion = matches.reduce(
      (s, m) => s + ((m.conversionRate || 0) * (m.totalAttempts || 0)) / 100,
      0
    );

    const season =
      matches.length === 0
        ? null
        : {
            matches: matches.length,
            minutes: sum("minutes"),
            distanceKm: Math.round(sum("distanceKm") * 10) / 10,
            avgSpeedKmh:
              Math.round((matches.reduce((s, m) => s + (m.avgSpeedKmh || 0), 0) / matches.length) * 10) / 10,
            topSpeedKmh: Math.max(...matches.map((m) => m.topSpeedKmh || 0)),
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
            assists: sum("assists"),
            conversionRate:
              totalAttempts > 0 ? Math.round((weightedConversion / totalAttempts) * 10000) / 100 : null,
            passesSuccessful: sum("passesSuccessful"),
            passesUnsuccessful: sum("passesUnsuccessful"),
            goals: sum("goals"),
            goalInvolvements: sum("goalInvolvements"),
            totalAttempts,
            corners: sum("corners"),
            penaltyKicks: sum("penaltyKicks"),
            freeKicks: sum("freeKicks"),
            throwIns: sum("throwIns"),
            starts: sum("starts"),
            captaincies: sum("captaincies"),
            playerOfTheMatch: sum("playerOfTheMatch"),
          };

    res.json({ season, matches });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, primaryPosition, secondaryPosition, number, email, teamId, skillGroupId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
    if (!skillGroupId) return res.status(400).json({ error: "skillGroupId is required" });

    const positionError = validatePositions(primaryPosition || null, secondaryPosition || null);
    if (positionError) return res.status(400).json({ error: positionError });

    const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
      skillGroupId,
    ]);
    if (!groupRows[0]) return res.status(400).json({ error: "skillGroupId not found" });

    const id = crypto.randomUUID();
    const selfToken = makeSelfToken();
    await pool.query(
      `insert into players (id, name, primary_position, secondary_position, number, email, team_id, self_token, skill_group_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        name.trim(),
        primaryPosition || null,
        secondaryPosition || null,
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
      primaryPosition: primaryPosition || null,
      secondaryPosition: secondaryPosition || null,
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
      `select id, name, primary_position, secondary_position, number, email, team_id, self_token, skill_group_id,
              participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y
       from players where id = $1`,
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Player not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const primaryPosition =
      req.body.primaryPosition !== undefined ? req.body.primaryPosition : existing.primary_position;
    const secondaryPosition =
      req.body.secondaryPosition !== undefined ? req.body.secondaryPosition : existing.secondary_position;
    const positionError = validatePositions(primaryPosition || null, secondaryPosition || null);
    if (positionError) return res.status(400).json({ error: positionError });
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
      `update players set name = $2, primary_position = $3, secondary_position = $4, number = $5, email = $6,
              team_id = $7, participation_level_id = $8, goal_2_3y = $9, goal_1_2y = $10, goal_under_1y = $11,
              skill_group_id = $12
       where id = $1
       returning id, name, primary_position, secondary_position, number, email, team_id, self_token, skill_group_id,
                 participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y`,
      [
        req.params.id,
        name,
        primaryPosition || null,
        secondaryPosition || null,
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
