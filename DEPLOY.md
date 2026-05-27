# 배포 & 자동화 가이드 (Vercel + 로컬 스케줄 + 텔레그램)

아키텍처: **계산(로컬 PC)** → **데이터(Supabase·클라우드)** → **서빙(Vercel·클라우드)**.
계산 잡은 로컬 stock_cache.db + 패치된 pykrx 로그인이 필요해 로컬에서 돈다. 적재된 데이터는 클라우드라 웹은 전 세계 서빙.

---

## A. Vercel 배포 (웹, 수동)

웹은 `s2-trading-web/` 만 필요(파이썬 엔진·캐시·KRX 키는 로컬 전용 → 공개 리포에 넣지 않음).

1. **GitHub 리포 생성** — `s2-trading-web/` 폴더만 푸시(루트가 이 폴더가 되도록).
   ```bash
   cd s2-trading-web
   git init && git add . && git commit -m "S2 trading web"
   git remote add origin <your-repo-url> && git push -u origin main
   ```
   (`.gitignore` 가 node_modules·.next·.env.local·로그·_dryrun 제외)
2. **Vercel → New Project → 리포 선택**. Framework: Next.js (자동). Root Directory: `./`(리포 루트=s2-trading-web).
3. **환경변수 등록** (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://epescynqznqshhytufce.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...`(publishable 키)
4. **Deploy**. 끝나면 공개 URL 발급. 데이터는 Supabase에서 읽으므로 즉시 동작.

> 데이터 갱신 반영: 페이지가 force-dynamic이라 매 요청 시 최신 조회(자동 반영). 캐싱 최적화는 추후 ISR 전환.

---

## B. 로컬 자동 스케줄 (Phase 2 — 15:10 / 15:45)

`s2_method/.env.local` 에 아래를 추가(KRX_* 는 기존):
```
SUPABASE_URL=https://epescynqznqshhytufce.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...        # 회전한 최신 secret 키
TELEGRAM_BOT_TOKEN=123456:ABC...               # 선택(알림)
TELEGRAM_CHAT_ID=123456789                      # 선택(알림)
```
스케줄 등록(관리자 PowerShell에서 1회):
```powershell
powershell -ExecutionPolicy Bypass -File s2-trading-web\scripts\register_tasks.ps1
```
- **15:10 S2_preclose** → `run_preclose.ps1` → 라이브 스냅샷으로 동시호가 신규 매수 후보 산출 → Supabase `daily_candidates` + 텔레그램.
- **15:45 S2_eod** → `run_eod.ps1` → `main.py`(당일 EOD 캐시 저장) + `export_eod.py`(전구간 재계산 적재) + 텔레그램.
- 로그: `scripts/preclose.log`, `scripts/eod.log`. 수동 테스트: `schtasks /run /tn S2_preclose`.
- ⚠ PC가 해당 시각에 켜져 있어야 함. 휴장일은 스냅샷 빈 결과로 자동 스킵.

---

## C. 텔레그램 봇 설정 (선택)

1. 텔레그램 **@BotFather** → `/newbot` → 봇 토큰 발급.
2. 만든 봇과 한 번 대화(아무 메시지) 후 `https://api.telegram.org/bot<TOKEN>/getUpdates` 열어 `chat.id` 확인.
3. 위 `.env.local` 에 `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` 입력.
4. 테스트: `python s2-trading-web/scripts/notify.py "테스트"`.

알림 내용: 15:10 "오늘 동시호가 신규 매수 후보(지지선 지정가)" · 15:45 "마감 결과(체결·NAV·내일 감시주문)".

---

## 화면에서 보는 곳
- **오늘 동시호가 후보** / **체결 결과** / **보유**: 홈 `/`
- **일자별**(과거 조회·후보 포함): `/day/[date]` (또는 `/day` → 최신일)
- **월별 성과 · 예비후보 vs 매수 비교**: `/dashboard`
- **종목별 매매 이력**: `/stocks` · **규칙/검증**: `/rules`
