const express = require("express");
const pool = require("../db");

const router = express.Router();

// Deliberately an allow-list, not "any key goes" — app_settings is a
// generic key/value table so a future setting doesn't need its own
// migration, but that shouldn't mean this route can write arbitrary keys.
const ALLOWED_KEYS = new Set(["development_plan_prompt"]);

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("select key, value from app_settings");
    const out = {};
    rows.forEach((r) => {
      out[r.key] = r.value;
    });
    res.json(out);
  } catch (err) {
    next(err);
  }
});

router.put("/:key", async (req, res, next) => {
  try {
    if (!ALLOWED_KEYS.has(req.params.key)) {
      return res.status(404).json({ error: "Unknown setting" });
    }
    const value = req.body?.value || "";
    await pool.query(
      `insert into app_settings (key, value) values ($1, $2)
       on conflict (key) do update set value = excluded.value`,
      [req.params.key, value]
    );
    res.json({ key: req.params.key, value });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
