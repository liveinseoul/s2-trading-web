# Phase 1 셋업 가이드

사후(EOD) 데이터 기반 공개 정보 서비스를 띄우는 단계별 절차. (장마감 전 실시간·텔레그램은 Phase 2)

## 0. 사전 준비
- Node.js 20+ / npm, Python 3.14(기존 S2 엔진), Supabase 계정, Vercel 계정.
- 운영 캐시(`../stock_cache.db`)가 최신인지 확인(`python ../main.py --no-gsheets`).

## 1. Supabase 프로젝트 + 스키마
1. supabase.com 에서 새 프로젝트 생성.
2. SQL Editor 에 [`supabase/schema.sql`](supabase/schema.sql) 전체 붙여넣고 실행 → 8개 테이블·RLS·seed 생성.
3. Settings → API 에서 `Project URL`, `anon public`, `service_role`(secret) 키 복사.

## 2. 데이터 적재 (Python 익스포터)
```bash
# 의존성
pip install supabase

# 먼저 로컬 검증(Supabase 없이 CSV + 요약)
python s2-trading-web/scripts/export_eod.py --dry-run
#   → _dryrun/*.csv 생성, CAGR/MDD/거래수 요약 출력으로 정합성 확인

# 부모 .env.local 에 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 추가 후 실제 적재
python s2-trading-web/scripts/export_eod.py
#   → 전 구간 재계산본을 Supabase에 멱등 적재
```

## 3. 웹 앱
```bash
cd s2-trading-web
cp .env.example .env.local          # NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 채우기
npm install
npm run dev                         # http://localhost:3000
```
화면: `/`(오늘) · `/dashboard`(월별) · `/day/[date]`(일자별) · `/stocks`·`/stocks/[ticker]` · `/trades` · `/rules`.

## 4. 배포 (Vercel)
1. GitHub 리포 연결, **Root Directory = `s2-trading-web`** 지정.
2. 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록 → Deploy.
3. 페이지는 `revalidate=600`(10분) ISR. 적재 후 즉시 반영하려면 Vercel On-demand Revalidate 연동(후속).

## 5. 일일 운영(임시 스케줄)
- 매 거래일 15:45경 로컬에서 `python s2-trading-web/scripts/export_eod.py` 실행(Windows 작업 스케줄러).
- 전제: `../main.py`로 당일 캐시가 갱신되어 있어야 함.
- Phase 2에서 GitHub Actions cron(15:10 후보 + 15:45 EOD) + 텔레그램 알림으로 자동화.

## 검증 기준(dry-run 기대값, 2026-05-27 종료 기준)
- CAGR ≈ 16% / MDD ≈ −6% / 완결거래 ≈ 328 / 승률 ≈ 90% (무비용·0버퍼 모델, s2_candidates 와 동일).

## 남은 Phase 1 다듬기(선택)
- NAV 곡선 차트(대시보드) — 차트 라이브러리 도입.
- On-demand revalidate 웹훅.
- 종목 검색 필터 UI, 거래내역 CSV 내보내기.
