// JP RS96+ 종목 테마/섹터 분류 — AI 인프라 공급망 위주.
// 사용자 제공 데이터 기반. 추후 갱신 시 이 파일만 수정하면 됨.

export type JpThemeEntry = {
  ticker: string;   // yahoo format (4자리코드.T)
  big: string;      // 큰 카테고리
  small?: string;   // 세부
  name: string;     // 한글/영문 회사명 (표시용)
};

export const JP_AI_INFRA_THEMES: JpThemeEntry[] = [
  // ── 반도체 소재 ─────────────────────────────────────────
  { ticker: "3436.T", big: "반도체 소재", small: "실리콘 웨이퍼", name: "SUMCO" },
  { ticker: "3445.T", big: "반도체 소재", small: "실리콘 웨이퍼", name: "RS Technologies" },

  { ticker: "4186.T", big: "반도체 소재", small: "포토레지스트/CMP", name: "도쿄오카공업" },
  { ticker: "5384.T", big: "반도체 소재", small: "포토레지스트/CMP", name: "Fujimi" },
  { ticker: "4368.T", big: "반도체 소재", small: "포토레지스트/CMP", name: "Fuso Chemical" },

  { ticker: "4004.T", big: "반도체 소재", small: "전자재료/화학", name: "Resonac HD" },
  { ticker: "4182.T", big: "반도체 소재", small: "전자재료/화학", name: "미쓰비시가스화학" },
  { ticker: "4047.T", big: "반도체 소재", small: "전자재료/화학", name: "간토전화공업" },
  { ticker: "5016.T", big: "반도체 소재", small: "전자재료/화학", name: "JX Advanced Metals" },
  { ticker: "5706.T", big: "반도체 소재", small: "전자재료/화학", name: "미쓰이금속" },
  { ticker: "6890.T", big: "반도체 소재", small: "전자재료/화학", name: "펠로우테크" },
  { ticker: "4980.T", big: "반도체 소재", small: "전자재료/화학", name: "Dexerials" },
  { ticker: "4971.T", big: "반도체 소재", small: "전자재료/화학", name: "MEC" },
  { ticker: "5301.T", big: "반도체 소재", small: "전자재료/화학", name: "도카이카본" },
  { ticker: "5310.T", big: "반도체 소재", small: "전자재료/화학", name: "Toyo Tanso" },

  { ticker: "4062.T", big: "반도체 소재", small: "기판(ABF/패키지)", name: "이비덴" },
  { ticker: "6787.T", big: "반도체 소재", small: "기판(ABF/패키지)", name: "메이코" },
  { ticker: "6524.T", big: "반도체 소재", small: "기판(ABF/패키지)", name: "후베이공업" },

  // ── 반도체 소자 ─────────────────────────────────────────
  { ticker: "6723.T", big: "반도체 소자", name: "르네사스" },
  { ticker: "6963.T", big: "반도체 소자", name: "로옴" },
  { ticker: "6875.T", big: "반도체 소자", name: "메가칩" },

  // ── 수동부품/MLCC ──────────────────────────────────────
  { ticker: "6981.T", big: "수동부품/MLCC", name: "무라타" },
  { ticker: "6762.T", big: "수동부품/MLCC", name: "TDK" },
  { ticker: "6971.T", big: "수동부품/MLCC", name: "교세라" },
  { ticker: "6976.T", big: "수동부품/MLCC", name: "태양유전" },
  { ticker: "6996.T", big: "수동부품/MLCC", small: "콘덴서", name: "니치콘" },

  // ── 전선/광케이블 (AI 데이터센터 광통신 수혜) ──────────
  { ticker: "5801.T", big: "전선/광케이블", name: "후루카와전기" },
  { ticker: "5802.T", big: "전선/광케이블", name: "스미토모전기" },
  { ticker: "5803.T", big: "전선/광케이블", name: "후지쿠라" },

  // ── FA/로봇/모터 ──────────────────────────────────────
  { ticker: "6506.T", big: "FA/로봇/모터", name: "야스카와전기" },
  { ticker: "6324.T", big: "FA/로봇/모터", name: "하모닉 드라이브" },
  { ticker: "6481.T", big: "FA/로봇/모터", name: "THK" },
  { ticker: "6516.T", big: "FA/로봇/모터", name: "산요전기" },
  { ticker: "6134.T", big: "FA/로봇/모터", name: "FUJI" },
  { ticker: "6407.T", big: "FA/로봇/모터", name: "CKD" },
  { ticker: "6479.T", big: "FA/로봇/모터", name: "미네베아미츠미" },

  // ── 계측/시험 장비 ────────────────────────────────────
  { ticker: "6754.T", big: "계측/시험 장비", name: "안리쓰" },
  { ticker: "6856.T", big: "계측/시험 장비", name: "호리바" },
  { ticker: "6866.T", big: "계측/시험 장비", name: "닛치전기" },
  { ticker: "6914.T", big: "계측/시험 장비", name: "Optex" },

  // ── 정밀/공작기계 ────────────────────────────────────
  { ticker: "6101.T", big: "정밀/공작기계", name: "츠가미" },
  { ticker: "6278.T", big: "정밀/공작기계", name: "유니온툴" },
  { ticker: "6834.T", big: "정밀/공작기계", name: "정공기연" },
  { ticker: "7220.T", big: "정밀/공작기계", name: "무사시정밀" },

  // ── 배터리/전원 ──────────────────────────────────────
  { ticker: "6674.T", big: "배터리/전원", name: "GS유아사" },

  // ── 종합 전자/전기 ───────────────────────────────────
  { ticker: "6752.T", big: "종합 전자/전기", name: "파나소닉 HD" },
  { ticker: "6925.T", big: "종합 전자/전기", name: "우시오전기" },
  { ticker: "6703.T", big: "종합 전자/전기", name: "오키전기" },
  { ticker: "3105.T", big: "종합 전자/전기", name: "닛신보 HD" },

  // ── 비반도체 (참고 — 동반 상승) ─────────────────────────
  { ticker: "8392.T", big: "비반도체 — 은행", name: "오이타은행" },
  { ticker: "8368.T", big: "비반도체 — 은행", name: "백오은행" },
  { ticker: "8361.T", big: "비반도체 — 은행", name: "오가키공립" },
  { ticker: "8393.T", big: "비반도체 — 은행", name: "미야자키은행" },
  { ticker: "7389.T", big: "비반도체 — 은행", name: "아이치FG" },

  { ticker: "9984.T", big: "비반도체 — 기타", name: "소프트뱅크그룹" },
  { ticker: "9412.T", big: "비반도체 — 기타", name: "스카퍼JSAT" },
  { ticker: "7762.T", big: "비반도체 — 기타", name: "시티즌시계" },
  { ticker: "8050.T", big: "비반도체 — 기타", name: "세이코그룹" },
  { ticker: "5332.T", big: "비반도체 — 기타", name: "TOTO" },
  { ticker: "3905.T", big: "비반도체 — 기타", name: "데이터섹션" },
  { ticker: "7685.T", big: "비반도체 — 기타", name: "BuySell" },
];

// 큰 카테고리 표시 순서 (사용자 정의 우선순위)
export const JP_CATEGORY_ORDER = [
  "반도체 소재",
  "반도체 소자",
  "수동부품/MLCC",
  "전선/광케이블",
  "FA/로봇/모터",
  "계측/시험 장비",
  "정밀/공작기계",
  "배터리/전원",
  "종합 전자/전기",
  "비반도체 — 은행",
  "비반도체 — 기타",
];

const _byTicker = new Map<string, JpThemeEntry>();
JP_AI_INFRA_THEMES.forEach((e) => _byTicker.set(e.ticker, e));

export function jpTheme(ticker: string): JpThemeEntry | undefined {
  return _byTicker.get(ticker);
}
