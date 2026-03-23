# データベースのセットアップ

## Supabase とは

**Supabase はオープンソースの「Backend as a Service（BaaS）」** です。
Firebase の代替として作られており、バックエンドに必要な機能をまとめて提供してくれます。

### なぜ Supabase を使うのか？

**1. バックエンドを自分で作らなくていい**
通常は API サーバーや DB を自分で構築する必要がありますが、Supabase がそれを肩代わりしてくれます。

**2. PostgreSQL が使える**
Firebase は NoSQL ですが、Supabase は SQL が使えるので、複雑なデータ操作が得意です。

**3. 無料枠が充実している**
個人開発や勉強用途なら無料で十分使えます。

**4. Next.js との相性が良い**
公式 SDK があり、簡単に連携できます。

---

## このアプリでの使い方

**postgres.js** を使って Supabase（PostgreSQL）に生SQL で接続します。

- **Supabase**: PostgreSQL をホスティングしてくれるサービス。ダッシュボードからSQLを直接実行できる
- **postgres.js**: Node.js から PostgreSQL に生SQL で接続するライブラリ

> テーブル作成などのDDL（`CREATE TABLE` など）はSupabaseのSQL Editorで直接実行してください。

---

## 1. Supabase プロジェクトの接続情報を確認する

Supabase ダッシュボード → **Project Settings** → **Database** を開き、以下をメモします：

- **Host**: `xxx.supabase.co`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: （設定したパスワード）
- **Port**: `5432`

または **Connection string** の `URI` をそのままコピーします：
```
postgresql://postgres:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres
```

---

## 2. パッケージのインストール

```bash
npm install postgres
```

---

## 3. 環境変数を設定する

`.env.local` ファイルをプロジェクトルートに作成します（`.gitignore` で自動除外済み）。

```bash
# .env.local
DATABASE_URL=postgresql://postgres:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres
```

> **注意**: パスワードには特殊文字が含まれる場合があります。Supabaseダッシュボードの「Connection string」からそのままコピーするのが確実です。

---

## 4. DB接続ヘルパーを作成する

`src/lib/db.ts` を新規作成します。

```typescript
// src/lib/db.ts
import postgres from 'postgres'

// 環境変数から接続URLを読み込む
const connectionString = process.env.DATABASE_URL!

// 開発時にホットリロードで接続が増えないようにする
const globalForSql = globalThis as unknown as { sql: postgres.Sql }

export const sql = globalForSql.sql ?? postgres(connectionString)

if (process.env.NODE_ENV !== 'production') {
  globalForSql.sql = sql
}
```

---

## 5. SQLの書き方

postgres.js はテンプレートリテラル（`` ` `` バッククォート）で SQL を書きます。
`${}` に値を入れると自動的にエスケープされるので **SQLインジェクション対策になります**。

### データを取得する（SELECT）

```typescript
import { sql } from '@/lib/db'

// 全件取得
const cats = await sql`SELECT * FROM cats ORDER BY created_at DESC`

// 条件付き取得（1件）
const [cat] = await sql`SELECT * FROM cats WHERE id = ${id}`

// 条件付き取得（複数件）
const cats = await sql`SELECT * FROM cats WHERE breed = ${'三毛猫'}`
```

戻り値は配列です。1件のみ取得する場合は分割代入 `const [cat] = ...` を使います。

### データを作成する（INSERT）

```typescript
const [newCat] = await sql`
  INSERT INTO cats (name, breed, birth_date)
  VALUES (${name}, ${breed}, ${birthDate})
  RETURNING *
`
// RETURNING * を付けると、作成されたレコードを返してくれる
```

### データを更新する（UPDATE）

```typescript
const [updated] = await sql`
  UPDATE cats
  SET name = ${name}, breed = ${breed}
  WHERE id = ${id}
  RETURNING *
`
```

### データを削除する（DELETE）

```typescript
await sql`DELETE FROM cats WHERE id = ${id}`
```

---

## SQLの基本構文まとめ

| 操作 | SQL | 用途 |
|---|---|---|
| 取得 | `SELECT * FROM テーブル` | 全カラム取得 |
| 条件付き | `WHERE カラム = ${値}` | 絞り込み |
| 作成 | `INSERT INTO テーブル (カラム) VALUES (${値}) RETURNING *` | レコード追加 |
| 更新 | `UPDATE テーブル SET カラム = ${値} WHERE id = ${id} RETURNING *` | レコード変更 |
| 削除 | `DELETE FROM テーブル WHERE id = ${id}` | レコード削除 |
| 並び順 | `ORDER BY created_at DESC` | 降順ソート |
| 件数制限 | `LIMIT 10` | 最大10件 |

> **`${}` について**: テンプレートリテラルの `${}` に値を入れると自動でパラメータ化されます。文字列を直接埋め込まないようにしましょう。

---

## テーブル例（Supabase SQL Editor で実行）

```sql
-- 猫テーブル
CREATE TABLE cats (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  breed      TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 健康記録テーブル
CREATE TABLE health_records (
  id          SERIAL PRIMARY KEY,
  cat_id      INTEGER NOT NULL REFERENCES cats(id),
  weight      NUMERIC(4,2),
  note        TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

## チェックリスト

- [ ] Supabase ダッシュボードで接続情報を確認した
- [ ] `npm install postgres` を実行した
- [ ] `.env.local` に `DATABASE_URL` を設定した
- [ ] `src/lib/db.ts` を作成した
- [ ] Supabase SQL Editor でテーブルを作成した
