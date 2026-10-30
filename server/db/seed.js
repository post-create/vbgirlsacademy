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

// Slot numbers follow the app's 1-11 formation catalog (server/positions.js).
// The numbering inside each formation is a starting point — wing-backs get 3
// and 2, a back three gets 4/5/6 — and is editable per slot under
// Indstillinger -> Formationer. [position, x, y], x/y in percent of the pitch.
const DEFAULT_FORMATIONS = [
  {
    id: 'f-4-4-2',
    name: '1-4-4-2',
    slots: [
      ['1', 50, 90],
      ['3', 13, 72], ['4', 37, 74], ['5', 63, 74], ['2', 87, 72],
      ['7', 13, 50], ['8', 37, 52], ['8', 63, 52], ['11', 87, 50],
      ['9', 37, 22], ['9', 63, 22],
    ],
  },
  {
    id: 'f-4-2-3-1',
    name: '1-4-2-3-1',
    slots: [
      ['1', 50, 90],
      ['3', 13, 72], ['4', 37, 74], ['5', 63, 74], ['2', 87, 72],
      ['6', 37, 56], ['8', 63, 56],
      ['7', 15, 36], ['10', 50, 38], ['11', 85, 36],
      ['9', 50, 15],
    ],
  },
  {
    id: 'f-3-4-3',
    name: '1-3-4-3',
    slots: [
      ['1', 50, 90],
      ['4', 26, 75], ['5', 50, 77], ['6', 74, 75],
      ['3', 11, 52], ['8', 37, 54], ['8', 63, 54], ['2', 89, 52],
      ['7', 16, 24], ['9', 50, 18], ['11', 84, 24],
    ],
  },
  {
    id: 'f-3-4-1-2',
    name: '1-3-4-1-2',
    slots: [
      ['1', 50, 90],
      ['4', 26, 75], ['5', 50, 77], ['6', 74, 75],
      ['3', 11, 54], ['8', 37, 56], ['8', 63, 56], ['2', 89, 54],
      ['10', 50, 36],
      ['9', 37, 16], ['9', 63, 16],
    ],
  },
];

async function seedFormations(pool) {
  const { rows } = await pool.query('select count(*)::int as count from formations');
  if (rows[0].count > 0) return;
  for (let i = 0; i < DEFAULT_FORMATIONS.length; i++) {
    const f = DEFAULT_FORMATIONS[i];
    await pool.query(
      'insert into formations (id, name, slots, sort_order) values ($1, $2, $3, $4)',
      [f.id, f.name, JSON.stringify(f.slots.map(([position, x, y]) => ({ position, x, y }))), i]
    );
  }
}

async function seed(pool) {
  await seedSkills(pool);
  await seedParticipationLevels(pool);
  await seedFormations(pool);
}

module.exports = { seed, DEFAULT_SKILLS, DEFAULT_PARTICIPATION_LEVELS };
