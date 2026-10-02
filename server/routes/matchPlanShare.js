const express = require("express");
const pool = require("../db");

// Public, unauthenticated — a coach shares this link directly with players
// (see KpShareLinkCard / POST /api/match-plans/:id/share for how the token
// is minted). Scoped to exactly one plan's token, same trust model as the
// player self-eval link (server/routes/self.js): a long random token
// stands in for login, never a database id.
const router = express.Router();

router.get("/:token", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select opponent, to_char(match_date, 'YYYY-MM-DD') as date, team_goals, defense, conquest,
              build_up, finishing, extras, player_goals, positions, formation, reserves
       from match_plans where share_token = $1`,
      [req.params.token]
    );
    const plan = rows[0];
    if (!plan) return res.status(404).json({ error: "Dette link findes ikke." });

    // Active through the day after the match — i.e. up to (but not
    // including) 00:00 two days after match_date.
    const matchDate = new Date(`${plan.date}T00:00:00Z`);
    const expiresAt = new Date(matchDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    if (Date.now() >= expiresAt.getTime()) {
      return res.status(410).json({ error: "Dette link er udløbet." });
    }

    res.json({
      opponent: plan.opponent || "",
      date: plan.date,
      teamGoals: plan.team_goals,
      defense: plan.defense,
      conquest: plan.conquest,
      buildUp: plan.build_up,
      finishing: plan.finishing,
      extras: plan.extras,
      playerGoals: plan.player_goals,
      positions: plan.positions,
      formation: plan.formation || "",
      reserves: plan.reserves,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
