"use client";
import { useCapital } from "@/lib/useCapital";

/** 포트% + 주문가 → 내 자본 기준 예상 수량/금액. */
export default function CapitalAmount({ pct, price }: { pct: number | null; price: number }) {
  const [cap] = useCapital();
  if (pct == null || price <= 0) return null;
  const amount = (cap * pct) / 100;
  const qty = Math.floor(amount / price);
  return (
    <span className="text-xs text-muted tnum">
      내 자본 ≈ {qty.toLocaleString("ko-KR")}주 ({Math.round(qty * price).toLocaleString("ko-KR")}원)
    </span>
  );
}
