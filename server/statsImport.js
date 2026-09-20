const XLSX = require("xlsx");

// The tracking tool exports two shapes we've seen so far: a season-to-date
// file with a text header row ("Player", "Matches", "Shots", ...), and a
// per-match file with no header row at all. Column 0-17 line up identically
// between the two (verified against a goalkeeper's row — Goal kicks and
// Saves land exactly where the headered file's column names say they
// should), so the positional layout below is authoritative; header text,
// when present, is used only to confirm we're reading a compatible file,
// not to remap anything.
//
// Columns 18-31 (assists onward) only exist in a newer version of the
// export ("...NY.ods" in the samples we've seen) — an older per-match file
// simply doesn't have those cells, so they come back null, same as any
// other missing value.
const COLUMNS = [
  "matches", "shots", "totalEvents", "distanceKm", "avgSpeedKmh", "sprints",
  "minutes", "highIntensityRuns", "passes", "passSuccessPct", "dribbles",
  "tackles", "looseBallRecoveries", "interceptions", "goalKicks", "fouls",
  "saves", "topSpeedKmh",
  "assists", "conversionRate", "passesSuccessful", "passesUnsuccessful",
  "goals", "goalInvolvements", "totalAttempts", "corners", "penaltyKicks",
  "freeKicks", "throwIns", "starts", "captaincies", "playerOfTheMatch",
];

// Every field name is stored internally in km/km-h regardless of which
// unit the export used for that row — see parseDistanceOrSpeedCell.
const DISTANCE_SPEED_FIELDS = new Set(["distanceKm", "avgSpeedKmh", "topSpeedKmh"]);
const PERCENT_FIELDS = new Set(["passSuccessPct", "conversionRate"]);

const HEADER_HINTS = ["player", "matches", "shots"];

function isHeaderRow(row) {
  const first = String(row[0] || "").trim().toLowerCase();
  return HEADER_HINTS.includes(first);
}

// Cells arrive as "3,6mi", "72min", "9,5mph" — European decimal comma plus
// a unit suffix baked into the text. Percentages arrive as a 0-1 fraction
// on a plain number (SheetJS already parses the "%"-formatted cell), which
// we rescale to 0-100 to match how percentages are shown everywhere else
// in the app (see PrintableReport, e.g. "Følges op i VEO... 42%").
function parseNumberCell(value, { percent } = {}) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return percent ? Math.round(value * 100 * 100) / 100 : value;
  const cleaned = String(value)
    .replace(",", ".")
    .replace(/[a-z%]+$/i, "")
    .trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

// A newer version of the export ("...NY.ods" in the samples we've seen)
// reports distance/speed in metric ("25,6km", "5,8km/t.") instead of the
// original imperial ("15,9mi", "3,6mph") used by the older export —
// confirmed by diffing the two sample files for the same player: every
// other stat is byte-identical, and 15.9mi * 1.60934 = 25.6km,
// 3.6mph * 1.60934 = 5.8km/h, to the displayed precision. Metric is the
// canonical unit regardless of source, so imperial values are converted
// here and metric ones pass through unchanged — match_stats.distance_km
// etc. always mean km/km-h no matter which export version a file came from.
const MI_TO_KM = 1.60934;
function parseDistanceOrSpeedCell(value) {
  const n = parseNumberCell(value);
  if (n === null) return null;
  const isMetric = /km/i.test(String(value));
  return isMetric ? n : Math.round(n * MI_TO_KM * 10) / 10;
}

// The player cell shows up in at least three layouts depending on which
// export this came from: 3 lines (initials / name / "#N · POS"), 2 lines
// (name / "#N · POS", initials line missing), or all on one line with
// spaces instead of newlines ("AW Agnes Weis #4 · LB"). The "#N · POS"
// chunk is reliably identifiable by regex regardless of layout, so anchor
// on that first and derive the name from whatever's left.
// Rows the tracking device picked up with no roster name attached print as
// "<number>\nJersey #<number>\n–" — no "#N · POS" pattern at all (position
// is a bare "–"), so they simply fail to match and are skipped, per: these
// must never be imported.
function parsePlayerCell(raw) {
  const text = String(raw || "");
  const lines = text.includes("\n") ? text.split("\n").map((s) => s.trim()) : [text.trim()];
  const tail = lines[lines.length - 1] || "";
  const m = tail.match(/#(\d+)\s*·\s*(\S+)\s*$/);
  if (!m) return null;
  const [, number, position] = m;
  if (position === "–" || position === "-") return null;

  let name;
  if (lines.length >= 3) {
    name = lines[lines.length - 2]; // initials / name / "#N · POS"
  } else if (lines.length === 2) {
    name = lines[0]; // name / "#N · POS"
  } else {
    // Single line: strip the trailing "#N · POS" and a leading 2-letter
    // initials token ("AW Agnes Weis #4 · LB" -> "Agnes Weis").
    const withoutTail = tail.slice(0, tail.length - m[0].length).trim();
    name = withoutTail.replace(/^[A-Za-zÆØÅæøå]{2}\s+/, "");
  }
  return { number, position, name: name.trim() };
}

// Returns { rows, skipped } — rows ready to match against players.number;
// skipped counts "Jersey #N" device-only entries filtered out per the
// import rule, purely for the review screen's "N rows skipped" note.
function parseStatsFile(buffer, filename) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) throw new Error("Filen indeholder ikke noget ark, der kunne læses.");
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
  if (!raw.length) throw new Error("Filen ser tom ud.");

  const dataRows = isHeaderRow(raw[0]) ? raw.slice(1) : raw;

  const rows = [];
  let skipped = 0;
  for (const cells of dataRows) {
    if (!cells || !cells[0]) continue;
    const player = parsePlayerCell(cells[0]);
    if (!player) {
      skipped++;
      continue;
    }

    const stats = {};
    COLUMNS.forEach((key, i) => {
      const cellIndex = i + 1; // cells[0] is the player cell
      stats[key] = DISTANCE_SPEED_FIELDS.has(key)
        ? parseDistanceOrSpeedCell(cells[cellIndex])
        : parseNumberCell(cells[cellIndex], { percent: PERCENT_FIELDS.has(key) });
    });

    const extra = {};
    for (let i = COLUMNS.length + 1; i < cells.length; i++) {
      if (cells[i] !== null && cells[i] !== "") extra[`col${i}`] = cells[i];
    }

    rows.push({
      playerNumber: player.number,
      position: player.position,
      name: player.name,
      stats,
      extra,
    });
  }

  return { rows, skipped };
}

module.exports = { parseStatsFile };
