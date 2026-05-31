import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import CapitalInput from "@/components/CapitalInput";

export const metadata: Metadata = {
  title: "S2 트레이딩 따라하기",
  description: "S2 매매 시스템 규칙대로 매매하려는 사람을 돕는 정보 서비스. 투자자문 아님.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="sticky top-0 z-10 border-b border-[var(--color-borderc)] bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
            <a href="/" className="font-bold tracking-tight">
              S2 <span className="text-accent">따라하기</span>
            </a>
            <TopNav />
            <CapitalInput />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-4 lg:py-6">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted">
          ⚠ 본 서비스는 투자 정보·교육 목적이며 투자 권유·자문이 아닙니다. 모든 수치는 기준 모델
          포트폴리오의 시뮬레이션 결과이고, 과거 성과는 미래를 보장하지 않습니다. 실제 매매·손익
          책임은 이용자 본인에게 있습니다.
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
