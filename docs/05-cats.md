# 猫プロフィール機能 仕様書

## 概要

ログイン中のユーザーが、飼っている猫のプロフィールを閲覧・編集できる機能。
猫の初期登録は seed スクリプトで行い、アプリ上での新規登録・削除は行わない。

---

## 設計の前提と意図

### 猫は「家族（household）」に紐づく

家族みんなで同じ猫を管理するため、猫は特定のユーザーではなく **household（家族）** に紐づける。

```
households（家族）
  └── users（ユーザー）  ← 家族の各メンバー
  └── cats（猫）         ← 家族の猫
```

- 家族内の誰がログインしても、同じ猫のデータを閲覧・編集できる
- `household_id` を条件にすることで、他の家族のデータは見えないようにする（**認可**）

---

## データ仕様

### households テーブル

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | UUID | ✓ | 主キー（自動生成） |
| `name` | TEXT | ✓ | 家族名（例: 青木家） |
| `created_at` | TIMESTAMPTZ | | 登録日時（自動セット） |

### users テーブル（変更点）

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| `household_id` | UUID | | 所属する家族（`households.id` への参照） |

### cats テーブル

| カラム | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | UUID | ✓ | 主キー（自動生成） |
| `household_id` | UUID | ✓ | 所属する家族（`households.id` への参照） |
| `name` | TEXT | ✓ | 猫の名前 |
| `icon_data` | TEXT | | アイコン画像（base64） |
| `breed` | TEXT | | 品種 |
| `birthdate` | DATE | | 誕生日 |
| `neutered` | BOOLEAN | | 去勢・避妊（TRUE: あり / FALSE: なし / NULL: 不明） |
| `created_at` | TIMESTAMPTZ | | 登録日時（自動セット） |

---

## 初期データ登録手順

```bash
# 1. 家族を登録する
node --env-file=.env.local scripts/seed-household.mjs 青木家
# → household ID が表示される

# 2. ユーザーを登録する（household_id を指定）
node --env-file=.env.local scripts/create-user.mjs hina mypassword <household_id>

# 3. 猫を登録する（username 経由で household に紐づく）
node --env-file=.env.local scripts/seed-cat.mjs hina たま 三毛猫 2022-04-01
```

---

## API仕様

### GET /api/cats
ログイン中のユーザーの家族（household）に紐づく猫を返す。

- 認証: 必須（未ログインは 401）
- レスポンス: `{ ok: true, cats: [...] }`

### PATCH /api/cats/:id
猫のプロフィールを更新する。

- 認証: 必須（未ログインは 401）
- 制約: 自分の家族（household）の猫のみ更新可能
- リクエスト: `{ name, icon_data?, breed?, birthdate?, neutered? }`
- バリデーション: `name` が空の場合は 400
- レスポンス: `{ ok: true, cat: {...} }`

---

## 画面仕様

### トップページ（/）

- 「うちの子」セクションに猫のアイコンと名前を表示
- アイコン写真がない場合は 🐱 を表示
- アイコンにホバーすると編集ボタン（✎）が表示され、`/cats/:id/edit` へ遷移する

### 編集画面（/cats/:id/edit）

| 項目 | 種類 | 必須 | 備考 |
|---|---|---|---|
| アイコン写真 | ファイル選択 | | 選択後にトリミング・ズーム調整が可能 |
| 名前 | テキスト入力 | ✓ | |
| 品種 | テキスト入力 | | |
| 誕生日 | 日付入力 | | |
| 去勢・避妊 | ラジオボタン | | あり / なし / 不明 |

**写真編集の仕様**
- 既存の写真がある場合はプレビューを表示し、「写真を変更する」で再選択できる
- 新しい写真を選ぶとエディタが表示され、ドラッグで位置・スライダーでズームを調整できる（1〜3倍）
- 保存時に編集内容を JPEG（品質 85%）で確定し、base64 に変換して保存する
- 上限サイズ: 10MB

**保存後の動作**
- 成功したらトップページ（`/`）へリダイレクト
