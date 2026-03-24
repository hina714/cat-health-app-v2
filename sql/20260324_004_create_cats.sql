CREATE TABLE cats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon_data  TEXT,
  breed      TEXT,
  birthdate  DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
