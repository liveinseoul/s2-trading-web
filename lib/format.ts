// 표시 포맷 헬퍼 (엔진 출력 규칙과 일치: 종목명 6자·KS/KQ·UP/DOWN·한국식 색)

export const won = (n: number | null | undefined) =>
  n == null ? "-" : Math.round(n).toLocaleString("ko-KR");

export const eok = (n: number | null | undefined) =>
  n == null ? "-" : `${(n / 1e8).toFixed(2)}억`;

export const pct = (n: number | null | undefined, digits = 1) =>
  n == null ? "-" : `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;

/** 손익 색: 양수=상승(빨강), 음수=하락(파랑) — 한국식 */
export const signClass = (n: number | null | undefined) =>
  n == null || n === 0 ? "text-flat" : n > 0 ? "text-up" : "text-down";

/** 종목명 6자 초과 시 앞 6자 */
export const shortName = (name: string) => (name?.length > 6 ? name.slice(0, 6) : name ?? "");

export const marketLabel = (m: string) => (m === "KOSPI" ? "KS" : m === "KOSDAQ" ? "KQ" : m);

export const upDown = (above: boolean | null | undefined) =>
  above == null ? "-" : above ? "UP" : "DOWN";

export const bull = (b: boolean | null | undefined) =>
  b == null ? "—" : b ? "양봉" : "음봉";

export const actionLabel: Record<string, string> = {
  buy_new: "신규매수", buy_add: "추가매수",
  sell_1: "1차매도(+3%)", sell_2: "2차매도(+5%)", sell_3: "3차매도(+7%)",
  stop: "손절", newlow_stop: "신저가손절",
};

export const orderTypeLabel: Record<string, string> = {
  buy_add: "추가매수 감시", sell: "매도 감시", stop: "손절 감시", newlow_stop: "신저가손절 감시",
};
