-- デモ用サンプルデータ（2026-03-22 〜 2026-03-28）
-- Supabase の SQL Editor で実行してください
-- ① と ② を別々に実行してください（①を先に実行すること）


-- ① 記録の挿入
WITH u AS (
  SELECT id, username FROM users WHERE username IN ('mama', 'aya', 'hina3')
)
INSERT INTO records (user_id, weight, food_amount, excretion, condition, memo, created_at)
SELECT
  u.id,
  v.weight::NUMERIC,
  v.food_amount,
  v.excretion,
  v.condition,
  v.memo,
  v.created_at::TIMESTAMPTZ
FROM (VALUES
  ('hina3', '4.32', '普通',  '良好', '元気', '朝から機嫌よさそう。よく鳴いてた。',                   '2026-03-22 07:41:00+09'),
  ('mama',  NULL,   '少なめ', '普通', '普通', '夕方ごろ食欲がなさそうだった。様子見。',               '2026-03-22 19:28:00+09'),
  ('aya',   NULL,   '普通',  '良好', '元気', '昼間ずっとソファで寝てた。触っても起きなかった笑',     '2026-03-23 10:15:00+09'),
  ('mama',  '4.35', '多め',  '良好', '元気', '体重測った。少し増えた。食欲旺盛で元気。',             '2026-03-24 08:03:00+09'),
  ('hina3', NULL,   '普通',  '普通', '普通', '夜になっておとなしくなった。疲れてるのかも。',         '2026-03-24 21:44:00+09'),
  ('aya',   NULL,   '少なめ', '普通', '普通', '今日は食欲あまりなさそう。水はよく飲んでいた。',       '2026-03-25 13:27:00+09'),
  ('hina3', '4.33', '普通',  '良好', '元気', '毛並みがきれい。毛づくろいをよくしていた。',           '2026-03-26 07:52:00+09'),
  ('mama',  NULL,   '多め',  '良好', '元気', 'カリカリをいつもより多く食べた。走り回って元気。',     '2026-03-26 16:10:00+09'),
  ('aya',   NULL,   '普通',  '普通', '普通', '夜少しぐったりしてたけど寝たら回復してそう。',         '2026-03-26 22:31:00+09'),
  ('mama',  NULL,   '普通',  '良好', '元気', '朝から窓の外をずっと眺めてた。鳥でもいたのかな。',     '2026-03-27 09:18:00+09'),
  ('aya',   '4.36', '普通',  '良好', '元気', '体重安定してる。今日もよく遊んでいた。',               '2026-03-28 07:35:00+09'),
  ('hina3', NULL,   '少なめ', '普通', '普通', '夕方から食欲やや落ちた。明日も様子見てみる。',         '2026-03-28 20:52:00+09')
) AS v(username, weight, food_amount, excretion, condition, memo, created_at)
JOIN u ON u.username = v.username;


-- ② コメントの挿入（①を実行してから実行すること）
WITH u AS (
  SELECT id, username FROM users WHERE username IN ('mama', 'aya', 'hina3')
)
INSERT INTO comments (record_id, user_id, body, created_at)
SELECT
  r.id,
  u.id,
  v.body,
  v.comment_at::TIMESTAMPTZ
FROM (VALUES
  ('hina3', '2026-03-22 07:41:00+09', 'aya',   'かわいい！朝から元気だったんだね',                   '2026-03-22 10:04:00+09'),
  ('mama',  '2026-03-22 19:28:00+09', 'hina3', '夜は食べてたよ！大丈夫そうだった',                   '2026-03-22 22:17:00+09'),
  ('mama',  '2026-03-24 08:03:00+09', 'aya',   '体重増えてよかった。ちゃんと食べてるんだね',         '2026-03-24 12:39:00+09'),
  ('aya',   '2026-03-25 13:27:00+09', 'mama',  '水飲んでるなら様子見でいいかな。明日確認してみる',   '2026-03-25 18:52:00+09'),
  ('hina3', '2026-03-26 07:52:00+09', 'mama',  '毛並みきれいだよね。ブラッシングの成果かな笑',       '2026-03-26 09:31:00+09'),
  ('mama',  '2026-03-26 16:10:00+09', 'hina3', 'すごい食欲だった！見てて笑えた',                     '2026-03-26 19:45:00+09'),
  ('aya',   '2026-03-28 07:35:00+09', 'mama',  '体重安定してるね。このまま維持できるといいね',       '2026-03-28 11:20:00+09')
) AS v(record_username, record_at, comment_username, body, comment_at)
JOIN u ON u.username = v.comment_username
JOIN records r
  ON r.created_at = v.record_at::TIMESTAMPTZ
  AND r.user_id = (SELECT id FROM users WHERE username = v.record_username);
