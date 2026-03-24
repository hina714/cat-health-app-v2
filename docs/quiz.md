# 理解度確認クイズ

このプロジェクトの理解度を確認するための問題集です。

---

## Q1: グローバル変数にDB接続を保持する理由

`src/lib/db.ts` では、DB接続をグローバル変数に保持しています。なぜそうしているのでしょうか？

**答え:**
開発時のホットリロード（ファイルを保存するたびにサーバーが再起動する機能）のたびに新しい接続が作られてしまうため、`globalThis` に接続を保持して使い回している。

---

## Q2: POST /api/test のエラーレスポンス

`POST /api/test` にリクエストを送るとき、`message` を含めなかった場合、どんなレスポンスが返ってきますか？HTTPステータスコードとレスポンスの内容（JSON）を答えてください。

**答え:**
- HTTPステータスコード: `400`
- レスポンス: `{ error: 'message は必須です' }`

---

## Q3: Supabaseのスキーマ変更手順

Supabaseのスキーマ変更が必要になった場合、どのように対応しますか？

**答え:**
1. `sql/` フォルダにSQLファイルを作成する（←Claudeの役割はここまで）
2. ユーザーが Supabase の SQL Editor で手動実行する

Claudeが直接SQLを実行することは禁止されている。

---

## Q4: QAレポートのファイル名形式

QAレポートを保存するとき、ファイル名はどのような形式にしますか？例も含めて答えてください。

**答え:**
- 保存先: `qa/` フォルダ
- ファイル名形式: `YYYYMMDD_NNN_report.md`
- 例: `qa/20260323_001_report.md`
- 既存ファイルを確認して連番が重複しないようにする

---

## Q5: GET /api/test のレスポンス形式

`GET /api/test` が返すレスポンスのJSONの形式を答えてください。

**答え:**
```json
{ "ok": true, "rows": [...] }
```

`ok: true` と一緒に `rows` というキーで全件を返している。

---

## Q6: POST /api/test の成功時のレスポンス

`POST /api/test` が成功したとき、レスポンスのJSONとHTTPステータスコードを答えてください。

**答え:**
- HTTPステータスコード: `201`
- レスポンス: `{ "ok": true, "row": { ... } }`

GETは複数件なので `rows`（複数形）、POSTは作成した1件だけなので `row`（単数形）になる点に注意。

---

## Q7: テーブル名とSQL

`GET /api/test` と `POST /api/test` が操作しているテーブル名と、それぞれ実行しているSQLの種類を答えてください。

**答え:**
- テーブル名: `test`
- `GET /api/test` → `SELECT * FROM test`（全件取得）
- `POST /api/test` → `INSERT INTO test (message) VALUES (...) RETURNING *`（1件追加して挿入されたレコードを返す）

`RETURNING *` はINSERT後に挿入されたデータをそのまま返すPostgreSQLの構文。

---

## Q8: 環境変数名と定義ファイル

`src/lib/db.ts` でDB接続に使っている環境変数の名前は何ですか？またそれはどのファイルに定義されていますか？

**答え:**
- 環境変数名: `DATABASE_URL`
- 定義ファイル: `.env.local`

```ts
const connectionString = process.env.DATABASE_URL!
```

---

## Q9: 不明瞭な質問への対応

ユーザーからの質問で主語や文脈が不明瞭な場合、どのように対応すべきですか？

**答え:**
そのまま回答せず指摘し、より明確な質問の例を提案する。

例：
- ユーザー：「これどうすればいい？」
- AI：「主語が不明です。例えば「`src/lib/db.ts` の接続エラーはどうすればいい？」のような形で質問していただけますか？」

---

## Q10: DBライブラリ名

`src/lib/db.ts` で使っているDBライブラリの名前は何ですか？

**答え:**
`postgres`（postgres.js）

```ts
import postgres from 'postgres'
```

---

## Q11: POST /api/test の未チェック項目

`POST /api/test` では `message` の存在チェックをしていますが、チェックしていないことが2つあります。何でしょうか？

**答え:**
1. **型チェック** — `message` が文字列（string）かどうか確認していない
2. **長さチェック** — `message` の最大文字数を制限していない

---

## Q12: 本番環境でのDB接続の扱い

`src/lib/db.ts` では、DB接続をグローバルに保存する処理に条件があります。どんな条件で、なぜその条件になっているのでしょうか？

**答え:**
```ts
if (process.env.NODE_ENV !== 'production') {
  globalForSql.sql = sql
}
```

**本番環境（production）以外のときだけ**グローバルに保存している。
理由は、本番環境ではホットリロードが発生しないため、グローバルに保存する必要がないから。

---

## Q13: SQLインジェクション対策

`src/app/api/test/route.ts` では、ユーザーから受け取った値をSQLに埋め込んでいます。SQLインジェクション（悪意ある入力でDBを不正操作される攻撃）対策はどのように行われていますか？

**答え:**
`postgres` ライブラリのタグ付きテンプレートリテラル（テンプレート文字列に関数を付ける仕組み）を使っている。

```ts
await sql`INSERT INTO test (message) VALUES (${body.message})`
```

`${}` で渡した値は `postgres` ライブラリが自動的にエスケープ（無害化）してくれるため、SQLインジェクションを防げる。

---

## Q14: `const [row] =` の意味

`POST /api/test` ではINSERTの結果をこのように受け取っています。`const [row] =` という書き方は何をしていますか？

```ts
const [row] = await sql`INSERT INTO test (message) VALUES (${body.message}) RETURNING *`
```

**答え:**
配列の分割代入（配列の要素を変数に割り当てる構文）。`RETURNING *` の結果は配列で返ってくるので、先頭の1件だけを `row` という変数に取り出している。

---

## Q15: `!` の意味とリスク

`src/lib/db.ts` の以下のコードで、`DATABASE_URL` の後ろに `!` がついています。これは何を意味しますか？またどんなリスクがありますか？

```ts
const connectionString = process.env.DATABASE_URL!
```

**答え:**
TypeScript の**非nullアサーション演算子**（「この値はnullやundefinedではないと断言する」記号）。

- **意味**: `DATABASE_URL` が必ず存在すると TypeScript に伝え、型エラーを黙らせる
- **リスク**: `.env.local` に `DATABASE_URL` を書き忘れた場合でも TypeScript はエラーを出さず、実行時にクラッシュする

---

## Q16: Response.json() の役割

`src/app/api/test/route.ts` では、レスポンスを返すのに `Response.json()` を使っています。これは何をしていますか？

**答え:**
JavaScriptのオブジェクトを JSON 文字列に変換し、`Content-Type: application/json` ヘッダーを付けた HTTPレスポンスを作ってクライアントに返す。

```ts
return Response.json({ ok: true, rows })
// → { "ok": true, "rows": [...] } という JSON をクライアントに返す
```

⚠️ リクエストを受け取る側の `request.json()` と混同しないこと。

---

## Q17: リクエストボディの受け取り方

`POST /api/test` では、送られてきたデータ（リクエストボディ）をどのように受け取っていますか？

**答え:**
```ts
const body = await request.json()
```

`await` を使っているのは、データを読み込む時間のかかる処理（**非同期処理**）だから。

---

## Q18: QAの最初の手順

QAを依頼されたとき、まず最初に確認することは何ですか？2つ答えてください。

**答え:**
1. **実装ファイルを読む**（`src/app/api/` 以下のルートファイルと `src/lib/db.ts`）
2. **`http://localhost:3000` が起動中かどうか確認する**
   - 起動中 → 各エンドポイントにリクエストを送って動作確認
   - 起動していない → コードレビューのみ実施

---

## Q19: GET と POST の用途

HTTPメソッドとして GET と POST はそれぞれどんな用途で使いますか？

**答え:**
- **GET** → データを**取得**する（サーバーの状態を変えない）
- **POST** → データを**作成・送信**する（サーバーの状態を変える）

このプロジェクトでの例：
- `GET /api/test` → `test` テーブルの全件取得
- `POST /api/test` → `test` テーブルにレコードを作成

