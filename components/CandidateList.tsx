import { won, pct, shortName, bull } from "@/lib/format";
import { Section, Empty, MarketBadge, Tag } from "@/components/ui";
import CapitalAmount from "@/components/CapitalAmount";
import type { DailyCandidate } from "@/lib/types";

export default function CandidateList({ cands }: { cands: DailyCandidate[] }) {
  return (
    <Section title="오늘 동시호가 신규 매수 후보"
      sub="15:20~15:30 종가 동시호가에 '지지선(20일선 −20%) 지정가' 매수주문을 미리 제출 → 종가가 지지선 이하로 마감하면 체결, 아니면 미체결(위험 없음).">
      {cands.length === 0 ? (
        <Empty>오늘 신규 진입 후보가 없습니다.</Empty>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cands.map((c) => (
            <div key={c.ticker} className="rounded-lg border border-[var(--color-borderc)] bg-bg p-2.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-bold">{shortName(c.name)}</span>
                <MarketBadge market={c.market} />
                <span className="text-xs text-muted tnum">{c.ticker}</span>
                {c.reached
                  ? <Tag tone="up">● 지지선 도달</Tag>
                  : <Tag tone="flat">지지선까지 {c.drop_to_pct?.toFixed(1)}%</Tag>}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span>현재가 <b className="text-textc tnum">{won(c.current_price)}</b></span>
                  <Tag tone={c.ma120_above ? "up" : "flat"}>MA120 {c.ma120_above ? "UP" : "DOWN"}</Tag>
                  <span>직전스파이크 {bull(c.prev_spike_bull)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="tnum">주문가 <b className="text-up">{won(c.order_price)}원</b></span>
                  <span className="text-xs text-muted">포트 {c.port_pct.toFixed(1)}%</span>
                  <CapitalAmount pct={c.port_pct} price={c.order_price} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
