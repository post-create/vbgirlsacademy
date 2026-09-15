const express = require("express");
const sanitizeHtml = require("sanitize-html");
const pool = require("../db");
const claude = require("../claude");

const router = express.Router();

// Mirrors the seed value in schema.sql — used only if that row is somehow
// missing (a database older than this feature, or deleted by hand), so
// "Generér med Claude" degrades to a sane default instead of a 500.
const DEFAULT_PROMPT = `Du er assistenttræner for VB Pige Akademi og skal udkaste en udviklingsplan til en af klubbens spillere, baseret på hendes rigtige evaluerings- og måldata (vedhæftet nedenfor).

Skriv direkte til spilleren (du-form), på dansk, i en varm men konkret trænertone — planen skal kunne læses af både spilleren selv og hendes forældre.

Brug udelukkende de angivne data. Opfind aldrig konkrete tal, kampstatistik eller hændelser, der ikke fremgår nedenfor — hvis noget mangler (fx ingen mål sat endnu), så spring det afsnit over eller nævn det kort i stedet for at gætte.

Strukturér planen med disse afsnit:
1. En kort personlig indledning der hilser på spilleren og opsummerer, hvor hun står nu.
2. Fokusområder — uddyb kort de mål, der allerede er sat; gengiv dem ikke som en ren liste, de vises i forvejen andetsteds i rapporten.
3. Egentræning — et kort, generelt afsnit tilpasset spillerens niveau.
4. Opfølgning — en kort opfordring til løbende dialog med træneren.

Svar udelukkende med HTML og kun disse tags: <h3>, <p>, <ul>, <li>, <strong>, <em>. Ingen andre tags, ingen inline-styles, ingen billeder, ingen indledende forklaring uden for HTML'en.`;

// Everything the model is allowed to know about the player — deliberately
// only what's already real, stored data (never invented). Formatted as
// plain text rather than JSON since it's read by the model, not parsed.
async function buildPlayerContext(playerId) {
  const { rows: playerRows } = await pool.query(
    `select p.id, p.name, p.positions, p.goal_2_3y, p.goal_1_2y, p.goal_under_1y,
            l.name as level_name, l.expectations as level_expectations
     from players p
     left join participation_levels l on l.id = p.participation_level_id
     where p.id = $1`,
    [playerId]
  );
  const player = playerRows[0];
  if (!player) return null;

  const { rows: periodRows } = await pool.query(
    "select id, label, to_char(date, 'YYYY-MM-DD') as date from periods order by date desc limit 1"
  );
  const latestPeriod = periodRows[0] || null;

  let scores = [];
  let goals = [];
  if (latestPeriod) {
    const s = await pool.query(
      `select sk.name as skill_name, e.score
       from evaluations e join skills sk on sk.id = e.skill_id
       where e.player_id = $1 and e.period_id = $2
       order by sk.category_key, sk.sort_order`,
      [playerId, latestPeriod.id]
    );
    scores = s.rows;

    const g = await pool.query(
      `select sk.name as skill_name, g.target, g.note, g.focus_areas, g.progress
       from goals g join skills sk on sk.id = g.skill_id
       where g.player_id = $1 and g.period_id = $2
       order by sk.category_key, sk.sort_order`,
      [playerId, latestPeriod.id]
    );
    goals = g.rows;
  }

  return { player, latestPeriod, scores, goals };
}

function formatPlayerContext({ player, latestPeriod, scores, goals }) {
  const lines = [`Spiller: ${player.name}`];
  if (player.positions?.length) lines.push(`Position(er): ${player.positions.join(", ")}`);
  if (player.level_name) {
    lines.push(`Niveau: ${player.level_name}${player.level_expectations ? " — " + player.level_expectations : ""}`);
  }
  if (player.goal_2_3y) lines.push(`Langsigtet mål (2-3 år): ${player.goal_2_3y}`);
  if (player.goal_1_2y) lines.push(`Langsigtet mål (1-2 år): ${player.goal_1_2y}`);
  if (player.goal_under_1y) lines.push(`Langsigtet mål (under 1 år): ${player.goal_under_1y}`);

  if (!latestPeriod) {
    lines.push("", "(Ingen evalueringsperioder oprettet endnu.)");
    return lines.join("\n");
  }

  lines.push("", `Seneste evaluering (${latestPeriod.label}, ${latestPeriod.date}):`);
  if (scores.length) {
    scores.forEach((s) => lines.push(`- ${s.skill_name}: ${s.score}/5`));
  } else {
    lines.push("(Ingen scorer registreret endnu for denne periode.)");
  }

  if (goals.length) {
    lines.push("", "Aktuelle mål:");
    goals.forEach((g) => {
      let line = `- ${g.skill_name}: mål ${g.target}/5`;
      if (typeof g.progress === "number") line += `, selvvurderet fremskridt ${g.progress}/10`;
      if (g.note) line += ` — Målsætning: ${g.note}`;
      if (g.focus_areas) line += ` — Fokusområder: ${g.focus_areas}`;
      lines.push(line);
    });
  }

  return lines.join("\n");
}

// The coach pastes the whole plan in from wherever it was drafted (Word,
// Google Docs, plain notes), so this has to accept real formatting — but
// it's rendered with dangerouslySetInnerHTML on both the coach and
// player-facing views, so whatever comes in is sanitized down to a small
// allow-list before it's ever stored. In particular: no inline styles or
// classes (so pasted-in fonts/colors don't fight the app's own print and
// screen styling) and no images (a single Word-pasted image can be several
// MB of base64 — well outside what this table is meant to hold).
const SANITIZE_OPTIONS = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li",
    "h1", "h2", "h3", "h4",
    "blockquote", "a",
  ],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
};

function sanitizePlanHtml(html) {
  return sanitizeHtml(html || "", SANITIZE_OPTIONS).trim();
}

function toOut(row) {
  if (!row) return null;
  return {
    playerId: row.player_id,
    seasonLabel: row.season_label || "",
    contentHtml: row.content_html || "",
    updatedAt: row.updated_at,
  };
}

router.get("/:playerId", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "select * from development_plans where player_id = $1",
      [req.params.playerId]
    );
    res.json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

// One plan per player — always an upsert, no separate create/update split.
router.put("/:playerId", async (req, res, next) => {
  try {
    const b = req.body || {};
    const { rows } = await pool.query(
      `insert into development_plans (player_id, season_label, content_html)
       values ($1, $2, $3)
       on conflict (player_id) do update set
         season_label = excluded.season_label,
         content_html = excluded.content_html,
         updated_at = now()
       returning *`,
      [req.params.playerId, b.seasonLabel || "", sanitizePlanHtml(b.contentHtml)]
    );
    res.json(toOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

// Drafts a plan with Claude from the player's real stored data and the
// coach-editable prompt template (Indstillinger → AI-udkast). Returns the
// draft for the coach to review/edit in the RichTextEditor — never saves
// it directly, so a bad or unwanted draft costs nothing to discard.
router.post("/:playerId/generate", async (req, res, next) => {
  try {
    if (!claude.isConfigured()) {
      return res
        .status(503)
        .json({ error: "Claude er ikke sat op endnu — ANTHROPIC_API_KEY mangler på serveren." });
    }

    const ctx = await buildPlayerContext(req.params.playerId);
    if (!ctx) return res.status(404).json({ error: "Player not found" });

    const { rows } = await pool.query(
      "select value from app_settings where key = 'development_plan_prompt'"
    );
    const template = rows[0]?.value || DEFAULT_PROMPT;
    const dataBlock = formatPlayerContext(ctx);

    const message = await claude.getClient().messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content:
            `${template}\n\n---\n` +
            `Her er spillerens rigtige data. Brug kun disse oplysninger — opfind aldrig tal eller ` +
            `detaljer der ikke står her:\n\n${dataBlock}\n\n` +
            `Skriv nu udviklingsplanen som HTML, uden nogen indledning uden for HTML'en.`,
        },
      ],
    });

    const rawHtml = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ contentHtml: sanitizePlanHtml(rawHtml) });
  } catch (err) {
    if (err?.status === 401) {
      return res.status(502).json({ error: "Claude afviste API-nøglen — tjek ANTHROPIC_API_KEY." });
    }
    next(err);
  }
});

router.delete("/:playerId", async (req, res, next) => {
  try {
    await pool.query("delete from development_plans where player_id = $1", [req.params.playerId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
