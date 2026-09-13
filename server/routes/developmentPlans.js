const express = require("express");
const sanitizeHtml = require("sanitize-html");
const pool = require("../db");

const router = express.Router();

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

router.delete("/:playerId", async (req, res, next) => {
  try {
    await pool.query("delete from development_plans where player_id = $1", [req.params.playerId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
