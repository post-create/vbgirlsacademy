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
  primary_position text,
  secondary_position text,
  number text not null default '',
  email text not null default '',
  team_id text references teams(id) on delete set null,
  self_token text not null unique
);

-- Added after the initial release; safe to re-run against a database that
-- already has the players table from before this column existed.
alter table players add column if not exists email text not null default '';

alter table players add column if not exists primary_position text;
alter table players add column if not exists secondary_position text;

-- Replaces the old free-form `positions text[]` tagging (a player could
-- carry any number of position tags, mixing letter codes and formation
-- numbers — see server/positions.js) with exactly one primary and one
-- optional secondary formation number. Any database still carrying that
-- column gets it backfilled here — first tag becomes primary, second
-- becomes secondary, any 3rd+ tag is dropped, which is the intended
-- simplification — then the column is retired. Guarded so re-running
-- schema.sql after a coach clears a player's position doesn't resurrect
-- the old tags.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'players' and column_name = 'positions'
  ) then
    update players set
      primary_position = positions[1],
      secondary_position = positions[2]
    where primary_position is null and coalesce(array_length(positions, 1), 0) > 0;
    alter table players drop column positions;
  end if;
end $$;

-- Coach-editable companion to the fixed 1-11 formation catalog in
-- server/positions.js (id/Danish label/abbreviation never change). Two
-- things live here instead, both meant to be tuned per position: which
-- English position abbreviations a stats-tracking export might use for
-- that slot (see server/routes/matchStats.js — this is what lets the
-- import recognise "RM"/"LB"/etc. and match/flag rows against a player's
-- tagged position), and a free-text description of what characterises the
-- position, fed into the AI development-plan prompt (see
-- server/routes/developmentPlans.js). Seeded below with sensible defaults;
-- `on conflict do nothing` so a coach's edits are never overwritten by a
-- later schema.sql run.
create table if not exists position_settings (
  id text primary key,
  aliases text[] not null default '{}',
  characteristics text not null default ''
);

-- The characteristics text below is a detailed taktisk/teknik/fysik/mentalt
-- profile per position, supplied by the club; ids 7 and 11 cross-reference
-- each other by number ("spejlbillede af 11'eren") — 7 is Venstre
-- kant/midtbane and 11 is Højre kant/midtbane per the catalog above, so
-- keep those two in sync if either is ever renumbered.
insert into position_settings (id, aliases, characteristics) values
  ('1', ARRAY['GK'], E'Taktisk: Bruges aktivt til at skabe taloverlægenhed i opbygningen mod højt pres, tør spille langt ved numerisk ligetal/overtal på modstanders sidste linje, indleder etableringen af den kompakte kæde bagfra ved genoprebalance.\nTeknik: Sikker boldbehandling med fødderne under pres, præcise korte og lange afleveringer, god førsteberøring ved opbygning.\nFysik: Eksplosivitet i reaktioner, god rækkevidde, hurtig genrejsning efter redning.\nMentalt: Ro og selvtillid til at spille sig ud af pres frem for at clearere, mod til at tage beslutninger under høj risiko, tydelig kommunikator.'),
  ('2', ARRAY['RB', 'RWB'], E'Taktisk: Smal bagved og bred foran i opbygningen, tiltrækker pres for at skabe rum til medspillere, indgår i forsvarsfeltets zoneprincip centralt/bagerst men presser mandsorienteret i siderummet ved erobringsspil, forsinker og etablerer blokken på siden ved genoprebalance.\nTeknik: Førsteberøring under pres i smal position, kvalitet i indlæg/afleveringer fra bred position foran, sikker 1v1-forsvar.\nFysik: Udholdenhed til konstant op/ned-løb, hurtighed i tilbageløb, styrke i dueller i siderummet.\nMentalt: Disciplin til at vælge smal/bred korrekt situationsbestemt, mod til at tiltrække pres, koncentration i det mandsorienterede sideransvar.'),
  ('3', ARRAY['LB', 'LWB'], E'Taktisk: Spejlbillede af højre back – samme rolle i opbygning (smal bagved/bred foran) og samme mandsorienterede ansvar for siderummet defensivt.\nTeknik/Fysik/Mentalt: Samme profil som 2''eren, spejlvendt (venstrefod til indlæg og løbemønstre).'),
  ('4', ARRAY['CB'], E'Taktisk: Del af zoneforsvaret centralt og bagerst, clearer mod siderum og så langt frem som muligt når presset ikke kan modstås, giver bevidst indrømmelser i det modsatte siderum efter blokprincippet, etablerer den kompakte kæde hurtigst muligt bagfra.\nTeknik: Præcis opspilspasning under pres, ren teknik i clearinger mod siderum, godt førsteberøring i pressede situationer.\nFysik: Styrke i luftdueller, hurtighed i tilbageløb ved dybe bolde, robusthed i den fysiske duel.\nMentalt: Ro til at "stå på bolden" og true rum uden at forhaste beslutningen, mod til at acceptere indrømmelser i modsatte siderum efter blokprincippet.'),
  ('5', ARRAY['CB'], E'Taktisk: Makker til 4''eren i zoneforsvaret – samme ansvar for kompakthed centralt/bagerst, pumper og gør organisationen kompakt når bolden spilles til siden eller baglæns.\nTeknik/Fysik/Mentalt: Samme profil som 4''eren, med ekstra vægt på kommunikation og synkronisering af linjen med makkeren.'),
  ('6', ARRAY['DM', 'DMF', 'CDM'], E'Taktisk: Dybe løb markeres mandsorienteret, søger retvendte mellemrumsspillere i opbygning, central i genpres (nærmeste spiller genpresser efter boldtab for at skabe hurtige reaktioner), lukker vandrette pasningslinjer i det høje pres.\nTeknik: Retvendt boldmodtagelse i mellemrum, sikker aflevering under pres, godt for- og bagvendt spil.\nFysik: Stor arbejdskapacitet til genpres, hurtig acceleration i sprint efter boldtab.\nMentalt: Skarp koncentration til at læse dybe løb mandsorienteret, mod til at lukke rum aggressivt i genpres.'),
  ('7', ARRAY['LM', 'LW'], E'Taktisk: Spejlbillede af 11''eren – 1v1 i siderum, dybe bevægelser i halvrum, presser skråt i det høje pres og bidrager til at overhale boldholder ved forbiløb af højt pres.\nTeknik/Fysik/Mentalt: Samme profil som 11''eren, spejlvendt.'),
  ('8', ARRAY['CM'], E'Taktisk: Udnytter overtal lokalt og fastholder efter erobring ved at spille væk fra pres og gerne bagud, dybe 6/8-løb markeres mandsorienteret defensivt, lokker modstander i bestemte rum og sprinter når bolden er undervejs i pres fra organiseret forsvarsspil.\nTeknik: Alsidig pasningsteknik i begge retninger, godt under pres i trange rum.\nFysik: Box-to-box-udholdenhed, styrke til at vinde dueller centralt.\nMentalt: Situationsfornemmelse for hvornår der skal lokkes/presses vs. holdes position, ro til at spille bagud efter erobring.'),
  ('9', ARRAY['ST', 'CF'], E'Taktisk: Tiltrækker pres og vender spillet i gennembrudsfasen, dybe løb i ryggen på modstander centralt, fylder de prioriterede rum i feltet ved afslutning (forreste, bagerste, cut-back, centralt uden for feltet), leder det høje pres indefra og ud.\nTeknik: Afslutningskvalitet med begge fødder/hoved, boldkontrol med ryggen til mål.\nFysik: Styrke i dueller ryg mod modstander, eksplosivitet i dybe løb.\nMentalt: Vedholdenhed efter fejlslagne chancer, mod til at tiltrække pres og vende spillet.'),
  ('10', ARRAY['CAM', 'AM', 'OM', 'OMF'], E'Taktisk: Modsatrettede bevægelser og bevægelse før pasning for at skabe gennembrud, søger retvendte mellemrumsspillere, en af "+1"-spillerne i restforsvar ved afslutning på angreb, mandsorienteret i erobringsspillet.\nTeknik: Kreativ sidste aflevering, teknisk sikkerhed i trange rum, godt sammenspil på lille plads.\nFysik: Hurtighed i modsatrettede bevægelser, smidighed til retningsskift.\nMentalt: Kreativitet og risikovillighed i sidste tredjedel, ansvarlighed i restforsvar efter boldtab.'),
  ('11', ARRAY['RM', 'RW'], E'Taktisk: Skaber og udnytter 1v1-situationer i siderummet, bevæger sig dybt i halvrum/siderum før pasning, presser skråt indefra og ud i det høje pres, forbi højt pres ved at overhale boldholder og skabe flere niveauer/vinkler.\nTeknik: Driblekvalitet i 1v1, præcision i afsluttende indlæg/afslutning, godt førsteberøring i fart.\nFysik: Eksplosiv hurtighed, evne til gentagne sprints (offensivt og i genpres).\nMentalt: Mod til at gå i 1v1 gentagne gange selvom det mislykkes, vilje til at presse skråt tilbage.')
on conflict (id) do nothing;

-- 7 and 11 were originally seeded backwards (7 right/11 left instead of
-- 7 left/11 right) — this fixes an already-seeded database's aliases, but
-- only if they still hold the original wrong default, so a coach who has
-- since edited either one by hand isn't overwritten.
do $$
begin
  if exists (select 1 from position_settings where id = '7' and aliases = ARRAY['RM', 'RW']) then
    update position_settings set aliases = ARRAY['LM', 'LW'] where id = '7';
  end if;
  if exists (select 1 from position_settings where id = '11' and aliases = ARRAY['LM', 'LW']) then
    update position_settings set aliases = ARRAY['RM', 'RW'] where id = '11';
  end if;
end $$;

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

-- The app was originally login-free by design (see README). Adding a login
-- screen for the coach side (never for the player self-eval link, which
-- stays token-only) means each coach needs credentials. password_hash is a
-- bcrypt hash, never the plaintext password; '' means "no password set
-- yet" and that account cannot log in until one is set from the Trænere
-- screen. email must be unique (and non-empty) to log in with it, but the
-- column itself stays nullable/non-unique at the DB level so existing rows
-- with a blank email don't break the migration — routes/auth.js enforces
-- uniqueness among non-empty emails at write time instead.
alter table coaches add column if not exists password_hash text not null default '';

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
  division text not null default '',
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

alter table match_plans add column if not exists division text not null default '';

-- Set once, on demand, via POST /:id/share (see server/routes/matchPlans.js)
-- — null until a coach actually clicks "generér spillerlink", and stable
-- after that (repeat clicks return the same token rather than minting a
-- new one, so an already-shared link keeps working). Looked up by the
-- public, unauthenticated server/routes/matchPlanShare.js, which also
-- enforces the "valid through the day after the match" cutoff — the token
-- itself never expires or gets revoked, since that's not something a
-- coach can do today.
alter table match_plans add column if not exists share_token text unique;

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

-- Every self-evaluation a player has ever submitted for a goal, kept as an
-- append-only log rather than overwriting goals.progress in place — the
-- coach wants to see the whole history on the printed report, in the order
-- it was submitted, not just the latest value. goals.progress is left as
-- the "current" value (still read by the in-app progress tracker); this
-- table is purely additive and only ever inserted into, from the player's
-- own self-eval link (see routes/self.js) — a coach adjusting progress on
-- the roster side does not log an entry here, since that isn't a
-- self-evaluation.
create table if not exists goal_progress_log (
  id text primary key,
  player_id text not null references players(id) on delete cascade,
  period_id text not null references periods(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  progress smallint not null check (progress between 0 and 10),
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_progress_log_lookup
  on goal_progress_log(player_id, period_id, skill_id, created_at);

-- One running development plan per player (not scoped to a period — it's
-- meant to be edited in place across a season, unlike goals). The season's
-- per-skill targets/notes live in the existing goals table and are pulled in
-- alongside this when the plan is printed, not duplicated here.
create table if not exists development_plans (
  player_id text primary key references players(id) on delete cascade,
  season_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Originally five separate structured fields (intro / kampsti list /
-- egentræning / stats / opfølgning list) filled in via five boxes. Replaced
-- with one rich-text field: the coach drafts (or pastes from Word/Docs) the
-- whole plan in one place and its formatting — bold, headings, bullet lists
-- — is kept, rather than being flattened into plain text per box. Dropped
-- without a data-preserving migration since this predates any real rollout
-- (the one plan created under the old shape was hand-recreated as rich text
-- afterwards). content_html is sanitized server-side before it's ever
-- stored (see routes/developmentPlans.js) since it's rendered with
-- dangerouslySetInnerHTML on both the coach and player-facing views.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'development_plans' and column_name = 'intro'
  ) then
    alter table development_plans drop column intro;
    alter table development_plans drop column match_path;
    alter table development_plans drop column self_training;
    alter table development_plans drop column stats_intro;
    alter table development_plans drop column stats_items;
    alter table development_plans drop column followups;
  end if;
end $$;

alter table development_plans add column if not exists content_html text not null default '';

-- Small generic key/value settings table. Currently holds exactly one row
-- — the fixed prompt template behind "Generér med Claude" on the
-- udviklingsplan card (see routes/developmentPlans.js and
-- client DevelopmentPlanCard) — but kept general-purpose rather than a
-- dedicated column somewhere, since any future one-off app-wide setting
-- can reuse it instead of another migration.
create table if not exists app_settings (
  key text primary key,
  value text not null default ''
);

-- Seeded once; a coach editing it from Indstillinger overwrites the row,
-- and re-running this migration must never stomp that edit back to the
-- default, hence "do nothing" on conflict.
insert into app_settings (key, value) values (
  'development_plan_prompt',
  E'Du er assistenttræner for VB Pige Akademi og skal udkaste en udviklingsplan til en af klubbens spillere, baseret på hendes rigtige evaluerings- og måldata (vedhæftet nedenfor).\n\nSkriv direkte til spilleren (du-form), på dansk, i en varm men konkret trænertone — planen skal kunne læses af både spilleren selv og hendes forældre.\n\nBrug udelukkende de angivne data. Opfind aldrig konkrete tal, kampstatistik eller hændelser, der ikke fremgår nedenfor — hvis noget mangler (fx ingen mål sat endnu), så spring det afsnit over eller nævn det kort i stedet for at gætte.\n\nStrukturér planen med disse afsnit:\n1. En kort personlig indledning der hilser på spilleren og opsummerer, hvor hun står nu.\n2. Fokusområder — uddyb kort de mål, der allerede er sat; gengiv dem ikke som en ren liste, de vises i forvejen andetsteds i rapporten.\n3. Egentræning — et kort, generelt afsnit tilpasset spillerens niveau og position (brug kendetegnene for spillerens position, hvis de er angivet).\n4. Opfølgning — en kort opfordring til løbende dialog med træneren.\n\nSvar udelukkende med HTML og kun disse tags: <h3>, <p>, <ul>, <li>, <strong>, <em>. Ingen andre tags, ingen inline-styles, ingen billeder, ingen indledende forklaring uden for HTML''en.'
) on conflict (key) do nothing;

-- Per-player tracking stats for one Kampplan (= one game — stats never
-- exist without a match to attach to, same relationship match_performance
-- already has). Imported from a GPS/video-tracking tool export (.ods/.xlsx/
-- .csv); see server/statsImport.js for the parser. Only the fields we
-- actively surface are real columns — anything the source file has that we
-- don't yet map to a named column lands in `extra` instead of being
-- dropped or forcing a migration to accept a new export.
create table if not exists match_stats (
  match_plan_id text not null references match_plans(id) on delete cascade,
  player_id text not null references players(id) on delete cascade,
  -- What the file said that game, not copied from players.number — squad
  -- numbers can shift game to game, so this stays a record of the source.
  player_number text not null default '',
  -- Position as the tracking export labelled it that game (GK/CB/LB/RB/...
  -- — English abbreviations, distinct from the app's own 1-11 formation
  -- numbers used in players.primary_position/secondary_position), kept as
  -- free text since export vocabularies vary and this is informational,
  -- not matched against anything.
  position text not null default '',
  minutes int,
  distance_km numeric(5,1),
  avg_speed_kmh numeric(4,1),
  top_speed_kmh numeric(4,1),
  sprints int,
  high_intensity_runs int,
  passes int,
  pass_success_pct numeric(5,2),
  dribbles int,
  shots int,
  tackles int,
  interceptions int,
  loose_ball_recoveries int,
  goal_kicks int,
  fouls int,
  saves int,
  total_events int,
  -- Added when the tracking tool's export grew from 18 to 32 stat columns
  -- (see server/statsImport.js) — a season-to-date shaped export, but
  -- still imported one Kampplan at a time like everything else here.
  assists int,
  conversion_rate numeric(5,2),
  passes_successful int,
  passes_unsuccessful int,
  goals int,
  goal_involvements int,
  total_attempts int,
  corners int,
  penalty_kicks int,
  free_kicks int,
  throw_ins int,
  starts int,
  captaincies int,
  player_of_the_match int,
  extra jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (match_plan_id, player_id)
);

alter table match_stats add column if not exists position text not null default '';
alter table match_stats add column if not exists assists int;
alter table match_stats add column if not exists conversion_rate numeric(5,2);
alter table match_stats add column if not exists passes_successful int;
alter table match_stats add column if not exists passes_unsuccessful int;
alter table match_stats add column if not exists goals int;
alter table match_stats add column if not exists goal_involvements int;
alter table match_stats add column if not exists total_attempts int;
alter table match_stats add column if not exists corners int;
alter table match_stats add column if not exists penalty_kicks int;
alter table match_stats add column if not exists free_kicks int;
alter table match_stats add column if not exists throw_ins int;
alter table match_stats add column if not exists starts int;
alter table match_stats add column if not exists captaincies int;
alter table match_stats add column if not exists player_of_the_match int;

-- Imported stats used to be stored in miles/mph (see server/statsImport.js
-- git history); any database still carrying those columns gets them renamed
-- to their metric equivalents, with existing values converted in place
-- (1mi = 1.60934km) so already-imported matches stay accurate rather than
-- being silently reinterpreted as km/km-h.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'match_stats' and column_name = 'distance_mi'
  ) then
    alter table match_stats rename column distance_mi to distance_km;
    alter table match_stats rename column avg_speed_mph to avg_speed_kmh;
    alter table match_stats rename column top_speed_mph to top_speed_kmh;
    update match_stats set
      distance_km = round((distance_km * 1.60934)::numeric, 1),
      avg_speed_kmh = round((avg_speed_kmh * 1.60934)::numeric, 1),
      top_speed_kmh = round((top_speed_kmh * 1.60934)::numeric, 1);
  end if;
end $$;

create index if not exists idx_match_stats_player on match_stats(player_id);

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

-- Pitch layouts for the Kampplan lineup view. Each slot is one of the 11
-- formation numbers (see server/positions.js) at an x/y spot on the pitch,
-- both 0-100 (x: left -> right, y: top = opponent's goal -> bottom = own
-- goal). The same number can appear in more than one slot (two 9s, two 8s),
-- so a slot is identified by its index in the array, not its number.
-- A Kampplan stores the formation's *name* in match_plans.formation (the
-- column predates this table and was free text), so renaming a formation
-- here unlinks plans that used the old name — they still show their table,
-- just no pitch. Seeded in server/db/seed.js, only while the table is empty.
create table if not exists formations (
  id text primary key,
  name text not null,
  slots jsonb not null default '[]',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
