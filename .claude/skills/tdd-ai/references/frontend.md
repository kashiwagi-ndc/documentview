# フロントエンド・コンポーネントテストパターン

## フロントエンドテストの哲学

**核心**: コンポーネントのテストは「ユーザーが何を見て何を操作できるか」を検証する。
内部状態（stateの変数名・propsの型定義）はテストしない。

```
❌ 実装の詳細をテストしている（悪い）:
  - state.isLoading が true になった
  - handleClick が呼ばれた
  - setUser(mockUser) が実行された

✅ ユーザーの振る舞いをテストしている（良い）:
  - ボタンをクリックするとローディングスピナーが表示される
  - フォーム送信後に成功メッセージが表示される
  - エラー時にエラーテキストが表示される
```

## テストピラミッド（フロントエンド版）

```
E2E（Playwright）         ← クリティカルなユーザーフロー最大5本
統合テスト（MSW + RTL）   ← API連携を含むページ単位の振る舞い
コンポーネントテスト（RTL）← 単一コンポーネントの振る舞い
```

ビジュアルリグレッションテスト（Storybook + Chromatic）は別枠。
TDDの対象はあくまで「振る舞い」テスト。

## コンポーネントTDDのワークフロー

### BDD仕様の書き方（コンポーネントレベル）

```
Feature: ログインフォーム

  Scenario: 正しい認証情報でログインできる
    Given: ログインフォームが表示されている
    When:  メールとパスワードを入力してボタンをクリックする
    Then:  ダッシュボードページに遷移する

  Scenario: 誤ったパスワードでエラーが表示される
    Given: ログインフォームが表示されている
    When:  誤ったパスワードで送信する
    Then:  「メールアドレスまたはパスワードが正しくありません」と表示される
```

### Claude Codeへの指示例（React Testing Library）

```
以下の仕様でコンポーネントテストを書いてください。
React Testing Library を使ってください。

原則:
- getByRole / getByText / getByLabelText でクエリする（getByTestId は最終手段）
- userEvent を使ってユーザー操作を再現する
- 内部stateや関数の呼び出しはテストしない
- APIはMSWでモックする（axiosやfetchをモックしない）

仕様:
[BDD仕様をここに貼る]

テストだけ書いてください。コンポーネントの実装は書かないでください。
```

## コンポーネントテストのクエリ優先順位

```
1. getByRole        ← 最優先（アクセシビリティと一致）
   例: getByRole('button', { name: 'ログイン' })
   例: getByRole('textbox', { name: 'メールアドレス' })

2. getByLabelText   ← フォーム要素
   例: getByLabelText('パスワード')

3. getByText        ← テキストコンテンツ
   例: getByText('送信完了しました')

4. getByPlaceholderText  ← placeholderでしか識別できない場合

5. getByTestId      ← 最終手段（他の方法で取れない場合のみ）
```

## テストしないもの（フロントエンド）

```
❌ テスト不要:
  - CSSクラスが付いているか（e.g., className に 'active' があるか）
  - Propsの型・デフォルト値（TypeScriptが保証する）
  - コンポーネントが存在するか（renderしてエラーがなければOK）
  - 内部stateの変数名・初期値

✅ テストすべき:
  - ユーザーの操作に対するUI変化
  - 条件分岐によるレンダリングの違い
  - フォームバリデーションメッセージ
  - ローディング・エラー・成功の各状態表示
  - アクセシビリティ属性（aria-label・role）
```

## MSW（Mock Service Worker）によるAPIモック

APIをテスト内でモックするときはMSWを使う（axiosやfetchを直接モックしない）。

```javascript
// テストセットアップ例
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('/api/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'test-token' }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

> MSWを使うと、実際のネットワーク層を通したテストになるため、
> axiosの設定ミスやヘッダー漏れも検出できる。

## フロントエンドTDD チェックリスト

```
[ ] クエリはgetByRoleを最優先で使ったか？
[ ] userEventでユーザー操作を再現しているか？
[ ] 内部stateや関数呼び出しをアサートしていないか？
[ ] APIモックはMSWを使っているか？
[ ] ローディング・エラー・成功の3状態をテストしているか？
[ ] アクセシビリティ属性（role・label）が正しく設定されているか？
```
