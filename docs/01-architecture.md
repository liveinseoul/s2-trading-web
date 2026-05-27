# 01 · 아키텍처 & 데이터 파이프라인

## 1. 3계층 구조

```
┌─────────────────────────────────────────────────────────────────┐
│  계산 계층 (Python · 진실의 원천)                                  │
│  ─ s2_candidates.py : 후보 추출(사전) / --verify(사후 체결·보유)    │
│  ─ backtest.py      : 과거 전 구간 시뮬레이션 → 거래·NAV·월별통계     │
│  ─ scripts/export_*.py : 위 결과를 Supabase에 upsert                │
└───────────────┬─────────────────────────────────────────────────┘
                │ Supabase service_role key (write, RLS 우회)
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  저장 계층 (Supabase Postgres)                                     │
│  daily_candidates · executions · position_snapshots ·             │
│  trades · trade_legs · nav_daily · monthly_stats · meta           │
│  → RLS: anon 은 SELECT 만 허용 (읽기 전용 공개)                     │
└───────────────┬─────────────────────────────────────────────────┘
                │ Supabase anon key (read-only)
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  표현 계층 (Next.js App Router @ Vercel)                           │
│  서버 컴포넌트에서 Supabase 조회 → 렌더. 로직 없음(읽기·표시·환산만)  │
└─────────────────────────────────────────────────────────────────┘
```

**왜 이렇게?** S2 규칙(진입·사이징·음봉차등·추가매수·분할매도·신저가손절·거래대금리셋·레버1.3)은
이미 7년/12년 백테스트로 검증된 Python에 있다. 웹에서 다시 구현하면 두 벌의 진실이 생겨 표류한다.
계산은 한 곳(Python), 웹은 그 결과를 "보여주기만" 한다.

## 2. 데이터 파이프라인 (배치)

| 작업 | 시각(KST) | 스크립트 | 입력 | 출력 테이블 |
|---|---|---|---|---|
| **장마감 전 후보** (Phase 2) | 15:10 | `export_preclose.py` | KRX 장중 스냅샷 | `daily_candidates` |
| **장마감 후 확정** | 15:45 | `export_eod.py` | KRX 일봉(확정) | `executions`, `position_snapshots`, `nav_daily` |
| **거래·월별 재집계** | 15:50 | `export_eod.py` (이어서) | 누적 시뮬레이션 | `trades`, `trade_legs`, `monthly_stats` |
| **과거 백필(최초 1회)** | 수동 | `export_eod.py --backfill` | 2019-03-11~ 전 구간 | 위 전체 |

- `export_eod.py` 는 내부적으로 `s2_candidates.reconstruct(verify=True)` 와 동일 로직을 시작자본부터
  대상일까지 한 번 돌려, 그날의 체결/보유/거래/NAV를 산출해 upsert 한다. **멱등(idempotent)** — 같은 날
  다시 돌려도 `(d, ticker, …)` 기준으로 덮어쓴다.
- 월별 통계는 `trades` 와 `nav_daily` 에서 파생 집계(SQL view 또는 배치 재계산).

### 장마감 전(15:10) 후보의 특수성

`daily_candidates`(동시호가 주문 정보)는 **장중 실시간 스냅샷**이 필요하다(15:10 현재가 → 지지선 지정가 계산).
따라서 15:10 정시 트리거가 필수. Phase 1에서는 사후(EOD) 데이터만 다루고, 실시간 후보는 Phase 2에서 추가한다.

## 3. 스케줄링

pykrx + KRX 로그인 + (패치된 `auth.py`)이 필요해 **Vercel 서버리스에서는 계산 엔진을 돌릴 수 없다.**
계산은 별도 환경에서 실행하고 결과만 Supabase에 넣는다.

| 단계 | 실행 위치 | 방법 |
|---|---|---|
| Phase 1 | 사용자 로컬 PC | Windows 작업 스케줄러 → `python scripts/export_eod.py` (매 거래일 15:45) |
| Phase 2+ | GitHub Actions | `cron` 워크플로(15:10·15:45 KST = 06:10·06:45 UTC), KRX/Supabase 키는 Secrets |

> GitHub Actions 러너(Linux)에서 pykrx 동작 가능. 단 **패치된 `auth.py`(자동 재로그인)**를 리포에 포함하거나
> 워크플로 단계에서 적용해야 한다. 휴장일은 KRX 빈 응답으로 감지 → 스킵.

Next.js(Vercel)는 계산에 관여하지 않으므로 cron 부담 없음. 데이터 신선도는 **ISR/On-demand Revalidation**으로:
exporter가 적재 완료 후 Vercel Revalidate 웹훅을 호출하거나, 페이지에 `revalidate = 600`(10분) 설정.

## 4. 환경변수

**Python exporter** (`s2_method/.env.local` 재사용 + 추가)
```
KRX_ID, KRX_PW                       # 기존 KRX 로그인
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY            # 쓰기 전용. 절대 클라이언트/깃 커밋 금지
```

**Next.js** (`s2-trading-web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY        # 공개 가능(RLS로 읽기만 허용)
```

## 5. 배포

- **Next.js → Vercel**: GitHub 리포 연결, `s2-trading-web/` 를 root로 설정. 환경변수는 Vercel 프로젝트 설정.
- **Supabase**: 프로젝트 생성 → `supabase/schema.sql` 적용 → RLS 정책 확인.
- **Exporter**: Phase 1 로컬 스케줄, Phase 2 GitHub Actions.

## 6. 신뢰성/정합성 원칙

- exporter는 멱등 upsert. 부분 실패 시 해당 날짜만 재실행하면 복구.
- `meta` 테이블에 `last_eod_at`, `last_preclose_at`, `base_capital`, `rules_version` 기록 → 화면에 "최종 업데이트" 표시.
- 백테스트(과거)와 라이브(당일)가 동일 엔진이므로 일자별 화면과 월별 통계가 항상 정합.
