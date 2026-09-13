const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { categoryKey, groupId, name } = req.body;
    if (!categoryKey || !name || !name.trim()) {
      return res.status(400).json({ error: "categoryKey and name are required" });
    }

    if (groupId) {
      const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
        groupId,
      ]);
      if (!groupRows[0]) return res.status(400).json({ error: "groupId not found" });
    }

    const { rows: maxRows } = await pool.query(
      "select coalesce(max(sort_order), -1) as max_sort from skills where category_key = $1",
      [categoryKey]
    );
    const sortOrder = maxRows[0].max_sort + 1;
    const id = crypto.randomUUID();

    await pool.query(
      "insert into skills (id, category_key, name, enabled, sort_order) values ($1, $2, $3, true, $4)",
      [id, categoryKey, name.trim(), sortOrder]
    );

    if (groupId) {
      await pool.query(
        "insert into skill_group_members (skill_group_id, skill_id) values ($1, $2)",
        [groupId, id]
      );
    }

    res.status(201).json({
      id,
      categoryKey,
      name: name.trim(),
      enabled: true,
      groupIds: groupId ? [groupId] : [],
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query("select id, name, enabled from skills where id = $1", [
      req.params.id,
    ]);
    if (!current.rows[0]) return res.status(404).json({ error: "Skill not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const enabled = req.body.enabled !== undefined ? req.body.enabled : existing.enabled;

    const { rows } = await pool.query(
      "update skills set name = $2, enabled = $3 where id = $1 returning id, name, enabled",
      [req.params.id, name, enabled]
    );
    const s = rows[0];
    res.json({ id: s.id, name: s.name, enabled: s.enabled });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
