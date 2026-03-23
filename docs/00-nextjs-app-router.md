# Next.js App Router とは

## Next.js とは

**Next.js は React をベースにしたフルスタックフレームワーク**です。
React だけだと「UI を作るライブラリ」ですが、Next.js を使うことで以下がすぐに使えます：

- **ルーティング**（URLとページの対応付け）
- **APIサーバー**（Route Handlers）
- **サーバーサイドレンダリング**（画面をサーバーで生成してブラウザに返す）

---

## App Router とは

Next.js には歴史的に 2 種類のルーティング方式があります：

| 方式 | フォルダ | 状態 |
|---|---|---|
| **Pages Router** | `pages/` | 旧方式（現在も動く） |
| **App Router** | `app/` | 新方式（現在の推奨） |

このアプリは **App Router**（`src/app/` フォルダ）を使っています。

---

## ファイルシステムベースのルーティング

App Router では **フォルダ構成が URL になります**。特別なファイルを置くだけでページや API が生えます。

```
src/app/
├── page.tsx          →  /          （トップページ）
├── cats/
│   ├── page.tsx      →  /cats      （猫一覧）
│   └── [id]/
│       └── page.tsx  →  /cats/123  （猫詳細。[id]は動的）
└── api/
    └── cats/
        └── route.ts  →  /api/cats  （APIエンドポイント）
```

### 特別なファイル名

| ファイル名 | 役割 |
|---|---|
| `page.tsx` | そのURLで表示される画面 |
| `layout.tsx` | 複数ページをまたぐ共通レイアウト（ヘッダーなど） |
| `route.ts` | API エンドポイント（GET/POST など） |
| `loading.tsx` | データ取得中に表示するローディング画面 |
| `not-found.tsx` | 404ページ |

---

## サーバーコンポーネントとクライアントコンポーネント

App Router の大きな特徴が、**コンポーネントをサーバーで動かすかブラウザで動かすか選べる**点です。

### サーバーコンポーネント（デフォルト）

何も書かなければサーバーコンポーネントになります。

```typescript
// src/app/cats/page.tsx
import { sql } from '@/lib/db'

export default async function CatsPage() {
  // DBアクセスをここで直接できる（サーバー上で実行されるから）
  const cats = await sql`SELECT * FROM cats`

  return <ul>{cats.map(cat => <li key={cat.id}>{cat.name}</li>)}</ul>
}
```

**使いどころ：**
- DB やAPIからデータを取得する
- APIキーなど秘密情報を扱う
- インタラクション（クリックなど）が不要なページ

### クライアントコンポーネント

ファイルの先頭に `'use client'` を書くとブラウザで動くコンポーネントになります。

```typescript
// src/app/components/LikeButton.tsx
'use client'

import { useState } from 'react'

export default function LikeButton() {
  const [count, setCount] = useState(0)  // useState はクライアントのみ使える

  return (
    <button onClick={() => setCount(count + 1)}>
      いいね {count}
    </button>
  )
}
```

**使いどころ：**
- `onClick` などのイベントハンドラが必要なとき
- `useState` / `useEffect` などの React フックを使うとき
- `localStorage` などブラウザ専用APIを使うとき

### 使い分けの判断フロー

```
DBアクセスや秘密情報が必要？
  → Yes: サーバーコンポーネント（デフォルト）
  → No: クリックや入力などのインタラクションが必要？
          → Yes: クライアントコンポーネント（'use client'）
          → No: サーバーコンポーネント（デフォルト）
```

---

## データの流れ（全体像）

```
ブラウザ
  ↓ URLにアクセス
Next.js サーバー
  ↓ page.tsx を実行（サーバーコンポーネント）
  ↓ DBから直接データ取得 or /api/* を呼ぶ
Supabase（PostgreSQL）
  ↓ データを返す
Next.js サーバー
  ↓ HTML を生成してブラウザに送る
ブラウザ
  ↓ 画面を表示
```

---

## まとめ

| 概念 | 一言で言うと |
|---|---|
| Next.js | React + サーバー機能 のフレームワーク |
| App Router | `app/` フォルダ = URL のルーティング方式 |
| `page.tsx` | そのURLの画面コンポーネント |
| `route.ts` | APIエンドポイント |
| サーバーコンポーネント | サーバーで動く（DBアクセスOK） |
| クライアントコンポーネント | ブラウザで動く（インタラクションOK） |
