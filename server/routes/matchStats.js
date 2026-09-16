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
  "minutes", "distanceMi", "avgSpeedMph", "topSpeedMph", "sprints",
  "highIntensityRuns", "passes", "passSuccessPct", "dribbles", "shots",
  "tackles", "interceptions", "looseBallRecoveries", "goalKicks", "fouls",
  "saves", "totalEvents",
];
const COLUMN_TO_DB = {
  minutes: "minutes", distanceMi: "distance_mi", avgSpeedMph: "avg_speed_mph",
  topSpeedMph: "top_speed_mph", sprints: "sprints", highIntensityRuns: "high_intensity_runs",
  passes: "passes", passSuccessPct: "pass_success_pct", dribbles: "dribbles",
  shots: "shots", tackles: "tackles", interceptions: "interceptions",
  looseBallRecoveries: "loose_ball_recoveries", goalKicks: "goal_kicks",
  fouls: "fouls", saves: "saves", totalEvents: "total_events",
};

// The tracking export labels positions with English abbreviations; the app
// tags players with classic formation numbers (1-11, see POSITIONS in
// App.jsx) instead of letters. Maps a file position to the app number(s)
// it plausibly corresponds to, so the review screen can flag a row where
// the file's position doesn't fit any position the matched player is
// tagged with — a cheap sanity check on top of the jersey-number match,
// not a hard rule (a coach may tag a player differently than a one-off
// export labels her that game). CB is kept ambiguous between the classic
// left/right centre-back numbers (4 and 5) since the export doesn't say
// which side.
const FILE_POSITION_TO_APP_NUMBERS = {
  GK: ["1"],
  RB: ["2"],
  LB: ["3"],
  CB: ["4", "5"],
  DM: ["6"],
  DMF: ["6"],
  CDM: ["6"],
  RM: ["7"],
  RW: ["7"],
  CM: ["8"],
  ST: ["9"],
  CF: ["9"],
  CAM: ["10"],
  AM: ["10"],
  OM: ["10"],
  OMF: ["10"],
  LM: ["11"],
  LW: ["11"],
  LWB: ["3"],
  RWB: ["2"],
};

// SUB ("substitute") isn't a position, so it's deliberately absent from
// the map above and never flagged as a mismatch.
function positionMismatch(filePosition, playerPositions) {
  const expected = FILE_POSITION_TO_APP_NUMBERS[String(filePosition || "").toUpperCase()];
  if (!expected || !playerPositions || playerPositions.length === 0) return false;
  return !expected.some((n) => playerPositions.includes(n));
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

    const { rows: players } = await pool.query("select id, name, number, positions from players");
    const byNumber = new Map(players.filter((p) => p.number).map((p) => [p.number, p]));

    const preview = parsed.rows.map((row) => {
      const match = byNumber.get(row.playerNumber) || null;
      return {
        fileNumber: row.playerNumber,
        filePosition: row.position,
        fileName: row.name,
        matchedPlayerId: match ? match.id : null,
        matchedPlayerName: match ? match.name : null,
        positionMismatch: match ? positionMismatch(row.position, match.positions) : false,
        stats: row.stats,
        extra: row.extra,
      };
    });

    res.json({ rows: preview, skipped: parsed.skipped, allPlayers: players });
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
