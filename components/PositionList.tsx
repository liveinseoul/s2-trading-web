import { won, pct, signClass, shortName } from "@/lib/format";
import { Section, Empty, MarketBadge } from "@/components/ui";
import type { PositionSnapshot } from "@/lib/types";

export default function PositionList({ positions, title = "보유 포트폴리오" }: {
  positions: PositionSnapshot[]; title?: string;
}) {
  return (
    <Section title={title} sub="당일 마감 후 보유 종목">
      {positions.length === 0 ? (
        <Empty>보유 종목 없음 — 전액 현금.</Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--color-borderc)]">
          {positions.map((p) => (
            <li key={p.ticker} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{shortName(p.name)}</span>
                  <MarketBadge market={p.market} />
                </div>
                <div className="text-xs text-muted tnum">
                  진입 {p.entry_date} · 매수 {p.buy_count}/매도 {p.sell_count} · 평단 {won(p.avg_buy)}
                </div>
              </div>
              <div className="text-right tnum">
                <div className="font-medium">{won(p.eval_amount)}원</div>
                <div className={`text-xs ${signClass(p.eval_pnl)}`}>
                  {p.eval_pnl >= 0 ? "+" : ""}{won(p.eval_pnl)} ({pct(p.ret_pct)})
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
