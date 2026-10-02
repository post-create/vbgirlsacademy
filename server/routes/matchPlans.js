const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

async function getPerformanceMap(matchPlanId) {
  const { rows } = await pool.query(
    "select player_id, score from match_performance where match_plan_id = $1",
    [matchPlanId]
  );
  const map = {};
  rows.forEach((r) => {
    map[r.player_id] = r.score;
  });
  return map;
}

function toOut(row, performanceScores) {
  return {
    id: row.id,
    division: row.division || "",
    opponent: row.opponent || "",
    date: row.date,
    teamGoals: row.team_goals,
    defense: row.defense,
    conquest: row.conquest,
    buildUp: row.build_up,
    finishing: row.finishing,
    extras: row.extras,
    generalNotes: row.general_notes || "",
    playerGoals: row.player_goals,
    positions: row.positions,
    formation: row.formation || "",
    positions2: row.positions2,
    formation2: row.formation2 || "",
    reserves: row.reserves,
    performanceScores: performanceScores || {},
    shareToken: row.share_token || null,
    updatedAt: row.updated_at,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select id, division, opponent, to_char(match_date, 'YYYY-MM-DD') as date, updated_at
       from match_plans order by match_date desc, updated_at desc`
    );
    // Performance scores now live in their own table (see schema.sql for
    // why), keyed by (match_plan_id, player_id) — pull them all in one query
    // and group in memory rather than joining per row.
    const { rows: perf } = await pool.query(
      "select match_plan_id, player_id, score from match_performance"
    );
    const perfByPlan = {};
    perf.forEach((r) => {
      if (!perfByPlan[r.match_plan_id]) perfByPlan[r.match_plan_id] = {};
      perfByPlan[r.match_plan_id][r.player_id] = r.score;
    });
    res.json(
      rows.map((r) => ({
        id: r.id,
        division: r.division || "",
        opponent: r.opponent || "Uden navn",
        date: r.date,
        performanceScores: perfByPlan[r.id] || {},
        updatedAt: r.updated_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Per-player average tracking stats across every match_stats row they have,
// regardless of which match plan it came from — used by Kampscore (see
// KampPerformanceView) alongside the coach rating to show who's actually
// performing well right now. Registered before /:id so "stats-summary"
// isn't swallowed as a plan id.
router.get("/stats-summary", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select player_id,
              avg(pass_success_pct) as avg_pass_success_pct,
              avg(high_intensity_runs) as avg_high_intensity_runs,
              avg(distance_km) as avg_distance_km,
              avg(dribbles) as avg_dribbles,
              avg(tackles) as avg_tackles,
              count(*) as games
       from match_stats
       group by player_id`
    );
    const summary = {};
    // pg returns numeric/bigint aggregates as strings, not JS numbers.
    rows.forEach((r) => {
      summary[r.player_id] = {
        avgPassSuccessPct: r.avg_pass_success_pct != null ? Number(r.avg_pass_success_pct) : null,
        avgHighIntensityRuns:
          r.avg_high_intensity_runs != null ? Number(r.avg_high_intensity_runs) : null,
        avgDistanceKm: r.avg_distance_km != null ? Number(r.avg_distance_km) : null,
        avgDribbles: r.avg_dribbles != null ? Number(r.avg_dribbles) : null,
        avgTackles: r.avg_tackles != null ? Number(r.avg_tackles) : null,
        games: Number(r.games),
      };
    });
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select id, division, opponent, to_char(match_date, 'YYYY-MM-DD') as date, team_goals, defense,
              conquest, build_up, finishing, extras, general_notes, player_goals, positions,
              formation, positions2, formation2, reserves, share_token, updated_at
       from match_plans where id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Match plan not found" });
    const performanceScores = await getPerformanceMap(req.params.id);
    res.json(toOut(rows[0], performanceScores));
  } catch (err) {
    next(err);
  }
});

// Mints (or returns the existing) share token for this plan — the public,
// unauthenticated link a coach sends players (see server/routes/
// matchPlanShare.js, which looks tokens up and enforces the "through the
// day after the match" cutoff). Idempotent: repeat clicks on "generér
// spillerlink" just return the same token rather than invalidating an
// already-shared link.
router.post("/:id/share", async (req, res, next) => {
  try {
    const { rows } = await pool.query("select share_token from match_plans where id = $1", [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "Match plan not found" });
    let token = rows[0].share_token;
    if (!token) {
      token = crypto.randomBytes(24).toString("hex");
      await pool.query("update match_plans set share_token = $2 where id = $1", [
        req.params.id,
        token,
      ]);
    }
    res.json({ shareToken: token });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const id = crypto.randomUUID();
    // Note: performance scores are deliberately not accepted here — a newly
    // created plan (including one started as a copy of another) always
    // starts with zero rows in match_performance. See schema.sql.
    const { rows } = await pool.query(
      `insert into match_plans (
         id, division, opponent, match_date, team_goals, defense, conquest, build_up, finishing,
         extras, general_notes, player_goals, positions, formation, positions2, formation2, reserves
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       returning id, division, opponent, to_char(match_date, 'YYYY-MM-DD') as date, team_goals, defense,
                 conquest, build_up, finishing, extras, general_notes, player_goals, positions,
                 formation, positions2, formation2, reserves, updated_at`,
      [
        id,
        b.division || "",
        b.opponent || "",
        b.date || new Date().toISOString().slice(0, 10),
        JSON.stringify(b.teamGoals || [""]),
        JSON.stringify(b.defense || []),
        JSON.stringify(b.conquest || []),
        JSON.stringify(b.buildUp || []),
        JSON.stringify(b.finishing || []),
        JSON.stringify(b.extras || []),
        b.generalNotes || "",
        JSON.stringify(b.playerGoals || {}),
        JSON.stringify(b.positions || []),
        b.formation || "",
        JSON.stringify(b.positions2 || []),
        b.formation2 || "",
        JSON.stringify(b.reserves || []),
      ]
    );
    res.status(201).json(toOut(rows[0], {}));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query("select * from match_plans where id = $1", [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: "Match plan not found" });
    const existing = current.rows[0];
    const b = req.body || {};

    const pick = (key, column, transform) =>
      b[key] !== undefined ? (transform ? transform(b[key]) : b[key]) : existing[column];

    const division = pick("division", "division");
    const opponent = pick("opponent", "opponent");
    const date = pick("date", "match_date");
    const teamGoals = JSON.stringify(pick("teamGoals", "team_goals"));
    const defense = JSON.stringify(pick("defense", "defense"));
    const conquest = JSON.stringify(pick("conquest", "conquest"));
    const buildUp = JSON.stringify(pick("buildUp", "build_up"));
    const finishing = JSON.stringify(pick("finishing", "finishing"));
    const extras = JSON.stringify(pick("extras", "extras"));
    const generalNotes = pick("generalNotes", "general_notes");
    const playerGoals = JSON.stringify(pick("playerGoals", "player_goals"));
    const positions = JSON.stringify(pick("positions", "positions"));
    const formation = pick("formation", "formation");
    const positions2 = JSON.stringify(pick("positions2", "positions2"));
    const formation2 = pick("formation2", "formation2");
    const reserves = JSON.stringify(pick("reserves", "reserves"));
    // Performance scores are not part of this update — they're written one
    // player at a time via PUT /:id/performance/:playerId instead.

    const { rows } = await pool.query(
      `update match_plans set
         division = $2, opponent = $3, match_date = $4, team_goals = $5, defense = $6, conquest = $7,
         build_up = $8, finishing = $9, extras = $10, general_notes = $11, player_goals = $12,
         positions = $13, formation = $14, positions2 = $15, formation2 = $16, reserves = $17,
         updated_at = now()
       where id = $1
       returning id, division, opponent, to_char(match_date, 'YYYY-MM-DD') as date, team_goals, defense,
                 conquest, build_up, finishing, extras, general_notes, player_goals, positions,
                 formation, positions2, formation2, reserves, updated_at`,
      [
        req.params.id,
        division,
        opponent,
        date,
        teamGoals,
        defense,
        conquest,
        buildUp,
        finishing,
        extras,
        generalNotes,
        playerGoals,
        positions,
        formation,
        positions2,
        formation2,
        reserves,
      ]
    );
    const performanceScores = await getPerformanceMap(req.params.id);
    res.json(toOut(rows[0], performanceScores));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from match_plans where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// A coach's 1-5 rating of one player's performance in one match. Upserts on
// a numeric score, deletes the row when score is null (matches the
// click-again-to-clear pattern used for scores elsewhere in the app).
router.put("/:planId/performance/:playerId", async (req, res, next) => {
  try {
    const { planId, playerId } = req.params;
    const score = req.body?.score;

    if (score === null || score === undefined) {
      await pool.query(
        "delete from match_performance where match_plan_id = $1 and player_id = $2",
        [planId, playerId]
      );
      return res.status(204).end();
    }

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ error: "score must be an integer between 1 and 5" });
    }

    await pool.query(
      `insert into match_performance (match_plan_id, player_id, score)
       values ($1, $2, $3)
       on conflict (match_plan_id, player_id) do update set score = excluded.score`,
      [planId, playerId, score]
    );
    res.status(200).json({ playerId, score });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
