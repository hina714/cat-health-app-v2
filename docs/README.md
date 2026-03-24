# 開発ガイド

このドキュメントは、cat-health-app-v2 に機能を追加するための手順をまとめたものです。

## 方針

- **ORM不使用** — SQLを直接書いてDB操作を学ぶ
- **CSSフレームワーク不使用** — CSSファイルを直書きしてスタイリングを学ぶ
- **DB**: Supabase（PostgreSQL）。テーブル作成などのSQLはSupabaseダッシュボードで実行
- **Next.js App Router** のみ使用（外部ライブラリ最小限）

## 目次

| ドキュメント | 内容 |
|---|---|
| [00-nextjs-app-router.md](./00-nextjs-app-router.md) | Next.js App Router の概要 |
| [01-database.md](./01-database.md) | データベースのセットアップ（Supabase + 生SQL） |
| [02-api.md](./02-api.md) | APIルートの追加方法 |
| [03-pages.md](./03-pages.md) | 画面（ページ）とCSSの追加方法 |
| [04-auth.md](./04-auth.md) | JWT認証の追加方法 |

## 技術スタック

| 技術 | バージョン | 用途 |
|---|---|---|
| Next.js | 16.2.1 | フレームワーク |
| React | 19.2.4 | UI |
| TypeScript | ^5 | 型安全な開発 |
| postgres（postgres.js） | 3.x | Supabase への生SQL接続 |
| CSS Modules | 標準機能 | スコープ付きCSS |

## プロジェクト構造（目標）

```
src/
├── app/
│   ├── layout.tsx          # 全画面共通レイアウト
│   ├── layout.css          # 共通レイアウトのCSS
│   ├── page.tsx            # トップページ (/)
│   ├── page.module.css     # トップページのCSS
│   ├── cats/
│   │   ├── page.tsx        # 猫一覧画面 (/cats)
│   │   ├── page.module.css
│   │   └── [id]/
│   │       ├── page.tsx    # 猫詳細画面 (/cats/123)
│   │       └── page.module.css
│   └── api/
│       └── cats/
│           └── route.ts    # APIエンドポイント (/api/cats)
└── lib/
    └── db.ts               # Supabase接続ヘルパー ✅
sql/
├── 20260323_001_create_test.sql   # テスト用テーブル ✅
└── 20260323_002_create_cats.sql   # 猫テーブル（今後）
```
