-- VB Pige Akademi schema.
-- All ids are app-generated strings (crypto.randomUUID()), not DB-generated,
-- so no Postgres extension needs to be enabled on the server (important for
-- Azure Database for PostgreSQL Flexible Server, where extensions must be
-- allow-listed before CREATE EXTENSION works).

create table if not exists teams (
  id text primary key,
  name text not null
);

create table if not exists players (
  id text primary key,
  name text not null,
  positions text[] not null default '{}',
  number text not null default '',
  email text not null default '',
  team_id text references teams(id) on delete set null,
  self_token text not null unique
);

-- Added after the initial release; safe to re-run against a database that
-- already has the players table from before this column existed.
alter table players add column if not exists email text not null default '';

create table if not exists periods (
  id text primary key,
  label text not null,
  date date not null
);

create table if not exists skills (
  id text primary key,
  category_key text not null,
  name text not null,
  enabled boolean not null default true,
  sort_order integer not null
);

create table if not exists evaluations (
  player_id text not null references players(id) on delete cascade,
  period_id text not null references periods(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  primary key (player_id, period_id, skill_id)
);

create table if not exists goals (
  player_id text not null references players(id) on delete cascade,
  period_id text not null references periods(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  target smallint not null check (target between 1 and 5),
  note text not null default '' check (char_length(note) <= 120),
  focus_areas text not null default '' check (char_length(focus_areas) <= 200),
  progress smallint,
  created_date date not null,
  primary key (player_id, period_id, skill_id)
);

-- Added after the initial release; safe to re-run against a database that
-- already has the goals table from before this column existed. The "note"
-- field (Målsætning) was originally limited to 60 chars; it's now 120.
alter table goals add column if not exists focus_areas text not null default '';
alter table goals drop constraint if exists goals_note_check;
alter table goals add constraint goals_note_check check (char_length(note) <= 120);
alter table goals drop constraint if exists goals_focus_areas_check;
alter table goals add constraint goals_focus_areas_check check (char_length(focus_areas) <= 200);

-- Goals were originally global per (player, skill), shared across every
-- evaluation period. They're now scoped per period instead, so a coach can
-- set a different goal for the same skill in different periods. Existing
-- goals (set before this change) are backfilled onto the most recent period,
-- since that's the closest equivalent to their old "always applies" meaning.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'goals' and column_name = 'period_id'
  ) then
    alter table goals add column period_id text references periods(id) on delete cascade;

    update goals
    set period_id = (select id from periods order by date desc limit 1)
    where period_id is null;

    delete from goals where period_id is null;

    alter table goals alter column period_id set not null;
    alter table goals drop constraint if exists goals_pkey;
    alter table goals add primary key (player_id, period_id, skill_id);
  end if;
end $$;

-- Named sets of skills a player can be evaluated against (e.g. "Standard" vs
-- "Målmand" for goalkeepers). A group spans all categories — it's not scoped
-- to one — and a skill can belong to any number of groups (or none) via
-- skill_group_members. Every player is assigned to exactly one group.
create table if not exists skill_groups (
  id text primary key,
  name text not null,
  sort_order integer not null default 0
);

create table if not exists skill_group_members (
  skill_group_id text not null references skill_groups(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  primary key (skill_group_id, skill_id)
);

-- Migrate from the earlier model (one group per category per skill, with a
-- per-category default/override on the player) to the model above. Existing
-- category-scoped default groups are consolidated into a single "Standard"
-- group carrying forward every skill's membership; existing custom groups
-- (e.g. an already-created "Målmand" group) survive as-is, just no longer
-- tied to one category.
do $$
declare
  standard_id text;
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'skill_groups' and column_name = 'category_key'
  ) then
    select id into standard_id from skill_groups where is_default order by id limit 1;

    if standard_id is not null then
      insert into skill_group_members (skill_group_id, skill_id)
      select case when sg.is_default then standard_id else s.group_id end, s.id
      from skills s
      join skill_groups sg on sg.id = s.group_id
      on conflict do nothing;
    end if;

    -- Drop the column (and its FK) before removing the now-redundant default
    -- groups, so their skills.group_id references don't block the delete.
    alter table skills drop column if exists group_id;

    if standard_id is not null then
      delete from skill_groups where is_default and id <> standard_id;
      update skill_groups set name = 'Standard' where id = standard_id;
    end if;

    alter table skill_groups drop column if exists category_key;
    alter table skill_groups drop column if exists is_default;
    drop table if exists player_skill_groups;
  end if;
end $$;

alter table players add column if not exists skill_group_id text references skill_groups(id);

-- Every player must have a group. Backfill anyone missing one (fresh column,
-- or a player created before a group existed) onto the lowest-sort-order
-- group, creating a fallback "Standard" group if none exists at all.
do $$
declare
  fallback_id text;
begin
  if exists (select 1 from players where skill_group_id is null) then
    select id into fallback_id from skill_groups order by sort_order limit 1;
    if fallback_id is null then
      fallback_id := 'standard';
      insert into skill_groups (id, name, sort_order) values (fallback_id, 'Standard', 0);
    end if;
    update players set skill_group_id = fallback_id where skill_group_id is null;
  end if;
end $$;

alter table players alter column skill_group_id set not null;

-- Configurable levels of participation in the development program (e.g.
-- "Ingen deltagelse" / "Standard" / "Udvidet"), each with a numeric value for
-- sorting and free-text expectations shown to coaches and printed on reports.
create table if not exists participation_levels (
  id text primary key,
  name text not null,
  numeric_value integer not null,
  expectations text not null default '',
  sort_order integer not null default 0
);

alter table players add column if not exists participation_level_id text references participation_levels(id) on delete set null;

-- Long-horizon development goals, entered as free text and printed on the
-- player's report alongside the per-skill goals.
alter table players add column if not exists goal_2_3y text not null default '';
alter table players add column if not exists goal_1_2y text not null default '';
alter table players add column if not exists goal_under_1y text not null default '';

create table if not exists coaches (
  id text primary key,
  name text not null,
  email text not null default '',
  team_id text references teams(id) on delete set null
);

create table if not exists followups (
  id text primary key,
  player_id text not null references players(id) on delete cascade,
  coach_id text references coaches(id) on delete set null,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- Per-match tactical plans (opponent, team goals, phase-based tactics,
-- lineups, individual player goals). The category+text lists and lineups
-- are variable-length and only ever read/written whole, so they're stored
-- as jsonb rather than normalized into extra tables.
create table if not exists match_plans (
  id text primary key,
  opponent text not null default '',
  match_date date not null default current_date,
  team_goals jsonb not null default '[]',
  defense jsonb not null default '[]',
  conquest jsonb not null default '[]',
  build_up jsonb not null default '[]',
  finishing jsonb not null default '[]',
  extras jsonb not null default '[]',
  general_notes text not null default '',
  player_goals jsonb not null default '{}',
  positions jsonb not null default '[]',
  formation text not null default '',
  positions2 jsonb not null default '[]',
  formation2 text not null default '',
  reserves jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A coach's 1-5 rating of how a specific player performed in a specific
-- match, entered after the game. Deliberately its own table (not a jsonb
-- field on match_plans) — an earlier version stored this as jsonb on the
-- plan itself, which meant "Kopiér" (clone a plan as the starting point for
-- a new match) silently copied the old match's ratings along with it, so a
-- player who never played the new match could show a leftover score. A real
-- (match_plan_id, player_id) link makes that structurally impossible: a
-- freshly copied plan gets a new id with zero performance rows, and it also
-- gives a clean base for per-player game-by-game statistics.
create table if not exists match_performance (
  match_plan_id text not null references match_plans(id) on delete cascade,
  player_id text not null references players(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  primary key (match_plan_id, player_id)
);

create index if not exists idx_match_performance_player on match_performance(player_id);

-- One-time migration from the earlier jsonb-on-match_plans design: carry any
-- existing ratings (keyed by player name at the time) into match_performance
-- by resolving each name to a player_id, then drop the old column so it
-- can't be written to (and leak between copies) again. Guarded on the
-- column's existence so it's a no-op once already migrated.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'match_plans' and column_name = 'performance_scores'
  ) then
    insert into match_performance (match_plan_id, player_id, score)
    select mp.id, p.id, (kv.value)::int
    from match_plans mp
    cross join lateral jsonb_each_text(mp.performance_scores) as kv(name, value)
    join players p on trim(p.name) = trim(kv.name)
    where jsonb_typeof(mp.performance_scores) = 'object'
      and (kv.value)::int between 1 and 5
    on conflict (match_plan_id, player_id) do nothing;

    alter table match_plans drop column performance_scores;
  end if;
end $$;

-- One running development plan per player (not scoped to a period — it's
-- meant to be edited in place across a season, unlike goals). The narrative
-- text and match-path/follow-up lists are coach-authored prose, not data the
-- app needs to query into, so they're plain text / jsonb string arrays
-- rather than normalized rows — same reasoning as match_plans' jsonb lists.
-- The season's per-skill targets/notes live in the existing goals table and
-- are pulled in alongside this when the plan is printed, not duplicated here.
create table if not exists development_plans (
  player_id text primary key references players(id) on delete cascade,
  season_label text not null default '',
  intro text not null default '',
  match_path jsonb not null default '[]',
  self_training text not null default '',
  stats_intro text not null default '',
  stats_items jsonb not null default '[]',
  followups jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_players_team_id on players(team_id);
create index if not exists idx_evaluations_player_period on evaluations(player_id, period_id);
create index if not exists idx_goals_player on goals(player_id);
create index if not exists idx_goals_player_period on goals(player_id, period_id);
create index if not exists idx_coaches_team_id on coaches(team_id);
create index if not exists idx_followups_player on followups(player_id, created_at);
create index if not exists idx_players_participation_level on players(participation_level_id);
create index if not exists idx_skill_group_members_skill on skill_group_members(skill_id);
create index if not exists idx_players_skill_group on players(skill_group_id);
create index if not exists idx_match_plans_date on match_plans(match_date);
