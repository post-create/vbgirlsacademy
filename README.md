# VB Pige Akademi

Player-development tracking app for VB Pige Akademi. Express/Postgres backend, React (Vite) frontend.

## Project structure

```
package.json          server package (express, pg) — dev/build/start/migrate scripts
server/                Express API
  index.js
  db.js
  config.js
  db/schema.sql        Postgres schema
  db/seed.js            default skill list (Teknik/Fysisk/Taktik/Mentalt)
  db/migrate.js         applies schema.sql + seeds, safe to re-run
  routes/                one file per resource
client/                React app (Vite)
  src/App.jsx           UI (unchanged from the prototype) + real API calls
  src/api.js            fetch wrappers for the backend
```

There's no login/auth on the coach side (by design, matching the original prototype) — anyone
with the app URL has full access. Player self-evaluation links are unguessable per-player tokens
(`?player=<token>`); the server only ever returns that one player's data for a given token.

## Local development

Requirements: Node 20+, a Postgres database (local install, Docker, or a cloud instance).

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your Postgres connection string.
2. Install server deps and apply the schema:
   ```bash
   npm install
   npm run migrate
   ```
3. Install client deps:
   ```bash
   npm install --prefix client
   ```
4. Run both dev servers together:
   ```bash
   npm run dev
   ```
   This starts Express on `http://localhost:4000` and Vite on `http://localhost:5173` (Vite
   proxies `/api` requests to Express). Open `http://localhost:5173`.

## Production build

```bash
npm run build   # builds client/dist
npm start        # serves the API and client/dist from one Express process
```

In production, set `NODE_ENV=production`, `DATABASE_URL`, and `PORT` (Azure App Service sets
`PORT` automatically).

## Deploying to Azure

This targets **Azure App Service** (Linux, Node) for the app and **Azure Database for
PostgreSQL Flexible Server** for the database. There are two common setups — pick the one that
matches what you (or the Azure Portal wizard) created.

### Option A — Azure Portal "Web App + Database" quickstart (private networking, recommended)

If you used the Azure Portal's guided "Web App + Database" creation flow, it provisions all of
this automatically: a VNet, an app subnet, a DB subnet, a Postgres Flexible Server with
**public network access disabled**, and VNet integration wiring the app to reach the database
privately. This is more secure than a publicly-reachable database, but it changes a few steps
below. This is the exact setup that was deployed and verified for this app.

1. **Find your resource names** (the wizard generates them):
   ```bash
   az webapp list --resource-group <your-resource-group> --query "[].{name:name, host:defaultHostName}" -o table
   az postgres flexible-server list --resource-group <your-resource-group> -o table
   az postgres flexible-server db list --server-name <your-db-server-name> --resource-group <your-resource-group> -o table
   ```
   The wizard usually creates an app-specific database (not just `postgres`) — use that name.

2. **Set the app settings.** Because the database has no public access, `DATABASE_URL` must
   point at the server's private FQDN, and the admin password must be
   [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) if it contains characters like
   `@`, `:`, `/`, or `%`:
   ```bash
   az webapp config appsettings set \
     --name <your-app-name> --resource-group <your-resource-group> \
     --settings \
       DATABASE_URL="postgresql://<admin-user>:<url-encoded-password>@<your-db-server-name>.postgres.database.azure.com:5432/<your-database-name>?sslmode=require" \
       NODE_ENV=production \
       SCM_DO_BUILD_DURING_DEPLOYMENT=true
   ```
   **If you ever reset the database password** (Portal or CLI), you must update `DATABASE_URL`
   here to match, or every connection will fail with `password authentication failed`. There is
   no automatic sync between the two.

3. **Deploy the code.** From the repo root (excluding `node_modules`, `client/dist`, `.env`):
   ```bash
   az webapp deploy --name <your-app-name> --resource-group <your-resource-group> --src-path deploy.zip --type zip
   ```
   Two Windows-specific gotchas if you build the zip yourself with PowerShell:
   - `Compress-Archive` (and even .NET's `ZipFile.CreateFromDirectory` on Windows) writes
     **backslash** path separators into the zip, which Azure's Linux build server fails to
     extract as nested folders (`npm error ... open '.../client/package.json'`, ENOENT). Build
     the zip entry-by-entry instead, forcing forward slashes — e.g. with
     `[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile`, setting each entry name to
     the relative path with `\` replaced by `/`.
   - `vite` and `@vitejs/plugin-react` must be in `client/package.json`'s `dependencies`, not
     `devDependencies`. Oryx's build container installs with dev dependencies omitted (the old
     `NPM_CONFIG_PRODUCTION=false` override no longer works on npm 7+), so if they're
     dev-only the build fails with `sh: 1: vite: not found`.

4. **Run the migration.** Since the database isn't publicly reachable, you can't run
   `npm run migrate` from your own machine. `az webapp ssh` needs an interactive terminal, which
   doesn't work from scripts/agents — instead, use Kudu's one-off command API, which executes
   inside the app's own network context:
   ```bash
   # First time only: the deployed node_modules ships as a compressed tarball that's extracted
   # lazily at container boot. If a fresh Kudu command session hasn't gone through that boot
   # path, extract it manually once:
   curl -u '<publish-user>:<publish-password>' -X POST \
     "https://<your-app-name>.scm.azurewebsites.net/api/command" \
     -H "Content-Type: application/json" \
     -d '{"command":"mkdir node_modules","dir":"site/wwwroot"}'
   curl -u '<publish-user>:<publish-password>' -X POST \
     "https://<your-app-name>.scm.azurewebsites.net/api/command" \
     -H "Content-Type: application/json" \
     -d '{"command":"tar -xzf node_modules.tar.gz -C node_modules","dir":"site/wwwroot"}'

   # Then run the migration itself:
   curl -u '<publish-user>:<publish-password>' -X POST \
     "https://<your-app-name>.scm.azurewebsites.net/api/command" \
     -H "Content-Type: application/json" \
     -d '{"command":"node server/db/migrate.js","dir":"site/wwwroot"}'
   ```
   Get `<publish-user>`/`<publish-password>` from
   `az webapp deployment list-publishing-profiles --name <your-app-name> --resource-group <your-resource-group>`.
   The Kudu command API only runs single commands — `&&` chaining and pipes (`|`) are not
   reliably parsed, so run each step as its own request.

   **If you just changed `DATABASE_URL`** (e.g. after a password reset), run
   `az webapp restart --name <your-app-name> --resource-group <your-resource-group>` first — the
   Kudu/SCM instance can keep a stale copy of the app settings until the app restarts, so
   commands run through it may still use the old value otherwise.

5. **Verify**: `curl https://<your-app-name>.azurewebsites.net/api/bootstrap` should return the
   seeded skill config with empty players/periods/teams.

### Option B — Manual CLI setup with public database access (simpler, less secure by default)

If you create the Postgres server yourself via `az postgres flexible-server create` without a
VNet, it defaults to being reachable over the public internet (gated by firewall rules), which
makes the migration step simpler at the cost of a more exposed database.

```bash
az postgres flexible-server create \
  --resource-group <your-resource-group> \
  --name <your-db-server-name> \
  --admin-user academyadmin \
  --admin-password '<a-strong-password>' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --public-access <your-current-ip>
```

Then run the migration directly from your machine (add more firewall rules under "Networking"
in the Portal if needed):

```bash
DATABASE_URL="postgresql://academyadmin:<url-encoded-password>@<your-db-server-name>.postgres.database.azure.com:5432/postgres?sslmode=require" npm run migrate
```

Create the App Service and set app settings the same way as Option A step 2–3 (minus the
private-networking concerns), then deploy with `az webapp up` or the zip-deploy steps above.
