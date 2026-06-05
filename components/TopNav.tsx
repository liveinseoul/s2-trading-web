"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Tab = { href: string; label: string; match: (p: string) => boolean };

// 왼편: RS 관련
const LEFT_TABS: Tab[] = [
  { href: "/rs96",       label: "RS96+",       match: (p) => p.startsWith("/rs96") },
  { href: "/rules/rs96", label: "규칙(RS96+)", match: (p) => p === "/rules/rs96" },
];

// 오른편: S2 관련
const RIGHT_TABS: Tab[] = [
  { href: "/",         label: "오늘",       match: (p) => p === "/" || p.startsWith("/day") },
  { href: "/dashboard",label: "대시보드",   match: (p) => p.startsWith("/dashboard") || p.startsWith("/month") },
  { href: "/stocks",   label: "종목",       match: (p) => p.startsWith("/stocks") || p.startsWith("/trades") },
  { href: "/rules/s2", label: "규칙(S2)",   match: (p) => p === "/rules/s2" || p === "/rules" },
];

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className={active ? "font-medium text-accent" : "text-muted hover:text-textc"}
    >
      {tab.label}
    </Link>
  );
}

export default function TopNav() {
  const p = usePathname();
  return (
    <nav className="hidden items-center gap-5 text-sm lg:flex">
      {LEFT_TABS.map((t) => <TabLink key={t.href} tab={t} active={t.match(p)} />)}
      <span className="text-[var(--color-borderc)] select-none">|</span>
      {RIGHT_TABS.map((t) => <TabLink key={t.href} tab={t} active={t.match(p)} />)}
    </nav>
  );
}
