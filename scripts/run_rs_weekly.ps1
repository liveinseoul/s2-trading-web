# 매주 토요일 02:00 — RS 캐시·테이블·Supabase 풀세트 갱신.
#
# 1) Rebuild_weekly_cache.py  : KR _bt_daily → _kr_weekly 재구성 + 자동 백업
# 2) 14_RS_KR_pykrx.py         : KR 종목·주간 OHLCV·RS 임계값 테이블 신선화
# 3) 13_RS_US_screen.py        : US 종목·주간 OHLCV·RS 임계값 테이블 신선화
# 4) export_rs_weekly.py       : 마감지기 Supabase rs_top_weekly/rs_history_weekly 동기화
#
# 인터랙티브 스크립트 13_/14_ 는 stdin 으로 빈 줄을 흘려 보낸다 — 기준일 enter(=오늘),
# ticker 캐시 enter(=유지), 종료 enter(=빈 티커). 캐시 입력은 매주 신규 종목만 자동 보강
# 되므로 ticker_cache 는 분기 단위 수동 갱신을 권장한다.
$ErrorActionPreference = "Stop"
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName   # s2_method
Set-Location $root
$log = Join-Path $PSScriptRoot "rs_weekly.log"
$qb  = "C:\quantBacktest"
$env:BT_OUTPUT_DIR = "$qb\screen"

function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m" | Out-File -Append -Encoding utf8 $log }

"`n===== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') rs_weekly start =====" | Out-File -Append -Encoding utf8 $log

Log "[1/4] Rebuild_weekly_cache.py (KR daily→weekly 재구성 + 백업)"
& C:\Python314\python.exe "$qb\Rebuild_weekly_cache.py" *>> $log

Log "[2/4] 14_RS_KR_pykrx.py (KR 캐시 신선화)"
# stdin: 기준일 enter / ticker 캐시 enter (유지)
"`n`n" | & C:\Python314\python.exe "$qb\14_RS_KR_pykrx.py" *>> $log

Log "[3/4] 13_RS_US_screen.py (US 캐시 신선화)"
# stdin: 기준일 enter / ticker 캐시 enter / 개별 종목 조회 종료 enter
"`n`n`n" | & C:\Python314\python.exe "$qb\13_RS_US_screen.py" *>> $log

Log "[4/4] export_rs_weekly.py (Supabase 동기화)"
& C:\Python314\python.exe "s2-trading-web\scripts\export_rs_weekly.py" *>> $log

Log "===== rs_weekly done ====="
