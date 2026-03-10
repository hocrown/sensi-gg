-- SENSI.GG Test Data Seed
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- RLS를 우회하기 위해 service_role로 실행됩니다 (Dashboard SQL Editor는 자동으로 service_role 사용).

-- ============================================================
-- 1. Test Profiles (10명)
-- ============================================================
INSERT INTO profiles (id, discord_user_id, handle, display_name, avatar_url, created_at, updated_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001', '100000000000000001', 'shroud_kr', 'Shroud_KR', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000002', '100000000000000002', 'wacky_jacky', 'WackyJacky101', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000003', '100000000000000003', 'kaymind', 'Kaymind', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000004', '100000000000000004', 'chocotaco', 'chocoTaco', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000005', '100000000000000005', 'ibiza_pubg', 'iBiZa', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000006', '100000000000000006', 'pio_pubg', 'Pio', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000007', '100000000000000007', 'glory_pubg', 'GLORY', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000008', '100000000000000008', 'loki_kr', 'Loki', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000009', '100000000000000009', 'seoul_gg', 'Seoul_GG', NULL, now(), now()),
  ('a0000001-0000-0000-0000-000000000010', '100000000000000010', 'ducky_aim', 'DuckyAim', NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Test Setups (10명 — 다양한 DPI/감도 분포)
-- ============================================================
INSERT INTO setups (profile_id, dpi, general_sens, vertical_multiplier, ads_sens, scope_2x, scope_4x, scope_6x, scope_8x, mouse, keyboard, headset, mousepad, monitor, notes)
VALUES
  -- 800 DPI 그룹 (4명) — low~mid eDPI
  ('a0000001-0000-0000-0000-000000000001', 800, 0.35, 1.0, 0.35, 0.35, 0.30, 0.25, 0.20,
   'Logitech G Pro X Superlight', 'Wooting 60HE', 'HyperX Cloud II', 'Artisan Zero', 'BenQ XL2546K',
   '배그 프로리그 세팅 참고'),
  ('a0000001-0000-0000-0000-000000000002', 800, 0.42, 1.0, 0.40, 0.40, 0.35, 0.30, 0.25,
   'Razer DeathAdder V3', 'Leopold FC660M', 'SteelSeries Arctis Pro', 'SteelSeries QcK Heavy', 'ASUS VG259QM',
   NULL),
  ('a0000001-0000-0000-0000-000000000003', 800, 0.50, 1.0, 0.45, 0.45, 0.40, 0.35, 0.30,
   'Logitech G Pro X Superlight', 'Razer Huntsman V2', 'Logitech G Pro X', 'Artisan Hien', 'BenQ XL2546K',
   '고감도 스타일'),
  ('a0000001-0000-0000-0000-000000000004', 800, 0.30, 1.0, 0.30, 0.30, 0.25, 0.20, 0.15,
   'Finalmouse Starlight-12', 'Wooting 60HE', 'HyperX Cloud II', 'Artisan Zero', 'BenQ XL2546K',
   NULL),

  -- 400 DPI 그룹 (3명) — low eDPI
  ('a0000001-0000-0000-0000-000000000005', 400, 0.60, 1.0, 0.55, 0.55, 0.50, 0.45, 0.40,
   'Zowie EC2-C', 'Leopold FC750R', 'Beyerdynamic DT 770', 'Zowie G-SR', 'BenQ XL2546K',
   '저DPI 고인게임 감도'),
  ('a0000001-0000-0000-0000-000000000006', 400, 0.65, 1.0, 0.60, 0.60, 0.55, 0.50, 0.45,
   'Razer Viper V2 Pro', 'Cherry MX Board', 'SteelSeries Arctis Pro', 'Artisan Hien', 'ASUS VG259QM',
   NULL),
  ('a0000001-0000-0000-0000-000000000007', 400, 0.70, 1.0, 0.65, 0.65, 0.60, 0.55, 0.50,
   'Logitech G Pro X Superlight', 'Wooting 60HE', 'Logitech G Pro X', 'Artisan Zero', 'LG 27GP850',
   '손목 에이밍'),

  -- 1600 DPI 그룹 (2명) — high eDPI
  ('a0000001-0000-0000-0000-000000000008', 1600, 0.25, 1.0, 0.25, 0.25, 0.20, 0.18, 0.15,
   'Razer DeathAdder V3', 'Razer Huntsman V2', 'HyperX Cloud II', 'SteelSeries QcK Heavy', 'BenQ XL2546K',
   '고DPI 저감도 — 정밀 에이밍'),
  ('a0000001-0000-0000-0000-000000000009', 1600, 0.30, 1.0, 0.28, 0.28, 0.25, 0.22, 0.18,
   'Finalmouse Starlight-12', 'Leopold FC660M', 'Beyerdynamic DT 770', 'Artisan Hien', 'ASUS VG259QM',
   NULL),

  -- 1200 DPI (1명) — mid eDPI
  ('a0000001-0000-0000-0000-000000000010', 1200, 0.28, 1.0, 0.28, 0.28, 0.25, 0.22, 0.18,
   'Zowie EC2-C', 'Wooting 60HE', 'SteelSeries Arctis Pro', 'Zowie G-SR', 'LG 27GP850',
   '중간 DPI 밸런스')
ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================
-- 3. Test Server
-- ============================================================
INSERT INTO servers (id, slug, name, description, is_public, join_code, guild_id)
VALUES (
  'b0000001-0000-0000-0000-000000000001',
  'test-server',
  'SENSI.GG 테스트 서버',
  'SENSI.GG 개발/테스트용 서버',
  true,
  'TEST-JOIN-CODE-2024',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Server Memberships (10명 모두 가입)
-- ============================================================
INSERT INTO server_memberships (server_id, profile_id)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000005'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000006'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000007'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000008'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000009'),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000010')
ON CONFLICT (server_id, profile_id) DO NOTHING;

-- ============================================================
-- 5. Server Claim (첫 번째 유저가 소유)
-- ============================================================
INSERT INTO server_claims (server_id, claimed_by_profile_id)
VALUES ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001')
ON CONFLICT (server_id) DO NOTHING;

-- ============================================================
-- 검증 쿼리
-- ============================================================
SELECT 'profiles' as tbl, count(*) as cnt FROM profiles WHERE id::text LIKE 'a0000001%'
UNION ALL
SELECT 'setups', count(*) FROM setups WHERE profile_id::text LIKE 'a0000001%'
UNION ALL
SELECT 'servers', count(*) FROM servers WHERE id = 'b0000001-0000-0000-0000-000000000001'
UNION ALL
SELECT 'memberships', count(*) FROM server_memberships WHERE server_id = 'b0000001-0000-0000-0000-000000000001'
UNION ALL
SELECT 'stats_view', count(*) FROM server_stats_raw WHERE server_id = 'b0000001-0000-0000-0000-000000000001';
