const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

function makeSelfToken() {
  return crypto.randomBytes(24).toString("hex");
}

router.post("/", async (req, res, next) => {
  try {
    const { name, positions, number, email, teamId, skillGroupId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
    if (!skillGroupId) return res.status(400).json({ error: "skillGroupId is required" });

    const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
      skillGroupId,
    ]);
    if (!groupRows[0]) return res.status(400).json({ error: "skillGroupId not found" });

    const id = crypto.randomUUID();
    const selfToken = makeSelfToken();
    await pool.query(
      `insert into players (id, name, positions, number, email, team_id, self_token, skill_group_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        name.trim(),
        positions || [],
        (number || "").trim(),
        (email || "").trim(),
        teamId || null,
        selfToken,
        skillGroupId,
      ]
    );
    res.status(201).json({
      id,
      name: name.trim(),
      positions: positions || [],
      number: (number || "").trim(),
      email: (email || "").trim(),
      teamId: teamId || null,
      selfToken,
      skillGroupId,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const current = await pool.query(
      `select id, name, positions, number, email, team_id, self_token, skill_group_id,
              participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y
       from players where id = $1`,
      [req.params.id]
    );
    if (!current.rows[0]) return res.status(404).json({ error: "Player not found" });
    const existing = current.rows[0];

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const positions = req.body.positions !== undefined ? req.body.positions : existing.positions;
    const number = req.body.number !== undefined ? req.body.number : existing.number;
    const email = req.body.email !== undefined ? req.body.email : existing.email;
    const teamId = req.body.teamId !== undefined ? req.body.teamId : existing.team_id;
    const participationLevelId =
      req.body.participationLevelId !== undefined
        ? req.body.participationLevelId
        : existing.participation_level_id;
    const goal2to3y = req.body.goal2to3y !== undefined ? req.body.goal2to3y : existing.goal_2_3y;
    const goal1to2y = req.body.goal1to2y !== undefined ? req.body.goal1to2y : existing.goal_1_2y;
    const goalUnder1y =
      req.body.goalUnder1y !== undefined ? req.body.goalUnder1y : existing.goal_under_1y;

    let skillGroupId = existing.skill_group_id;
    if (req.body.skillGroupId !== undefined) {
      if (!req.body.skillGroupId) {
        return res.status(400).json({ error: "skillGroupId cannot be cleared — every player needs a group" });
      }
      const { rows: groupRows } = await pool.query("select id from skill_groups where id = $1", [
        req.body.skillGroupId,
      ]);
      if (!groupRows[0]) return res.status(400).json({ error: "skillGroupId not found" });
      skillGroupId = req.body.skillGroupId;
    }

    const { rows } = await pool.query(
      `update players set name = $2, positions = $3, number = $4, email = $5, team_id = $6,
              participation_level_id = $7, goal_2_3y = $8, goal_1_2y = $9, goal_under_1y = $10,
              skill_group_id = $11
       where id = $1
       returning id, name, positions, number, email, team_id, self_token, skill_group_id,
                 participation_level_id, goal_2_3y, goal_1_2y, goal_under_1y`,
      [
        req.params.id,
        name,
        positions,
        number,
        email,
        teamId,
        participationLevelId,
        goal2to3y,
        goal1to2y,
        goalUnder1y,
        skillGroupId,
      ]
    );
    const p = rows[0];
    res.json({
      id: p.id,
      name: p.name,
      positions: p.positions || [],
      number: p.number || "",
      email: p.email || "",
      teamId: p.team_id,
      selfToken: p.self_token,
      skillGroupId: p.skill_group_id,
      participationLevelId: p.participation_level_id,
      goal2to3y: p.goal_2_3y || "",
      goal1to2y: p.goal_1_2y || "",
      goalUnder1y: p.goal_under_1y || "",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("delete from players where id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
