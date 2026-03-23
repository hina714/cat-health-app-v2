-- 猫テーブル
CREATE TABLE cats (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL,
  name       TEXT NOT NULL,
  breed      TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
