import { won, shortName, orderTypeLabel } from "@/lib/format";
import { Section, Empty, MarketBadge, Tag } from "@/components/ui";
import CapitalAmount from "@/components/CapitalAmount";
import type { OrderPlan } from "@/lib/types";

const diffTone = { new: "up", changed: "warn", keep: "flat", cancel: "down" } as const;

export default function WatchOrderPlan({ plan }: { plan: OrderPlan[] }) {
  const byTicker = new Map<string, OrderPlan[]>();
  plan.forEach((o) => byTicker.set(o.ticker, [...(byTicker.get(o.ticker) ?? []), o]));

  return (
    <Section title="오늘 저녁 세팅할 감시주문"
      sub="보유 종목별 매수·매도·손절 감시주문. 체결로 평단·단계가 바뀌면 가격이 재계산됨 → 저녁에 갱신.">
      {plan.length === 0 ? (
        <Empty>설정할 감시주문이 없습니다(보유 없음).</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {[...byTicker.entries()].map(([tk, orders]) => (
            <div key={tk} className="rounded-lg border border-[var(--color-borderc)] bg-bg p-2.5">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-bold">{shortName(orders[0].name)}</span>
                <MarketBadge market={orders[0].market} />
                <span className="text-xs text-muted tnum">{tk}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Tag tone={o.order_type === "buy_add" ? "up" : o.order_type.includes("stop") ? "down" : "accent"}>
                        {orderTypeLabel[o.order_type]}{o.stage ? ` ${o.stage}` : ""}
                      </Tag>
                      <Tag tone={diffTone[o.diff]}>{o.diff}</Tag>
                      <span className="text-xs text-muted">{o.note}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="tnum font-medium">{won(o.trigger_price)}원</span>
                      <span className="tnum text-xs text-muted">{o.qty.toLocaleString("ko-KR")}주(모델)</span>
                      {o.order_type === "buy_add" && <CapitalAmount pct={o.port_pct} price={o.trigger_price} />}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
