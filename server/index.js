if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const path = require("path");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./db");
const requireAuth = require("./middleware/requireAuth");

const authRouter = require("./routes/auth");
const bootstrapRouter = require("./routes/bootstrap");
const teamsRouter = require("./routes/teams");
const playersRouter = require("./routes/players");
const periodsRouter = require("./routes/periods");
const skillsRouter = require("./routes/skills");
const skillGroupsRouter = require("./routes/skillGroups");
const evaluationsRouter = require("./routes/evaluations");
const goalsRouter = require("./routes/goals");
const selfRouter = require("./routes/self");
const coachesRouter = require("./routes/coaches");
const followupsRouter = require("./routes/followups");
const notificationsRouter = require("./routes/notifications");
const participationLevelsRouter = require("./routes/participationLevels");
const matchPlansRouter = require("./routes/matchPlans");
const matchPlanShareRouter = require("./routes/matchPlanShare");
const matchStatsRouter = require("./routes/matchStats");
const developmentPlansRouter = require("./routes/developmentPlans");
const settingsRouter = require("./routes/settings");
const positionSettingsRouter = require("./routes/positionSettings");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set. Copy .env.example to .env and fill it in.");
}

const app = express();
// Azure App Service (and most PaaS hosts) terminate TLS at a proxy in front
// of the app, so Express itself sees plain HTTP — without this, "secure"
// cookies below would never actually be set on that first hop.
app.set("trust proxy", 1);
app.use(express.json());
app.use(
  session({
    store: new pgSession({ pool, tableName: "session", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// /api/auth (login/setup can't require a session), /api/self (the player
// link), and /api/kampplan-share (the match-plan link) are the mounts
// without requireAuth — both links are token-scoped, never behind coach
// login. Every other API route needs a logged-in coach.
app.use("/api/auth", authRouter);
app.use("/api/self", selfRouter);
app.use("/api/kampplan-share", matchPlanShareRouter);

app.use("/api/bootstrap", requireAuth, bootstrapRouter);
app.use("/api/teams", requireAuth, teamsRouter);
app.use("/api/players", requireAuth, playersRouter);
app.use("/api/periods", requireAuth, periodsRouter);
app.use("/api/skills", requireAuth, skillsRouter);
app.use("/api/skill-groups", requireAuth, skillGroupsRouter);
app.use("/api/players/:playerId/periods/:periodId/scores", requireAuth, evaluationsRouter);
app.use("/api/players/:playerId/periods/:periodId/goals", requireAuth, goalsRouter);
app.use("/api/players/:playerId/followups", requireAuth, followupsRouter);
app.use("/api/coaches", requireAuth, coachesRouter);
app.use("/api/notifications", requireAuth, notificationsRouter);
app.use("/api/participation-levels", requireAuth, participationLevelsRouter);
app.use("/api/match-plans", requireAuth, matchPlansRouter);
app.use("/api/match-plans/:matchPlanId/stats", requireAuth, matchStatsRouter);
app.use("/api/development-plans", requireAuth, developmentPlansRouter);
app.use("/api/settings", requireAuth, settingsRouter);
app.use("/api/position-settings", requireAuth, positionSettingsRouter);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`VB Pige Akademi server listening on port ${port}`);
});
