import { ImageResponse } from "next/og";

// 마감지기 Open Graph 이미지 (1200×630) — Pretendard 폰트 로드, 청록 포인트
export const runtime = "edge";
export const alt = "마감지기 — 룰은 당신이, 감시는 우리가";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRETENDARD_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf";
const PRETENDARD_REGULAR =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Regular.otf";

export default async function OG() {
  const [bold, regular] = await Promise.all([
    fetch(PRETENDARD_BOLD).then((r) => r.arrayBuffer()).catch(() => null),
    fetch(PRETENDARD_REGULAR).then((r) => r.arrayBuffer()).catch(() => null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "white",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "#1098ad",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.8" />
              <path
                d="M10 5 V10 H15"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ color: "#1098ad", fontSize: 30, fontWeight: 700 }}>
            한국 주식 · S2 매매 시스템
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#212529",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            룰은 당신이,
          </div>
          <div
            style={{
              color: "#212529",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 8,
            }}
          >
            감시는 <span style={{ color: "#1098ad" }}>마감지기</span>가.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#495057",
            fontSize: 28,
          }}
        >
          <div style={{ fontWeight: 500 }}>
            15:10 동시호가 직전 · 15:45 마감 직후 — 텔레그램·웹 알림
          </div>
          <div style={{ color: "#868e96", fontSize: 22 }}>
            magamjigi.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(bold ? [{ name: "Pretendard", data: bold, weight: 800 as const, style: "normal" as const }] : []),
        ...(regular
          ? [{ name: "Pretendard", data: regular, weight: 500 as const, style: "normal" as const }]
          : []),
      ],
    },
  );
}
