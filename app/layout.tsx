import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import CapitalInput from "@/components/CapitalInput";

const SITE_URL = "https://s2-trading-web.vercel.app";
const DESC =
  "검증된 매매 룰은 갖춘 직장인 투자자를 위해 — 장중 시세 감시는 시스템이 대신합니다. 15:10 동시호가 직전엔 오늘 살 종목과 지지선 지정가를, 15:45 마감 직후엔 체결 결과와 내일 세팅할 감시주문을 정확히 전달합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "마감지기",
  description: DESC,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "마감지기",
    title: "마감지기",
    description: DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "마감지기",
    description: DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="sticky top-0 z-10 border-b border-[var(--color-borderc)] bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
            <a href="/" className="font-bold tracking-tight">
              <span className="text-accent">마감</span>지기
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
