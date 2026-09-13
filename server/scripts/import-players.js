// One-off/reusable player import: upserts by exact name match so re-running
// (e.g. against a different database) never creates duplicates for players
// that already exist. Only name + email are imported per the user's decision;
// birthdate/mobile from the source list are intentionally not stored anywhere.
require("dotenv").config();
const crypto = require("crypto");
const { Pool } = require("pg");

const PLAYERS = [
  ["Agnes Weis", "agnesweis2011@gmail.com"],
  ["Ajla Dautovic", "adnandautovic2000@gmail.com"],
  ["Alma Bossen", "bossen_stine@hotmail.com"],
  ["Amalie Hyldtoft Søgaard", "maikenhyldtoft@hotmail.com"],
  ["Amalie Jacobsen", "mallejacobsen@outlook.com"],
  ["Annemarie Pranger-Rasmussen", "mrandersen@hotmail.com"],
  ["Asta Askou Berg", "henrikzberg@gmail.com"],
  ["Ayah El-Sayed", "w.elsayed1987@hotmail.com"],
  ["Caroline Bak", "carolinegbak@gmail.com"],
  ["Clara Sembach Risgaard", "clararisgaard@gmail.com"],
  ["Clara Sofie Dahl Hjort", "cshjort@icloud.com"],
  ["Emma Habibovic", "emma@habibovic.dk"],
  ["Erina Merxha", "erinamerxha8@gmail.com"],
  ["Ida Neergaard", "post@janneergaard.dk"],
  ["Josefine Emilie Grønfeldt", "agk@gcmail.dk"],
  ["Karla Petersen", "karlaemiliepetersen@gmail.com"],
  ["Kathrine Juhl Kristiansen", "Juhl2120jk@gmail.com"],
  ["Katja Gæraa Iversen", "Katj4131@gsnsvejle.dk"],
  ["Laura Styrbæk Nielsen", "maria82styrbaek@gmail.com"],
  ["Lærke Hougaard", "thodsen.nicoline@gmail.com"],
  ["Mai Amdisen", "familienamdisen@gmail.com"],
  ["Mia Vinther Rasmussen", "stjernevej23@hotmail.dk"],
  ["Naja Broch Fausing", "sfj66@hotmail.com"],
  ["Nicoline Zülau", "Nicolinezulaup@gmail.com"],
  ["Nitharsana Sashvathi Mahendiran", "nitharsana3107@gmail.com"],
  ["Nora Junge Van West", "bartvanwest@hotmail.com"],
  ["Naaveerya Anchali Gobinesan", "priyanesan@gmail.com"],
  ["Signe Jacobsen", "sign115f@apps.vejle.dk"],
  ["Sophia Bach", "Sophiaanb2010@icloud.com"],
  ["Sørine Lade", "Sorinemathiesen@gmail.com"],
];

function makeSelfToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const [name, email] of PLAYERS) {
    const existing = await pool.query("select id, email from players where name = $1", [name]);
    if (existing.rows[0]) {
      if (existing.rows[0].email !== email) {
        await pool.query("update players set email = $2 where id = $1", [
          existing.rows[0].id,
          email,
        ]);
        console.log(`updated email: ${name}`);
        updated++;
      } else {
        console.log(`unchanged (already correct): ${name}`);
        unchanged++;
      }
    } else {
      const id = crypto.randomUUID();
      const selfToken = makeSelfToken();
      await pool.query(
        "insert into players (id, name, positions, number, email, team_id, self_token) values ($1, $2, '{}', '', $3, null, $4)",
        [id, name, email, selfToken]
      );
      console.log(`created: ${name}`);
      created++;
    }
  }

  console.log(`\nDone. Created ${created}, updated ${updated}, unchanged ${unchanged}, total ${PLAYERS.length}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
