"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const TABS = [
  { href: "/", label: "오늘", match: (p: string) => p === "/" || p.startsWith("/day") },
  { href: "/dashboard", label: "대시보드", match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/month") },
  { href: "/stocks", label: "종목", match: (p: string) => p.startsWith("/stocks") || p.startsWith("/trades") },
  { href: "/rs96", label: "RS96+", match: (p: string) => p.startsWith("/rs96") },
  { href: "/rules/s2", label: "규칙(S2)", match: (p: string) => p === "/rules/s2" || p === "/rules" },
  { href: "/rules/rs96", label: "규칙(RS96+)", match: (p: string) => p === "/rules/rs96" },
];

export default function TopNav() {
  const p = usePathname();
  return (
    <nav className="hidden items-center gap-6 text-sm lg:flex">
      {TABS.map((t) => {
        const active = t.match(p);
        return (
          <Link
            key={t.href} href={t.href}
            className={active ? "font-medium text-accent" : "text-muted hover:text-textc"}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
