const express = require("express");
const multer = require("multer");
const pool = require("../db");
const { parseStatsFile } = require("../statsImport");

// Mounted at /api/match-plans/:matchPlanId/stats
const router = express.Router({ mergeParams: true });

// Memory storage — these files are tens of KB and never touch disk; parsed
// once, held in a single request, then discarded.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const STAT_COLUMNS = [
  "minutes", "distanceKm", "avgSpeedKmh", "topSpeedKmh", "sprints",
  "highIntensityRuns", "passes", "passSuccessPct", "dribbles", "shots",
  "tackles", "interceptions", "looseBallRecoveries", "goalKicks", "fouls",
  "saves", "totalEvents",
  "assists", "conversionRate", "passesSuccessful", "passesUnsuccessful",
  "goals", "goalInvolvements", "totalAttempts", "corners", "penaltyKicks",
  "freeKicks", "throwIns", "starts", "captaincies", "playerOfTheMatch",
];
const COLUMN_TO_DB = {
  minutes: "minutes", distanceKm: "distance_km", avgSpeedKmh: "avg_speed_kmh",
  topSpeedKmh: "top_speed_kmh", sprints: "sprints", highIntensityRuns: "high_intensity_runs",
  passes: "passes", passSuccessPct: "pass_success_pct", dribbles: "dribbles",
  shots: "shots", tackles: "tackles", interceptions: "interceptions",
  looseBallRecoveries: "loose_ball_recoveries", goalKicks: "goal_kicks",
  fouls: "fouls", saves: "saves", totalEvents: "total_events",
  assists: "assists", conversionRate: "conversion_rate",
  passesSuccessful: "passes_successful", passesUnsuccessful: "passes_unsuccessful",
  goals: "goals", goalInvolvements: "goal_involvements", totalAttempts: "total_attempts",
  corners: "corners", penaltyKicks: "penalty_kicks", freeKicks: "free_kicks",
  throwIns: "throw_ins", starts: "starts", captaincies: "captaincies",
  playerOfTheMatch: "player_of_the_match",
};

// { id: [alias, ...] } for every formation slot, straight from the
// coach-editable position_settings table (see server/routes/positionSettings.js)
// — Positionsopsætning under Indstillinger is where a coach links English
// import abbreviations like "RM"/"LB" to a Danish position number.
async function loadPositionAliases() {
  const { rows } = await pool.query("select id, aliases from position_settings");
  return new Map(rows.map((r) => [r.id, (r.aliases || []).map((a) => a.toUpperCase())]));
}

// The tracking export labels positions with English abbreviations; the app
// tags each player with a primary/secondary formation number (1-11, see
// server/positions.js) instead of letters. Flags a row where the file's
// position doesn't fit either position the matched player is tagged with —
// a cheap sanity check on top of the jersey-number match, not a hard rule
// (a coach may tag a player differently than a one-off export labels her
// that game). Only flags a mismatch when some position's alias list
// actually recognises the file's term — an export using a term no coach
// has linked to any position (e.g. "SUB") is silently allowed through
// rather than treated as always wrong.
function positionMismatch(filePosition, playerPositions, aliasesById) {
  if (!filePosition || !playerPositions || playerPositions.length === 0) return false;
  const term = String(filePosition).toUpperCase();
  const recognised = [...aliasesById.values()].some((aliases) => aliases.includes(term));
  if (!recognised) return false;
  return !playerPositions.some((id) => (aliasesById.get(id) || []).includes(term));
}

function rowOut(row) {
  const out = {
    playerId: row.player_id,
    playerNumber: row.player_number,
    position: row.position || "",
    updatedAt: row.updated_at,
    extra: row.extra || {},
  };
  STAT_COLUMNS.forEach((key) => {
    out[key] = row[COLUMN_TO_DB[key]];
  });
  return out;
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select ms.*, p.name as player_name
       from match_stats ms join players p on p.id = ms.player_id
       where ms.match_plan_id = $1
       order by p.name`,
      [req.params.matchPlanId]
    );
    res.json(rows.map((r) => ({ ...rowOut(r), playerName: r.player_name })));
  } catch (err) {
    next(err);
  }
});

// Clears every stat row for this match — e.g. the wrong file got uploaded
// and committed. Re-uploading afterward is a normal commit (upsert), so
// this is only needed to get back to a clean slate first, not as part of
// the regular correct-a-mistake flow.
router.delete("/", async (req, res, next) => {
  try {
    await pool.query("delete from match_stats where match_plan_id = $1", [req.params.matchPlanId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Parses the uploaded file and matches each row to a roster player by
// jersey number — nothing is written to the database here. The coach
// reviews the result (including any unmatched numbers) and only rows
// confirmed via POST /commit are actually saved.
router.post("/parse", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Ingen fil modtaget." });

    let parsed;
    try {
      parsed = parseStatsFile(req.file.buffer, req.file.originalname);
    } catch (e) {
      return res.status(400).json({ error: "Kunne ikke læse filen: " + e.message });
    }

    const [{ rows: players }, aliasesById] = await Promise.all([
      pool.query("select id, name, number, primary_position, secondary_position from players"),
      loadPositionAliases(),
    ]);
    const byNumber = new Map(players.filter((p) => p.number).map((p) => [p.number, p]));

    const preview = parsed.rows.map((row) => {
      const match = byNumber.get(row.playerNumber) || null;
      const matchPositions = match
        ? [match.primary_position, match.secondary_position].filter(Boolean)
        : [];
      return {
        fileNumber: row.playerNumber,
        filePosition: row.position,
        fileName: row.name,
        matchedPlayerId: match ? match.id : null,
        matchedPlayerName: match ? match.name : null,
        positionMismatch: match ? positionMismatch(row.position, matchPositions, aliasesById) : false,
        stats: row.stats,
        extra: row.extra,
      };
    });

    // positionAliases is sent along so the client can recompute mismatches
    // live if the coach re-matches a row to a different player — the flag
    // above is only ever right at parse time.
    res.json({
      rows: preview,
      skipped: parsed.skipped,
      allPlayers: players,
      positionAliases: Object.fromEntries(aliasesById),
    });
  } catch (err) {
    next(err);
  }
});

// Body: { rows: [{ playerId, stats: {...}, extra: {...} }] } — normally the
// (possibly coach-corrected) result of /parse, sent back once confirmed.
// Upserts, so re-uploading a corrected file for the same match just
// updates the existing rows rather than duplicating them.
router.post("/commit", async (req, res, next) => {
  try {
    const rows = req.body?.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Ingen rækker at gemme." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const row of rows) {
        if (!row.playerId) continue; // still unmatched — coach chose to skip it
        const cols = ["match_plan_id", "player_id", "player_number", "position"];
        const values = [req.params.matchPlanId, row.playerId, row.fileNumber || "", row.filePosition || ""];
        STAT_COLUMNS.forEach((key) => {
          cols.push(COLUMN_TO_DB[key]);
          values.push(row.stats?.[key] ?? null);
        });
        cols.push("extra");
        values.push(JSON.stringify(row.extra || {}));

        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const updates = cols
          .filter((c) => c !== "match_plan_id" && c !== "player_id")
          .map((c) => `${c} = excluded.${c}`)
          .join(", ");

        await client.query(
          `insert into match_stats (${cols.join(", ")}) values (${placeholders})
           on conflict (match_plan_id, player_id) do update set ${updates}, updated_at = now()`,
          values
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const { rows: saved } = await pool.query(
      `select ms.*, p.name as player_name
       from match_stats ms join players p on p.id = ms.player_id
       where ms.match_plan_id = $1
       order by p.name`,
      [req.params.matchPlanId]
    );
    res.status(201).json(saved.map((r) => ({ ...rowOut(r), playerName: r.player_name })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
