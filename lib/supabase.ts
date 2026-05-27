import { createClient } from "@supabase/supabase-js";

// 공개 읽기 전용(anon). RLS 로 SELECT 만 허용된다. 쓰기는 Python 익스포터(service_role)만.
// 서버 컴포넌트에서 모듈 레벨로 재사용.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

/** nav_daily 의 최신 거래일을 구한다(여러 화면의 기준일). */
export async function latestDate(): Promise<string | null> {
  const { data } = await supabase
    .from("nav_daily").select("d").order("d", { ascending: false }).limit(1).single();
  return data?.d ?? null;
}

/** meta(key→value) 전체를 객체로. */
export async function getMeta(): Promise<Record<string, unknown>> {
  const { data } = await supabase.from("meta").select("key,value");
  const m: Record<string, unknown> = {};
  (data ?? []).forEach((r) => (m[r.key] = r.value));
  return m;
}
