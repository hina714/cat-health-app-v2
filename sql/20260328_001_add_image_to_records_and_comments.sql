-- records テーブルに画像カラムを追加
ALTER TABLE records ADD COLUMN IF NOT EXISTS image_data TEXT;

-- comments テーブルに画像カラムを追加
ALTER TABLE comments ADD COLUMN IF NOT EXISTS image_data TEXT;
