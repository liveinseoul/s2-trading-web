import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { eok, pct, signClass, shortName } from "@/lib/format";
import { Section, Empty, MarketBadge } from "@/components/ui";
import type { Trade } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
  const { data } = await supabase.from("trades").select("*").order("entry_date", { ascending: false });
  const trades = (data as Trade[]) ?? [];
  const agg = new Map<string, { name: string; market: string; n: number; pnl: number; ret: number; last: string }>();
  for (const t of trades) {
    const a = agg.get(t.ticker) ?? { name: t.name, market: t.market, n: 0, pnl: 0, ret: 0, last: t.entry_date };
    a.n += 1; a.pnl += t.pnl ?? 0; a.ret += t.ret_pct ?? 0;
    if (t.entry_date > a.last) a.last = t.entry_date;
    agg.set(t.ticker, a);
  }
  const rows = [...agg.entries()].sort((x, y) => y[1].pnl - x[1].pnl);

  return (
    <>
      <h1 className="mb-3 text-lg font-bold">종목별 매매</h1>
      <Section title={`거래 종목 ${rows.length}개`} sub="종목을 누르면 매수/매도 이력(일자·포트%)을 봅니다.">
        {rows.length === 0 ? <Empty>데이터 없음</Empty> : (
          <ul className="divide-y divide-[var(--color-borderc)]">
            {rows.map(([tk, a]) => (
              <li key={tk}>
                <Link href={`/stocks/${tk}`} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium">{shortName(a.name)}</span>
                    <MarketBadge market={a.market} />
                    <span className="text-xs text-muted">{a.n}회</span>
                  </span>
                  <span className="text-right tnum">
                    <span className={`font-medium ${signClass(a.pnl)}`}>{eok(a.pnl)}</span>
                    <span className="ml-2 text-xs text-muted">평균 {pct(a.ret / a.n)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
