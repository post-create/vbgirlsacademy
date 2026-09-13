const express = require("express");
const pool = require("../db");
const { sendMail, isConfigured } = require("../mailer");

const router = express.Router();

router.post("/self-eval", async (req, res, next) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: "E-mailafsendelse er ikke konfigureret endnu" });
    }

    const { playerIds } = req.body;
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({ error: "playerIds is required" });
    }

    const { rows: players } = await pool.query(
      "select id, name, email, self_token from players where id = any($1::text[])",
      [playerIds]
    );

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;

    const sent = await Promise.all(
      players.map(async (p) => {
        if (!p.email) return { id: p.id, name: p.name, ok: false, reason: "no-email" };
        const link = `${baseUrl}/?player=${p.self_token}`;
        try {
          await sendMail({
            to: p.email,
            subject: "Selvevaluering af dine mål — VB Pige Akademi",
            text:
              `Hej ${p.name}\n\n` +
              `Din træner beder dig evaluere dine mål i VB Pige Akademi.\n\n` +
              `Åbn linket herunder for at gå til din selvevaluering:\n${link}\n\n` +
              `Linket er personligt og viser kun dine egne mål og vurderinger.\n\n` +
              `Mange hilsner\nVB Pige Akademi`,
            html:
              `<p>Hej ${p.name}</p>` +
              `<p>Din træner beder dig evaluere dine mål i VB Pige Akademi.</p>` +
              `<p><a href="${link}">Åbn din selvevaluering</a></p>` +
              `<p>Linket er personligt og viser kun dine egne mål og vurderinger.</p>` +
              `<p>Mange hilsner<br/>VB Pige Akademi</p>`,
          });
          return { id: p.id, name: p.name, ok: true };
        } catch (err) {
          return { id: p.id, name: p.name, ok: false, reason: "send-failed" };
        }
      })
    );

    const foundIds = new Set(players.map((p) => p.id));
    const missing = playerIds
      .filter((id) => !foundIds.has(id))
      .map((id) => ({ id, ok: false, reason: "not-found" }));

    res.json({ results: [...sent, ...missing] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
