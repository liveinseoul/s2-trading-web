import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CandidateList from "@/components/CandidateList";
import ExecutionList from "@/components/ExecutionList";
import PositionList from "@/components/PositionList";
import type { Execution, PositionSnapshot, DailyCandidate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const [cands, execs, positions, prev, next] = await Promise.all([
    supabase.from("daily_candidates").select("*").eq("d", date).eq("kind", "new").order("reached", { ascending: false }).order("drop_to_pct", { ascending: false }),
    supabase.from("executions").select("*").eq("d", date),
    supabase.from("position_snapshots").select("*").eq("d", date).order("eval_amount", { ascending: false }),
    supabase.from("nav_daily").select("d").lt("d", date).order("d", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("nav_daily").select("d").gt("d", date).order("d", { ascending: true }).limit(1).maybeSingle(),
  ]);
  const prevD = (prev.data as { d: string } | null)?.d;
  const nextD = (next.data as { d: string } | null)?.d;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        {prevD ? <Link href={`/day/${prevD}`} className="text-accent">◀ {prevD}</Link> : <span />}
        <h1 className="text-lg font-bold">{date} 매매</h1>
        {nextD ? <Link href={`/day/${nextD}`} className="text-accent">{nextD} ▶</Link> : <span />}
      </div>
      <CandidateList cands={(cands.data as DailyCandidate[]) ?? []} />
      <ExecutionList execs={(execs.data as Execution[]) ?? []} title="체결 내역"
        sub="모델 기준 당일 신규·추가 매수 및 매도·손절(레버 미체결 참고 포함)" />
      <PositionList positions={(positions.data as PositionSnapshot[]) ?? []} title="마감 후 보유" />
    </>
  );
}
