import React, { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import * as api from "./api.js";
import { POSITION_CATALOG } from "./positions.js";

// Lineup pitch for the Kampplan: a formation is a set of slots (a 1-11
// position number at an x/y spot, both 0-100, y=0 the opponent's goal), and
// a Kampplan's `positions` rows are just { position, name } — so the pitch is
// a *view* of those rows, never a second copy of them. Rows are matched to
// slots by number (first unclaimed row with that number takes the slot, in
// slot order), and every edit on the pitch is written straight back as
// plain rows, so the tables, print and individual goals keep working
// unchanged.

// A Kampplan stores a formation's *name*, and older plans say "4-4-2" where
// the catalog says "1-4-4-2" — this must stay in step with
// normalizeFormationName in server/routes/formations.js.
export function normalizeFormationName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/^1-/, "");
}

export function findFormation(formations, name) {
  const wanted = normalizeFormationName(name);
  if (!wanted) return null;
  return (formations || []).find((f) => normalizeFormationName(f.name) === wanted) || null;
}

const PITCH_RATIO = 1.25; // pitch height / width
const MARKER = 38;

const ui = {
  input: {
    flex: 1,
    minWidth: 140,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 14,
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 14,
    fontFamily: "inherit",
    background: "#FFFFFF",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#111111",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  ghostBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "1px solid #D9D4C7",
    color: "#1A1A1A",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  dangerBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "1px solid #E2231A",
    color: "#E2231A",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#6B6B6B",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sub: { color: "#6B6B6B", fontSize: 14, margin: "4px 0 0" },
  error: {
    background: "#F4E0DD",
    color: "#8A3A31",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
};

// "Amalie Hyldtoft Søgaard" -> "Amalie S." — the full name doesn't fit
// under a marker, and the full name is in the tooltip.
function shortName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || "";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// ---------------------------------------------------------------------
// Pitch drawing

function PitchLines() {
  const stripes = [];
  const bands = 8;
  for (let i = 0; i < bands; i += 2) {
    stripes.push(
      <rect key={i} x="0" y={(i * 125) / bands} width="100" height={125 / bands} fill="#44995A" />
    );
  }
  const line = { stroke: "rgba(255,255,255,0.85)", strokeWidth: 0.7, fill: "none" };
  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="100" height="125" fill="#3B8A4D" />
      {stripes}
      <rect x="3" y="3" width="94" height="119" {...line} />
      <line x1="3" y1="62.5" x2="97" y2="62.5" {...line} />
      <circle cx="50" cy="62.5" r="11" {...line} />
      <circle cx="50" cy="62.5" r="0.9" fill="rgba(255,255,255,0.85)" />
      <rect x="24" y="3" width="52" height="20" {...line} />
      <rect x="38" y="3" width="24" height="8" {...line} />
      <circle cx="50" cy="16" r="0.9" fill="rgba(255,255,255,0.85)" />
      <rect x="24" y="102" width="52" height="20" {...line} />
      <rect x="38" y="114" width="24" height="8" {...line} />
      <circle cx="50" cy="109" r="0.9" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

// `innerRef` is the pitch box itself, so the formation editor can turn a
// pointer position into the same x/y percentages the slots are stored in.
function PitchSurface({ children, innerRef, maxWidth = 420 }) {
  return (
    <div style={{ width: "100%", maxWidth, margin: "0 auto" }}>
      <div
        ref={innerRef}
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: `${PITCH_RATIO * 100}%`,
          borderRadius: 10,
          overflow: "hidden",
          background: "#3B8A4D",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <PitchLines />
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function SlotMarker({ slot, name, highlight, selected, draggable, tappable, handlers, small }) {
  const size = small ? 22 : MARKER;
  const filled = Boolean(name);
  return (
    <div
      {...handlers}
      title={name || undefined}
      style={{
        position: "absolute",
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: filled ? "#E2231A" : "rgba(255,255,255,0.12)",
        border: filled ? "2px solid #FFFFFF" : "2px dashed rgba(255,255,255,0.85)",
        boxShadow: selected
          ? "0 0 0 3px #F5C518"
          : highlight
          ? "0 0 0 3px rgba(245,197,24,0.8)"
          : filled
          ? "0 1px 4px rgba(0,0,0,0.35)"
          : "none",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: small ? 11 : 15,
        fontFamily: "'Oswald', sans-serif",
        boxSizing: "border-box",
        cursor: draggable ? "grab" : tappable ? "pointer" : "default",
        touchAction: draggable ? "none" : "auto",
      }}
    >
      {slot.position}
      {filled && !small && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 3,
            maxWidth: 82,
            padding: "1px 6px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.62)",
            color: "#FFFFFF",
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
          }}
        >
          {shortName(name)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Lineup model: rows <-> slots

// Rows with no slot to land in (a number the formation doesn't have, or a
// third "8" in a formation with two) stay as `leftover` rather than being
// dropped — they're real lineup entries the coach typed in the table.
function buildModel(slots, rows, reserveObjs) {
  const clean = (rows || []).filter((r) => r.name && r.name.trim());
  const used = new Set();
  const slotNames = slots.map(() => null);
  slots.forEach((s, i) => {
    const k = clean.findIndex((r, idx) => !used.has(idx) && String(r.position) === s.position);
    if (k >= 0) {
      used.add(k);
      slotNames[i] = clean[k].name.trim();
    }
  });
  const leftover = [];
  clean.forEach((r, idx) => {
    if (!used.has(idx)) leftover.push({ ...r, name: r.name.trim() });
  });
  const reserves = (reserveObjs || [])
    .map((r) => (typeof r === "string" ? r : r.name))
    .map((n) => (n || "").trim())
    .filter(Boolean);
  return { slotNames, leftover, reserves };
}

function applyMove(model, slots, source, target) {
  const m = {
    slotNames: [...model.slotNames],
    leftover: [...model.leftover],
    reserves: [...model.reserves],
  };
  const name = source.kind === "slot" ? m.slotNames[source.index] : source.name;
  if (!name) return model;

  const removeFromOrigin = () => {
    if (source.kind === "slot") m.slotNames[source.index] = null;
    else if (source.kind === "leftover") m.leftover = m.leftover.filter((r) => r.name !== name);
    else if (source.kind === "reserve") m.reserves = m.reserves.filter((n) => n !== name);
  };

  if (target.kind === "slot") {
    if (source.kind === "slot" && source.index === target.index) return model;
    const occupant = m.slotNames[target.index];
    removeFromOrigin();
    m.slotNames[target.index] = name;
    if (occupant) {
      // Whoever was displaced goes where the dragged player came from — a
      // straight swap between slots, a bench swap from the reserves. A
      // player pulled in from "other players" just pushes the occupant out.
      if (source.kind === "slot") m.slotNames[source.index] = occupant;
      else if (source.kind === "reserve") m.reserves.push(occupant);
      else if (source.kind === "leftover") {
        m.leftover.push({ position: slots[target.index].position, name: occupant });
      }
    }
  } else if (target.kind === "reserves") {
    if (source.kind === "reserve") return model;
    removeFromOrigin();
    if (!m.reserves.includes(name)) m.reserves.push(name);
  } else if (target.kind === "other") {
    if (source.kind === "other") return model;
    removeFromOrigin();
  }
  return m;
}

function modelToRows(model, slots, useListByName) {
  const positions = [];
  model.slotNames.forEach((name, i) => {
    if (name) {
      positions.push({ position: slots[i].position, name, useList: useListByName.get(name) ?? true });
    }
  });
  model.leftover.forEach((r) => {
    positions.push({ position: r.position, name: r.name, useList: r.useList ?? useListByName.get(r.name) ?? true });
  });
  const reserves = model.reserves.map((name) => ({ name, useList: useListByName.get(name) ?? true }));
  return { positions, reserves };
}

function parseDrop(value) {
  if (!value) return null;
  if (value.startsWith("slot:")) return { kind: "slot", index: Number(value.slice(5)) };
  if (value === "reserves") return { kind: "reserves" };
  if (value === "other") return { kind: "other" };
  return null;
}

function Chip({ name, selected, handlers, draggable }) {
  return (
    <div
      {...handlers}
      title={name}
      // The zone around a chip is itself a tap target; without this the
      // click that follows tapping a chip lands on the zone and cancels the
      // selection the tap just made.
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: "5px 10px",
        borderRadius: 16,
        border: selected ? "2px solid #F5C518" : "1px solid #D9D4C7",
        background: selected ? "#FFF8D6" : "#FFFFFF",
        fontSize: 12,
        fontWeight: 600,
        cursor: draggable ? "grab" : "default",
        touchAction: draggable ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  );
}

function Zone({ label, hint, dropId, hover, onClick, children, maxHeight }) {
  return (
    <div
      data-drop={dropId}
      onClick={onClick}
      style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 10,
        border: hover ? "2px dashed #F5C518" : "1px dashed #C9C3B3",
        background: hover ? "#FFFBE6" : "#FAF9F6",
      }}
    >
      <div style={{ ...ui.label, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight, overflowY: maxHeight ? "auto" : "visible" }}>
        {children}
        {React.Children.count(children) === 0 && <span style={{ fontSize: 12, color: "#8A8A8A" }}>{hint}</span>}
      </div>
    </div>
  );
}

// The pitch for one lineup. Read-only when `onChange` is omitted (the
// player share link); otherwise players can be dragged between slots, the
// reserves and the rest of the squad — or tapped: tap a player, then tap
// where they should go, which is the reliable path on a phone.
export function LineupPitch({ formation, positions, reserves, playerNames, onChange }) {
  const readOnly = !onChange;
  const slots = formation.slots;
  const model = buildModel(slots, positions, reserves);

  const useListByName = new Map();
  (positions || []).forEach((r) => r.name && useListByName.set(r.name.trim(), r.useList !== false));
  (reserves || []).forEach((r) => {
    if (typeof r !== "string" && r.name) useListByName.set(r.name.trim(), r.useList !== false);
  });

  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null); // { label, x, y }
  const [hover, setHover] = useState(null);

  // The window-level pointer listeners below outlive a single render, so
  // they read the current model/onChange through a ref instead of closing
  // over whatever was true when the drag started.
  const live = useRef({});
  live.current = { model, slots, onChange, useListByName };

  const commit = (source, target) => {
    const { model: mdl, slots: sl, onChange: cb, useListByName: ul } = live.current;
    const next = applyMove(mdl, sl, source, target);
    if (next === mdl) return;
    cb(modelToRows(next, sl, ul));
  };

  const sourceName = (source) =>
    source.kind === "slot" ? live.current.model.slotNames[source.index] : source.name;
  const sameSource = (a, b) =>
    a && b && a.kind === b.kind && (a.kind === "slot" ? a.index === b.index : a.name === b.name);

  const tap = (source) => {
    setSelected((cur) => (sameSource(cur, source) ? null : source));
  };

  const dropTargetAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const dropEl = el && el.closest ? el.closest("[data-drop]") : null;
    return dropEl ? dropEl.getAttribute("data-drop") : null;
  };

  const onPointerDown = (e, source) => {
    if (readOnly) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    const label = sourceName(source) || "";

    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
      moved = true;
      setDrag({ label, x: ev.clientX, y: ev.clientY });
      setHover(dropTargetAt(ev.clientX, ev.clientY));
    };
    const finish = (ev, cancelled) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      setDrag(null);
      setHover(null);
      if (cancelled) return;
      if (moved) {
        const target = parseDrop(dropTargetAt(ev.clientX, ev.clientY));
        if (target) commit(source, target);
        setSelected(null);
      } else if (source.kind === "slot" && selected && !sameSource(selected, source)) {
        // A tap on an occupied slot while someone is selected is a "place
        // them here" (a swap), not a new selection.
        commit(selected, { kind: "slot", index: source.index });
        setSelected(null);
      } else {
        tap(source);
      }
    };
    const up = (ev) => finish(ev, false);
    const cancel = (ev) => finish(ev, true);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };

  const tapTarget = (target) => {
    if (readOnly || !selected) return;
    commit(selected, target);
    setSelected(null);
  };

  // Clear a stale selection if the lineup changes underneath it (e.g. the
  // coach edits the table), so a ring never points at an empty slot.
  useEffect(() => {
    if (selected && !sourceName(selected)) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, reserves]);

  const onPitch = new Set([...model.slotNames.filter(Boolean), ...model.leftover.map((r) => r.name), ...model.reserves]);
  const others = (playerNames || []).filter((n) => !onPitch.has(n));

  return (
    <div>
      <PitchSurface>
        {slots.map((slot, i) => {
          const name = model.slotNames[i];
          const isSel = selected && selected.kind === "slot" && selected.index === i;
          // data-drop goes on the marker too: elementFromPoint returns the
          // topmost element, which is the marker, and closest() only walks
          // up through ancestors — the hit area below is a sibling.
          const handlers = readOnly
            ? {}
            : name
            ? { "data-drop": `slot:${i}`, onPointerDown: (e) => onPointerDown(e, { kind: "slot", index: i }) }
            : { "data-drop": `slot:${i}`, onClick: () => tapTarget({ kind: "slot", index: i }) };
          return (
            <React.Fragment key={i}>
              {/* Separate from the marker so a drop a little beside it
                  still counts — the marker alone is a small target. */}
              <div
                data-drop={readOnly ? undefined : `slot:${i}`}
                onClick={readOnly ? undefined : () => tapTarget({ kind: "slot", index: i })}
                style={{
                  position: "absolute",
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: 62,
                  height: 62,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                }}
              />
              <SlotMarker
                slot={slot}
                name={name}
                selected={isSel}
                highlight={hover === `slot:${i}`}
                draggable={!readOnly && Boolean(name)}
                tappable={!readOnly}
                handlers={handlers}
              />
            </React.Fragment>
          );
        })}
      </PitchSurface>

      {!readOnly && (
        <>
          <p style={{ ...ui.sub, fontSize: 12, textAlign: "center", marginTop: 8 }}>
            Træk en spiller til en plads — eller tryk på en spiller og så på pladsen.
          </p>

          <Zone
            label="Reserver"
            hint="Træk spillere hertil"
            dropId="reserves"
            hover={hover === "reserves"}
            onClick={() => tapTarget({ kind: "reserves" })}
          >
            {model.reserves.map((name) => {
              const src = { kind: "reserve", name };
              return (
                <Chip
                  key={name}
                  name={name}
                  draggable
                  selected={sameSource(selected, src)}
                  handlers={{ onPointerDown: (e) => onPointerDown(e, src) }}
                />
              );
            })}
          </Zone>

          {model.leftover.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ ...ui.label, marginBottom: 6 }}>I opstillingen, men uden plads på banen</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {model.leftover.map((r) => {
                  const src = { kind: "leftover", name: r.name };
                  return (
                    <Chip
                      key={r.name}
                      name={`${r.position} · ${r.name}`}
                      draggable
                      selected={sameSource(selected, src)}
                      handlers={{ onPointerDown: (e) => onPointerDown(e, src) }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <Zone
            label="Andre spillere (træk hertil for at tage en spiller ud)"
            hint="Alle spillere er i brug"
            dropId="other"
            hover={hover === "other"}
            onClick={() => tapTarget({ kind: "other" })}
            maxHeight={150}
          >
            {others.map((name) => {
              const src = { kind: "other", name };
              return (
                <Chip
                  key={name}
                  name={name}
                  draggable
                  selected={sameSource(selected, src)}
                  handlers={{ onPointerDown: (e) => onPointerDown(e, src) }}
                />
              );
            })}
          </Zone>
        </>
      )}

      {drag && (
        <div
          style={{
            position: "fixed",
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -140%)",
            padding: "5px 10px",
            borderRadius: 16,
            background: "#111111",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {drag.label}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Formation settings (Indstillinger -> Formationer)

const LINE_XS = {
  1: [50],
  2: [36, 64],
  3: [20, 50, 80],
  4: [13, 37, 63, 87],
  5: [10, 30, 50, 70, 90],
  6: [8, 24, 40, 60, 76, 92],
};

function numbersForLine(n, lineIndex, parts) {
  const k = parts.length;
  const fill = (base, num) => Array.from({ length: n }, (_, j) => base[j] || num);
  if (lineIndex === 0) {
    return fill({ 1: ["5"], 2: ["4", "5"], 3: ["4", "5", "6"], 4: ["3", "4", "5", "2"], 5: ["3", "4", "5", "6", "2"] }[n] || [], "4");
  }
  if (lineIndex === k - 1) {
    return fill({ 1: ["9"], 2: ["9", "9"], 3: ["7", "9", "11"], 4: ["7", "9", "9", "11"] }[n] || [], "9");
  }
  const firstMid = lineIndex === 1;
  const lastMid = lineIndex === k - 2;
  const table = {
    1: firstMid ? ["6"] : ["10"],
    2: firstMid ? ["6", "8"] : ["8", "10"],
    3: lastMid && parts[k - 1] === 1 ? ["7", "10", "11"] : ["8", "6", "8"],
    4: parts[0] === 3 ? ["3", "8", "8", "2"] : ["7", "8", "8", "11"],
    5: ["7", "6", "8", "10", "11"],
  };
  return fill(table[n] || [], "8");
}

// "1-4-2-3-1" (or "4-2-3-1") -> a starting layout: goalkeeper, then one row
// per number. The numbering is a best guess (editable per slot afterwards),
// since which number a back-three or a wing-back "is" is a club convention.
export function generateFormationSlots(name) {
  const parts = String(name || "")
    .trim()
    .replace(/^1-/, "")
    .split("-")
    .map((s) => parseInt(s, 10));
  if (parts.length < 2 || parts.some((n) => !Number.isInteger(n) || n < 1 || n > 6)) return null;
  if (parts.reduce((a, b) => a + b, 0) > 10) return null;
  const k = parts.length;
  const slots = [{ position: "1", x: 50, y: 90 }];
  parts.forEach((n, li) => {
    const y = Math.round((74 - li * (58 / (k - 1))) * 10) / 10;
    const nums = numbersForLine(n, li, parts);
    LINE_XS[n].forEach((x, j) => slots.push({ position: nums[j], x, y }));
  });
  return slots;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;

function FormationEditor({ initial, isNew, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(initial.name);
  const [slots, setSlots] = useState(initial.slots);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const pitchRef = useRef(null);

  const startMove = (e, index) => {
    e.preventDefault();
    setSelected(index);
    const move = (ev) => {
      const r = pitchRef.current.getBoundingClientRect();
      const x = round1(clamp(((ev.clientX - r.left) / r.width) * 100, 4, 96));
      const y = round1(clamp(((ev.clientY - r.top) / r.height) * 100, 5, 95));
      setSlots((prev) => prev.map((s, k) => (k === index ? { ...s, x, y } : s)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const generate = () => {
    const generated = generateFormationSlots(name);
    if (!generated) {
      setError('Skriv navnet som tal adskilt af bindestreg, fx "1-4-3-3" (højst 10 markspillere, 1-6 pr. række).');
      return;
    }
    if (slots.length > 0 && !window.confirm("Det erstatter de nuværende pladser. Fortsæt?")) return;
    setError("");
    setSlots(generated);
    setSelected(null);
  };

  const addSlot = () => {
    if (slots.length >= 11) return;
    const used = new Set(slots.map((s) => s.position));
    const next = POSITION_CATALOG.find((p) => !used.has(p.id))?.id || "8";
    setSlots([...slots, { position: next, x: 50, y: 50 }]);
    setSelected(slots.length);
  };

  const updateSelected = (patch) =>
    setSlots((prev) => prev.map((s, k) => (k === selected ? { ...s, ...patch } : s)));

  const removeSelected = () => {
    setSlots((prev) => prev.filter((_, k) => k !== selected));
    setSelected(null);
  };

  const save = async () => {
    setError("");
    if (!name.trim()) return setError("Formationen skal have et navn.");
    if (slots.length === 0) return setError("Tilføj mindst én plads.");
    setSaving(true);
    try {
      await onSave({ name: name.trim(), slots });
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  const sel = selected != null ? slots[selected] : null;

  return (
    <div style={ui.card}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          style={ui.input}
          value={name}
          placeholder='Navn, fx "1-4-3-3"'
          onChange={(e) => setName(e.target.value)}
        />
        <button style={ui.ghostBtn} onClick={generate} title="Lav en første opstilling ud fra tallene i navnet">
          Generér ud fra navn
        </button>
      </div>

      <PitchSurface innerRef={pitchRef} maxWidth={360}>
        {slots.map((slot, i) => (
          <SlotMarker
            key={i}
            slot={slot}
            name=""
            selected={selected === i}
            draggable
            handlers={{ onPointerDown: (e) => startMove(e, i) }}
          />
        ))}
      </PitchSurface>

      <p style={{ ...ui.sub, fontSize: 12, textAlign: "center" }}>
        Træk pladserne rundt på banen. Tryk på en plads for at ændre dens nummer. Samme nummer kan bruges flere
        gange (fx to 9&apos;ere).
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
        <button style={ui.ghostBtn} onClick={addSlot} disabled={slots.length >= 11}>
          <Plus size={14} /> Tilføj plads
        </button>
        <span style={ui.sub}>{slots.length} pladser</span>
      </div>

      {sel && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={ui.label}>Valgt plads — position</div>
            <select
              style={ui.select}
              value={sel.position}
              onChange={(e) => updateSelected({ position: e.target.value })}
            >
              {POSITION_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.label}
                </option>
              ))}
            </select>
          </div>
          <button style={ui.dangerBtn} onClick={removeSelected}>
            <X size={14} /> Fjern plads
          </button>
        </div>
      )}

      {error && <div style={ui.error}>{error}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={ui.primaryBtn} onClick={save} disabled={saving}>
          {saving ? "Gemmer…" : "Gem"}
        </button>
        <button style={ui.ghostBtn} onClick={onCancel} disabled={saving}>
          Annuller
        </button>
        {!isNew && (
          <button style={{ ...ui.dangerBtn, marginLeft: "auto" }} onClick={onDelete} disabled={saving}>
            Slet formation
          </button>
        )}
      </div>
    </div>
  );
}

export function FormationsSettingsView() {
  const [formations, setFormations] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // formation id | "new" | null

  useEffect(() => {
    api.getFormations().then(setFormations).catch((e) => setError(e.message));
  }, []);

  const save = async (id, draft) => {
    if (id === "new") {
      const created = await api.createFormation(draft);
      setFormations((prev) => [...prev, created]);
    } else {
      const updated = await api.updateFormation(id, draft);
      setFormations((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
    setEditing(null);
  };

  const remove = async (f) => {
    if (
      !window.confirm(
        `Slet formationen ${f.name}? Kampplaner, der bruger den, beholder deres tabel, men viser ikke længere banen.`
      )
    ) {
      return;
    }
    try {
      await api.deleteFormation(f.id);
      setFormations((prev) => prev.filter((x) => x.id !== f.id));
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, letterSpacing: 0.5, margin: 0, color: "#111111" }}>
            Formationer
          </h1>
          <p style={ui.sub}>
            Formationerne bruges til banen under Position &amp; opstilling i en kampplan, og til
            det billede spillerne ser på deres delelink. Hver plads har et positionsnummer (1-11) og et sted på banen.
          </p>
        </div>
        {editing === null && formations && (
          <button style={ui.primaryBtn} onClick={() => setEditing("new")}>
            <Plus size={14} /> Ny formation
          </button>
        )}
      </div>

      {error && <div style={ui.error}>{error}</div>}
      {formations === null && !error && <p style={ui.sub}>Indlæser…</p>}

      {editing === "new" && (
        <FormationEditor
          isNew
          initial={{ name: "", slots: [] }}
          onSave={(draft) => save("new", draft)}
          onCancel={() => setEditing(null)}
        />
      )}

      {(formations || []).map((f) =>
        editing === f.id ? (
          <FormationEditor
            key={f.id}
            initial={f}
            onSave={(draft) => save(f.id, draft)}
            onCancel={() => setEditing(null)}
            onDelete={() => remove(f)}
          />
        ) : (
          <div key={f.id} style={{ ...ui.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 90, flexShrink: 0 }}>
              <PitchSurface maxWidth={90}>
                {f.slots.map((slot, i) => (
                  <SlotMarker key={i} slot={slot} name="x" small handlers={{}} />
                ))}
              </PitchSurface>
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 16 }}>{f.name}</strong>
              <div style={ui.sub}>{f.slots.length} pladser</div>
            </div>
            <button style={ui.ghostBtn} onClick={() => setEditing(f.id)} disabled={editing !== null}>
              Rediger
            </button>
          </div>
        )
      )}
    </div>
  );
}
