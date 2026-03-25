-- cats テーブルの user_id を household_id に置き換える
ALTER TABLE cats ADD COLUMN household_id UUID REFERENCES households(id) ON DELETE CASCADE;
ALTER TABLE cats DROP COLUMN user_id;
ALTER TABLE cats ALTER COLUMN household_id SET NOT NULL;
