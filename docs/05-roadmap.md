# 05 · 로드맵 & 개발 계획

## 단계 요약

| Phase | 목표 | 핵심 산출물 |
|---|---|---|
| **0** (현재) | 설계·문서 | README + docs 01~05 |
| **1 · MVP** | 사후 데이터 기반 정보 서비스 배포 | 스키마 + EOD exporter + 읽기 화면 + Vercel 배포 |
| **2** | 장마감 전 실시간 후보 + 자동화 | preclose exporter(15:10) + 홈 실시간 + GitHub Actions + 자본환산 |
| **3** | 알림·심화 | 이메일/푸시 알림, 종목 차트, (선택)사용자 계정 |

---

## Phase 1 — MVP (사후 정보 서비스)

**목표**: "어제(혹은 특정일) 무엇을 사고팔았어야 했나 + 월별 성과"를 공개 웹으로 제공.

1. **Supabase 셋업** — 프로젝트 생성, `supabase/schema.sql` 적용, RLS 확인.
2. **EOD Exporter (`scripts/export_eod.py`)**
   - 기존 `s2_candidates.reconstruct(verify=True)` 로직을 시작자본→대상일 1회 실행.
   - 산출: `executions`(체결+레버미체결), `position_snapshots`, `nav_daily`, `trades`+`trade_legs`, `monthly_stats` upsert.
   - **`daily_order_plan` 산출**(보유 종목별 다음날 감시주문 세트: 2/3차 매수·매도·손절, 전일 대비 diff) — docs/06.
   - `--backfill START:END` 로 2019-03-11~현재 전 구간 1회 적재. 멱등.
   - `meta` 갱신(last_eod_at, base_capital, rules_version).
3. **Next.js 앱**
   - `create-next-app`(TS/Tailwind/App Router) + `@supabase/supabase-js`(서버 측 anon 읽기).
   - 화면: `/`(보유+최근체결), `/day/[date]`, `/dashboard`, `/stocks`+`/stocks/[ticker]`, `/trades`, `/rules`.
   - 공통: 면책 배너, 자본 입력(localStorage 환산), 모바일 하단 탭, 손익 색(빨강↑/파랑↓).
   - 데이터 신선도: ISR `revalidate=600` 또는 on-demand revalidate.
4. **배포** — Vercel(root=`s2-trading-web/`), 환경변수 설정.
5. **스케줄(임시)** — 로컬 Windows 작업 스케줄러로 매 거래일 15:45 `export_eod.py` 실행.

**완료 기준**: 모바일에서 홈/일자별/월별/종목 화면이 실제 데이터로 동작하고 Vercel에 배포됨.

---

## Phase 2 — 장마감 전 실시간 + 자동화

1. **Preclose Exporter (`scripts/export_preclose.py`)** — 15:10 KRX 장중 스냅샷 → `s2_candidates` [A]/[B] 후보 → `daily_candidates` upsert.
2. **홈 실시간 카드** — 장중 시간대에 `daily_candidates(today)` 노출(동시호가 주문 가이드), 마감 후 자동으로 체결 결과로 전환.
3. **GitHub Actions cron** — 06:10·06:45 UTC(=15:10·15:45 KST) 워크플로. KRX/Supabase 키 Secrets, 패치 `auth.py` 포함, 휴장일 스킵, 적재 후 Vercel revalidate 웹훅.
4. **자본 환산 고도화** — 호가단위(틱) 보정, 환산 수량/금액 표 출력.

---

### Phase 2 추가 — 텔레그램 트리거 알림 (감시주문 시차 보완)

저녁 일일 플랜(Phase 1)이 못 닫는 **당일 이벤트**(특히 당일 −1% 손절 ≈ 1차매도일의 49%, 2차매수 후 매도 재설정)를
장중 KRX 시세 감시로 보완. 브로커 연동 없이 **모델 트리거 교차 시** 텔레그램으로 "지금 이 감시주문을 설정/변경하세요" 푸시.
- 트리거 근접/교차 이벤트 기반(+마감 임박 15:00~15:20 집중 점검). 자동매매 아님(수동 설정 안내). 상세: docs/06.

## Phase 3 — 알림·심화 (선택)

- **알림 확장**: 웹푸시/이메일 채널, 관심 종목 구독. Supabase Edge Function + Resend 등.
- **종목 차트**: 가격 + 매매 시점 마커(`/stocks/[ticker]`).
- **사용자 계정**(필요 시): Supabase Auth, 관심종목·자기 자본 저장. 데이터 모델에 user 스코프 추가.
- **백테스트 탐색 뷰**: 파라미터(사이징·매도비율)별 성과 비교(읽기 전용, 사전 계산 결과).

---

## 리스크 & 결정 대기

- **실시간 데이터 트리거(15:10)**: GitHub Actions 안정성/지연. 대안: 소형 상시 호스트. → Phase 2 착수 시 결정.
- **패치 pykrx `auth.py`**: 클라우드 러너에 이식 필요(리포 포함 or 빌드 스텝).
- **면책·법적**: 투자정보 제공 고지 문구 확정(서비스 오픈 전 필수).
- **용량/슬리피지 고지**: 기준자본 확대 시 체결 현실성 한계를 화면에 명시(과대평가 방지).

## 다음 액션(승인 후)

1. Supabase 프로젝트 생성 + `schema.sql` 작성·적용
2. `scripts/export_eod.py` 작성 + `--backfill` 1회 적재
3. `create-next-app` 스캐폴드 + 공통 레이아웃/디자인 토큰
4. 화면 순서: `/`(홈) → `/dashboard` → `/day/[date]` → `/stocks` → `/rules`
