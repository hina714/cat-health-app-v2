<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 説明・会話ルール

専門用語が出てきた場合は、初心者にもわかるように簡単な言葉で補足説明を添えること。

例：
- 「**ルーティング**（URLとページの対応付け）」
- 「**非同期処理**（時間のかかる処理を待つ仕組み）」

# 質問・会話ルール

ユーザーからの質問で主語や文脈が不明瞭な場合は、そのまま回答せず指摘すること。
その際、より明確な質問の例を提案すること。

例：
- ユーザー：「これどうすればいい？」
- AI：「主語が不明です。例えば「`src/lib/db.ts` の接続エラーはどうすればいい？」のような形で質問していただけますか？」

# データベースルール

Supabase に対して、スキーマやデータを変更するSQLを絶対に実行しないこと。
対象は CREATE、ALTER、DROP、INSERT、UPDATE、DELETE、TRUNCATE など。

スキーマ変更が必要な場合は、SQLファイルを `sql/` フォルダに作成するところまでを行い、
実際の実行はユーザーが Supabase の SQL Editor で手動で行う。
