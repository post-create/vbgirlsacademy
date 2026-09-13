<#
.SYNOPSIS
  Builds and deploys VB Pige Akademi to an existing Azure App Service, and
  optionally runs the database migration afterward.

.PARAMETER AppName
  Name of the Azure Web App (App Service). Defaults to this project's app.

.PARAMETER ResourceGroup
  Resource group containing the Web App. Defaults to this project's group.

.PARAMETER Migrate
  After deploying, restart the app and run server/db/migrate.js against the
  live database via the Kudu command API. Safe to run repeatedly (idempotent).

.EXAMPLE
  ./deploy.ps1
  Deploy code changes only.

.EXAMPLE
  ./deploy.ps1 -Migrate
  Deploy code changes and apply any schema/seed changes afterward.
#>
param(
    [string]$AppName = "vbgirlsacedemy",
    [string]$ResourceGroup = "vbgirlsacademy",
    [switch]$Migrate
)

$ErrorActionPreference = "Stop"

function Get-AzCommand {
    $cmd = Get-Command az -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $fallback = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
    if (Test-Path $fallback) { return $fallback }
    throw "Azure CLI ('az') not found on PATH or at the default Windows install location. Install it or open a new terminal if you just installed it."
}

function Invoke-KuduCommand {
    param(
        [string]$ScmUrl,
        [hashtable]$Headers,
        [string]$Command
    )
    $body = @{ command = $Command; dir = "site/wwwroot" } | ConvertTo-Json
    try {
        return Invoke-RestMethod -Uri $ScmUrl -Method Post -Headers $Headers -Body $body -ContentType "application/json"
    } catch {
        # Best-effort steps (like removing a symlink that may not exist) can fail
        # harmlessly; surface the error but let the caller decide whether it matters.
        Write-Host "  (command '$Command' returned an error, continuing: $($_.Exception.Message))" -ForegroundColor DarkYellow
        return $null
    }
}

$az = Get-AzCommand
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$stagingDir = Join-Path $env:TEMP "vbgirlsacademy-deploy-staging"
$zipPath = Join-Path $env:TEMP "vbgirlsacademy-deploy.zip"

Write-Host "==> Staging files (excluding node_modules, dist, .env)..." -ForegroundColor Cyan
if (Test-Path $stagingDir) { Remove-Item -LiteralPath $stagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
robocopy $repoRoot $stagingDir /E /XD node_modules dist .git /XF ".env" "App_1.jsx" "*.zip" /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Write-Host "==> Building deployment zip with forward-slash paths..." -ForegroundColor Cyan
# NOTE: Compress-Archive and even .NET's ZipFile.CreateFromDirectory write backslash
# path separators on Windows, which Azure's Linux build server fails to extract as
# nested folders. Build the zip entry-by-entry with explicit forward slashes instead.
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -Path $stagingDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($stagingDir.Length + 1).Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally {
    $zip.Dispose()
}

Write-Host "==> Deploying to $AppName..." -ForegroundColor Cyan
& $az webapp deploy --name $AppName --resource-group $ResourceGroup --src-path $zipPath --type zip
if ($LASTEXITCODE -ne 0) { throw "az webapp deploy failed with exit code $LASTEXITCODE" }

Remove-Item -LiteralPath $stagingDir -Recurse -Force
Remove-Item -LiteralPath $zipPath -Force
Write-Host "==> Deployment complete." -ForegroundColor Green

if ($Migrate) {
    Write-Host "==> Restarting app to refresh cached environment settings before migrating..." -ForegroundColor Cyan
    & $az webapp restart --name $AppName --resource-group $ResourceGroup
    Start-Sleep -Seconds 20

    Write-Host "==> Fetching publish credentials..." -ForegroundColor Cyan
    $creds = & $az webapp deployment list-publishing-profiles --name $AppName --resource-group $ResourceGroup --query "[?publishMethod=='MSDeploy'].{user:userName, pass:userPWD}" -o json | ConvertFrom-Json
    $publishUser = $creds[0].user
    $publishPass = $creds[0].pass

    $defaultHost = & $az webapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostName" -o tsv
    $hostParts = $defaultHost -split "\.", 2
    $scmUrl = "https://$($hostParts[0]).scm.$($hostParts[1])/api/command"

    $pair = "$($publishUser):$($publishPass)"
    $basicAuth = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
    $headers = @{ Authorization = "Basic $basicAuth" }

    # The restart bounces the Kudu/SCM instance too, so it can take a bit before it's
    # actually ready to accept commands again. Poll until a trivial command succeeds
    # instead of guessing a fixed delay.
    Write-Host "==> Waiting for Kudu to come back up after restart..." -ForegroundColor Cyan
    $kuduReady = $false
    for ($i = 0; $i -lt 12; $i++) {
        $probe = Invoke-KuduCommand -ScmUrl $scmUrl -Headers $headers -Command "pwd"
        if ($probe -and $probe.ExitCode -eq 0) { $kuduReady = $true; break }
        Start-Sleep -Seconds 10
    }
    if (-not $kuduReady) { throw "Kudu did not come back up in time after restart." }

    # Oryx ships node_modules as a compressed tarball extracted lazily at container
    # boot; a fresh Kudu command session may not have gone through that boot path.
    # Extracting the tarball directly through the Kudu command API is unreliable —
    # it can hit gateway timeouts partway through (some packages land, others don't),
    # and the request failing doesn't mean the extraction didn't keep running server
    # side, so a single-file existence check isn't a trustworthy signal either way.
    # A plain `npm install` is a well-defined, atomic-enough operation by comparison
    # (it either completes or reports a clear npm error), so just reinstall instead
    # of trusting the pre-built tarball at all.
    Write-Host "==> Reinstalling server dependencies..." -ForegroundColor Cyan
    Invoke-KuduCommand -ScmUrl $scmUrl -Headers $headers -Command "rm -rf node_modules" | Out-Null
    $installResult = Invoke-KuduCommand -ScmUrl $scmUrl -Headers $headers -Command "npm install --omit=dev"
    if (-not $installResult -or $installResult.ExitCode -ne 0) {
        if ($installResult) { Write-Host $installResult.Error -ForegroundColor Red }
        throw "npm install failed on the deployed app."
    }

    Write-Host "==> Running migration..." -ForegroundColor Cyan
    $result = Invoke-KuduCommand -ScmUrl $scmUrl -Headers $headers -Command "node server/db/migrate.js"
    if ($result) {
        Write-Host $result.Output
        if ($result.ExitCode -ne 0) {
            Write-Host $result.Error -ForegroundColor Red
            throw "Migration failed (exit code $($result.ExitCode))."
        }
    } else {
        throw "Migration command did not return a result."
    }
    Write-Host "==> Migration complete." -ForegroundColor Green
}

$liveHost = & $az webapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostName" -o tsv
Write-Host "==> Done. https://$liveHost" -ForegroundColor Green
