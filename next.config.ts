import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 데이터 페이지는 force-dynamic(요청 시 Supabase 읽기). ESLint 설정 도입 전까지 빌드 시 린트 스킵(타입 체크는 유지).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
