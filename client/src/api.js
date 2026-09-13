async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = `${method} ${url} failed with ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) message = body.error;
    } catch (e) {
      /* response body wasn't JSON */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getBootstrap() {
  return request("GET", "/api/bootstrap");
}

export function createTeam(name) {
  return request("POST", "/api/teams", { name });
}

export function renameTeam(id, name) {
  return request("PATCH", `/api/teams/${id}`, { name });
}

export function deleteTeam(id) {
  return request("DELETE", `/api/teams/${id}`);
}

export function createPlayer({ name, positions, number, email, teamId, skillGroupId }) {
  return request("POST", "/api/players", { name, positions, number, email, teamId, skillGroupId });
}

export function updatePlayer(id, patch) {
  return request("PATCH", `/api/players/${id}`, patch);
}

export function deletePlayer(id) {
  return request("DELETE", `/api/players/${id}`);
}

export function createPeriod(label, date) {
  return request("POST", "/api/periods", { label, date });
}

export function renamePeriod(id, label, date) {
  return request("PATCH", `/api/periods/${id}`, { label, date });
}

export function deletePeriod(id) {
  return request("DELETE", `/api/periods/${id}`);
}

export function renameSkill(id, name) {
  return request("PATCH", `/api/skills/${id}`, { name });
}

export function toggleSkill(id, enabled) {
  return request("PATCH", `/api/skills/${id}`, { enabled });
}

export function createSkill({ categoryKey, groupId, name }) {
  return request("POST", "/api/skills", { categoryKey, groupId, name });
}

export function createSkillGroup(name) {
  return request("POST", "/api/skill-groups", { name });
}

export function renameSkillGroup(id, name) {
  return request("PATCH", `/api/skill-groups/${id}`, { name });
}

export function deleteSkillGroup(id) {
  return request("DELETE", `/api/skill-groups/${id}`);
}

export function addSkillToGroup(groupId, skillId) {
  return request("PUT", `/api/skill-groups/${groupId}/skills/${skillId}`);
}

export function removeSkillFromGroup(groupId, skillId) {
  return request("DELETE", `/api/skill-groups/${groupId}/skills/${skillId}`);
}

export function createParticipationLevel({ name, numericValue, expectations }) {
  return request("POST", "/api/participation-levels", { name, numericValue, expectations });
}

export function updateParticipationLevel(id, patch) {
  return request("PATCH", `/api/participation-levels/${id}`, patch);
}

export function deleteParticipationLevel(id) {
  return request("DELETE", `/api/participation-levels/${id}`);
}

export function setScore(playerId, periodId, skillId, value) {
  return request(
    "PUT",
    `/api/players/${playerId}/periods/${periodId}/scores/${skillId}`,
    { value: value === undefined ? null : value }
  );
}

export function setGoal(playerId, periodId, skillId, target, note, focusAreas) {
  return request("PUT", `/api/players/${playerId}/periods/${periodId}/goals/${skillId}`, {
    target,
    note,
    focusAreas,
  });
}

export function setGoalProgress(playerId, periodId, skillId, progress) {
  return request(
    "PATCH",
    `/api/players/${playerId}/periods/${periodId}/goals/${skillId}/progress`,
    { progress }
  );
}

export function removeGoal(playerId, periodId, skillId) {
  return request("DELETE", `/api/players/${playerId}/periods/${periodId}/goals/${skillId}`);
}

export function getSelf(token) {
  return request("GET", `/api/self/${token}`);
}

export function setSelfGoalProgress(token, periodId, skillId, progress) {
  return request(
    "PATCH",
    `/api/self/${token}/periods/${periodId}/goals/${skillId}/progress`,
    { progress }
  );
}

export function createCoach({ name, email, teamId }) {
  return request("POST", "/api/coaches", { name, email, teamId });
}

export function updateCoach(id, patch) {
  return request("PATCH", `/api/coaches/${id}`, patch);
}

export function deleteCoach(id) {
  return request("DELETE", `/api/coaches/${id}`);
}

export function createFollowup(playerId, coachId, note) {
  return request("POST", `/api/players/${playerId}/followups`, { coachId, note });
}

export function deleteFollowup(playerId, followupId) {
  return request("DELETE", `/api/players/${playerId}/followups/${followupId}`);
}

export function sendSelfEvalNotifications(playerIds) {
  return request("POST", "/api/notifications/self-eval", { playerIds });
}

export function getMatchPlans() {
  return request("GET", "/api/match-plans");
}

export function getMatchPlan(id) {
  return request("GET", `/api/match-plans/${id}`);
}

export function createMatchPlan(plan) {
  return request("POST", "/api/match-plans", plan);
}

export function updateMatchPlan(id, plan) {
  return request("PATCH", `/api/match-plans/${id}`, plan);
}

export function deleteMatchPlan(id) {
  return request("DELETE", `/api/match-plans/${id}`);
}

export function setMatchPerformanceScore(planId, playerId, score) {
  return request("PUT", `/api/match-plans/${planId}/performance/${playerId}`, { score });
}

export function saveDevelopmentPlan(playerId, plan) {
  return request("PUT", `/api/development-plans/${playerId}`, plan);
}

export function deleteDevelopmentPlan(playerId) {
  return request("DELETE", `/api/development-plans/${playerId}`);
}
