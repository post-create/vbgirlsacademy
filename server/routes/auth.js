const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

function coachOut(row) {
  return { id: row.id, name: row.name, email: row.email || "" };
}

// "Setup needed" means no coach can currently log in — not just "zero
// coaches". Login was added after this app already had real coach rows in
// production (created back when there was no login at all), so a fresh
// migration there has coaches with password_hash = '' rather than an empty
// table. Gating on row count alone would 409 the setup screen shut while
// leaving every real coach permanently locked out.
async function loadSetupState() {
  const { rows } = await pool.query(
    "select id, name, email from coaches where password_hash = '' order by name"
  );
  const { rows: securedCount } = await pool.query(
    "select count(*)::int as n from coaches where password_hash <> ''"
  );
  return { setupNeeded: securedCount[0].n === 0, claimableCoaches: rows.map(coachOut) };
}

// GET /api/auth/status — the client calls this on load to decide what to
// show: the setup screen (see loadSetupState above), the login screen, or
// the app itself.
router.get("/status", async (req, res, next) => {
  try {
    const { setupNeeded, claimableCoaches } = await loadSetupState();
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
    res.json({ setupNeeded, claimableCoaches: setupNeeded ? claimableCoaches : [], coach });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup — only reachable while setupNeeded (see above).
// Two shapes: { claimCoachId, email, password } sets a password on an
// existing passwordless coach row (their evaluations/goals/followups history
// stays exactly as it was — nothing is deleted or recreated); { name, email,
// password } creates a brand new coach, same as the very first install.
// Once at least one coach has a password, this always 409s — from then on,
// new coaches are only created from the (login-protected) Trænere screen,
// and an existing one's password only changes from there too.
router.post("/setup", async (req, res, next) => {
  try {
    const { setupNeeded } = await loadSetupState();
    if (!setupNeeded) {
      return res.status(409).json({ error: "Der findes allerede en konto — log ind i stedet." });
    }

    const { claimCoachId, name, email, password } = req.body || {};
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Adgangskoden skal være mindst 6 tegn." });
    }

    if (claimCoachId) {
      const { rows: existing } = await pool.query(
        "select id, name, email, password_hash from coaches where id = $1",
        [claimCoachId]
      );
      const coach = existing[0];
      if (!coach || coach.password_hash) {
        return res.status(404).json({ error: "Kunne ikke finde den valgte konto." });
      }
      const trimmedEmail = (email || coach.email || "").trim();
      if (!trimmedEmail) {
        return res.status(400).json({ error: "E-mail er påkrævet for at kunne logge ind." });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        `update coaches set email = $2, password_hash = $3 where id = $1
         returning id, name, email`,
        [claimCoachId, trimmedEmail, passwordHash]
      );
      req.session.coachId = rows[0].id;
      return res.status(200).json(coachOut(rows[0]));
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Navn og e-mail er påkrævet." });
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
