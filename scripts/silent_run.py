#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""quantBacktest 의 input() 사용 스크립트(13_, 14_)를 비대화식으로 실행.

PowerShell 5.1 의 stdin pipe 가 UTF-16 BOM 을 prepend 해 Python input() 이
\\ufeff 를 받아 datetime.strptime 등에서 깨지는 문제를 회피한다.

방식: builtins.input 을 빈 문자열 반환으로 monkey-patch 후, 대상 스크립트를
파일로 import 하고 main() 을 직접 호출. stdin pipe 를 전혀 사용하지 않는다.

사용:
  python silent_run.py C:/quantBacktest/14_RS_KR_pykrx.py
  python silent_run.py C:/quantBacktest/13_RS_US_screen.py
"""
import sys
import os
import builtins
import importlib.util
import traceback


def fake_input(prompt=""):
    if prompt:
        print(f"{prompt}(auto: enter)", flush=True)
    return ""


builtins.input = fake_input


def run(path):
    name = "silent_" + os.path.basename(path).replace(".", "_")
    print(f"\n>>> silent run: {path}", flush=True)
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    try:
        spec.loader.exec_module(mod)
        if hasattr(mod, "main"):
            mod.main()
    except SystemExit as e:
        code = e.code if e.code is not None else 0
        print(f"<<< {path} sys.exit({code})", flush=True)
    except Exception:
        traceback.print_exc()
        print(f"<<< {path} FAILED", flush=True)


def main():
    if len(sys.argv) < 2:
        print("usage: silent_run.py <script1.py> [<script2.py> ...]", file=sys.stderr)
        sys.exit(2)
    for p in sys.argv[1:]:
        run(p)
    print("\nsilent_run.py DONE")


if __name__ == "__main__":
    main()
