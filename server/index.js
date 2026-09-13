if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const path = require("path");
const express = require("express");

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

const app = express();
app.use(express.json());

app.use("/api/bootstrap", bootstrapRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/periods", periodsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/skill-groups", skillGroupsRouter);
app.use("/api/players/:playerId/periods/:periodId/scores", evaluationsRouter);
app.use("/api/players/:playerId/periods/:periodId/goals", goalsRouter);
app.use("/api/players/:playerId/followups", followupsRouter);
app.use("/api/coaches", coachesRouter);
app.use("/api/self", selfRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/participation-levels", participationLevelsRouter);
app.use("/api/match-plans", matchPlansRouter);

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
