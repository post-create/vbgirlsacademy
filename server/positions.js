// The fixed 1-11 formation-slot catalog — id, Danish label and
// abbreviation never change (mirrors what coaches already use when
// filling in a Kampplan's formation; see KpPositionTable in App.jsx — 4/5
// intentionally share a label since the app doesn't distinguish "which
// side" beyond the number itself; 7 and 11 do each have their own side —
// 7 left, 11 right). The coach-editable parts (which English import
// abbreviations map to a slot, and its characteristics description) live
// in the position_settings table instead — see server/db/schema.sql and
// server/routes/positionSettings.js.
const POSITIONS = [
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

const BY_ID = new Map(POSITIONS.map((p) => [p.id, p]));

function positionLabel(id) {
  const p = BY_ID.get(id);
  return p ? `${p.label} (${p.abbr})` : null;
}

module.exports = { POSITIONS, positionLabel };
