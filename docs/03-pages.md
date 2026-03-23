# 画面（ページ）とCSSの追加方法

Next.js App Router では、フォルダに `page.tsx` を置くだけで画面が作れます。
スタイルは **CSS Modules**（`.module.css`）を使ってコンポーネントごとに管理します。

---

## 基本ルール

| ファイルパス | URLパス |
|---|---|
| `app/page.tsx` | `/` （トップ） |
| `app/cats/page.tsx` | `/cats` |
| `app/cats/[id]/page.tsx` | `/cats/123` |

- フォルダ名が URL になる
- `[id]` のように `[]` で囲むと動的なURL（パラメータ）になる

---

## 1. 新しいページを追加する

### 例：猫一覧ページ `/cats`

**① フォルダとファイルを作る**

```
src/app/cats/
├── page.tsx        ← 画面のコード
└── page.module.css ← このページ専用のCSS
```

**② `page.tsx` を書く**

サーバーコンポーネント（デフォルト）では DB を直接呼べます。

```typescript
// src/app/cats/page.tsx
import Link from 'next/link'
import { db } from '@/lib/db'
import styles from './page.module.css'

export default function CatsPage() {
  // DB から直接取得（サーバー側で実行される）
  const cats = db.prepare('SELECT * FROM cats ORDER BY created_at DESC').all() as {
    id: number
    name: string
    breed: string | null
  }[]

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>猫一覧</h1>
      <Link href="/cats/new" className={styles.addButton}>
        ＋ 猫を追加
      </Link>
      <ul className={styles.list}>
        {cats.map((cat) => (
          <li key={cat.id} className={styles.item}>
            <Link href={`/cats/${cat.id}`}>
              {cat.name}
              {cat.breed && <span className={styles.breed}> ({cat.breed})</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**③ `page.module.css` を書く**

```css
/* src/app/cats/page.module.css */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.addButton {
  display: inline-block;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  margin-bottom: 24px;
}

.addButton:hover {
  background-color: #357abd;
}

.list {
  list-style: none;
  padding: 0;
}

.item {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.item a {
  text-decoration: none;
  color: #333;
  font-size: 16px;
}

.item a:hover {
  color: #4a90e2;
}

.breed {
  color: #888;
  font-size: 14px;
}
```

---

## 2. 動的ページを追加する

### 例：猫詳細ページ `/cats/[id]`

```typescript
// src/app/cats/[id]/page.tsx
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import styles from './page.module.css'

export default async function CatDetailPage(props: PageProps<'/cats/[id]'>) {
  const { id } = await props.params

  const cat = db.prepare('SELECT * FROM cats WHERE id = ?').get(id) as {
    id: number
    name: string
    breed: string | null
    birth_date: string | null
  } | undefined

  // 存在しない場合は404ページを表示
  if (!cat) notFound()

  return (
    <div className={styles.container}>
      <h1 className={styles.name}>{cat.name}</h1>
      {cat.breed && <p>品種: {cat.breed}</p>}
      {cat.birth_date && <p>誕生日: {cat.birth_date}</p>}
    </div>
  )
}
```

> **`params` は Promise**: このバージョンの Next.js では `await props.params` が必要です

---

## 3. CSSの書き方

### CSS Modules（推奨）

ファイル名を `*.module.css` にすると、クラス名がそのコンポーネントだけに限定されます（他のページと名前が衝突しない）。

```css
/* page.module.css */
.title {
  font-size: 24px; /* このtitleクラスはこのファイルだけに効く */
}
```

```typescript
import styles from './page.module.css'

// styles.title というオブジェクトとして使う
<h1 className={styles.title}>見出し</h1>
```

### グローバルCSS

`src/app/globals.css` はアプリ全体に適用されます。リセットCSSや共通スタイルをここに書きます。

```css
/* src/app/globals.css */

/* ブラウザデフォルトのスタイルを統一 */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

a {
  color: inherit;
}
```

### レイアウト用CSS

`src/app/layout.tsx` に対応した CSS を書くことで、全ページ共通のヘッダー・フッターなどを管理できます。

```css
/* src/app/layout.css */
.nav {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 24px;
  display: flex;
  gap: 16px;
}
```

---

## 4. ページ間のリンク

`<Link>` コンポーネントを使います（`<a>` タグの代わり）。

```typescript
import Link from 'next/link'

// 静的なリンク
<Link href="/cats">猫一覧へ</Link>

// 動的なリンク（IDを埋め込む）
<Link href={`/cats/${cat.id}`}>{cat.name}</Link>
```

---

## 5. フォームからデータを送信する（Server Actions）

ページ内でデータを追加・更新する場合は **Server Actions** を使います。

```typescript
// src/app/cats/new/page.tsx
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import styles from './page.module.css'

export default function NewCatPage() {
  // サーバー側で実行される関数（フォーム送信時に呼ばれる）
  async function createCat(formData: FormData) {
    'use server'

    const name = formData.get('name') as string
    const breed = formData.get('breed') as string

    db.prepare('INSERT INTO cats (name, breed) VALUES (?, ?)').run(name, breed || null)

    // 作成後に一覧ページへ移動
    redirect('/cats')
  }

  return (
    <div className={styles.container}>
      <h1>猫を追加</h1>
      <form action={createCat} className={styles.form}>
        <label className={styles.label}>
          名前
          <input type="text" name="name" required className={styles.input} />
        </label>
        <label className={styles.label}>
          品種
          <input type="text" name="breed" className={styles.input} />
        </label>
        <button type="submit" className={styles.button}>追加する</button>
      </form>
    </div>
  )
}
```

---

## まとめ：画面追加の手順

1. `src/app/画面名/` フォルダを作る
2. `page.tsx` を作り、データ取得とHTMLを書く
3. `page.module.css` を作り、スタイルを書く
4. 既存ページから `<Link>` でリンクを貼る

---

## チェックリスト

- [ ] `src/app/cats/page.tsx` を作成した
- [ ] `src/app/cats/page.module.css` を作成した
- [ ] `src/app/cats/[id]/page.tsx` を作成した
- [ ] `src/app/globals.css` にリセットCSSを追加した
- [ ] `<Link>` コンポーネントでページ間リンクを設定した
