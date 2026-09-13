const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, numericValue, expectations } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
    if (typeof numericValue !== "number") return res.status(400).json({ error: "numericValue is required" });

    const { rows: maxRows } = await pool.query(
      "select coalesce(max(sort_order), -1) as max_sort from participation_levels"
    );
    const sortOrder = maxRows[0].max_sort + 1;
    const id = crypto.randomUUID();

    await pool.query(
      "insert into participation_levels (id, name, numeric_value, expectations, sort_order) values ($1, $2, $3, $4, $5)",
      [id, name.trim(), numericValue, (expectations || "").trim(), sortOrder]
    );
    res.status(201).json({
      id,
      name: name.trim(),
      numericValue,
      expectations: (expectations || "").trim(),
      sortOrder,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query(
      "select id, name, numeric_value, expectations from participation_levels where id = $1",
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Participation level not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const numericValue =
      req.body.numericValue !== undefined ? req.body.numericValue : existing.numeric_value;
    const expectations =
      req.body.expectations !== undefined ? req.body.expectations : existing.expectations;

    const { rows } = await pool.query(
      `update participation_levels set name = $2, numeric_value = $3, expectations = $4
       where id = $1
       returning id, name, numeric_value, expectations, sort_order`,
      [req.params.id, name, numericValue, expectations]
    );
    const l = rows[0];
    res.json({
      id: l.id,
      name: l.name,
      numericValue: l.numeric_value,
      expectations: l.expectations || "",
      sortOrder: l.sort_order,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    // Players referencing this level fall back to "no level" rather than
    // being blocked or silently deleted (participation_level_id is ON DELETE SET NULL).
    await pool.query("delete from participation_levels where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
