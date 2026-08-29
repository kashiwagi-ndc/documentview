# Redmine 連携（REST API 運用の普遍ルール）

> 課題管理が **Redmine（Backlog/Jira等も近い）** のときに読む。`tool-integration.md` の登録手順を Redmine 向けに具体化したもの。
> **環境固有値（URL・各種ID・APIキーの所在・スプリント=どのバージョンか・規模→工数の換算）はプロジェクト側で `docs/agile-state.md` に記録**し、ここ（汎用キット）には書かない。
> AI（Claude Code）が直接 REST API を叩く前提（専用CLIは無くてよい）。

## 1. 安全第一（最優先）
- **APIキーは画面・ログ・コミットに出さない**。環境変数 or gitignore済みファイルに置く。
- **キー抽出は「ラベル一致 grep → 変数取り込み」**で行い、`cat`/`Read`/`sed`マスクで本文表示しない（マスクは漏れる）。
  ```bash
  # 例：APIキーを変数に取り込み、出力に値を出さない
  KEY=$(grep -iE '^API:' "$KEYFILE" | sed -E 's/^API:[[:space:]]*//I' | tr -d '[:space:]')
  curl -sS -H "X-Redmine-API-Key: $KEY" "$BASE/issues/123.json"   # 出力にKEYを含めない
  ```
- **書き込み（作成/更新/削除）は内容を一覧提示して承認を得てから**。起票前に subject 重複チェック（重複作成しない）。
- 画面に露出したキーは**ローテーション（再発行）**。

## 2. REST API 基本操作
| 操作 | メソッド / エンドポイント |
|---|---|
| 取得 | `GET /issues/{id}.json`（`?include=relations,children,journals`） |
| 一覧/検索 | `GET /issues.json?project_id=X&status_id=*&limit=100` |
| 作成 | `POST /issues.json` `{"issue":{...}}` |
| 更新 | `PUT /issues/{id}.json` `{"issue":{...}}`（204応答） |
| バージョン作成 | `POST /projects/{id}/versions.json` `{"version":{"name":"SprintN"}}` |
| 実績工数 | `POST /time_entries.json` `{"time_entry":{"issue_id","hours","activity_id","spent_on","comments"}}` |
| メタ情報（ID取得） | `GET /issue_statuses.json`・`/trackers.json`・`/enumerations/time_entry_activities.json`・`/projects/{id}/versions.json`・`/custom_fields.json` |

> 日本語を含む起票/更新は JSON を `ensure_ascii=False` で組み立て、`--data @file` か python urllib で送る。
> **ID（ステータス/トラッカー/作業分類/カスタムフィールド/バージョン/担当）は環境ごとに異なる**。新環境では上のメタ情報APIで取得し直し、`docs/agile-state.md` に控える。

## 3. チケット記載ルール（予実管理のため必須）
**起票時（②バックログ／③計画。＝計画を立てたら必ず）**：
- **説明**：目的・対象・受入条件・関連（仕様メモ等）を具体的に。
- **受入条件**：専用カスタムフィールド（無ければ説明内）。
- **規模**：相対サイズ（大/中/小）。
- **予定日程**：`start_date` / `due_date`。
- **★予定工数 `estimated_hours` を必ず入れる**（後述「予定工数の必須ルール」）。
- 担当 `assigned_to_id` ・対象バージョン `fixed_version_id`（＝スプリント。スプリント以外の計画でも、ロードマップのバージョンに割り当ててよい）。

**完了時（⑧）**：
- **実績日程**：実開始/実終了（カスタムフィールド）。
- **実績工数**：`POST /time_entries`（activity_id＝開発/レビュー等）。
- **ステータス→完了**・`done_ratio=100`・完了コメント（実装内容・`refs #コミット`・ふりかえりリンク）。

## 4. ★予定工数（estimated_hours）の必須ルール
**スプリントに限らず、計画を立てて起票・更新したら、必ず `estimated_hours`（予定工数）を入れる。** 予実（予定 vs 実績）を成立させる土台で、自動報告の工数予実・コスト予実もこれが前提。
- **規模→予定工数は換算表で機械的に決める**（プロジェクトで定義し `docs/agile-state.md` に記録）。既定の目安：**大=8h／中=4h／小=2h**。
- バックログ起票（②）でも、スプリント計画（③）でも、見積りが付いた時点で `estimated_hours` を入れる（空のまま起票しない）。
- 規模が変わったら `estimated_hours` も更新。実績は別途 `time_entries` に積み、予定は触らない（予実の差分が見えるように）。
- キットの相対ポイント（小1/中3/大5＝ベロシティ用）と、Redmineの `estimated_hours`（時間）は**別軸**。ポイントは速度計測、estimated_hoursは工数予実。両方を規模から導く。

## 5. 工程節目での同期（提案→承認後に実行）
- **②立上げ**：バックログをチケット化（説明・受入条件・規模・**予定工数**・優先度）。
- **③計画**：スプリントのバージョン作成＋対象バージョン割当・予定日程・**予定工数**。
- **⑤〜⑥**：`done_ratio` 更新。
- **⑧完了**：ステータス完了・100%・実績日程/工数・完了コメント。
- 二重管理回避3原則：1情報1正本（md→Redmine）／リンクで繋ぐ（`refs #id`）／担当と着手は1箇所。

## 6. 落とし穴（実体験ベース）
- **先行（precedes）関係があると開始日を過去に戻せない**（`開始日を…より前にできません`）。完了済みの実績は `start_date` を触らず**実開始/終了のカスタムフィールド**側に入れて回避。
- 関係は両端に表示されるため、`issue_id == 自分` のものだけ見ると重複なく把握できる。
- 完了（closed）チケットでもフィールド更新は可能（ワークフロー次第）。
- 大量更新はループで各 PUT の HTTP コード（**204=成功**）を確認する。

> 関連：`tool-integration.md`（汎用の登録手順・安全）／`reporting.md`（Redmineを読み取り元にした自動報告）／`docs/templates/コスト・予算 予実.md`（estimated_hours と time_entries から予実）。
