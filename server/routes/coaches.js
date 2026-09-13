const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

function coachOut(c) {
  return { id: c.id, name: c.name, email: c.email || "", teamId: c.team_id };
}

async function emailTaken(email, excludingId) {
  if (!email) return false;
  const { rows } = await pool.query(
    excludingId
      ? "select 1 from coaches where lower(email) = lower($1) and id <> $2"
      : "select 1 from coaches where lower(email) = lower($1)",
    excludingId ? [email, excludingId] : [email]
  );
  return rows.length > 0;
}

// A password is required up front (not optional-then-set-later) since the
// whole point of this screen, per how it was asked for, is that creating a
// coach is how they get login access — a passwordless row would just be a
// coach who can never log in, with no separate flow to fix that.
router.post("/", async (req, res, next) => {
  try {
    const { name, email, teamId, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Navn er påkrævet" });
    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) return res.status(400).json({ error: "E-mail er påkrævet for at kunne logge ind" });
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Adgangskode skal være mindst 6 tegn" });
    }
    if (await emailTaken(trimmedEmail)) {
      return res.status(409).json({ error: "En træner med den e-mail findes allerede" });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      "insert into coaches (id, name, email, team_id, password_hash) values ($1, $2, $3, $4, $5)",
      [id, name.trim(), trimmedEmail, teamId || null, passwordHash]
    );
    res.status(201).json({ id, name: name.trim(), email: trimmedEmail, teamId: teamId || null });
  } catch (err) {
    next(err);
  }
});

// password is optional here — omit it (or send "") to leave the existing
// one alone; this is also how an existing coach (created before login
// existed, or by direct DB import) gets a password set for the first time.
router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query(
      "select id, name, email, team_id from coaches where id = $1",
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Coach not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const email = req.body.email !== undefined ? req.body.email.trim() : existing.email;
    const teamId = req.body.teamId !== undefined ? req.body.teamId : existing.team_id;

    if (email && (await emailTaken(email, req.params.id))) {
      return res.status(409).json({ error: "En træner med den e-mail findes allerede" });
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ error: "Adgangskode skal være mindst 6 tegn" });
      }
      const passwordHash = await bcrypt.hash(req.body.password, 12);
      await pool.query("update coaches set password_hash = $2 where id = $1", [
        req.params.id,
        passwordHash,
      ]);
    }

    const { rows } = await pool.query(
      `update coaches set name = $2, email = $3, team_id = $4
       where id = $1
       returning id, name, email, team_id`,
      [req.params.id, name, email, teamId]
    );
    res.json(coachOut(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    // Two guards against locking everyone out of the login screen: can't
    // delete your own account (log in as someone else to remove it), and
    // can't delete the last coach standing regardless of who's logged in.
    if (req.session.coachId === req.params.id) {
      return res.status(400).json({ error: "Du kan ikke slette din egen konto, mens du er logget ind" });
    }
    const { rows } = await pool.query("select count(*)::int as n from coaches");
    if (rows[0].n <= 1) {
      return res.status(400).json({ error: "Der skal altid være mindst én træner tilbage" });
    }
    await pool.query("delete from coaches where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
