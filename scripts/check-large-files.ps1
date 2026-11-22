#requires -Version 5.1
<#
.SYNOPSIS
Blocks accidental staging of newly added files larger than the configured threshold.

.DESCRIPTION
Default threshold: 5 MiB. Only staged additions (git diff --cached --diff-filter=A)
are blocked. Already tracked files that are modified are reported as warnings and
allowed, so existing assets can still be updated intentionally.

Use -Allow to permit a specific path, or add it to scripts/large-file-allowlist.txt.
This is a guard, not a substitute for review.

.EXAMPLE
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1

.EXAMPLE
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-large-files.ps1 -ThresholdMB 5 -Allow "content/big-source.bin"
#>
[CmdletBinding()]
param(
    [int]$ThresholdMB = 5,
    [string[]]$Allow = @(),
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

function Write-Info([string]$Message) {
    if (-not $Quiet) { Write-Host $Message }
}

if ($ThresholdMB -lt 1) {
    throw "ThresholdMB must be >= 1."
}

$root = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($root)) {
    throw "Not inside a Git repository."
}
Set-Location $root
$thresholdBytes = [int64]$ThresholdMB * 1MB

$allowed = @{}
foreach ($item in $Allow) {
    if (-not [string]::IsNullOrWhiteSpace($item)) {
        $allowed[$item.Replace('\', '/').TrimStart('./')] = $true
    }
}

$allowFile = Join-Path $root "scripts/large-file-allowlist.txt"
if (Test-Path -LiteralPath $allowFile) {
    Get-Content -LiteralPath $allowFile -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $allowed[$line.Replace('\', '/').TrimStart('./')] = $true
        }
    }
}

$rawAdded = (& git diff --cached --name-only -z --diff-filter=A 2>$null)
if ($LASTEXITCODE -ne 0) { throw "Could not read staged files." }
$added = @($rawAdded -split "`0" | Where-Object { $_ })

$rawModified = (& git diff --cached --name-only -z --diff-filter=M 2>$null)
if ($LASTEXITCODE -ne 0) { throw "Could not read staged modifications." }
$modified = @($rawModified -split "`0" | Where-Object { $_ })

$blocked = @()
$warned = @()

foreach ($path in $added) {
    $normalized = $path.Replace('\', '/')
    $full = Join-Path $root $path
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
    $size = (Get-Item -LiteralPath $full).Length
    if ($size -le $thresholdBytes) { continue }
    if ($allowed.ContainsKey($normalized)) {
        Write-Info ("ALLOW  {0}  {1:N2} MiB  (explicit allowlist)" -f $path, ($size / 1MB))
        continue
    }
    $blocked += [PSCustomObject]@{ Path = $path; MiB = [math]::Round($size / 1MB, 2) }
}

foreach ($path in $modified) {
    $full = Join-Path $root $path
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
    $size = (Get-Item -LiteralPath $full).Length
    if ($size -gt $thresholdBytes) {
        $warned += [PSCustomObject]@{ Path = $path; MiB = [math]::Round($size / 1MB, 2) }
    }
}

if ($warned.Count -gt 0) {
    Write-Info "WARN: tracked file above threshold is being modified (allowed):"
    $warned | ForEach-Object { Write-Info ("  {0}  {1:N2} MiB" -f $_.Path, $_.MiB) }
}

if ($blocked.Count -gt 0) {
    Write-Host "BLOCKED: newly staged file(s) above $ThresholdMB MiB:"
    $blocked | ForEach-Object { Write-Host ("  {0}  {1:N2} MiB" -f $_.Path, $_.MiB) }
    Write-Host ""
    Write-Host "Move the file to external storage, ignore it, or add an explicit exception:"
    Write-Host "  scripts/large-file-allowlist.txt"
    Write-Host "  or: scripts/check-large-files.ps1 -Allow <path>"
    exit 1
}

Write-Info "OK: no newly staged file above $ThresholdMB MiB."
exit 0
