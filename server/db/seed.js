const DEFAULT_SKILLS = {
  technique: ["Boldkontrol", "Afleveringer", "Driblinger", "Afslutninger", "Førsteberøring", "Indlæg"],
  physical: ["Hurtighed", "Styrke", "Udholdenhed", "Smidighed", "Balance", "Eksplosivitet"],
  tactical: ["Positionering", "Beslutningstagning", "Overblik", "Samarbejde", "Forsvarsspil", "Bevægelse uden bold"],
  mental: ["Selvtillid", "Ro", "Målrettethed", "Disciplin", "Kommunikation", "Lederskab"],
};

const DEFAULT_PARTICIPATION_LEVELS = [
  { id: "none", name: "Ingen deltagelse", numericValue: 0, expectations: "" },
  { id: "standard", name: "Standard", numericValue: 1, expectations: "" },
  { id: "extended", name: "Udvidet", numericValue: 2, expectations: "" },
];

async function seedSkills(pool) {
  const { rows } = await pool.query("select count(*)::int as count from skills");
  if (rows[0].count > 0) return;

  await pool.query(
    "insert into skill_groups (id, name, sort_order) values ($1, $2, $3) on conflict (id) do nothing",
    ["standard", "Standard", 0]
  );

  const values = [];
  const params = [];
  let i = 1;
  const skillIds = [];
  Object.keys(DEFAULT_SKILLS).forEach((categoryKey) => {
    DEFAULT_SKILLS[categoryKey].forEach((name, index) => {
      const id = `${categoryKey}-${index}`;
      skillIds.push(id);
      values.push(`($${i++}, $${i++}, $${i++}, true, $${i++})`);
      params.push(id, categoryKey, name, index);
    });
  });

  await pool.query(
    `insert into skills (id, category_key, name, enabled, sort_order) values ${values.join(", ")}`,
    params
  );

  const memberValues = [];
  const memberParams = [];
  let m = 1;
  skillIds.forEach((skillId) => {
    memberValues.push(`($${m++}, $${m++})`);
    memberParams.push("standard", skillId);
  });
  await pool.query(
    `insert into skill_group_members (skill_group_id, skill_id) values ${memberValues.join(", ")}`,
    memberParams
  );
}

async function seedParticipationLevels(pool) {
  const { rows } = await pool.query("select count(*)::int as count from participation_levels");
  if (rows[0].count > 0) return;

  const values = [];
  const params = [];
  let i = 1;
  DEFAULT_PARTICIPATION_LEVELS.forEach((level, index) => {
    values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
    params.push(level.id, level.name, level.numericValue, level.expectations, index);
  });

  await pool.query(
    `insert into participation_levels (id, name, numeric_value, expectations, sort_order) values ${values.join(", ")}`,
    params
  );
}

async function seed(pool) {
  await seedSkills(pool);
  await seedParticipationLevels(pool);
}

module.exports = { seed, DEFAULT_SKILLS, DEFAULT_PARTICIPATION_LEVELS };
