$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$standaloneDir = Join-Path $repoRoot ".next\standalone"
$staticSourceDir = Join-Path $repoRoot ".next\static"
$staticTargetDir = Join-Path $standaloneDir ".next\static"
$publicSourceDir = Join-Path $repoRoot "public"
$publicTargetDir = Join-Path $standaloneDir "public"
$releaseDir = Join-Path $repoRoot "release"
$zipPath = Join-Path $releaseDir "frontend-standalone.zip"

if (-not (Test-Path -LiteralPath $standaloneDir)) {
  throw "Missing .next\standalone. Run npm.cmd run build before packaging."
}

if (-not (Test-Path -LiteralPath $staticSourceDir)) {
  throw "Missing .next\static. Run npm.cmd run build before packaging."
}

if (Test-Path -LiteralPath $staticTargetDir) {
  Remove-Item -LiteralPath $staticTargetDir -Recurse -Force
}

New-Item -ItemType Directory -Path (Split-Path -Parent $staticTargetDir) -Force | Out-Null
Copy-Item -LiteralPath $staticSourceDir -Destination $staticTargetDir -Recurse -Force

if (Test-Path -LiteralPath $publicSourceDir) {
  if (Test-Path -LiteralPath $publicTargetDir) {
    Remove-Item -LiteralPath $publicTargetDir -Recurse -Force
  }

  Copy-Item -LiteralPath $publicSourceDir -Destination $publicTargetDir -Recurse -Force
}

New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

$archiveSources = Get-ChildItem -LiteralPath $standaloneDir -Force | Select-Object -ExpandProperty FullName
Compress-Archive -Path $archiveSources -DestinationPath $zipPath -Force

Write-Host "Created $zipPath"
