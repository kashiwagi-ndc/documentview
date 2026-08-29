#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
記録棚卸し_検出.py — docs/ 等を走査し、「棚卸ししたほうがよい記録md」を機械で拾う。

出す一覧：
  ① 大きいファイル（行数/サイズ上位）      … 読み込みが重い＝分割/アーカイブ候補
  ② 古いファイル（最終更新が古い）          … 陳腐化/終了の可能性
  ③ 重複見出しが多いファイル                … 追記型で伸びている兆候（同じ見出しの繰り返し）
  ④ 先頭サマリが無いファイル                … 「先頭に要点」を置くと読みが軽くなる候補

使い方:
  python -X utf8 記録棚卸し_検出.py docs                 # docs 配下の *.md を診断
  python -X utf8 記録棚卸し_検出.py docs --days 90 --top 15 --out 棚卸し診断.md
  # 除外したいフォルダ: --exclude _archive,node_modules

※ 読み取り専用（ファイルは変更しない）。結果を見て、記録棚卸しチェックリスト.md に沿って手で棚卸しする。
"""
import argparse, os, re, sys, time

HEADING = re.compile(r'^(#{1,6})\s+(.*\S)\s*$')

def read_lines(path):
    for enc in ("utf-8-sig", "cp932", "utf-16", "latin-1"):
        try:
            with open(path, encoding=enc) as f:
                return f.read().splitlines()
        except Exception:
            continue
    return []

def analyze(path):
    lines = read_lines(path)
    n = len(lines)
    size = os.path.getsize(path)
    mtime = os.path.getmtime(path)
    age_days = int((time.time() - mtime) / 86400)
    # 見出しの重複（同じ見出し文字列が何回出るか）
    heads = {}
    for ln in lines:
        m = HEADING.match(ln)
        if m:
            heads[m.group(2)] = heads.get(m.group(2), 0) + 1
    dup = sum(c for c in heads.values() if c >= 3)  # 3回以上出る見出しの延べ数
    dup_top = sorted([(c, h) for h, c in heads.items() if c >= 3], reverse=True)[:3]
    # 先頭サマリの有無（先頭20行に「サマリ/要点/概要/現在地」等があるか、簡易判定）
    head_txt = "\n".join(lines[:20])
    has_summary = bool(re.search(r'サマリ|要点|概要|現在地|Summary|TL;DR', head_txt))
    return {"path": path, "lines": n, "size": size, "age_days": age_days,
            "dup": dup, "dup_top": dup_top, "has_summary": has_summary}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", help="走査するフォルダ（例 docs）")
    ap.add_argument("--days", type=int, default=90, help="この日数より古いと『古い』とする")
    ap.add_argument("--top", type=int, default=10, help="各ランキングの表示件数")
    ap.add_argument("--exclude", default="_archive", help="除外フォルダ（カンマ区切り）")
    ap.add_argument("--out", default=None, help="診断結果mdの出力先（省略時は標準出力）")
    a = ap.parse_args()

    if not os.path.isdir(a.dir):
        sys.exit(f"フォルダが見つかりません: {a.dir}")
    excl = set(x.strip() for x in a.exclude.split(",") if x.strip())

    rows = []
    for dp, dirs, files in os.walk(a.dir):
        dirs[:] = [d for d in dirs if d not in excl]
        for f in files:
            if f.lower().endswith(".md"):
                rows.append(analyze(os.path.join(dp, f)))
    if not rows:
        sys.exit("対象の .md が見つかりませんでした。")

    big  = sorted(rows, key=lambda r: -r["lines"])[:a.top]
    old  = [r for r in sorted(rows, key=lambda r: -r["age_days"]) if r["age_days"] >= a.days][:a.top]
    dupy = [r for r in sorted(rows, key=lambda r: -r["dup"]) if r["dup"] > 0][:a.top]
    nosum = [r for r in rows if not r["has_summary"] and r["lines"] >= 60]

    L = [f"# 記録 棚卸し診断: {os.path.abspath(a.dir)}", "",
         f"- 対象 .md: {len(rows)}件 ／ 古い判定: {a.days}日 ／ 生成: 手動確認用（ファイルは未変更）", "",
         "## ① 大きいファイル（行数上位＝読み込みが重い）", "| 行数 | サイズKB | ファイル |", "|---|---|---|"]
    for r in big:
        L.append(f"| {r['lines']} | {r['size']//1024} | {_rel(r['path'],a.dir)} |")
    L += ["", f"## ② 古いファイル（最終更新 {a.days}日超）", "| 経過日 | 行数 | ファイル |", "|---|---|---|"]
    for r in old: L.append(f"| {r['age_days']} | {r['lines']} | {_rel(r['path'],a.dir)} |")
    if not old: L.append("| - | - | （なし） |")
    L += ["", "## ③ 重複見出しが多い（追記型で伸びている兆候）", "| 重複延べ | 例（回数×見出し） | ファイル |", "|---|---|---|"]
    for r in dupy:
        ex = " / ".join(f"{c}×{h[:20]}" for c,h in r["dup_top"])
        L.append(f"| {r['dup']} | {ex} | {_rel(r['path'],a.dir)} |")
    if not dupy: L.append("| - | - | （なし） |")
    L += ["", "## ④ 先頭サマリが無い（要点を先頭に置くと軽くなる候補・60行以上）"]
    for r in nosum[:a.top]:
        L.append(f"- {_rel(r['path'],a.dir)}（{r['lines']}行）")
    if not nosum: L.append("- （なし）")
    L += ["", "> 次の一手：`docs/templates/記録棚卸しチェックリスト.md` に沿って、重複統合・陳腐化削除・先頭サマリ更新・古い詳細を `_archive/` へ。"]

    text = "\n".join(L)
    if a.out:
        with open(a.out, "w", encoding="utf-8") as f: f.write(text)
        print(f"診断を出力: {a.out}")
    else:
        print(text)

def _rel(path, base):
    try: return os.path.relpath(path, base).replace(os.sep, "/")
    except Exception: return path

if __name__ == "__main__":
    main()
