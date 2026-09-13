const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const { rows: maxRows } = await pool.query(
      "select coalesce(max(sort_order), -1) as max_sort from skill_groups"
    );
    const sortOrder = maxRows[0].max_sort + 1;
    const id = crypto.randomUUID();

    await pool.query("insert into skill_groups (id, name, sort_order) values ($1, $2, $3)", [
      id,
      name.trim(),
      sortOrder,
    ]);
    res.status(201).json({ id, name: name.trim(), sortOrder, skillIds: [] });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

    const { rows } = await pool.query(
      "update skill_groups set name = $2 where id = $1 returning id, name, sort_order",
      [req.params.id, name.trim()]
    );
    if (!rows[0]) return res.status(404).json({ error: "Skill group not found" });
    const g = rows[0];
    res.json({ id: g.id, name: g.name, sortOrder: g.sort_order });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rows: playerRows } = await pool.query(
      "select count(*)::int as count from players where skill_group_id = $1",
      [req.params.id]
    );
    if (playerRows[0].count > 0) {
      return res.status(400).json({
        error: `Kan ikke slette gruppen — ${playerRows[0].count} spiller${
          playerRows[0].count !== 1 ? "e" : ""
        } er tildelt den. Flyt dem til en anden gruppe først.`,
      });
    }

    const { rowCount } = await pool.query("delete from skill_groups where id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: "Skill group not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Add a skill to a group's membership.
router.put("/:id/skills/:skillId", async (req, res, next) => {
  try {
    const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
      req.params.id,
    ]);
    if (!groupRows[0]) return res.status(404).json({ error: "Skill group not found" });
    const { rows: skillRows } = await pool.query("select id from skills where id = $1", [
      req.params.skillId,
    ]);
    if (!skillRows[0]) return res.status(404).json({ error: "Skill not found" });

    await pool.query(
      "insert into skill_group_members (skill_group_id, skill_id) values ($1, $2) on conflict do nothing",
      [req.params.id, req.params.skillId]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Remove a skill from a group's membership.
router.delete("/:id/skills/:skillId", async (req, res, next) => {
  try {
    await pool.query(
      "delete from skill_group_members where skill_group_id = $1 and skill_id = $2",
      [req.params.id, req.params.skillId]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
