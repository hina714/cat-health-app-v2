-- テスト用テーブル（接続確認用）
CREATE TABLE test (
  id         SERIAL PRIMARY KEY,
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
