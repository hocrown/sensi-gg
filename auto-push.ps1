# Auto-sync script for Claude Code Agent Teams
# Runs every 30 minutes via Task Scheduler

$repoPath = "D:\12.개인프로젝트\20.sensi-gg"
$logFile = Join-Path $repoPath "auto-push.log"

function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logFile -Value "[$timestamp] $msg"
}

Set-Location $repoPath

# Pull first (get WSL changes)
$branch = (git branch --show-current 2>&1).Trim()
if (-not $branch) { $branch = "main" }
$pullResult = git pull origin $branch --rebase 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Log "Pull successful"
} else {
    Write-Log "Pull failed: $pullResult"
}

# Check for local changes
$status = git status --porcelain
if ($status) {
    git add -A
    $commitMsg = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMsg 2>&1
    $pushResult = git push origin $branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Push successful: $commitMsg"
    } else {
        Write-Log "Push failed: $pushResult"
    }
} else {
    Write-Log "No changes to push"
}
