const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

function coachOut(row) {
  return { id: row.id, name: row.name, email: row.email || "" };
}

// GET /api/auth/status — the client calls this on load to decide what to
// show: the one-time setup screen (no coach exists at all yet — this app
// had no login before, so a fresh install/migration always starts here),
// the login screen, or the app itself.
router.get("/status", async (req, res, next) => {
  try {
    const { rows } = await pool.query("select count(*)::int as n from coaches");
    const setupNeeded = rows[0].n === 0;
    let coach = null;
    if (req.session.coachId) {
      const c = await pool.query("select id, name, email from coaches where id = $1", [
        req.session.coachId,
      ]);
      coach = c.rows[0] ? coachOut(c.rows[0]) : null;
      // The session outlived the coach row (deleted from another tab) —
      // clear it rather than keep pointing at nothing.
      if (!coach) req.session.coachId = null;
    }
    res.json({ setupNeeded, coach });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup — only reachable while the coaches table is empty.
// Creates the first coach account and logs it straight in. Once any coach
// exists, this always 409s — from then on, new coaches are only created
// from the (now login-protected) Trænere screen.
router.post("/setup", async (req, res, next) => {
  try {
    const { rows: existing } = await pool.query("select count(*)::int as n from coaches");
    if (existing[0].n > 0) {
      return res.status(409).json({ error: "Der findes allerede en konto — log ind i stedet." });
    }
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Navn, e-mail og en adgangskode på mindst 6 tegn er påkrævet." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `insert into coaches (id, name, email, password_hash) values ($1, $2, $3, $4)
       returning id, name, email`,
      [crypto.randomUUID(), name.trim(), email.trim().toLowerCase(), passwordHash]
    );
    req.session.coachId = rows[0].id;
    res.status(201).json(coachOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail og adgangskode er påkrævet." });
    }
    const { rows } = await pool.query(
      "select id, name, email, password_hash from coaches where lower(email) = lower($1)",
      [email.trim()]
    );
    const coach = rows[0];
    // Same generic error whether the email doesn't exist, has no password
    // set yet, or the password is wrong — don't leak which one it was.
    const valid =
      coach && coach.password_hash && (await bcrypt.compare(password, coach.password_hash));
    if (!valid) {
      return res.status(401).json({ error: "Forkert e-mail eller adgangskode." });
    }
    req.session.coachId = coach.id;
    res.json(coachOut(coach));
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(204).end();
  });
});

// Mounted before requireAuth in index.js, so it has no session guard of its
// own; every route above is reachable while logged out (that's the point).
module.exports = router;
