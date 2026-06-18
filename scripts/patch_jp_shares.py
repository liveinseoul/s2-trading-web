#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""JP 발행주식수 캐시 보강 — yfinance 로 누락 종목 채움.

배경:
  _bt_shares_jp.pkl 가 ~1786 ticker 만 shares 정보 보유. 그나마도 Toyota, Sony,
  Tokyo Electron 등 대형주 shares=None. 그 결과 export_rs_weekly 의 mktcap
  계산이 yahoo_mktcap (stale) fallback → 시총 부정확.

본 스크립트:
  1. _jp_weekly_cache.pkl 의 ticker 전체 (=3,668개) 중
  2. _bt_shares_jp.pkl 에 shares 없음/None 인 ticker만
  3. yfinance.Ticker(tk).info.sharesOutstanding 로 fetch
  4. _bt_shares_jp.pkl 에 저장 (백업 .bak)

사용:
  python patch_jp_shares.py              # 누락 모두 (시간 오래 걸림)
  python patch_jp_shares.py --top 300    # 시총 상위 N개만 (빠름)
  python patch_jp_shares.py --ticker 7203.T  # 한 종목

⚠ yfinance rate limit — 종목당 ~1.5초. 300개 ≈ 8분.
"""
from __future__ import annotations
import argparse
import pickle
import shutil
import sys
import time
from pathlib import Path

import yfinance as yf

CACHE_DIR = Path(r"C:\quantBacktest\screen")
SHARES_PKL = CACHE_DIR / "_bt_shares_jp.pkl"
WEEKLY_CACHE_PKL = CACHE_DIR / "_jp_weekly_cache.pkl"


def load_pkl(path):
    with open(path, "rb") as f:
        return pickle.load(f)


def save_pkl(path, obj):
    bak = path.with_suffix(path.suffix + ".bak")
    if path.exists() and not bak.exists():
        shutil.copyfile(path, bak)
        print(f"  backup: {bak.name}")
    with open(path, "wb") as f:
        pickle.dump(obj, f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=None,
                    help="weekly_cache 최신 종가 기준 상위 N (속도 우선용)")
    ap.add_argument("--ticker", default=None, help="한 종목 (예: 7203.T)")
    args = ap.parse_args()

    shares = load_pkl(SHARES_PKL)
    wc = load_pkl(WEEKLY_CACHE_PKL)
    print(f"shares cache: {len(shares)} 항목 (실제 값 있는 종목 "
          f"{sum(1 for v in shares.values() if v and v > 0):,}개)")
    print(f"weekly_cache: {len(wc)} ticker")

    # 누락 (None / 0 / 키 부재) 후보
    targets: list[str] = []
    if args.ticker:
        targets = [args.ticker]
    else:
        cands = [
            tk for tk in wc.keys()
            if not (isinstance(shares.get(tk), (int, float)) and shares.get(tk, 0) > 0)
        ]
        if args.top:
            # 최근 종가 × 1 (proxy) 로 정렬 — 큰 종목 우선
            def latest_close(tk):
                v = wc.get(tk, {})
                s = v.get("close") if isinstance(v, dict) else None
                if s is None or len(s) == 0:
                    return 0
                return float(s.iloc[-1])
            cands.sort(key=latest_close, reverse=True)
            targets = cands[: args.top]
        else:
            targets = cands
    print(f"\n대상 ticker {len(targets)}개\n")

    n_ok = 0
    n_fail = 0
    for i, tk in enumerate(targets, 1):
        try:
            info = yf.Ticker(tk).info or {}
            sh = info.get("sharesOutstanding")
            if sh and sh > 0:
                shares[tk] = float(sh)
                n_ok += 1
                if n_ok % 20 == 0 or n_ok <= 10:
                    print(f"  [{i}/{len(targets)}] {tk} shares={sh:,.0f}")
            else:
                n_fail += 1
        except Exception as e:
            n_fail += 1
            if n_fail <= 5:
                print(f"  ⚠ {tk}: {type(e).__name__} {str(e)[:80]}")
        # 매 50건마다 중간 저장 (장기 실행 보호)
        if i % 50 == 0:
            save_pkl(SHARES_PKL, shares)
            print(f"  ··· 중간 저장 ({i}/{len(targets)}) · ok {n_ok} · fail {n_fail}")
        time.sleep(0.4)  # rate limit 완화

    save_pkl(SHARES_PKL, shares)
    print(f"\n✅ 완료 · 성공 {n_ok} · 실패 {n_fail}")
    print(f"   현재 shares cache 유효 값 {sum(1 for v in shares.values() if v and v > 0):,}개")


if __name__ == "__main__":
    main()
