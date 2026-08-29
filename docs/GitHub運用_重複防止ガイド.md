# GitHubで「同じものを二人が作る」を防ぐ運用ガイド（複数人開発）

> 複数人でアジャイル開発するとき、**誰が何をやっているか見えない**と、同じドキュメント・モジュール・テストを別の人が重ねて作ってしまいます。
> このガイドは、それを **GitHubの公式の仕組み＋アジャイルの協調**で防ぐ方法を、やさしい言葉でまとめたものです。出典は末尾。
> 根拠ラベル：`[引用]`（公式の記載）／`[知識]`（一般的な慣習）／`[推測(%)]`／`[不明]`。
>
> **⚠️ GitHubは"一例"です（前提ではありません）。** 重複防止の<b>考え方</b>（担当を1人に・着手を早く見せる・デイリーで宣言）はツールに依存しません。
> GitHub以外（GitLab・Backlog・Jira・Notion 等）や、VCS／PMツールが無い場合は、**§8「GitHub以外の場合の読み替え」**を参照してください。本キットのコア（進行役・8工程・テンプレ・スプリントボードCSV）は**GitHubが無くても動きます**。

---

## 0. 結論（これだけで9割防げる最小セット）

1. **作業の前に必ず Issue を作り、自分を担当（Assignee）に付ける**（＝着手宣言）`[引用]`
2. **1作業＝1ブランチ**。ブランチ名は短く説明的に（例 `add-login-validation`）`[引用]`
3. **着手したらすぐ Draft PR（下書きプルリク）を作り、Issue に紐づける**（`Closes #123`）＝「やってます」が全員に見える `[引用]`
4. **ボード（GitHub Projects）で「やること／作業中／完了」を全員が見る** `[引用]`
5. **毎日の短い進捗共有（デイリー）で「今日触る所」を宣言** `[引用]`

> ポイントは**「見える化」＋「所有権（だれの担当か）」**。これが揃うと重複は構造的に起きにくくなります。

---

## 1. なぜ重複が起きるのか

スクラムでは、チームは「**誰が・何を・いつ・どうやるかを自分たちで決める（自己組織化）**」`[引用:Scrum Guide]`。
これがうまく回る前提は、「**今だれが何に着手済みか**」が常に見えていること（スプリントバックログの透明性）`[引用:Scrum Guide]`。
逆に言えば、**見えないと二人が同じものを取る**。だから「見える化」を仕組みで強制します。

---

## 2. GitHubの仕組みで防ぐ（7つの柱）

### 柱1：Issue ＋ 担当（Assignee）で着手を宣言する `[引用]`
- 作業のたびに **Issue を1つ**作り、自分を Assignee にする。
- 「担当が空（Assigned to nobody）」で**まだ誰もやっていない作業**を一覧できる。
- → 「これは私がやる」が宣言され、被りを防ぐ。
- 出典: [Creating an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue) ／ [Filtering issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests)

### 柱2：1作業＝1ブランチ、名前で見える化（GitHub Flow）`[引用]`
- 関連しない変更ごとに**別ブランチ**を作る。短く説明的な名前にすると「進行中の作業が一目で分かる」。
- 例（公式）：`increase-test-timeout`、`add-code-of-conduct`。慣習として `feat/login-form`、`fix/123-null` 等の接頭辞も可 `[知識]`。
- マージしたらブランチを削除（古いブランチの誤用を防ぐ）。
- 出典: [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)

### 柱3：Draft PR（下書きプルリク）を早く作り、Issueに紐づける `[引用]`
- 完成を待たず、**着手直後に Draft PR を作る**＝「今これに取り組んでいる」が全員に見える。
- PR説明に **`Closes #123`** と書くと PR↔Issue が紐づき、「誰かがそのIssueに取り組んでいることが見える」。マージ時にIssueも自動で閉じる。
- キーワード（公式）：`close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved`。
- 注意：**自動で閉じるのは、PRの宛先が main（default）ブランチのときだけ** `[引用]`。
- 出典: [Linking a PR to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) ／ [Using keywords](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests)

### 柱4：ボード（GitHub Projects）でWIPを可視化 `[引用]`
- Issue/PRをボードに載せ、**やること／作業中／完了**を全員で共有。
- 本キットの**スプリントボード（③）とそのまま対応**（タスク＝Issue／状態＝ボードの列）。
- 出典: [Planning and tracking with Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

### 柱5：ブランチ保護でmain直pushを禁止・レビュー必須 `[引用]`
- main へは**必ずPR経由**（「Require a pull request before merging」）。直接pushを実質禁止。
- **承認1件以上**＋**必須チェック（CI）通過**をマージ条件にする。
- → 未レビュー・壊れたコードがmainに入らず、衝突を早く見つけられる。
- 出典: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

### 柱6：GitHub Actions（CI）で自動テスト/lint `[引用]`
- PRごとに**自動でテスト・文法チェック**を走らせ、結果をPRに表示。
- 柱5の「必須チェック」に指定すると、**通らなければマージできない品質ゲート**になる（本キット⑥の検証ゲート）。
- 出典: [Continuous integration](https://docs.github.com/en/actions/get-started/continuous-integration)

### 柱7：CODEOWNERS でモジュールの担当境界を決める `[引用]`
- `src/auth/` は誰、`tests/` は誰…と**ディレクトリの所有者**を宣言。
- そこを変えるPRには**所有者が自動でレビュアーに指名**される。
- → 「この領域は誰の担当か」が明確になり、無断の重複改変を防ぐ。規模が大きくなったら導入。
- 出典: [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

## 3. アジャイルの協調で防ぐ（会議・進め方）

- **デイリー（毎日の短い進捗共有）で宣言する** `[引用:Scrum Guide]`：
  1. 今日着手する**タスク（Issue番号）** 2. 今日触る**ファイル/モジュール** 3. 1日以上open のブランチが無いか
- **同じ場所を複数人が触りそうなら、ペア／モブで一緒に作る**（そもそも衝突させない）`[引用:Fowler]`。
- **WIP（同時に進める数）を絞る**：着手より**完了を優先**。空いたら次を取る「プル型」`[引用:DORA]`。
- **小さく・短命ブランチ・毎日マージ**（トランクベース開発）：統合を遅らせると衝突が大きくなる。**1日1回はマージ**を目安に `[引用:DORA]`。

---

## 4. ドキュメント・テストの重複を防ぐ（具体）

- **作る前に検索**：docs/ や既存Issueを検索して「もう誰か作っていないか」を確認してから着手。
- **ドキュメントの索引（index）を1つ持つ**：docs/ の先頭に一覧を置き、新規作成時はそこにIssueを立てる `[知識]`。
- **テストの担当を分ける**：③のスプリントボードでテストタスクも**担当を1人（またはAI）に固定**。`tests/` を CODEOWNERS に入れて二重作成を防ぐ。
- **AI担当タスクも Issue 化**：種別=AI のタスクもIssue＋Draft PRにすると、人と同じボードで見えて重複しない。

---

## 5. 本キットとの接続

| 本キット | GitHub側 |
|---|---|
| ②の担当・メンバー一覧 | Issue の Assignee／CODEOWNERS |
| ③スプリントボードのタスク | Issue＋Projectsボードのカード |
| ③タスクの状態（未着手/進行中/…） | ボードの列（Status） |
| ④実装 | 1タスク1ブランチ＋Draft PR（`Closes #`） |
| ⑤テスト | テストもIssue化・担当固定・tests/はCODEOWNERS |
| ⑥レビュー・検証ゲート | ブランチ保護（PR必須・承認・必須チェック）＋Actions(CI) |

> ③のスプリントボードCSVの「種別=AI」タスクは、Issue化して④で並列実行 → 各タスクがDraft PRで見える、という流れにすると人もAIも被りません。

---

## 6. 導入チェックリスト

**最初に1回だけ**
- [ ] main を保護（PR必須＋承認1件以上＋必須チェック）
- [ ] CI（Actions）でテスト/lintを用意し、必須チェックに指定
- [ ] （規模が出たら）CODEOWNERS で領域の担当を宣言
- [ ] ドキュメント索引（docs/ の一覧）を作る

**毎タスク**
- [ ] Issueを作り、自分をAssigneeに
- [ ] 1作業1ブランチ（短く説明的な名前）
- [ ] 着手直後にDraft PR＋`Closes #番号`
- [ ] ボードで状態を更新

**毎日**
- [ ] デイリーで「今日のタスク・触る所・openブランチ」を宣言
- [ ] 1日1回はマージ（小さく・こまめに）

---

## 7. 出典（一次・公式）

GitHub Docs（docs.github.com）
- Creating an issue ／ Filtering issues ／ GitHub flow ／ Linking a PR to an issue ／ Using keywords ／ Planning and tracking with Projects ／ About protected branches ／ Continuous integration ／ About code owners（各URLは本文中に記載）`[引用]`

アジャイル・DevOps
- The 2020 Scrum Guide（自己組織化・デイリーの目的・バックログの透明性） — https://scrumguides.org/scrum-guide.html `[引用]`
- DORA：Trunk-based development／Working in small batches／WIP limits／Work visibility — https://dora.dev/capabilities/ `[引用]`
- Martin Fowler「On Pair Programming」（集団的コードオーナーシップ・衝突回避） — https://martinfowler.com/articles/on-pair-programming.html `[引用]`

### 注記
- ブランチ接頭辞（`feat/`等）・ラベル設計・CODEOWNERSの行例は一般的慣習 `[知識]`。正確な書式は各公式ページを参照。
- 「PRは小さく」という独立した公式一文は今回未確認だが、「変更ごとに別ブランチ／レビューしやすさ」の公式記述が実質同義 `[引用/一部不明]`。

---

## 8. GitHub以外の場合の読み替え（GitLab・Backlog・VCSなし 等）

**GitHubは一例**です。大事なのは右の「考え方」。これはどのツールでも、ツールが無くても同じです。

| GitHubの機能 | 考え方（ツール非依存・ここが本質） | 他ツール／無い場合の相当 |
|---|---|---|
| Issue＋担当(Assignee) | **タスクに担当を1人付けて着手を宣言** | GitLab/Jira/Backlog/Linearの課題＋担当、Trello/Notionのカード＋担当、無ければ**スプリントボードCSVの担当欄** |
| Draft PR（早く見せる） | **着手を早く全員に見せる** | 各ツールの「作業中」ステータス、チャットで「○○に着手します」宣言 |
| Projectsボード | **やること/作業中/完了の可視化** | 各PMツールのボード、ホワイトボード、**スプリントボードCSV** |
| ブランチ保護＋CI | **マージ前にレビュー＋自動テストを必須化** | GitLabのMR承認ルール、各CIサービス、無ければ「**マージ前に必ず誰かがレビューし、テストが緑**」という運用ルール |
| CODEOWNERS | **モジュールの担当境界を決める** | 各ツールのコンポーネント担当、または**立上げメモのメンバー一覧＋「この領域は誰」表** |
| 1作業1ブランチ | **小さく短命な単位＋こまめに統合** | どのVCSでも同じ。VCS無しでも「小さく区切って早く共有」 |
| デイリーで宣言 | **毎日「今日の担当・触る所」を共有** | ツール不問（会議／チャットでOK） |

> つまり、**ツールが無くても重複は防げます**：①スプリントボードで担当を1人に固定 → ②デイリーで「今日触る所」を宣言 → ③同じ場所はペアで。GitHub等はこれを"自動で見える化"してくれる便利装置、という位置づけです。
> どのツールを使うかは `/agile-coach` のツール連携の確認で決められます（未定でもコアは今すぐ始められます）。
