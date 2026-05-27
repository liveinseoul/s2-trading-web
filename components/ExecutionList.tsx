import { won, pct, shortName, actionLabel } from "@/lib/format";
import { Section, Empty, MarketBadge, Tag } from "@/components/ui";
import type { Execution } from "@/lib/types";

function Row({ e }: { e: Execution }) {
  const isBuy = e.action.startsWith("buy");
  const isSell = e.action.startsWith("sell") || e.action === "stop" || e.action === "newlow_stop";
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-[var(--color-borderc)] py-2 last:border-0">
      <span className="flex items-center gap-1.5">
        <Tag tone={isBuy ? "up" : "down"}>{actionLabel[e.action]}</Tag>
        <span className="font-medium">{shortName(e.name)}</span>
        <MarketBadge market={e.market} />
        {e.blocked_by_leverage && <Tag tone="warn">레버 미체결</Tag>}
      </span>
      <span className="flex items-center gap-3 text-sm tnum">
        <span className="font-medium">{won(e.fill_price)}원</span>
        <span className="text-xs text-muted">{e.qty.toLocaleString("ko-KR")}주 · {won(e.amount)}원</span>
        {e.port_pct != null && <span className="text-xs text-muted">{e.port_pct.toFixed(1)}%</span>}
      </span>
    </li>
  );
}

export default function ExecutionList({ execs, title = "오늘 체결", sub }: {
  execs: Execution[]; title?: string; sub?: string;
}) {
  const filled = execs.filter((e) => !e.blocked_by_leverage);
  const blocked = execs.filter((e) => e.blocked_by_leverage);
  return (
    <Section title={title} sub={sub}>
      {filled.length === 0 && blocked.length === 0 ? (
        <Empty>해당 일자에 체결 내역이 없습니다.</Empty>
      ) : (
        <>
          <ul>{filled.map((e) => <Row key={e.id} e={e} />)}</ul>
          {blocked.length > 0 && (
            <>
              <p className="mt-3 mb-1 text-xs text-warn">참고 · 레버리지 1.3배 상한에 막혀 미체결 ({blocked.length})</p>
              <ul className="opacity-70">{blocked.map((e) => <Row key={e.id} e={e} />)}</ul>
            </>
          )}
        </>
      )}
    </Section>
  );
}
