// Canonical 1-11 formation-slot position catalog — the client-side mirror
// of server/positions.js (the two runtimes don't share a bundle, so this
// list is kept in sync by hand; only id/label/abbr are needed here, the
// server also carries a characteristics blurb used in AI-generated plans).
export const POSITION_CATALOG = [
  { id: "1", label: "Målvogter", abbr: "MV" },
  { id: "2", label: "Højre back", abbr: "HB" },
  { id: "3", label: "Venstre back", abbr: "VB" },
  { id: "4", label: "Midterforsvarer", abbr: "CB" },
  { id: "5", label: "Midterforsvarer", abbr: "CB" },
  { id: "6", label: "Defensiv midtbane", abbr: "DM" },
  { id: "7", label: "Venstre kant/midtbane", abbr: "VM" },
  { id: "8", label: "Central midtbane", abbr: "CM" },
  { id: "9", label: "Angriber", abbr: "ST" },
  { id: "10", label: "Offensiv midtbane", abbr: "OM" },
  { id: "11", label: "Højre kant/midtbane", abbr: "HM" },
];

const POSITION_BY_ID = new Map(POSITION_CATALOG.map((p) => [p.id, p]));

export function positionLabel(id) {
  const p = POSITION_BY_ID.get(id);
  return p ? `${p.id} · ${p.label}` : null;
}

// Combined primary/secondary display used everywhere a player's position is
// shown in the app — just the formation numbers ("Primær: 2 · Sekundær: 3"),
// no label text; the dropdowns are the only place that spell out what a
// number means. Returns null when neither is set so callers can supply
// their own "not set" copy.
export function formatPlayerPositions(player) {
  if (!player.primaryPosition) return null;
  return player.secondaryPosition
    ? `Primær: ${player.primaryPosition} · Sekundær: ${player.secondaryPosition}`
    : `Primær: ${player.primaryPosition}`;
}
