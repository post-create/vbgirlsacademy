import React, { useState, useEffect, useCallback } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  Settings,
  ChevronLeft,
  Plus,
  X,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Shield,
  GitCompare,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  CalendarRange,
  Layers,
  ClipboardList,
  ChevronRight,
  Link2,
  Copy,
  Check,
  Lock,
  Printer,
} from "lucide-react";

const STORAGE_KEY = "academy-data";

const LOGO_SRC =
  "data:image/png;base64,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";

const CATEGORY_META = [
  { key: "technique", label: "Teknik", accent: "#E2231A", short: "TEK" },
  { key: "physical", label: "Fysisk", accent: "#1A1A1A", short: "FYS" },
  { key: "tactical", label: "Taktik", accent: "#5C6B73", short: "TAK" },
  { key: "mental", label: "Mentalt", accent: "#C9A24B", short: "MEN" },
];

const DEFAULT_SKILLS = {
  technique: ["Boldkontrol", "Afleveringer", "Driblinger", "Afslutninger", "Førsteberøring", "Indlæg"],
  physical: ["Hurtighed", "Styrke", "Udholdenhed", "Smidighed", "Balance", "Eksplosivitet"],
  tactical: ["Positionering", "Beslutningstagning", "Overblik", "Samarbejde", "Forsvarsspil", "Bevægelse uden bold"],
  mental: ["Selvtillid", "Ro", "Målrettethed", "Disciplin", "Kommunikation", "Lederskab"],
};

const POSITIONS = [
  "MV",
  "CB",
  "VB",
  "HB",
  "VWB",
  "HWB",
  "DM",
  "CM",
  "OM",
  "VM",
  "HM",
  "VK",
  "HK",
  "CF",
  "ST",
];

const EVAL_COLORS = ["#4A4A4A", "#E2231A"];
const GOAL_COLOR = "#1A1A1A";

function makeDefaultConfig() {
  const config = {};
  CATEGORY_META.forEach(({ key }) => {
    config[key] = DEFAULT_SKILLS[key].map((name, i) => ({
      id: `${key}-${i}`,
      name,
      enabled: true,
    }));
  });
  return config;
}

function scoreColor(v) {
  if (v == null) return "#D9D4C7";
  const colors = { 1: "#B5493F", 2: "#C9803F", 3: "#C9A24B", 4: "#7C9A5C", 5: "#2F5D46" };
  return colors[v] || "#D9D4C7";
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeToken() {
  return uid() + uid();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("da-DK", { month: "short", day: "numeric", year: "numeric" });
}

function findSkillMeta(config, skillId) {
  for (const cat of CATEGORY_META) {
    const skill = (config[cat.key] || []).find((s) => s.id === skillId);
    if (skill) return { skill, category: cat };
  }
  return null;
}

function categoryAverage(config, scores, catKey) {
  const skills = (config[catKey] || []).filter((s) => s.enabled);
  if (skills.length === 0) return null;
  const vals = skills.map((s) => scores?.[s.id]).filter((v) => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function overallAverage(config, scores) {
  const cats = CATEGORY_META.map((c) => categoryAverage(config, scores, c.key)).filter(
    (v) => v != null
  );
  if (cats.length === 0) return null;
  return cats.reduce((a, b) => a + b, 0) / cats.length;
}

function categoryGoalAverage(config, goals, catKey) {
  const skillIds = (config[catKey] || []).map((s) => s.id);
  const targets = skillIds.map((id) => goals?.[id]?.target).filter((v) => typeof v === "number");
  if (targets.length === 0) return null;
  return targets.reduce((a, b) => a + b, 0) / targets.length;
}

function categoryTotal(config, scores, catKey) {
  const skills = (config[catKey] || []).filter((s) => s.enabled);
  const total = skills.reduce((sum, s) => sum + (scores?.[s.id] || 0), 0);
  const avg = skills.length ? total / skills.length : 0;
  return { total, avg, count: skills.length };
}

function migrateData(raw) {
  const empty = {
    config: makeDefaultConfig(),
    players: [],
    periods: [],
    evaluations: {},
    goals: {},
    teams: [],
  };
  if (!raw) return empty;

  if (raw.periods) {
    return {
      config: raw.config || makeDefaultConfig(),
      players: raw.players || [],
      periods: raw.periods || [],
      evaluations: raw.evaluations || {},
      goals: raw.goals || {},
      teams: raw.teams || [],
    };
  }

  const periods = [];
  const evaluations = {};
  const findOrCreatePeriod = (label, date) => {
    let p = periods.find((pp) => pp.label === label && pp.date === date);
    if (!p) {
      p = { id: uid(), label: label || "Evaluering", date: date || todayStr() };
      periods.push(p);
    }
    return p.id;
  };

  if (raw.evaluations) {
    Object.keys(raw.evaluations).forEach((playerId) => {
      evaluations[playerId] = {};
      (raw.evaluations[playerId] || []).forEach((ev) => {
        const pid = findOrCreatePeriod(ev.label, ev.date);
        evaluations[playerId][pid] = { scores: ev.scores || {} };
      });
    });
  } else if (raw.scores) {
    const pid = findOrCreatePeriod("Evaluering 1", todayStr());
    Object.keys(raw.scores).forEach((playerId) => {
      evaluations[playerId] = { [pid]: { scores: raw.scores[playerId] || {} } };
    });
  }

  periods.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return {
    config: raw.config || makeDefaultConfig(),
    players: raw.players || [],
    periods,
    evaluations,
    goals: raw.goals || {},
    teams: raw.teams || [],
  };
}

function sortedPeriods(periods) {
  return [...(periods || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function getPlayerScores(data, playerId, periodId) {
  return data.evaluations?.[playerId]?.[periodId]?.scores || {};
}

function getLatestScoredPeriod(data, playerId) {
  const periods = sortedPeriods(data.periods);
  for (let i = periods.length - 1; i >= 0; i--) {
    const scores = getPlayerScores(data, playerId, periods[i].id);
    if (Object.keys(scores).length > 0) return periods[i];
  }
  return periods.length ? periods[periods.length - 1] : null;
}

function getUrlToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("player")) return params.get("player");
    const hash = window.location.hash.replace("#", "");
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get("player")) return hashParams.get("player");
  } catch (e) {
    /* ignore */
  }
  return null;
}

function CategoryAxisTick({ x, y, cx, cy, payload, index, onSelect }) {
  const cat = CATEGORY_META[index];
  if (!cat) return null;
  const anchor = x > cx + 2 ? "start" : x < cx - 2 ? "end" : "middle";
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      fill="#1A1A1A"
      fontSize={12}
      fontFamily="'Oswald', sans-serif"
      fontWeight={700}
      style={{ cursor: onSelect ? "pointer" : "default" }}
      onClick={() => onSelect && onSelect(cat.key)}
    >
      {payload.value}
    </text>
  );
}

function SkillDrilldownRadar({ config, catKey, scores, goals, onClose }) {
  const cat = CATEGORY_META.find((c) => c.key === catKey);
  if (!cat) return null;
  const skills = (config[catKey] || []).filter((s) => s.enabled);
  const data = skills.map((s) => ({
    subject: s.name,
    value: scores?.[s.id] || 0,
    goal: goals?.[s.id]?.target || 0,
  }));
  const hasAnyGoal = skills.some((s) => goals?.[s.id]?.target);

  return (
    <div style={styles.radarCard}>
      <div style={styles.drilldownHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ ...styles.dot, background: cat.accent }} />
          <span style={styles.categoryLabel}>{cat.label} — detaljer</span>
        </div>
        <button style={styles.iconBtnGhost} onClick={onClose} title="Luk">
          <X size={16} />
        </button>
      </div>
      {skills.length === 0 ? (
        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data} outerRadius="65%">
            <PolarGrid stroke="#D9D4C7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#1A1A1A", fontSize: 11, fontFamily: "'Inter', sans-serif" }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={cat.accent}
              fill={cat.accent}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            {hasAnyGoal && (
              <Radar
                name="Mål"
                dataKey="goal"
                stroke={GOAL_COLOR}
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 4"
                isAnimationActive={false}
              />
            )}
            {hasAnyGoal && (
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
            )}
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function PositionPicker({ selected, onToggle }) {
  return (
    <div style={styles.positionGrid}>
      {POSITIONS.map((pos) => {
        const active = selected.includes(pos);
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onToggle(pos)}
            style={{
              ...styles.positionChip,
              background: active ? "#111111" : "#FFFFFF",
              color: active ? "#FFFFFF" : "#1A1A1A",
              borderColor: active ? "#111111" : "#D9D4C7",
            }}
          >
            {pos}
          </button>
        );
      })}
    </div>
  );
}

function ClubHeader({ view, setView, setSelectedId }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerTopBar}>
        <div style={styles.headerTopRow}>
          <div style={styles.brand}>
            <span style={styles.brandText}>VB PIGE AKADEMI</span>
            <span style={styles.brandSub}>Spillerudvikling</span>
          </div>
          <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
        </div>
      </div>
      <div style={styles.headerNavBar}>
        <nav style={styles.nav}>
          <button
            onClick={() => {
              setView("roster");
              setSelectedId(null);
            }}
            style={{
              ...styles.navBtn,
              ...(view === "roster" || view === "player" ? styles.navBtnActive : {}),
            }}
          >
            <Users size={16} />
            <span>Spillertrup</span>
          </button>
          <button
            onClick={() => setView("coaches")}
            style={{ ...styles.navBtn, ...(view === "coaches" ? styles.navBtnActive : {}) }}
          >
            <ClipboardList size={16} />
            <span>Trænere</span>
          </button>
          <button
            onClick={() => setView("teams")}
            style={{ ...styles.navBtn, ...(view === "teams" ? styles.navBtnActive : {}) }}
          >
            <Layers size={16} />
            <span>Hold</span>
          </button>
          <button
            onClick={() => setView("periods")}
            style={{ ...styles.navBtn, ...(view === "periods" ? styles.navBtnActive : {}) }}
          >
            <CalendarRange size={16} />
            <span>Perioder</span>
          </button>
          <button
            onClick={() => setView("settings")}
            style={{ ...styles.navBtn, ...(view === "settings" ? styles.navBtnActive : {}) }}
          >
            <Settings size={16} />
            <span>Kriterier</span>
          </button>
        </nav>
      </div>
      <div style={styles.headerStripes} />
    </header>
  );
}

export default function AcademyApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [view, setView] = useState("roster");
  const [selectedId, setSelectedId] = useState(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPositions, setNewPositions] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [newTeamId, setNewTeamId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [urlToken] = useState(getUrlToken);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        let migrated;
        if (result && result.value) {
          migrated = migrateData(JSON.parse(result.value));
        } else {
          migrated = {
            config: makeDefaultConfig(),
            players: [],
            periods: [],
            evaluations: {},
                    goals: {},
            teams: [],
          };
        }
        let needsSave = !result || !result.value;
        const players = migrated.players.map((p) => {
          if (!p.selfToken) {
            needsSave = true;
            return { ...p, selfToken: makeToken() };
          }
          return p;
        });
        migrated = { ...migrated, players };
        setData(migrated);
        if (needsSave) {
          await window.storage.set(STORAGE_KEY, JSON.stringify(migrated), true);
        }
      } catch (e) {
        setData({
          config: makeDefaultConfig(),
          players: [],
          periods: [],
          evaluations: {},
                goals: {},
          teams: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
      setSaveError(!res);
    } catch (e) {
      setSaveError(true);
    }
  }, []);

  const setGoalProgress = async (playerId, subskillId, progress) => {
    const existing = data.goals[playerId] || {};
    const prevGoal = existing[subskillId];
    if (!prevGoal) return;
    const goals = {
      ...data.goals,
      [playerId]: { ...existing, [subskillId]: { ...prevGoal, progress } },
    };
    await persist({ ...data, goals });
  };

  if (loading || !data) {
    return (
      <div style={styles.loadingWrap}>
        <img src={LOGO_SRC} alt="Klublogo" style={{ width: 56, height: 56, marginBottom: 4 }} />
        <div style={{ color: "#FFFFFF", fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
          INDLÆSER TRUP…
        </div>
      </div>
    );
  }

  // Player self-evaluation via private link — restricted to a single player, no roster access
  if (urlToken) {
    const tokenPlayer = data.players.find((p) => p.selfToken === urlToken);
    if (!tokenPlayer) {
      return (
        <div style={styles.app}>
          <div style={styles.headerTopBar}>
            <div style={styles.headerTopRow}>
              <div style={styles.brand}>
                <span style={styles.brandText}>VB PIGE AKADEMI</span>
              </div>
              <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
            </div>
          </div>
          <div style={{ ...styles.main, textAlign: "center", paddingTop: 60 }}>
            <Lock size={32} color="#B9B2A0" />
            <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Ugyldigt link</div>
            <p style={styles.subtext}>
              Dette link er ugyldigt eller ikke længere aktivt. Kontakt din træner for at få et
              nyt link.
            </p>
          </div>
        </div>
      );
    }
    return (
      <PlayerSelfEvalApp
        player={tokenPlayer}
        config={data.config}
        periods={sortedPeriods(data.periods)}
        coachEvaluations={data.evaluations[tokenPlayer.id] || {}}
        goals={data.goals[tokenPlayer.id] || {}}
        onSetGoalProgress={(subskillId, progress) =>
          setGoalProgress(tokenPlayer.id, subskillId, progress)
        }
      />
    );
  }

  const addPlayer = async () => {
    if (!newName.trim()) return;
    const player = {
      id: uid(),
      name: newName.trim(),
      positions: newPositions,
      number: newNumber.trim(),
      teamId: newTeamId || null,
      selfToken: makeToken(),
    };
    const next = { ...data, players: [...data.players, player] };
    await persist(next);
    setNewName("");
    setNewPositions([]);
    setNewNumber("");
    setNewTeamId("");
    setAddingPlayer(false);
  };

  const deletePlayer = async (id) => {
    const players = data.players.filter((p) => p.id !== id);
    const evaluations = { ...data.evaluations };
    delete evaluations[id];
    const goals = { ...data.goals };
    delete goals[id];
    await persist({ ...data, players, evaluations, goals });
    setConfirmDelete(null);
    if (selectedId === id) {
      setView("roster");
      setSelectedId(null);
    }
  };

  const updatePlayerPositions = async (playerId, positions) => {
    const players = data.players.map((p) => (p.id === playerId ? { ...p, positions } : p));
    await persist({ ...data, players });
  };

  const updatePlayerTeam = async (playerId, teamId) => {
    const players = data.players.map((p) => (p.id === playerId ? { ...p, teamId: teamId || null } : p));
    await persist({ ...data, players });
  };

  const createTeam = async (name) => {
    const team = { id: uid(), name: name || "Nyt hold" };
    await persist({ ...data, teams: [...data.teams, team] });
    return team.id;
  };

  const renameTeam = async (teamId, name) => {
    const teams = data.teams.map((t) => (t.id === teamId ? { ...t, name } : t));
    await persist({ ...data, teams });
  };

  const deleteTeam = async (teamId) => {
    const teams = data.teams.filter((t) => t.id !== teamId);
    const players = data.players.map((p) => (p.teamId === teamId ? { ...p, teamId: null } : p));
    await persist({ ...data, teams, players });
  };

  const createPeriod = async (label, date) => {
    const period = { id: uid(), label: label || "Ny periode", date: date || todayStr() };
    await persist({ ...data, periods: [...data.periods, period] });
    return period.id;
  };

  const renamePeriod = async (periodId, label, date) => {
    const periods = data.periods.map((p) => (p.id === periodId ? { ...p, label, date } : p));
    await persist({ ...data, periods });
  };

  const deletePeriod = async (periodId) => {
    const periods = data.periods.filter((p) => p.id !== periodId);
    const evaluations = {};
    Object.keys(data.evaluations).forEach((playerId) => {
      const playerEvals = { ...data.evaluations[playerId] };
      delete playerEvals[periodId];
      evaluations[playerId] = playerEvals;
    });
    await persist({ ...data, periods, evaluations });
  };

  const setScore = async (playerId, periodId, subskillId, value) => {
    const playerEvals = { ...(data.evaluations[playerId] || {}) };
    const current = playerEvals[periodId]?.scores || {};
    const scores = { ...current };
    scores[subskillId] = scores[subskillId] === value ? undefined : value;
    if (scores[subskillId] === undefined) delete scores[subskillId];
    playerEvals[periodId] = { scores };
    const evaluations = { ...data.evaluations, [playerId]: playerEvals };
    await persist({ ...data, evaluations });
  };

  const setGoal = async (playerId, subskillId, target, note) => {
    const existing = data.goals[playerId] || {};
    const prevGoal = existing[subskillId];
    const goals = {
      ...data.goals,
      [playerId]: {
        ...existing,
        [subskillId]: {
          target,
          note: note || "",
          createdDate: prevGoal ? prevGoal.createdDate : todayStr(),
          progress: prevGoal ? prevGoal.progress : null,
        },
      },
    };
    await persist({ ...data, goals });
  };

  const removeGoal = async (playerId, subskillId) => {
    const existing = { ...(data.goals[playerId] || {}) };
    delete existing[subskillId];
    const goals = { ...data.goals, [playerId]: existing };
    await persist({ ...data, goals });
  };

  const renameSkill = async (catKey, skillId, name) => {
    const config = { ...data.config };
    config[catKey] = config[catKey].map((s) => (s.id === skillId ? { ...s, name } : s));
    await persist({ ...data, config });
  };

  const toggleSkill = async (catKey, skillId) => {
    const config = { ...data.config };
    config[catKey] = config[catKey].map((s) =>
      s.id === skillId ? { ...s, enabled: !s.enabled } : s
    );
    await persist({ ...data, config });
  };

  const selectedPlayer = data.players.find((p) => p.id === selectedId);
  const periods = sortedPeriods(data.periods);

  return (
    <div style={styles.app}>
      <PrintStyles />
      <ClubHeader view={view} setView={setView} setSelectedId={setSelectedId} />

      <main style={styles.main}>
        {saveError && (
          <div style={styles.errorBanner}>
            Kunne ikke gemme ændringer — tjek din forbindelse og prøv igen.
          </div>
        )}

        {view === "settings" && (
          <SettingsView config={data.config} onRename={renameSkill} onToggle={toggleSkill} />
        )}

        {view === "coaches" && (
          <CoachesOverviewView
            data={data}
            onSetGoalProgress={setGoalProgress}
            onOpenPlayer={(id) => {
              setSelectedId(id);
              setView("player");
            }}
          />
        )}

        {view === "teams" && (
          <TeamsView
            teams={data.teams}
            players={data.players}
            onCreate={createTeam}
            onRename={renameTeam}
            onDelete={deleteTeam}
          />
        )}

        {view === "periods" && (
          <PeriodsView
            periods={periods}
            onCreate={createPeriod}
            onRename={renamePeriod}
            onDelete={deletePeriod}
          />
        )}

        {view === "roster" && (
          <RosterView
            data={data}
            periods={periods}
            onOpen={(id) => {
              setSelectedId(id);
              setView("player");
            }}
            addingPlayer={addingPlayer}
            setAddingPlayer={setAddingPlayer}
            newName={newName}
            setNewName={setNewName}
            newPositions={newPositions}
            setNewPositions={setNewPositions}
            newNumber={newNumber}
            setNewNumber={setNewNumber}
            newTeamId={newTeamId}
            setNewTeamId={setNewTeamId}
            onAdd={addPlayer}
          />
        )}

        {view === "player" && selectedPlayer && (
          <PlayerView
            player={selectedPlayer}
            config={data.config}
            periods={periods}
            teams={data.teams}
            evaluations={data.evaluations[selectedPlayer.id] || {}}
            goals={data.goals[selectedPlayer.id] || {}}
            onBack={() => {
              setView("roster");
              setSelectedId(null);
            }}
            onScore={(periodId, subskillId, value) =>
              setScore(selectedPlayer.id, periodId, subskillId, value)
            }
            onDelete={() => setConfirmDelete(selectedPlayer.id)}
            onUpdatePositions={(positions) => updatePlayerPositions(selectedPlayer.id, positions)}
            onUpdateTeam={(teamId) => updatePlayerTeam(selectedPlayer.id, teamId)}
            onSetGoal={(subskillId, target, note) => setGoal(selectedPlayer.id, subskillId, target, note)}
            onSetGoalProgress={(subskillId, progress) => setGoalProgress(selectedPlayer.id, subskillId, progress)}
            onRemoveGoal={(subskillId) => removeGoal(selectedPlayer.id, subskillId)}
            onGoToPeriods={() => setView("periods")}
          />
        )}
      </main>

      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Fjern spiller?</div>
            <div style={styles.modalBody}>
              Dette sletter alle registrerede evalueringer for spilleren. Kan ikke fortrydes.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDelete(null)}>
                Annuller
              </button>
              <button style={styles.dangerBtn} onClick={() => deletePlayer(confirmDelete)}>
                Fjern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Player self-evaluation (accessed only via a private link) ---------- */
function PlayerSelfEvalApp({ player, config, periods, coachEvaluations, goals, onSetGoalProgress }) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods.length ? periods[periods.length - 1].id : null
  );
  const [drilldownCat, setDrilldownCat] = useState(null);
  const [printPanelOpen, setPrintPanelOpen] = useState(false);
  const [printColBMode, setPrintColBMode] = useState("goal");
  const [printColBPeriodId, setPrintColBPeriodId] = useState(null);

  useEffect(() => {
    if (!selectedPeriodId && periods.length) {
      setSelectedPeriodId(periods[periods.length - 1].id);
    }
  }, [periods.length, selectedPeriodId]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;
  const scores = selectedPeriod ? coachEvaluations[selectedPeriod.id]?.scores || {} : {};

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    value: categoryAverage(config, scores, c.key) || 0,
    goal: categoryGoalAverage(config, goals, c.key) || 0,
  }));

  const hasGoals = Object.keys(goals).length > 0;
  const goalEntries = Object.keys(goals)
    .map((skillId) => {
      const meta = findSkillMeta(config, skillId);
      if (!meta) return null;
      return { skillId, goal: goals[skillId], ...meta };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.category.label.localeCompare(b.category.label) || a.skill.name.localeCompare(b.skill.name)
    );

  return (
    <div style={styles.app}>
      <PrintStyles />
      <div style={styles.headerTopBar}>
        <div style={styles.headerTopRow}>
          <div style={styles.brand}>
            <span style={styles.brandText}>VB PIGE AKADEMI</span>
            <span style={styles.brandSub}>Min udvikling</span>
          </div>
          <img src={LOGO_SRC} alt="Klublogo" style={styles.logoImg} />
        </div>
      </div>
      <div style={styles.headerStripes} />

      <main style={styles.main}>
        <div style={styles.playerHeadRow}>
          <div style={styles.numberBadgeLg}>{player.number || "—"}</div>
          <div>
            <h1 style={styles.h1}>{player.name}</h1>
            <p style={styles.subtext}>
              {player.positions && player.positions.length > 0
                ? player.positions.join(" · ")
                : "Position ikke angivet"}
            </p>
          </div>
        </div>

        <div style={styles.infoBanner}>
          Her kan du se din træners vurdering og opdatere din egen indsats på dine udviklingsmål.
          Du kan ikke ændre selve scoren — det gør din træner.
        </div>

        {hasGoals && (
          <div style={styles.goalsOverviewCard}>
            <div style={styles.goalsOverviewHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={16} color="#1A1A1A" />
                <span style={styles.categoryLabel}>Dine udviklingsmål</span>
              </div>
            </div>
            {goalEntries.map(({ skillId, goal, skill, category }) => {
              const currentVal = scores[skillId];
              const achieved = typeof currentVal === "number" && currentVal >= goal.target;
              return (
                <div key={skillId} style={styles.goalOverviewRow}>
                  <div style={styles.goalOverviewTop}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ ...styles.dot, background: category.accent }} />
                        <span style={styles.skillName}>{skill.name}</span>
                        <span style={styles.goalOverviewCat}>{category.label}</span>
                      </div>
                      {goal.note && (
                        <div style={styles.goalNote}>
                          <strong>Øvelser:</strong> {goal.note}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.goalChip,
                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                      }}
                    >
                      <Target size={11} /> Mål {goal.target}
                      {achieved ? " ✓" : ""}
                    </span>
                  </div>
                  <ProgressTracker
                    value={goal.progress}
                    onChange={(v) => onSetGoalProgress(skillId, v)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!hasGoals && (
          <div style={styles.emptyState}>
            <Target size={28} color="#B9B2A0" />
            <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen udviklingsmål endnu</div>
            <div style={{ color: "#6B6B6B", fontSize: 14 }}>
              Din træner har ikke sat nogen mål for dig endnu.
            </div>
          </div>
        )}

        {periods.length > 0 && (
          <>
            <div style={styles.evalBar}>
              <div style={styles.evalTabs}>
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPeriodId(p.id);
                      setDrilldownCat(null);
                    }}
                    style={{
                      ...styles.evalTab,
                      ...(selectedPeriodId === p.id ? styles.evalTabActive : {}),
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.label}</div>
                    <div style={styles.evalTabDate}>{formatDate(p.date)}</div>
                  </button>
                ))}
              </div>
              <button
                style={{
                  ...styles.compareBtn,
                  ...(printPanelOpen ? styles.compareBtnActive : {}),
                }}
                onClick={() => setPrintPanelOpen((v) => !v)}
              >
                <Printer size={14} /> Udskriv rapport
              </button>
            </div>

            {printPanelOpen && (
              <div style={styles.addCardCol}>
                <div style={styles.fieldLabel}>Anden kolonne skal vise</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    style={{
                      ...styles.teamFilterChip,
                      ...(printColBMode === "goal" ? styles.teamFilterChipActive : {}),
                    }}
                    onClick={() => setPrintColBMode("goal")}
                  >
                    Mål
                  </button>
                  <button
                    style={{
                      ...styles.teamFilterChip,
                      ...(printColBMode === "period" ? styles.teamFilterChipActive : {}),
                    }}
                    onClick={() => {
                      setPrintColBMode("period");
                      if (!printColBPeriodId) {
                        const alt = periods.find((p) => p.id !== selectedPeriodId);
                        setPrintColBPeriodId(alt ? alt.id : periods[0].id);
                      }
                    }}
                  >
                    Anden periode
                  </button>
                </div>
                {printColBMode === "period" && periods.length >= 2 && (
                  <div>
                    <div style={styles.fieldLabel}>Vælg periode til sammenligning</div>
                    <select
                      style={styles.select}
                      value={printColBPeriodId || ""}
                      onChange={(e) => setPrintColBPeriodId(e.target.value)}
                    >
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} · {formatDate(p.date)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button style={styles.primaryBtn} onClick={() => window.print()}>
                  <Printer size={16} /> Udskriv nu
                </button>
              </div>
            )}

            {selectedPeriod && (
              <PrintableReport
                player={player}
                config={config}
                goals={goals}
                colA={{
                  label: `${selectedPeriod.label} (${formatDate(selectedPeriod.date)})`,
                  scores,
                }}
                colB={
                  printColBMode === "goal"
                    ? {
                        label: "Mål",
                        scores: Object.fromEntries(
                          Object.keys(goals).map((id) => [id, goals[id].target])
                        ),
                      }
                    : {
                        label: (() => {
                          const p = periods.find((pp) => pp.id === printColBPeriodId);
                          return p ? `${p.label} (${formatDate(p.date)})` : "Anden periode";
                        })(),
                        scores: printColBPeriodId
                          ? coachEvaluations[printColBPeriodId]?.scores || {}
                          : {},
                      }
                }
              />
            )}

            {selectedPeriod && (
              <>
                <div style={styles.radarCard}>
                  <p style={styles.radarHint}>Tryk på en kategori for at se de enkelte kriterier</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#D9D4C7" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => (
                          <CategoryAxisTick {...props} onSelect={setDrilldownCat} />
                        )}
                      />
                      <Radar
                        name="Trænervurdering"
                        dataKey="value"
                        stroke="#E2231A"
                        fill="#E2231A"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      {hasGoals && (
                        <Radar
                          name="Mål"
                          dataKey="goal"
                          stroke={GOAL_COLOR}
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          isAnimationActive={false}
                        />
                      )}
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {drilldownCat && (
                  <SkillDrilldownRadar
                    config={config}
                    catKey={drilldownCat}
                    scores={scores}
                    goals={goals}
                    onClose={() => setDrilldownCat(null)}
                  />
                )}

                <div style={styles.evalMetaRow}>
                  <span style={styles.subtext}>
                    Viser <strong>{selectedPeriod.label}</strong> · {formatDate(selectedPeriod.date)}
                    {" · "}
                    <Lock size={11} style={{ verticalAlign: "-1px" }} /> Kun din træner kan ændre
                    scoren
                  </span>
                </div>

                {CATEGORY_META.map((cat) => {
                  const skills = config[cat.key].filter((s) => s.enabled);
                  const avg = categoryAverage(config, scores, cat.key);
                  return (
                    <div key={cat.key} style={styles.categoryBlock}>
                      <div style={styles.categoryHeadRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ ...styles.dot, background: cat.accent }} />
                          <span style={styles.categoryLabel}>{cat.label}</span>
                        </div>
                        <span style={{ ...styles.categoryAvg, color: cat.accent }}>
                          {avg ? avg.toFixed(1) : "—"}
                        </span>
                      </div>
                      {skills.length === 0 ? (
                        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
                      ) : (
                        skills.map((skill) => {
                          const val = scores[skill.id];
                          return (
                            <div key={skill.id} style={styles.skillRow}>
                              <span style={styles.skillName}>{skill.name}</span>
                              <span
                                style={{
                                  ...styles.readOnlyScorePill,
                                  background: scoreColor(val),
                                }}
                              >
                                {val ?? "—"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- Player self-evaluation link card (shown to coaches on the player profile) ---------- */
function SelfEvalLinkCard({ token }) {
  const [copied, setCopied] = useState(false);

  const link = (() => {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      return `${url.toString()}${url.toString().includes("?") ? "&" : "?"}player=${token}`;
    } catch (e) {
      return `?player=${token}`;
    }
  })();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <div style={styles.linkCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Link2 size={15} color="#1A1A1A" />
        <span style={styles.categoryLabel}>Spillerens selvevalueringslink</span>
      </div>
      <p style={styles.subtext}>
        Del dette link med spilleren. Alle med linket kan kun evaluere denne ene spiller — ingen
        andre spillere eller trænerfunktioner er tilgængelige.
      </p>
      <div style={styles.linkRow}>
        <input style={styles.linkInput} value={link} readOnly onFocus={(e) => e.target.select()} />
        <button style={styles.primaryBtnSm} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Kopieret" : "Kopiér"}
        </button>
      </div>
    </div>
  );
}

function PeriodsView({ periods, onCreate, onRename, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [date, setDate] = useState(todayStr());
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const startCreate = () => {
    setLabel("");
    setDate(todayStr());
    setCreating(true);
  };

  const submitCreate = async () => {
    if (!label.trim()) return;
    await onCreate(label.trim(), date);
    setCreating(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditLabel(p.label);
    setEditDate(p.date);
  };

  const submitEdit = async () => {
    if (!editLabel.trim()) return;
    await onRename(editingId, editLabel.trim(), editDate);
    setEditingId(null);
  };

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Evalueringsperioder</h1>
          <p style={styles.subtext}>
            Oprettes én gang og deles af alle spillere — fx "Forsæson" og "Midtsæson". Alle
            trænere vurderer hver spiller ud fra de samme perioder.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={startCreate}>
          <Plus size={16} /> Ny periode
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={styles.input}
              placeholder="Periodenavn (fx Forsæson)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
            <input
              type="date"
              style={{ ...styles.input, maxWidth: 170 }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {periods.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <CalendarRange size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen evalueringsperioder endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret én (fx "Forsæson"), så trænere kan begynde at vurdere spillere ud fra den.
          </div>
        </div>
      )}

      {periods.map((p) => (
        <div key={p.id} style={styles.periodRow}>
          {editingId === p.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
              <input
                style={styles.input}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                autoFocus
              />
              <input
                type="date"
                style={{ ...styles.input, maxWidth: 170 }}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              <button style={styles.primaryBtnSm} onClick={submitEdit}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditingId(null)}>
                Annuller
              </button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{p.label}</div>
                <div style={styles.subtext}>{formatDate(p.date)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={styles.iconBtn} onClick={() => startEdit(p)} title="Rediger">
                  <Pencil size={14} />
                </button>
                <button
                  style={{ ...styles.iconBtn, color: "#E2231A" }}
                  onClick={() => setConfirmDeleteId(p.id)}
                  title="Slet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Slet denne periode?</div>
            <div style={styles.modalBody}>
              Dette fjerner den for alle spillere, inklusive allerede indtastede scores på tværs
              af hele truppen. Kan ikke fortrydes.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDeleteId(null)}>
                Annuller
              </button>
              <button
                style={styles.dangerBtn}
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressTracker({ value, onChange, compact }) {
  return (
    <div style={styles.progressRow}>
      <span style={styles.progressLabel}>Fremskridt</span>
      <div style={styles.progressButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
          const filled = typeof value === "number" && v <= value;
          return (
            <button
              key={v}
              onClick={() => onChange(value === v ? null : v)}
              style={{
                ...(compact ? styles.progressBtnCompact : styles.progressBtn),
                background: filled ? "#1A1A1A" : "#FFFFFF",
                color: filled ? "#FFFFFF" : "#1A1A1A",
                borderColor: filled ? "#1A1A1A" : "#D9D4C7",
              }}
              title={`Sæt fremskridt til ${v}`}
            >
              {v}
            </button>
          );
        })}
      </div>
      <span style={styles.progressValue}>{typeof value === "number" ? `${value}/10` : "—"}</span>
    </div>
  );
}

function CoachesOverviewView({ data, onSetGoalProgress, onOpenPlayer }) {
  const playersWithGoals = data.players
    .map((p) => ({ player: p, goalIds: Object.keys(data.goals[p.id] || {}) }))
    .filter((x) => x.goalIds.length > 0);

  return (
    <div>
      <h1 style={styles.h1}>Træneroverblik</h1>
      <p style={styles.subtext}>
        Alle spilleres udviklingsmål, øvelsesnoter og fremskridt samlet ét sted.
      </p>

      {playersWithGoals.length === 0 && (
        <div style={styles.emptyState}>
          <ClipboardList size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen udviklingsmål endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Sæt et mål på en spillers kompetence, så vises det her.
          </div>
        </div>
      )}

      {playersWithGoals.map(({ player, goalIds }) => {
        const goals = data.goals[player.id];
        const latestPeriod = getLatestScoredPeriod(data, player.id);
        const scores = latestPeriod ? getPlayerScores(data, player.id, latestPeriod.id) : {};
        const entries = goalIds
          .map((skillId) => {
            const meta = findSkillMeta(data.config, skillId);
            if (!meta) return null;
            return { skillId, goal: goals[skillId], ...meta };
          })
          .filter(Boolean)
          .sort(
            (a, b) =>
              a.category.label.localeCompare(b.category.label) ||
              a.skill.name.localeCompare(b.skill.name)
          );

        return (
          <div key={player.id} style={styles.coachPlayerCard}>
            <div style={styles.coachPlayerHead} onClick={() => onOpenPlayer(player.id)}>
              <div style={styles.numberBadge}>{player.number || "—"}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.playerName}>{player.name}</div>
                <div style={styles.subtext}>
                  {player.positions && player.positions.length > 0
                    ? player.positions.join(" · ")
                    : "Position ikke angivet"}
                </div>
              </div>
              <ChevronRight size={18} color="#B9B2A0" />
            </div>

            {entries.map(({ skillId, goal, skill, category }) => {
              const currentVal = scores[skillId];
              const achieved = typeof currentVal === "number" && currentVal >= goal.target;
              return (
                <div key={skillId} style={styles.goalOverviewRow}>
                  <div style={styles.goalOverviewTop}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ ...styles.dot, background: category.accent }} />
                        <span style={styles.skillName}>{skill.name}</span>
                        <span style={styles.goalOverviewCat}>{category.label}</span>
                      </div>
                      {goal.note && (
                        <div style={styles.goalNote}>
                          <strong>Øvelser:</strong> {goal.note}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.goalChip,
                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                      }}
                    >
                      <Target size={11} /> Mål {goal.target}
                      {achieved ? " ✓" : ""}
                    </span>
                  </div>
                  <ProgressTracker
                    value={goal.progress}
                    onChange={(v) => onSetGoalProgress(player.id, skillId, v)}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TeamsView({ teams, players, onCreate, onRename, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const submitCreate = async () => {
    if (!name.trim()) return;
    await onCreate(name.trim());
    setName("");
    setCreating(false);
  };

  const submitEdit = async () => {
    if (!editName.trim()) return;
    await onRename(editingId, editName.trim());
    setEditingId(null);
  };

  const countFor = (teamId) => players.filter((p) => p.teamId === teamId).length;

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Hold</h1>
          <p style={styles.subtext}>
            Oprettes én gang — knyt en spiller til et hold fra spillerens profil eller når du
            opretter spilleren.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setCreating(true)}>
          <Plus size={16} /> Nyt hold
        </button>
      </div>

      {creating && (
        <div style={styles.addCardCol}>
          <input
            style={styles.input}
            placeholder="Holdnavn (fx U14 Drenge)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={submitCreate}>
              Opret
            </button>
            <button style={styles.ghostBtn} onClick={() => setCreating(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {teams.length === 0 && !creating && (
        <div style={styles.emptyState}>
          <Layers size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen hold endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Opret ét (fx "U14 Drenge"), så spillere kan knyttes til det.
          </div>
        </div>
      )}

      {teams.map((t) => (
        <div key={t.id} style={styles.periodRow}>
          {editingId === t.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
              <input
                style={styles.input}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <button style={styles.primaryBtnSm} onClick={submitEdit}>
                Gem
              </button>
              <button style={styles.ghostBtn} onClick={() => setEditingId(null)}>
                Annuller
              </button>
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div style={styles.subtext}>
                  {countFor(t.id)} spiller{countFor(t.id) !== 1 ? "e" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={styles.iconBtn}
                  onClick={() => {
                    setEditingId(t.id);
                    setEditName(t.name);
                  }}
                  title="Omdøb"
                >
                  <Pencil size={14} />
                </button>
                <button
                  style={{ ...styles.iconBtn, color: "#E2231A" }}
                  onClick={() => setConfirmDeleteId(t.id)}
                  title="Slet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {confirmDeleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalTitle}>Slet dette hold?</div>
            <div style={styles.modalBody}>
              Spillere knyttet til det bliver frigjort — deres scores og mål bevares.
            </div>
            <div style={styles.modalActions}>
              <button style={styles.ghostBtn} onClick={() => setConfirmDeleteId(null)}>
                Annuller
              </button>
              <button
                style={styles.dangerBtn}
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RosterView({
  data,
  periods,
  onOpen,
  addingPlayer,
  setAddingPlayer,
  newName,
  setNewName,
  newPositions,
  setNewPositions,
  newNumber,
  setNewNumber,
  newTeamId,
  setNewTeamId,
  onAdd,
}) {
  const [teamFilter, setTeamFilter] = useState("all");
  const teams = data.teams || [];

  const togglePosition = (pos) => {
    setNewPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const teamName = (teamId) => teams.find((t) => t.id === teamId)?.name || null;

  const visiblePlayers =
    teamFilter === "all"
      ? data.players
      : teamFilter === "none"
      ? data.players.filter((p) => !p.teamId)
      : data.players.filter((p) => p.teamId === teamFilter);

  return (
    <div>
      <div style={styles.sectionHeadRow}>
        <div>
          <h1 style={styles.h1}>Spillertrup</h1>
          <p style={styles.subtext}>
            {visiblePlayers.length} af {data.players.length} spiller
            {data.players.length !== 1 ? "e" : ""} · delt med alle trænere
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setAddingPlayer(true)}>
          <Plus size={16} /> Tilføj spiller
        </button>
      </div>

      {teams.length > 0 && (
        <div style={styles.teamFilterRow}>
          <button
            style={{
              ...styles.teamFilterChip,
              ...(teamFilter === "all" ? styles.teamFilterChipActive : {}),
            }}
            onClick={() => setTeamFilter("all")}
          >
            Alle
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              style={{
                ...styles.teamFilterChip,
                ...(teamFilter === t.id ? styles.teamFilterChipActive : {}),
              }}
              onClick={() => setTeamFilter(t.id)}
            >
              {t.name}
            </button>
          ))}
          <button
            style={{
              ...styles.teamFilterChip,
              ...(teamFilter === "none" ? styles.teamFilterChipActive : {}),
            }}
            onClick={() => setTeamFilter("none")}
          >
            Intet hold
          </button>
        </div>
      )}

      {addingPlayer && (
        <div style={styles.addCardCol}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={styles.input}
              placeholder="Spillernavn"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              style={{ ...styles.input, maxWidth: 90 }}
              placeholder="Nr."
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
            />
          </div>
          {teams.length > 0 && (
            <div>
              <div style={styles.fieldLabel}>Hold</div>
              <select
                style={styles.select}
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
              >
                <option value="">Intet hold</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <div style={styles.fieldLabel}>Position(er)</div>
            <PositionPicker selected={newPositions} onToggle={togglePosition} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.primaryBtn} onClick={onAdd}>
              Gem
            </button>
            <button style={styles.ghostBtn} onClick={() => setAddingPlayer(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {data.players.length === 0 && !addingPlayer && (
        <div style={styles.emptyState}>
          <Shield size={32} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen spillere endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14 }}>
            Tilføj din første spiller for at begynde udviklingen.
          </div>
        </div>
      )}

      {data.players.length > 0 && visiblePlayers.length === 0 && (
        <div style={styles.emptyState}>
          <div style={{ fontWeight: 600 }}>Ingen spillere på dette hold</div>
        </div>
      )}

      <div style={styles.grid}>
        {visiblePlayers.map((p) => {
          const latestPeriod = getLatestScoredPeriod(data, p.id);
          const scores = latestPeriod ? getPlayerScores(data, p.id, latestPeriod.id) : {};
          const overall = overallAverage(data.config, scores);
          const goals = data.goals[p.id] || {};
          const goalIds = Object.keys(goals);
          const goalsMet = goalIds.filter(
            (id) => typeof scores[id] === "number" && scores[id] >= goals[id].target
          ).length;
          return (
            <div key={p.id} style={styles.playerCard} onClick={() => onOpen(p.id)}>
              <div style={styles.playerCardTop}>
                <div style={styles.numberBadge}>{p.number || "—"}</div>
                <div
                  style={{
                    ...styles.overallPill,
                    background: scoreColor(overall ? Math.round(overall) : null),
                  }}
                >
                  {overall ? overall.toFixed(1) : "—"}
                </div>
              </div>
              <div style={styles.playerName}>{p.name}</div>
              <div style={styles.playerPos}>
                {p.positions && p.positions.length > 0
                  ? p.positions.join(" · ")
                  : "Position ikke angivet"}
              </div>
              {teamName(p.teamId) && (
                <div style={styles.teamBadge}>
                  <Layers size={10} /> {teamName(p.teamId)}
                </div>
              )}
              <div style={styles.miniBars}>
                {CATEGORY_META.map((c) => {
                  const avg = categoryAverage(data.config, scores, c.key);
                  return (
                    <div key={c.key} style={styles.miniBarTrack} title={`${c.label}: ${avg ? avg.toFixed(1) : "—"}`}>
                      <div
                        style={{
                          ...styles.miniBarFill,
                          width: avg ? `${(avg / 5) * 100}%` : "0%",
                          background: c.accent,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              {goalIds.length > 0 && (
                <div
                  style={{
                    ...styles.goalChip,
                    ...(goalsMet === goalIds.length ? styles.goalChipMet : styles.goalChipPending),
                    marginTop: 10,
                  }}
                >
                  <Target size={11} /> {goalsMet} af {goalIds.length} mål nået
                </div>
              )}
              <div style={styles.evalCountTag}>
                {periods.length === 0
                  ? "Ingen perioder oprettet endnu"
                  : latestPeriod
                  ? `Seneste vurdering: ${latestPeriod.label} · ${formatDate(latestPeriod.date)}`
                  : "Ikke vurderet endnu"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerView({
  player,
  config,
  periods,
  teams,
  evaluations,
  goals,
  onBack,
  onScore,
  onDelete,
  onUpdatePositions,
  onUpdateTeam,
  onSetGoal,
  onSetGoalProgress,
  onRemoveGoal,
  onGoToPeriods,
}) {
  const [editingPositions, setEditingPositions] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    periods.length ? periods[periods.length - 1].id : null
  );
  const [compareMode, setCompareMode] = useState(false);
  const [goalEditingId, setGoalEditingId] = useState(null);
  const [goalTargetDraft, setGoalTargetDraft] = useState(4);
  const [goalNoteDraft, setGoalNoteDraft] = useState("");
  const [drilldownCat, setDrilldownCat] = useState(null);
  const [printPanelOpen, setPrintPanelOpen] = useState(false);
  const [printColBMode, setPrintColBMode] = useState("goal");
  const [printColBPeriodId, setPrintColBPeriodId] = useState(null);

  const positions = player.positions || [];

  useEffect(() => {
    if (!selectedPeriodId && periods.length) {
      setSelectedPeriodId(periods[periods.length - 1].id);
    }
    if (selectedPeriodId && !periods.find((p) => p.id === selectedPeriodId)) {
      setSelectedPeriodId(periods.length ? periods[periods.length - 1].id : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods.length]);

  const togglePosition = (pos) => {
    const next = positions.includes(pos)
      ? positions.filter((p) => p !== pos)
      : [...positions, pos];
    onUpdatePositions(next);
  };

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;
  const scores = selectedPeriod ? evaluations[selectedPeriod.id]?.scores || {} : {};

  const openGoalEditor = (skillId) => {
    const existing = goals[skillId];
    setGoalEditingId(skillId);
    setGoalTargetDraft(existing ? existing.target : 4);
    setGoalNoteDraft(existing ? existing.note : "");
  };

  const saveGoal = (skillId) => {
    onSetGoal(skillId, goalTargetDraft, goalNoteDraft.trim());
    setGoalEditingId(null);
  };

  const hasGoals = Object.keys(goals).length > 0;

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    value: categoryAverage(config, scores, c.key) || 0,
    goal: categoryGoalAverage(config, goals, c.key) || 0,
  }));

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>
        <ChevronLeft size={16} /> Spillertrup
      </button>

      <div style={styles.playerHeadRow}>
        <div style={styles.numberBadgeLg}>{player.number || "—"}</div>
        <div style={{ flex: 1 }}>
          <h1 style={styles.h1}>{player.name}</h1>
          {!editingPositions && (
            <div style={styles.positionRow}>
              <span style={styles.subtext}>
                {positions.length > 0 ? positions.join(" · ") : "Position ikke angivet"}
              </span>
              <button style={styles.linkBtn} onClick={() => setEditingPositions(true)}>
                <Pencil size={12} /> Rediger
              </button>
            </div>
          )}
        </div>
        <button style={styles.iconDangerBtn} onClick={onDelete} title="Fjern spiller">
          <Trash2 size={16} />
        </button>
      </div>

      {editingPositions && (
        <div style={styles.positionEditCard}>
          <div style={styles.fieldLabel}>Position(er)</div>
          <PositionPicker selected={positions} onToggle={togglePosition} />
          <button style={styles.ghostBtn} onClick={() => setEditingPositions(false)}>
            Færdig
          </button>
        </div>
      )}

      {teams.length > 0 && (
        <div style={styles.teamRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={14} color="#6B6B6B" />
            {!editingTeam && (
              <span style={styles.subtext}>
                {teams.find((t) => t.id === player.teamId)?.name || "Intet hold tilknyttet"}
              </span>
            )}
            {editingTeam && (
              <select
                style={{ ...styles.select, maxWidth: 220 }}
                value={player.teamId || ""}
                onChange={(e) => onUpdateTeam(e.target.value || null)}
                autoFocus
              >
                <option value="">Intet hold</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button style={styles.linkBtn} onClick={() => setEditingTeam((v) => !v)}>
            <Pencil size={12} /> {editingTeam ? "Færdig" : "Rediger"}
          </button>
        </div>
      )}

      <SelfEvalLinkCard token={player.selfToken} />

      <GoalsOverview
        config={config}
        goals={goals}
        scores={scores}
        periodLabel={selectedPeriod ? selectedPeriod.label : null}
        goalEditingId={goalEditingId}
        goalTargetDraft={goalTargetDraft}
        goalNoteDraft={goalNoteDraft}
        setGoalTargetDraft={setGoalTargetDraft}
        setGoalNoteDraft={setGoalNoteDraft}
        onOpenEditor={openGoalEditor}
        onCloseEditor={() => setGoalEditingId(null)}
        onSave={saveGoal}
        onRemove={onRemoveGoal}
        onSetProgress={(skillId, progress) => onSetGoalProgress(skillId, progress)}
      />

      {periods.length === 0 ? (
        <div style={styles.emptyState}>
          <CalendarRange size={28} color="#B9B2A0" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>Ingen evalueringsperioder endnu</div>
          <div style={{ color: "#6B6B6B", fontSize: 14, marginBottom: 12 }}>
            Perioder oprettes én gang og deles af alle spillere.
          </div>
          <button style={styles.primaryBtnSm} onClick={onGoToPeriods}>
            <Plus size={14} /> Opret periode
          </button>
        </div>
      ) : (
        <>
          <div style={styles.evalBar}>
            <div style={styles.evalTabs}>
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPeriodId(p.id);
                    setCompareMode(false);
                    setGoalEditingId(null);
                    setDrilldownCat(null);
                  }}
                  style={{
                    ...styles.evalTab,
                    ...(selectedPeriodId === p.id && !compareMode ? styles.evalTabActive : {}),
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.label}</div>
                  <div style={styles.evalTabDate}>{formatDate(p.date)}</div>
                </button>
              ))}
            </div>
            {periods.length >= 2 && (
              <button
                style={{
                  ...styles.compareBtn,
                  ...(compareMode ? styles.compareBtnActive : {}),
                }}
                onClick={() => {
                  setCompareMode((v) => !v);
                  setDrilldownCat(null);
                }}
              >
                <GitCompare size={14} /> Sammenlign
              </button>
            )}
            {periods.length >= 1 && (
              <button
                style={{
                  ...styles.compareBtn,
                  ...(printPanelOpen ? styles.compareBtnActive : {}),
                }}
                onClick={() => setPrintPanelOpen((v) => !v)}
              >
                <Printer size={14} /> Udskriv rapport
              </button>
            )}
          </div>

          {printPanelOpen && (
            <div style={styles.addCardCol}>
              <div style={styles.fieldLabel}>Anden kolonne skal vise</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.teamFilterChip,
                    ...(printColBMode === "goal" ? styles.teamFilterChipActive : {}),
                  }}
                  onClick={() => setPrintColBMode("goal")}
                >
                  Mål
                </button>
                <button
                  style={{
                    ...styles.teamFilterChip,
                    ...(printColBMode === "period" ? styles.teamFilterChipActive : {}),
                  }}
                  onClick={() => {
                    setPrintColBMode("period");
                    if (!printColBPeriodId) {
                      const alt = periods.find((p) => p.id !== selectedPeriodId);
                      setPrintColBPeriodId(alt ? alt.id : periods[0].id);
                    }
                  }}
                >
                  Anden periode
                </button>
              </div>
              {printColBMode === "period" && periods.length >= 2 && (
                <div>
                  <div style={styles.fieldLabel}>Vælg periode til sammenligning</div>
                  <select
                    style={styles.select}
                    value={printColBPeriodId || ""}
                    onChange={(e) => setPrintColBPeriodId(e.target.value)}
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} · {formatDate(p.date)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p style={styles.subtext}>
                Rapporten viser {selectedPeriod ? selectedPeriod.label : "den valgte periode"} i
                første kolonne, samt {printColBMode === "goal" ? "målene" : "den valgte periode"}{" "}
                i anden kolonne — på én side, klar til udskrift eller "Gem som PDF".
              </p>
              <button
                style={styles.primaryBtn}
                onClick={() => window.print()}
              >
                <Printer size={16} /> Udskriv nu
              </button>
            </div>
          )}

          {selectedPeriod && (
            <PrintableReport
              player={player}
              teamName={teams.find((t) => t.id === player.teamId)?.name}
              config={config}
              goals={goals}
              colA={{
                label: `${selectedPeriod.label} (${formatDate(selectedPeriod.date)})`,
                scores,
              }}
              colB={
                printColBMode === "goal"
                  ? {
                      label: "Mål",
                      scores: Object.fromEntries(
                        Object.keys(goals).map((id) => [id, goals[id].target])
                      ),
                    }
                  : {
                      label: (() => {
                        const p = periods.find((pp) => pp.id === printColBPeriodId);
                        return p ? `${p.label} (${formatDate(p.date)})` : "Anden periode";
                      })(),
                      scores: printColBPeriodId
                        ? evaluations[printColBPeriodId]?.scores || {}
                        : {},
                    }
              }
            />
          )}

          {compareMode && periods.length >= 2 ? (
            <CompareView config={config} periods={periods} evaluations={evaluations} />
          ) : (
            selectedPeriod && (
              <>
                <div style={styles.radarCard}>
                  <p style={styles.radarHint}>Tryk på en kategori for at se de enkelte kriterier</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#D9D4C7" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => (
                          <CategoryAxisTick {...props} onSelect={setDrilldownCat} />
                        )}
                      />
                      <Radar
                        name="Træner"
                        dataKey="value"
                        stroke="#E2231A"
                        fill="#E2231A"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      {hasGoals && (
                        <Radar
                          name="Mål"
                          dataKey="goal"
                          stroke={GOAL_COLOR}
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          isAnimationActive={false}
                        />
                      )}
                      {hasGoals && (
                        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
                      )}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {drilldownCat && (
                  <SkillDrilldownRadar
                    config={config}
                    catKey={drilldownCat}
                    scores={scores}
                    goals={goals}
                    onClose={() => setDrilldownCat(null)}
                  />
                )}

                <div style={styles.evalMetaRow}>
                  <span style={styles.subtext}>
                    Redigerer <strong>{selectedPeriod.label}</strong> · {formatDate(selectedPeriod.date)}
                  </span>
                </div>

                {CATEGORY_META.map((cat) => {
                  const skills = config[cat.key].filter((s) => s.enabled);
                  const avg = categoryAverage(config, scores, cat.key);
                  return (
                    <div key={cat.key} style={styles.categoryBlock}>
                      <div style={styles.categoryHeadRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ ...styles.dot, background: cat.accent }} />
                          <span style={styles.categoryLabel}>{cat.label}</span>
                        </div>
                        <span style={{ ...styles.categoryAvg, color: cat.accent }}>
                          {avg ? avg.toFixed(1) : "—"}
                        </span>
                      </div>
                      {skills.length === 0 ? (
                        <div style={styles.noSkills}>Ingen aktive kriterier i denne kategori.</div>
                      ) : (
                        skills.map((skill) => {
                          const goal = goals[skill.id];
                          const currentVal = scores[skill.id];
                          const achieved =
                            goal && typeof currentVal === "number" && currentVal >= goal.target;
                          const isEditingGoal = goalEditingId === skill.id;
                          return (
                            <div key={skill.id} style={styles.skillBlock}>
                              <div style={styles.skillTopRow}>
                                <span style={styles.skillName}>{skill.name}</span>
                                {goal && !isEditingGoal && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span
                                      style={{
                                        ...styles.goalChip,
                                        ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                                      }}
                                    >
                                      <Target size={11} /> Mål {goal.target}
                                      {achieved ? " ✓" : ""}
                                    </span>
                                    <button
                                      style={styles.iconBtnGhost}
                                      onClick={() => openGoalEditor(skill.id)}
                                      title="Rediger mål"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      style={styles.iconBtnGhost}
                                      onClick={() => onRemoveGoal(skill.id)}
                                      title="Fjern mål"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                )}
                                {!goal && !isEditingGoal && (
                                  <button style={styles.linkBtn} onClick={() => openGoalEditor(skill.id)}>
                                    <Target size={11} /> Sæt mål
                                  </button>
                                )}
                              </div>

                              {goal && goal.note && !isEditingGoal && (
                                <div style={styles.goalNote}>
                                  <strong>Øvelser:</strong> {goal.note}
                                </div>
                              )}

                              {isEditingGoal && (
                                <div style={styles.goalEditRow}>
                                  <div style={styles.fieldLabel}>Målscore</div>
                                  <div style={styles.scoreButtons}>
                                    {[1, 2, 3, 4, 5].map((v) => (
                                      <button
                                        key={v}
                                        onClick={() => setGoalTargetDraft(v)}
                                        style={{
                                          ...styles.scoreBtn,
                                          background: goalTargetDraft === v ? "#5C6B73" : "#FFFFFF",
                                          color: goalTargetDraft === v ? "#FFFFFF" : "#1A1A1A",
                                          borderColor: goalTargetDraft === v ? "#5C6B73" : "#D9D4C7",
                                        }}
                                      >
                                        {v}
                                      </button>
                                    ))}
                                  </div>
                                  <div style={styles.fieldLabel}>Fokusøvelser (valgfrit)</div>
                                  <input
                                    style={styles.input}
                                    placeholder="fx kegleslalom, vægspil"
                                    value={goalNoteDraft}
                                    maxLength={60}
                                    onChange={(e) => setGoalNoteDraft(e.target.value)}
                                  />
                                  <div style={styles.charCount}>{goalNoteDraft.length}/60</div>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      style={styles.primaryBtnSm}
                                      onClick={() => saveGoal(skill.id)}
                                    >
                                      Gem mål
                                    </button>
                                    <button
                                      style={styles.ghostBtn}
                                      onClick={() => setGoalEditingId(null)}
                                    >
                                      Annuller
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div style={styles.scoreButtons}>
                                {[1, 2, 3, 4, 5].map((v) => {
                                  const active = scores[skill.id] === v;
                                  return (
                                    <button
                                      key={v}
                                      onClick={() => onScore(selectedPeriod.id, skill.id, v)}
                                      style={{
                                        ...styles.scoreBtn,
                                        background: active ? scoreColor(v) : "#FFFFFF",
                                        color: active ? "#FFFFFF" : "#1A1A1A",
                                        borderColor: active ? scoreColor(v) : "#D9D4C7",
                                      }}
                                    >
                                      {v}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </>
            )
          )}
        </>
      )}
    </div>
  );
}

function GoalsOverview({
  config,
  goals,
  scores,
  periodLabel,
  goalEditingId,
  goalTargetDraft,
  goalNoteDraft,
  setGoalTargetDraft,
  setGoalNoteDraft,
  onOpenEditor,
  onCloseEditor,
  onSave,
  onRemove,
  onSetProgress,
}) {
  const entries = Object.keys(goals)
    .map((skillId) => {
      const meta = findSkillMeta(config, skillId);
      if (!meta) return null;
      return { skillId, goal: goals[skillId], ...meta };
    })
    .filter(Boolean)
    .sort((a, b) => a.category.label.localeCompare(b.category.label) || a.skill.name.localeCompare(b.skill.name));

  if (entries.length === 0) return null;

  const metCount = entries.filter(
    (e) => typeof scores[e.skillId] === "number" && scores[e.skillId] >= e.goal.target
  ).length;

  return (
    <div style={styles.goalsOverviewCard}>
      <div style={styles.goalsOverviewHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={16} color="#1A1A1A" />
          <span style={styles.categoryLabel}>Udviklingsmål</span>
        </div>
        <span style={styles.subtext}>
          {metCount} af {entries.length} nået{periodLabel ? ` · ${periodLabel}` : ""}
        </span>
      </div>

      {entries.map(({ skillId, goal, skill, category }) => {
        const currentVal = scores[skillId];
        const achieved = typeof currentVal === "number" && currentVal >= goal.target;
        const isEditing = goalEditingId === skillId;
        return (
          <div key={skillId} style={styles.goalOverviewRow}>
            <div style={styles.goalOverviewTop}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ ...styles.dot, background: category.accent }} />
                  <span style={styles.skillName}>{skill.name}</span>
                  <span style={styles.goalOverviewCat}>{category.label}</span>
                </div>
                {goal.note && !isEditing && (
                  <div style={styles.goalNote}>
                    <strong>Øvelser:</strong> {goal.note}
                  </div>
                )}
              </div>
              {!isEditing && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      ...styles.goalChip,
                      ...(achieved ? styles.goalChipMet : styles.goalChipPending),
                    }}
                  >
                    <Target size={11} /> Mål {goal.target}
                    {achieved ? " ✓" : ""}
                  </span>
                  <button
                    style={styles.iconBtnGhost}
                    onClick={() => onOpenEditor(skillId)}
                    title="Rediger mål"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    style={styles.iconBtnGhost}
                    onClick={() => onRemove(skillId)}
                    title="Fjern mål"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div style={styles.goalEditRow}>
                <div style={styles.fieldLabel}>Målscore</div>
                <div style={styles.scoreButtons}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGoalTargetDraft(v)}
                      style={{
                        ...styles.scoreBtn,
                        background: goalTargetDraft === v ? "#5C6B73" : "#FFFFFF",
                        color: goalTargetDraft === v ? "#FFFFFF" : "#1A1A1A",
                        borderColor: goalTargetDraft === v ? "#5C6B73" : "#D9D4C7",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div style={styles.fieldLabel}>Fokusøvelser (valgfrit)</div>
                <input
                  style={styles.input}
                  placeholder="fx kegleslalom, vægspil"
                  value={goalNoteDraft}
                  maxLength={60}
                  onChange={(e) => setGoalNoteDraft(e.target.value)}
                />
                <div style={styles.charCount}>{goalNoteDraft.length}/60</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.primaryBtnSm} onClick={() => onSave(skillId)}>
                    Gem mål
                  </button>
                  <button style={styles.ghostBtn} onClick={onCloseEditor}>
                    Annuller
                  </button>
                </div>
              </div>
            )}

            {!isEditing && (
              <ProgressTracker
                value={goal.progress}
                onChange={(v) => onSetProgress(skillId, v)}
                compact
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .print-report, .print-report * { visibility: visible; }
        .print-report { position: absolute; top: 0; left: 0; width: 100%; }
        @page { size: A4; margin: 10mm; }
      }
      @media screen {
        .print-report { display: none; }
      }
    `}</style>
  );
}

function PrintableReport({ player, teamName, config, goals, colA, colB }) {
  return (
    <div className="print-report" style={pstyles.page}>
      <div style={pstyles.headRow}>
        <img src={LOGO_SRC} alt="Klublogo" style={pstyles.logo} />
        <div>
          <div style={pstyles.title}>
            Spillerprofil {player.name}
            {player.positions && player.positions.length > 0 ? ` — ${player.positions.join(", ")}` : ""}
          </div>
          {teamName && <div style={pstyles.subtitle}>{teamName}</div>}
        </div>
      </div>

      <div style={pstyles.grid}>
        {CATEGORY_META.map((cat) => {
          const skills = config[cat.key].filter((s) => s.enabled);
          const totA = categoryTotal(config, colA.scores, cat.key);
          const totB = categoryTotal(config, colB.scores, cat.key);
          return (
            <table key={cat.key} style={pstyles.table}>
              <thead>
                <tr>
                  <th style={{ ...pstyles.th, ...pstyles.thName, background: cat.accent }}>
                    {cat.label}
                  </th>
                  <th style={{ ...pstyles.th, background: cat.accent }}>{colA.label}</th>
                  <th style={{ ...pstyles.th, background: cat.accent }}>{colB.label}</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.id}>
                    <td style={pstyles.tdName}>{s.name}</td>
                    <td style={pstyles.td}>{colA.scores[s.id] ?? ""}</td>
                    <td style={pstyles.td}>{colB.scores[s.id] ?? ""}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...pstyles.tdName, fontWeight: 700 }}>Total</td>
                  <td style={{ ...pstyles.td, fontWeight: 700 }}>{totA.total}</td>
                  <td style={{ ...pstyles.td, fontWeight: 700 }}>{totB.total}</td>
                </tr>
                <tr>
                  <td style={{ ...pstyles.tdName, fontWeight: 700 }}>Gennemsnit</td>
                  <td style={{ ...pstyles.td, fontWeight: 700 }}>{totA.avg.toFixed(2)}</td>
                  <td style={{ ...pstyles.td, fontWeight: 700 }}>{totB.avg.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          );
        })}
      </div>

      <div style={pstyles.footerRow}>
        <table style={pstyles.legendTable}>
          <thead>
            <tr>
              <th colSpan={3} style={pstyles.legendHead}>
                Scoreinddeling — ud af 10 aktioner
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={pstyles.legendTd}>Fremragende</td>
              <td style={pstyles.legendTd}>5</td>
              <td style={pstyles.legendTd}>9/10 vellykkede aktioner</td>
            </tr>
            <tr>
              <td style={pstyles.legendTd}>Over middel</td>
              <td style={pstyles.legendTd}>4</td>
              <td style={pstyles.legendTd}>7/8 vellykkede aktioner</td>
            </tr>
            <tr>
              <td style={pstyles.legendTd}>Middel</td>
              <td style={pstyles.legendTd}>3</td>
              <td style={pstyles.legendTd}>5/6 vellykkede aktioner</td>
            </tr>
            <tr>
              <td style={pstyles.legendTd}>Kunne være bedre</td>
              <td style={pstyles.legendTd}>2</td>
              <td style={pstyles.legendTd}>3/4 vellykkede aktioner</td>
            </tr>
            <tr>
              <td style={pstyles.legendTd}>Udviklingsområde</td>
              <td style={pstyles.legendTd}>1</td>
              <td style={pstyles.legendTd}>1/2 vellykkede aktioner</td>
            </tr>
          </tbody>
        </table>

        {Object.keys(goals).length > 0 && (
          <div style={pstyles.goalsBox}>
            <div style={pstyles.goalsTitle}>Udviklingsmål</div>
            {Object.keys(goals).map((skillId) => {
              const meta = findSkillMeta(config, skillId);
              if (!meta) return null;
              const goal = goals[skillId];
              return (
                <div key={skillId} style={pstyles.goalLine}>
                  <strong>{meta.skill.name}</strong> — Mål: {goal.target}
                  {typeof goal.progress === "number" ? ` — Fremskridt: ${goal.progress}/10` : ""}
                  {goal.note ? ` — Øvelser: ${goal.note}` : ""}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const pstyles = {
  page: {
    width: "190mm",
    fontFamily: "Arial, sans-serif",
    color: "#111111",
    fontSize: "8.5pt",
  },
  headRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    borderBottom: "2px solid #111111",
    paddingBottom: 6,
  },
  logo: { width: 34, height: 34, objectFit: "contain" },
  title: { fontSize: "13pt", fontWeight: 700 },
  subtitle: { fontSize: "9pt", color: "#4A4A4A" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #111111",
  },
  th: {
    border: "1px solid #111111",
    padding: "3px 5px",
    color: "#FFFFFF",
    fontSize: "8pt",
    textAlign: "center",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  thName: { textAlign: "left" },
  td: {
    border: "1px solid #B0B0B0",
    padding: "2.5px 5px",
    textAlign: "center",
  },
  tdName: {
    border: "1px solid #B0B0B0",
    padding: "2.5px 5px",
    textAlign: "left",
  },
  footerRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    alignItems: "start",
  },
  legendTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #111111",
    fontSize: "7.5pt",
  },
  legendHead: {
    border: "1px solid #111111",
    background: "#111111",
    color: "#FFFFFF",
    padding: "3px 5px",
    textAlign: "left",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  legendTd: {
    border: "1px solid #B0B0B0",
    padding: "2px 5px",
  },
  goalsBox: {
    border: "1px solid #111111",
    padding: "6px 8px",
    fontSize: "7.5pt",
  },
  goalsTitle: { fontWeight: 700, fontSize: "8.5pt", marginBottom: 4 },
  goalLine: { marginBottom: 3, lineHeight: 1.35 },
};

function CompareView({ config, periods, evaluations }) {
  const [fromId, setFromId] = useState(periods[0].id);
  const [toId, setToId] = useState(periods[periods.length - 1].id);

  const fromScores = evaluations[fromId]?.scores || {};
  const toScores = evaluations[toId]?.scores || {};
  const fromPeriod = periods.find((p) => p.id === fromId);
  const toPeriod = periods.find((p) => p.id === toId);

  const radarData = CATEGORY_META.map((c) => ({
    subject: c.short,
    from: categoryAverage(config, fromScores, c.key) || 0,
    to: categoryAverage(config, toScores, c.key) || 0,
  }));

  const overallFrom = overallAverage(config, fromScores);
  const overallTo = overallAverage(config, toScores);
  const overallDelta =
    overallFrom != null && overallTo != null ? overallTo - overallFrom : null;

  return (
    <div>
      <div style={styles.compareSelectRow}>
        <div style={{ flex: 1 }}>
          <div style={styles.fieldLabel}>Fra</div>
          <select style={styles.select} value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {formatDate(p.date)}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.fieldLabel}>Til</div>
          <select style={styles.select} value={toId} onChange={(e) => setToId(e.target.value)}>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · {formatDate(p.date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.radarCard}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} outerRadius="65%">
            <PolarGrid stroke="#D9D4C7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#1A1A1A", fontSize: 12, fontFamily: "'Oswald', sans-serif" }}
            />
            <Radar
              name={fromPeriod ? fromPeriod.label : "Fra"}
              dataKey="from"
              stroke={EVAL_COLORS[0]}
              fill={EVAL_COLORS[0]}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Radar
              name={toPeriod ? toPeriod.label : "Til"}
              dataKey="to"
              stroke={EVAL_COLORS[1]}
              fill={EVAL_COLORS[1]}
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Inter', sans-serif" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.overallCompareCard}>
        <div>
          <div style={styles.fieldLabel}>Samlet</div>
          <div style={styles.overallCompareNums}>
            <span>{overallFrom != null ? overallFrom.toFixed(1) : "—"}</span>
            <span style={{ color: "#B9B2A0" }}>→</span>
            <span>{overallTo != null ? overallTo.toFixed(1) : "—"}</span>
          </div>
        </div>
        <DeltaBadge value={overallDelta} />
      </div>

      {CATEGORY_META.map((cat) => {
        const fromAvg = categoryAverage(config, fromScores, cat.key);
        const toAvg = categoryAverage(config, toScores, cat.key);
        const delta = fromAvg != null && toAvg != null ? toAvg - fromAvg : null;
        const skills = config[cat.key].filter((s) => s.enabled);
        return (
          <div key={cat.key} style={styles.categoryBlock}>
            <div style={styles.categoryHeadRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ ...styles.dot, background: cat.accent }} />
                <span style={styles.categoryLabel}>{cat.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={styles.compareNums}>
                  {fromAvg != null ? fromAvg.toFixed(1) : "—"} → {toAvg != null ? toAvg.toFixed(1) : "—"}
                </span>
                <DeltaBadge value={delta} compact />
              </div>
            </div>
            {skills.map((skill) => {
              const fv = fromScores[skill.id];
              const tv = toScores[skill.id];
              const d = typeof fv === "number" && typeof tv === "number" ? tv - fv : null;
              return (
                <div key={skill.id} style={styles.skillRow}>
                  <span style={styles.skillName}>{skill.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.compareNums}>
                      {fv ?? "—"} → {tv ?? "—"}
                    </span>
                    <DeltaBadge value={d} compact />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DeltaBadge({ value, compact }) {
  if (value == null) {
    return <span style={{ ...styles.deltaBadge, ...styles.deltaNeutral }}>—</span>;
  }
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) {
    return (
      <span style={{ ...styles.deltaBadge, ...styles.deltaNeutral }}>
        <Minus size={compact ? 10 : 12} /> 0
      </span>
    );
  }
  const up = rounded > 0;
  return (
    <span style={{ ...styles.deltaBadge, ...(up ? styles.deltaUp : styles.deltaDown) }}>
      {up ? <ArrowUp size={compact ? 10 : 12} /> : <ArrowDown size={compact ? 10 : 12} />}
      {up ? "+" : ""}
      {rounded}
    </span>
  );
}

function SettingsView({ config, onRename, onToggle }) {
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <h1 style={styles.h1}>Vurderingskriterier</h1>
      <p style={styles.subtext}>
        Omdøb kriterier, eller deaktivér dem, jeres klub ikke bruger. Deaktiverede kriterier
        udgår af alle spilleres kategori-gennemsnit.
      </p>

      {CATEGORY_META.map((cat) => (
        <div key={cat.key} style={styles.categoryBlock}>
          <div style={styles.categoryHeadRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ ...styles.dot, background: cat.accent }} />
              <span style={styles.categoryLabel}>{cat.label}</span>
            </div>
          </div>
          {config[cat.key].map((skill) => (
            <div key={skill.id} style={styles.settingsRow}>
              {editing === skill.id ? (
                <input
                  style={styles.editInput}
                  defaultValue={skill.name}
                  autoFocus
                  onBlur={(e) => {
                    onRename(cat.key, skill.id, e.target.value.trim() || skill.name);
                    setEditing(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.target.blur();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <span
                  style={{
                    ...styles.skillName,
                    opacity: skill.enabled ? 1 : 0.4,
                    textDecoration: skill.enabled ? "none" : "line-through",
                  }}
                >
                  {skill.name}
                </span>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button style={styles.iconBtn} onClick={() => setEditing(skill.id)} title="Omdøb">
                  <Pencil size={14} />
                </button>
                <button
                  style={styles.iconBtn}
                  onClick={() => onToggle(cat.key, skill.id)}
                  title={skill.enabled ? "Deaktiver" : "Aktiver"}
                >
                  {skill.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F7F7F5",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#1A1A1A",
    paddingBottom: 60,
  },
  loadingWrap: {
    minHeight: "100vh",
    background: "#111111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  headerTopBar: {
    background: "#FFFFFF",
    borderBottom: "1px solid #E3E3E3",
  },
  headerTopRow: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerNavBar: {
    background: "#111111",
  },
  brand: {
    display: "flex",
    flexDirection: "column",
  },
  brandText: {
    color: "#111111",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 17,
    letterSpacing: 1.5,
    fontWeight: 700,
  },
  brandSub: {
    color: "#6B6B6B",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  logoImg: {
    width: 40,
    height: 40,
    objectFit: "contain",
    flexShrink: 0,
  },
  nav: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "8px 20px 12px",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#C9C9C9",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  navBtnActive: {
    background: "#E2231A",
    color: "#FFFFFF",
  },
  headerStripes: {
    height: 4,
    background:
      "repeating-linear-gradient(90deg, #E2231A 0px, #E2231A 40px, #111111 40px, #111111 80px)",
  },
  main: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "28px 20px",
  },
  errorBanner: {
    background: "#F4E0DD",
    color: "#8A3A31",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  sectionHeadRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  h1: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 26,
    letterSpacing: 0.5,
    margin: 0,
    color: "#111111",
  },
  subtext: {
    color: "#6B6B6B",
    fontSize: 14,
    margin: "4px 0 0",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#111111",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  primaryBtnSm: {
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
  compareBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#FFFFFF",
    color: "#111111",
    border: "1px solid #D9D4C7",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  compareBtnActive: {
    background: "#E2231A",
    color: "#FFFFFF",
    borderColor: "#E2231A",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #D9D4C7",
    color: "#1A1A1A",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "#E2231A",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  addCard: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  addCardCol: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#6B6B6B",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  positionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  positionChip: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  positionRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  linkBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#111111",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  linkBtnDanger: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#E2231A",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  positionEditCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
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
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    background: "#FFFFFF",
    borderRadius: 10,
    border: "1px dashed #D9D4C7",
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  playerCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    cursor: "pointer",
  },
  playerCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#111111",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 14,
    fontWeight: 600,
  },
  numberBadgeLg: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#111111",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    flexShrink: 0,
  },
  overallPill: {
    color: "#FFFFFF",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
  },
  playerName: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 2,
  },
  playerPos: {
    color: "#6B6B6B",
    fontSize: 13,
    marginBottom: 12,
  },
  miniBars: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  miniBarTrack: {
    height: 5,
    background: "#EFEFEF",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  evalCountTag: {
    marginTop: 10,
    fontSize: 11,
    color: "#B9B2A0",
    fontWeight: 600,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#111111",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    padding: "6px 0",
    marginBottom: 12,
  },
  playerHeadRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconDangerBtn: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    color: "#E2231A",
    borderRadius: 8,
    padding: 8,
    cursor: "pointer",
  },
  evalBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  evalTabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    minWidth: 0,
  },
  evalTab: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  evalTabActive: {
    background: "#E2231A",
    borderColor: "#E2231A",
    color: "#FFFFFF",
  },
  evalTabDate: {
    fontSize: 11,
    opacity: 0.7,
  },
  evalMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 8,
  },
  periodRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    flexWrap: "wrap",
  },
  teamFilterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  teamFilterChip: {
    background: "#FFFFFF",
    border: "1px solid #D9D4C7",
    color: "#1A1A1A",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  teamFilterChipActive: {
    background: "#111111",
    borderColor: "#111111",
    color: "#FFFFFF",
  },
  teamBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#5C6B73",
    fontWeight: 700,
    marginBottom: 10,
  },
  teamRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  linkCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderLeft: "4px solid #E2231A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  linkRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  },
  linkInput: {
    flex: 1,
    minWidth: 180,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #D9D4C7",
    fontSize: 12,
    fontFamily: "monospace",
    color: "#6B6B6B",
    background: "#F7F7F5",
  },
  compareSelectRow: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  overallCompareCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  overallCompareNums: {
    display: "flex",
    gap: 8,
    fontFamily: "'Oswald', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#111111",
  },
  compareNums: {
    fontSize: 13,
    color: "#6B6B6B",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  deltaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  deltaUp: {
    background: "#E4EEE0",
    color: "#2F5D46",
  },
  deltaDown: {
    background: "#F4E0DD",
    color: "#8A3A31",
  },
  deltaNeutral: {
    background: "#EFEFEF",
    color: "#6B6B6B",
  },
  radarCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  radarHint: {
    fontSize: 11,
    color: "#B9B2A0",
    textAlign: "center",
    margin: "4px 0 0",
    fontWeight: 600,
  },
  drilldownHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px 0",
    marginBottom: 4,
  },
  categoryBlock: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  categoryHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  categoryLabel: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  categoryAvg: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 700,
  },
  skillRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderTop: "1px solid #F0F0F0",
    gap: 10,
    flexWrap: "wrap",
  },
  skillBlock: {
    padding: "10px 0",
    borderTop: "1px solid #F0F0F0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  skillTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  infoBanner: {
    background: "#F3EBDA",
    color: "#5A4A25",
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  readOnlyScorePill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 32,
    padding: "0 8px",
    borderRadius: 8,
    color: "#FFFFFF",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 15,
    fontWeight: 700,
  },
  scoreButtons: {
    display: "flex",
    gap: 8,
  },
  scoreBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "1.5px solid",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Oswald', sans-serif",
  },
  goalChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  goalChipMet: {
    background: "#E4EEE0",
    color: "#2F5D46",
  },
  goalChipPending: {
    background: "#F3EBDA",
    color: "#8A6D3D",
  },
  iconBtnGhost: {
    background: "transparent",
    border: "none",
    color: "#6B6B6B",
    cursor: "pointer",
    padding: 2,
    display: "flex",
    alignItems: "center",
  },
  goalNote: {
    fontSize: 12,
    color: "#6B6B6B",
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 11,
    color: "#B9B2A0",
    textAlign: "right",
    marginTop: -4,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  progressButtons: {
    display: "flex",
    gap: 3,
    flexWrap: "wrap",
  },
  progressBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  progressBtnCompact: {
    width: 22,
    height: 22,
    borderRadius: 5,
    border: "1px solid",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#5C6B73",
    minWidth: 34,
  },
  coachPlayerCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  coachPlayerHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    paddingBottom: 10,
    marginBottom: 6,
    borderBottom: "1px solid #F0F0F0",
  },
  goalEditRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#F7F7F5",
    borderRadius: 8,
    padding: 10,
  },
  goalsOverviewCard: {
    background: "#FFFFFF",
    border: "1px solid #E3E3E3",
    borderLeft: "4px solid #111111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goalsOverviewHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 6,
  },
  goalOverviewRow: {
    padding: "10px 0",
    borderTop: "1px solid #F0F0F0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  goalOverviewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  goalOverviewCat: {
    fontSize: 11,
    color: "#B9B2A0",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  noSkills: {
    color: "#B9B2A0",
    fontSize: 13,
    fontStyle: "italic",
  },
  settingsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 0",
    borderTop: "1px solid #F0F0F0",
    gap: 10,
  },
  editInput: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #111111",
    fontSize: 14,
    fontFamily: "inherit",
  },
  iconBtn: {
    background: "#F7F7F5",
    border: "1px solid #E3E3E3",
    borderRadius: 6,
    padding: 6,
    cursor: "pointer",
    color: "#1A1A1A",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,17,17,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 10,
  },
  modalCard: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    maxWidth: 340,
    width: "100%",
  },
  modalTitle: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 18,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
};
