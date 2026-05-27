import { redirect } from "next/navigation";
import { latestDate } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// /day → 최신 거래일 조회로 초기화(어제/최근)
export default async function DayIndex() {
  const d = await latestDate();
  redirect(d ? `/day/${d}` : "/");
}
