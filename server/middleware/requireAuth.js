// Applied to every API router except /api/auth (can't require a session to
// log in) and /api/self (the player self-eval link — token-scoped, and
// deliberately never behind coach login, per how the app is meant to be
// shared with players).
module.exports = function requireAuth(req, res, next) {
  if (!req.session || !req.session.coachId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};
