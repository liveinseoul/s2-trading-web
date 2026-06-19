# 매주 금요일 18:00 KST — KR + JP 데이터 갱신 + 부분 Supabase 동기화.
#
# 단계:
#   1) Rebuild_weekly_cache.py     : KR _bt_daily → _kr_weekly 재구성
#   2) 14_RS_KR_pykrx.py            : KR 종목·OHLCV·RS 임계값
#   3) 15_RS_JP_screen.py           : JP 종목·OHLCV  (2 와 병렬)
#   4) export_rs_weekly --market KR --full-universe
#   5) export_rs_weekly --market JP --full-universe
#   6) add_etfs --market KR         : ETF 재적재 (export 가 universe 전체 삭제)
#   7) classify_rs96_gemini --market KR --weeks 1
#   8) classify_rs96_gemini --market JP --weeks 1
#
# 한미일 통합 분류 (classify_global_themes) 는 US 데이터 준비 후 토 07:00 잡에서.
#
# 한국 시장 마감 15:30 KST, 일본 시장 마감 15:00 KST → 16:00 이후 안전.
# 권장 시각 18:00 KST (데이터 안정화 + 사용자 활동 시간대).
#
# 18시간 가드 — 같은 일과 내 재실행 방지.

$ErrorActionPreference = "Continue"
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName   # s2_method
Set-Location $root
$log = Join-Path $PSScriptRoot "rs_kr_jp.log"
$qb  = "C:\quantBacktest"
$env:BT_OUTPUT_DIR = "$qb\screen"
$silent = "s2-trading-web\scripts\silent_run.py"

function Log($m) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m" | Out-File -Append -Encoding utf8 $log
}

function RunPy($label, [string[]]$pyArgs) {
    Log "[$label] start  ($($pyArgs -join ' '))"
    try {
        & C:\Python314\python.exe @pyArgs *>> $log
        Log "[$label] done (exit=$LASTEXITCODE)"
    } catch {
        Log "[$label] FAILED: $_"
    }
}

function StartPyJob($label, [string[]]$pyArgs, $jobLog) {
    Log "[$label] start (job)  ($($pyArgs -join ' ')) → $jobLog"
    Start-Job -Name $label -ScriptBlock {
        param($args2, $jobLog2)
        try { & C:\Python314\python.exe @args2 *>> $jobLog2 } catch { "FAILED: $_" | Out-File -Append -Encoding utf8 $jobLog2 }
    } -ArgumentList (,$pyArgs), $jobLog
}

"`n===== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') rs_kr_jp start =====" | Out-File -Append -Encoding utf8 $log

# 18시간 가드
$skipHours = 18
if (Test-Path $log) {
    $lastDone = (Get-Content $log -ErrorAction SilentlyContinue) | Select-String -Pattern "rs_kr_jp done" -SimpleMatch | Select-Object -Last 1
    if ($lastDone) {
        $tsText = $lastDone.Line.Substring(0, 19)
        try {
            $lastTs = [DateTime]::ParseExact($tsText, "yyyy-MM-dd HH:mm:ss", $null)
            $age = (Get-Date) - $lastTs
            if ($age.TotalHours -lt $skipHours) {
                Log "[SKIP] 마지막 실행 $($lastTs) ($([int]$age.TotalHours)h 전) → 건너뜀"
                "===== rs_kr_jp skipped =====" | Out-File -Append -Encoding utf8 $log
                exit 0
            }
        } catch { }
    }
}

# JP 스크리닝 (15_RS_JP) 은 KR 과 독립 — 1 단계와 병렬 시작.
$logJP = Join-Path $PSScriptRoot "rs_kr_jp_jp.log"
$jobJP = StartPyJob "3 15_RS_JP" @($silent, "$qb\15_RS_JP_screen.py") $logJP

# KR 캐시 rebuild + 14_RS_KR (KR pykrx) 는 순차
RunPy "1 Rebuild"    @("$qb\Rebuild_weekly_cache.py")
RunPy "2 14_RS_KR"   @($silent, "$qb\14_RS_KR_pykrx.py")

# JP 잡 완료 대기
Log "[wait] JP 잡 대기..."
Wait-Job -Job $jobJP | Out-Null
Log "[3 15_RS_JP] done (job state=$($jobJP.State))"
Remove-Job -Job $jobJP
if (Test-Path $logJP) {
    "--- $logJP ---" | Out-File -Append -Encoding utf8 $log
    Get-Content $logJP -Encoding utf8 | Out-File -Append -Encoding utf8 $log
    Remove-Item $logJP -Force -ErrorAction SilentlyContinue
}

# KR + JP 부분 export (US 는 미포함)
RunPy "4 export KR"  @("s2-trading-web\scripts\export_rs_weekly.py", "--market", "KR", "--weeks", "56", "--full-universe")
RunPy "5 export JP"  @("s2-trading-web\scripts\export_rs_weekly.py", "--market", "JP", "--weeks", "56", "--full-universe")

# export 가 universe 전체 삭제 후 재적재 → KR ETF 재적재 필요 (JP 는 ETF 화이트리스트 없음)
RunPy "6 add KR ETFs" @("s2-trading-web\scripts\add_etfs.py", "--market", "KR", "--weeks", "56")

# 시장별 Gemini 분류 (per-market 테마, /rs96 우측 패널용)
$env:GEMINI_MODEL = "gemini-2.5-pro"
RunPy "7 classify KR" @("s2-trading-web\scripts\classify_rs96_gemini.py", "--market", "KR", "--weeks", "1")
RunPy "8 classify JP" @("s2-trading-web\scripts\classify_rs96_gemini.py", "--market", "JP", "--weeks", "1")

Log "===== rs_kr_jp done ====="
