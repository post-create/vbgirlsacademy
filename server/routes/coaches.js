const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, teamId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

    const id = crypto.randomUUID();
    await pool.query(
      "insert into coaches (id, name, email, team_id) values ($1, $2, $3, $4)",
      [id, name.trim(), (email || "").trim(), teamId || null]
    );
    res.status(201).json({
      id,
      name: name.trim(),
      email: (email || "").trim(),
      teamId: teamId || null,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query(
      "select id, name, email, team_id from coaches where id = $1",
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Coach not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const email = req.body.email !== undefined ? req.body.email : existing.email;
    const teamId = req.body.teamId !== undefined ? req.body.teamId : existing.team_id;

    const { rows } = await pool.query(
      `update coaches set name = $2, email = $3, team_id = $4
       where id = $1
       returning id, name, email, team_id`,
      [req.params.id, name, email, teamId]
    );
    const c = rows[0];
    res.json({ id: c.id, name: c.name, email: c.email || "", teamId: c.team_id });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from coaches where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
