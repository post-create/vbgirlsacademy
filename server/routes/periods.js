const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const label = req.body.label || "Ny periode";
    const date = req.body.date || new Date().toISOString().slice(0, 10);
    const id = crypto.randomUUID();
    await pool.query("insert into periods (id, label, date) values ($1, $2, $3)", [
      id,
      label,
      date,
    ]);
    res.status(201).json({ id, label, date });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { label, date } = req.body;
    const { rows } = await pool.query(
      "update periods set label = $2, date = $3 where id = $1 returning id, label, to_char(date, 'YYYY-MM-DD') as date",
      [req.params.id, label, date]
    );
    if (!rows[0]) return res.status(404).json({ error: "Period not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from periods where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
