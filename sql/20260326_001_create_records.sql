CREATE TABLE records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  weight      NUMERIC(5, 2),
  food_amount TEXT,
  excretion   TEXT,
  condition   TEXT,
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
