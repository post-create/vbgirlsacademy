const CATEGORY_ORDER = ["technique", "physical", "tactical", "mental"];

function buildConfig(skillRows, groupRows, membershipRows) {
  const config = {};
  CATEGORY_ORDER.forEach((key) => {
    config[key] = [];
  });

  const groupIdsBySkill = {};
  membershipRows.forEach((row) => {
    if (!groupIdsBySkill[row.skill_id]) groupIdsBySkill[row.skill_id] = [];
    groupIdsBySkill[row.skill_id].push(row.skill_group_id);
  });

  skillRows.forEach((row) => {
    if (!config[row.category_key]) config[row.category_key] = [];
    config[row.category_key].push({
      id: row.id,
      name: row.name,
      enabled: row.enabled,
      groupIds: groupIdsBySkill[row.id] || [],
    });
  });

  config.groups = groupRows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({ id: row.id, name: row.name, sortOrder: row.sort_order }));

  return config;
}

module.exports = { CATEGORY_ORDER, buildConfig };
