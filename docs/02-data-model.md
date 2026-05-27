# 02 · 데이터 모델 (Supabase Postgres)

모든 가격은 원(KRW) 정수(`bigint`), 비율은 `numeric`. 시장은 `'KS'`(KOSPI)/`'KQ'`(KOSDAQ).
기준 모델 포트폴리오 1개만 다루므로 user_id 없음(공개 단일 포트폴리오). 사이징은 항상 **포트 대비 %**로 저장.

## 테이블 개요

| 테이블 | 용도 | 주요 화면 |
|---|---|---|
| `meta` | 설정·갱신시각(기준자본, 룰버전, last_eod_at) | 공통(최종 업데이트 표시) |
| `daily_candidates` | 장마감 전 동시호가 주문 후보(15:10) | 홈/오늘 (Phase 2) |
| `daily_order_plan` | 마감 후 산출, 다음날 세팅할 감시주문 세트(매수/매도/손절) | 홈(감시주문 플랜) |
| `executions` | 사후 확정 체결 + 레버 미체결(참고) | 홈, 일자별 |
| `position_snapshots` | 일자별 마감 후 보유 포트폴리오 | 홈, 일자별 |
| `trades` | 완결 라운드트립 거래 | 종목별, 전체 거래내역 |
| `trade_legs` | 거래의 개별 매수/매도 레그(일자·포트%) | 종목 상세 |
| `nav_daily` | 일별 NAV·낙폭 시계열 | 대시보드 차트 |
| `monthly_stats` | 월별 매매건수·승률·수익률·MDD | 월별 대시보드 |

## DDL (`supabase/schema.sql`)

```sql
-- ── 메타/설정 ──────────────────────────────────────────────
create table meta (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
-- seed 예: ('base_capital','500000000'), ('rules_version','"15/7.5·음봉0.8·10/10/80·리셋60·신저가2차·레버1.3"')

-- ── 장마감 전 동시호가 주문 후보 (15:10 스냅샷) ───────────────
create table daily_candidates (
  d               date    not null,
  ticker          text    not null,
  kind            text    not null check (kind in ('new','add')),  -- 신규진입/추가매수
  name            text    not null,
  market          text    not null check (market in ('KS','KQ')),
  current_price   bigint  not null,                 -- 스냅샷 현재가(15:10)
  order_price     bigint  not null,                 -- 신규=지지선(MA20×0.80), 추가=직전매수가×0.9
  port_pct        numeric(5,2) not null,            -- 포트 대비 주문 비중(%)
  ma120_above     boolean not null,
  prev_spike_bull boolean,                           -- 직전 5천억 봉 양봉=true/음봉=false/없음=null
  stage           smallint not null default 1,       -- 추가매수 회차(2,3), 신규=1
  reached         boolean not null,                  -- 주문가 도달 여부(신규=종가권/추가=트리거)
  drop_to_pct     numeric(6,2),                      -- 신규: 지지선까지 추가하락 필요폭(%)
  snapshot_at     timestamptz not null,
  primary key (d, ticker, kind)
);
create index on daily_candidates (d);

-- ── 일일 감시주문 플랜 (마감 후 산출 → 다음 거래일 세팅) ───────
-- 보유 종목별로 '내일 걸어둘 감시주문' 세트. 체결로 평단/단계가 바뀌면 매도·손절이 재계산된다.
create table daily_order_plan (
  id            bigint generated always as identity primary key,
  d             date    not null,                 -- 이 플랜 산출 기준일(이날 마감 후)
  ticker        text    not null,
  name          text    not null,
  market        text    not null,
  order_type    text    not null check (order_type in
                  ('buy_add','sell','stop','newlow_stop')),
  stage         smallint,                          -- 매수 회차(2/3) / 매도 단계(1/2/3)
  trigger_price bigint  not null,                  -- 감시 트리거·지정가
  qty           integer not null,
  port_pct      numeric(5,2),
  diff          text not null default 'keep' check (diff in ('new','changed','keep','cancel')),
  note          text,
  created_at    timestamptz not null default now()
);
create index on daily_order_plan (d);
create index on daily_order_plan (d, ticker);

-- ── 사후 확정 체결/미체결 (15:45 verify) ─────────────────────
create table executions (
  id            bigint generated always as identity primary key,
  d             date    not null,
  ticker        text    not null,
  name          text    not null,
  market        text    not null,
  action        text    not null check (action in
                  ('buy_new','buy_add','sell_1','sell_2','sell_3','stop','newlow_stop')),
  stage         smallint,                       -- 매수 회차 / 매도 단계
  fill_price    bigint  not null,
  qty           integer not null,
  amount        bigint  not null,               -- fill_price × qty
  port_pct      numeric(5,2),
  ma120_above   boolean,
  prev_spike_bull boolean,
  blocked_by_leverage boolean not null default false,  -- true=조건충족했으나 레버1.3 상한에 막힘(참고)
  created_at    timestamptz not null default now()
);
create index on executions (d);
create index on executions (ticker);

-- ── 일자별 마감 후 보유 포트폴리오 ───────────────────────────
create table position_snapshots (
  d            date    not null,
  ticker       text    not null,
  name         text    not null,
  market       text    not null,
  entry_date   date    not null,
  buy_count    smallint not null,
  sell_count   smallint not null,
  qty          integer not null,
  avg_buy      bigint  not null,
  last_close   bigint  not null,
  eval_amount  bigint  not null,                 -- qty × last_close
  eval_pnl     bigint  not null,                 -- qty × (last_close - avg_buy)
  ret_pct      numeric(6,2) not null,
  port_pct     numeric(5,2),                     -- 평가금액 / 당일 NAV
  primary key (d, ticker)
);
create index on position_snapshots (d);

-- ── 완결 라운드트립 거래 ─────────────────────────────────────
create table trades (
  id           bigint generated always as identity primary key,
  ticker       text    not null,
  name         text    not null,
  market       text    not null,
  entry_date   date    not null,
  exit_date    date,
  buy_count    smallint not null,
  max_invested bigint  not null,                 -- 총 투입원금(비용)
  proceeds     bigint,                            -- 총 회수금
  pnl          bigint,
  ret_pct      numeric(7,2),                      -- proceeds/max_invested - 1
  holding_days integer,
  exit_reason  text,                              -- 'sell_3'|'stop'|'newlow_stop'|'open'
  status       text not null default 'open' check (status in ('open','closed'))
);
create index on trades (entry_date);
create index on trades (exit_date);
create index on trades (ticker);

-- ── 거래 레그(개별 매수/매도) — 종목 상세 일자·포트% ──────────
create table trade_legs (
  id        bigint generated always as identity primary key,
  trade_id  bigint not null references trades(id) on delete cascade,
  d         date    not null,
  leg_type  text    not null,                    -- 'buy_new'|'buy_add'|'sell_1'|'sell_2'|'sell_3'|'stop'|'newlow_stop'
  stage     smallint,
  price     bigint  not null,
  qty       integer not null,
  amount    bigint  not null,
  port_pct  numeric(5,2)
);
create index on trade_legs (trade_id);
create index on trade_legs (d);

-- ── 일별 NAV/낙폭 시계열 (대시보드 차트) ─────────────────────
create table nav_daily (
  d           date primary key,
  nav         bigint  not null,
  cash        bigint  not null,
  stock_value bigint  not null,
  leverage    numeric(4,3) not null,
  dd_pct      numeric(6,2) not null,             -- 고점 대비 낙폭(음수)
  n_positions smallint not null
);

-- ── 월별 통계 (대시보드) ─────────────────────────────────────
create table monthly_stats (
  month        text primary key,                 -- 'YYYY-MM'
  num_trades   integer not null,
  win_rate     numeric(5,2) not null,
  avg_ret      numeric(6,2) not null,            -- 매수당 평균 수익률
  realized_pnl bigint  not null,
  nav_start    bigint  not null,
  nav_end      bigint  not null,
  return_pct   numeric(7,2) not null,            -- 월 NAV 수익률
  mdd_pct      numeric(6,2) not null
);
```

## RLS (행 수준 보안)

공개 읽기 전용. 쓰기는 Python exporter가 `service_role` 키로 수행(RLS 우회).

```sql
-- 모든 공개 테이블에 동일 적용
alter table daily_candidates    enable row level security;
alter table daily_order_plan    enable row level security;
alter table executions          enable row level security;
alter table position_snapshots  enable row level security;
alter table trades              enable row level security;
alter table trade_legs          enable row level security;
alter table nav_daily           enable row level security;
alter table monthly_stats       enable row level security;
alter table meta                enable row level security;

create policy "public read" on daily_candidates   for select using (true);
create policy "public read" on daily_order_plan    for select using (true);
create policy "public read" on executions          for select using (true);
create policy "public read" on position_snapshots  for select using (true);
create policy "public read" on trades              for select using (true);
create policy "public read" on trade_legs          for select using (true);
create policy "public read" on nav_daily           for select using (true);
create policy "public read" on monthly_stats       for select using (true);
create policy "public read" on meta                for select using (true);
-- INSERT/UPDATE 정책 없음 → anon 쓰기 불가. service_role 키만 쓰기.
```

## Python 출력 ↔ 테이블 매핑

| `s2_candidates --verify` 출력 | 테이블 |
|---|---|
| [보유] 당일 마감 후 포트폴리오 | `position_snapshots` |
| [A] 신규 체결 / [B] 추가매수 체결 | `executions` (action=`buy_new`/`buy_add`, `blocked_by_leverage=false`) |
| [C] 레버 한도 미체결 | `executions` (`blocked_by_leverage=true`) |
| 매도/손절(전체 시뮬레이션에서) | `executions` (action=`sell_*`/`stop`/`newlow_stop`) |
| 라운드트립 집계 | `trades` + `trade_legs` |
| 일별 NAV/DD | `nav_daily` |
| 월별 집계 | `monthly_stats` |

> `daily_candidates`(사전 후보)는 `s2_candidates`의 [A]/[B] 후보(주문가=지지선/직전매수가×0.9)를 그대로 적재.
