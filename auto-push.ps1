# =========================================
# AI Project Auto Git Push Script
# =========================================

$repoPath = "D:\12.개인프로젝트\20.sensi-gg"
$logDir = "$repoPath\logs"
$logFile = "$logDir\autopush.log"

# UTF8 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 로그 폴더 생성
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Write-Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "$time | $msg"
    Add-Content $logFile $line
}

Write-Log "------------------------------------"
Write-Log "Auto Push Start"

cd $repoPath

# 변경사항 확인
$changes = git status --porcelain

if ($changes -eq $null -or $changes -eq "") {
    Write-Log "No changes detected. Skip commit."
    exit
}

Write-Log "Changes detected. Preparing commit."

git add .

$commitMsg = "auto backup $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

git commit -m $commitMsg

Write-Log "Commit created."

# push retry
$maxRetry = 3
$retry = 0
$success = $false

while ($retry -lt $maxRetry -and !$success) {

    try {

        git push

        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Log "Push success."
        }

    } catch {

        Write-Log "Push error: $_"

    }

    if (!$success) {
        $retry++
        Write-Log "Retry push ($retry/$maxRetry)"
        Start-Sleep -Seconds 10
    }
}

if (!$success) {
    Write-Log "Push failed after retries."
}

Write-Log "Auto Push End"