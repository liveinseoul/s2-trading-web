"use client";
import { useCapital } from "@/lib/useCapital";

/** 헤더의 내 자본 입력(억 단위). 전 화면의 포트% → 수량/금액 환산 기준. */
export default function CapitalInput() {
  const [cap, setCap] = useCapital();
  const eok = Math.round(cap / 1e8 * 10) / 10;
  return (
    <label className="flex items-center gap-1 text-sm text-muted">
      내 자본
      <input
        type="number" step="0.5" min="0.5" value={eok}
        onChange={(e) => setCap(Math.max(0.5, Number(e.target.value)) * 1e8)}
        className="w-16 rounded border border-[var(--color-borderc)] px-1 py-0.5 text-right text-textc tnum"
      />
      억
    </label>
  );
}
