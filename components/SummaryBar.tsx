import { won, eok } from "@/lib/format";
import type { NavDaily } from "@/lib/types";

export default function SummaryBar({ nav, date, lastEod }: {
  nav: NavDaily | null; date: string | null; lastEod?: string;
}) {
  const items = [
    { k: "NAV", v: nav ? eok(nav.nav) : "-" },
    { k: "주식평가", v: nav ? eok(nav.stock_value) : "-" },
    { k: "현금", v: nav ? eok(nav.cash) : "-" },
    { k: "레버리지", v: nav ? `${nav.leverage.toFixed(2)}배` : "-" },
    { k: "보유", v: nav ? `${nav.n_positions}종목` : "-" },
  ];
  return (
    <div className="mb-5 rounded-xl border border-[var(--color-borderc)] bg-surface p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>기준일 {date ?? "-"}</span>
        <span>기준자본 5억 모델 · 최종 업데이트 {lastEod ?? "-"}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto">
        {items.map((it) => (
          <div key={it.k} className="shrink-0">
            <div className="text-xs text-muted">{it.k}</div>
            <div className="text-lg font-bold tnum">{it.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
