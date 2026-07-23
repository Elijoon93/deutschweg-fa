[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$RepositoryPath = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [string]$ExpectedRemote = "https://github.com/Elijoon93/deutschweg-fa.git"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

$repo = (Resolve-Path $RepositoryPath).Path
$payload = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

if (-not (Test-Path (Join-Path $repo ".git"))) {
    throw "RepositoryPath is not a Git repository: $repo"
}

$remote = (& git remote get-url origin).Trim()
if ($LASTEXITCODE -ne 0) { throw "Cannot read origin remote." }
$normalizedRemote = $remote -replace '\.git$',''
$normalizedExpected = $ExpectedRemote -replace '\.git$',''
if ($normalizedRemote -ne $normalizedExpected) {
    throw "Unexpected origin. Expected '$ExpectedRemote' but found '$remote'."
}

$currentBranch = (& git branch --show-current).Trim()
if ($currentBranch -ne "main") {
    throw "Publish must start from main. Current branch: $currentBranch"
}

$status = (& git status --porcelain)
if ($status) {
    throw "Working tree is not clean. Commit, stash or discard local changes first."
}

Invoke-Git fetch origin main
Invoke-Git pull --ff-only origin main

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupBranch = "backup/x16.4-before-final-acceptance-$stamp"
Invoke-Git branch $backupBranch
Invoke-Git push origin $backupBranch

$excluded = @(
    "PUBLISH_X16_4_FINAL_ACCEPTANCE.ps1",
    "DeutschWeg_X16_4_Final_Acceptance_Hardening_GitHub_Pages_Root.zip"
)

Get-ChildItem -LiteralPath $payload -Force | Where-Object { $excluded -notcontains $_.Name } | ForEach-Object {
    $destination = Join-Path $repo $_.Name
    if ($_.PSIsContainer) {
        if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }
        Copy-Item $_.FullName $destination -Recurse -Force
    } else {
        Copy-Item $_.FullName $destination -Force
    }
}

if (Get-Command node -ErrorAction SilentlyContinue) {
    & node scripts/verify-release.mjs
    if ($LASTEXITCODE -ne 0) { throw "Release verification failed." }
} else {
    Write-Warning "Node.js was not found. GitHub Actions will run the deterministic verification after push."
}

Invoke-Git add --all
$pending = (& git status --porcelain)
if (-not $pending) {
    Write-Host "No repository changes detected. The X16.4 payload may already be published."
    exit 0
}

Invoke-Git commit -m "ci(release): add X16.4 final acceptance quality gate"
Invoke-Git push origin main

Write-Host "Published successfully."
Write-Host "Backup branch: $backupBranch"
Write-Host "Next: wait for GitHub Actions, then complete FINAL_ACCEPTANCE_X16_4_1.md on real Android and iPhone devices."
