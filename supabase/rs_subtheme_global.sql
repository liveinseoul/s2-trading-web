-- 한미일 통합 테마 서브디비전 (50+ 종목 테마를 Gemini 로 다시 세분).
-- Supabase SQL Editor 에서 1회 실행.

create table if not exists rs_subtheme_global_weekly (
  week_date date not null,
  theme_key text not null,            -- 정규화 키 (lib/globalTheme.ts normalizeBig 결과)
  theme_label text not null,          -- 표시 라벨
  total_stocks int not null,
  subcategories jsonb not null,       -- [{label: string, tickers: string[]}]
  model text,
  generated_at timestamptz not null default now(),
  primary key (week_date, theme_key)
);

alter table rs_subtheme_global_weekly enable row level security;

drop policy if exists rs_subtheme_global_weekly_read on rs_subtheme_global_weekly;
create policy rs_subtheme_global_weekly_read on rs_subtheme_global_weekly
  for select using (true);

create index if not exists rs_subtheme_global_weekly_week_idx
  on rs_subtheme_global_weekly (week_date desc);
