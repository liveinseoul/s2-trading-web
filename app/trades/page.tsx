import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { pct, signClass, shortName, won } from "@/lib/format";
import { Section, Empty, MarketBadge } from "@/components/ui";
import type { Trade } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TradesPage() {
  const { data } = await supabase.from("trades").select("*")
    .order("entry_date", { ascending: false }).limit(500);
  const trades = (data as Trade[]) ?? [];
  return (
    <>
      <h1 className="mb-3 text-lg font-bold">전체 거래내역</h1>
      <Section title={`최근 ${trades.length}건`}>
        {trades.length === 0 ? <Empty>데이터 없음</Empty> : (
          <ul className="divide-y divide-[var(--color-borderc)]">
            {trades.map((t) => (
              <li key={t.id}>
                <Link href={`/stocks/${t.ticker}`} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium">{shortName(t.name)}</span>
                    <MarketBadge market={t.market} />
                    <span className="text-xs text-muted tnum">{t.entry_date}~{t.exit_date ?? "보유"}</span>
                  </span>
                  <span className="text-right tnum">
                    {t.pnl != null
                      ? <span className={`font-medium ${signClass(t.pnl)}`}>{pct(t.ret_pct)} · {won(t.pnl)}</span>
                      : <span className="text-muted">보유중</span>}
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
