"use client";
import { useEffect, useState } from "react";

const KEY = "s2_capital";
const DEFAULT = 500_000_000;
const EVT = "s2-capital-change";

/** 사용자 자본(원)을 localStorage 에 저장하고 컴포넌트 간 동기화. */
export function useCapital(): [number, (v: number) => void] {
  const [cap, setCap] = useState<number>(DEFAULT);

  useEffect(() => {
    const read = () => {
      const v = Number(localStorage.getItem(KEY));
      setCap(v > 0 ? v : DEFAULT);
    };
    read();
    window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);

  const update = (v: number) => {
    localStorage.setItem(KEY, String(v));
    window.dispatchEvent(new Event(EVT));
    setCap(v > 0 ? v : DEFAULT);
  };
  return [cap, update];
}
