const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const name = (req.body.name || "Nyt hold").trim() || "Nyt hold";
    const id = crypto.randomUUID();
    await pool.query("insert into teams (id, name) values ($1, $2)", [id, name]);
    res.status(201).json({ id, name });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      "update teams set name = $2 where id = $1 returning id, name",
      [req.params.id, name]
    );
    if (!rows[0]) return res.status(404).json({ error: "Team not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from teams where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
