import { marketLabel } from "@/lib/format";

export function Section({ title, sub, children }: {
  title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-1 text-base font-bold">{title}</h2>
      {sub && <p className="mb-2 text-xs text-muted">{sub}</p>}
      <div className="rounded-xl border border-[var(--color-borderc)] bg-surface p-3">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-center text-sm text-muted">{children}</p>;
}

export function MarketBadge({ market }: { market: string }) {
  return (
    <span className="rounded bg-[var(--color-borderc)] px-1.5 py-0.5 text-[11px] text-flat">
      {marketLabel(market)}
    </span>
  );
}

export function Tag({ children, tone = "flat" }: {
  children: React.ReactNode; tone?: "up" | "down" | "flat" | "warn" | "accent";
}) {
  const cls = {
    up: "bg-up-soft text-up", down: "bg-down-soft text-down",
    flat: "bg-[var(--color-borderc)] text-flat", warn: "bg-orange-100 text-warn",
    accent: "bg-cyan-50 text-accent",
  }[tone];
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}
