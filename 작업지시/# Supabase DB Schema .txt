# Supabase DB Schema + RLS 설계/마이그레이션 생성

## 요구 테이블
### 1) profiles (웹 로그인/봇 공용 유저)
- id (uuid, PK, auth.users.id 참조 가능)
- discord_user_id (text, unique)  // 봇에서 알 수 있는 값
- handle (text, unique)           // URL용 닉네임
- display_name (text)
- avatar_url (text)
- created_at, updated_at

### 2) setups (세팅 데이터)
- id (uuid PK)
- profile_id (uuid FK -> profiles.id)
- dpi (int)
- general_sens (numeric)
- vertical_multiplier (numeric, nullable)
- ads_sens (numeric, nullable)
- scope_2x, scope_3x, scope_4x, scope_6x, scope_8x, scope_15x (numeric, nullable)
- mouse, keyboard, headset, mousepad, monitor (text, nullable)
- notes (text, nullable)
- updated_at, created_at

인덱스:
- setups(profile_id)
- setups(dpi)
- setups(updated_at)

### 3) servers (서버 공개 페이지 단위)
- id (uuid PK)
- slug (text unique)        // /s/:slug
- name (text)
- description (text, nullable)
- is_public (boolean default true)
- join_code (text unique)   // 서버 가입 코드(회전 가능)
- created_at, updated_at

### 4) server_claims (서버 소유권)
- id (uuid PK)
- server_id (uuid FK -> servers.id)
- claimed_by_profile_id (uuid FK -> profiles.id)
- created_at
제약:
- server_id unique (한 서버는 1명만 claim)

### 5) server_memberships (서버 소속)
- id (uuid PK)
- server_id (uuid FK)
- profile_id (uuid FK)
- created_at
제약:
- unique(server_id, profile_id)

## RLS 정책(요구)
- profiles: 본인 row는 읽기/수정 가능, 공개필드(handle, display_name, avatar_url)는 누구나 읽기 가능(공유 카드용)
- setups: 누구나 읽기 가능(공유/통계 목적), 단 수정/삭제는 본인만
- servers: is_public=true면 누구나 읽기 가능
- server_memberships: 누구나 읽기 가능(통계 계산용) 또는 통계 API에서만 사용
  - 단, 생성(join)은 로그인 사용자만 가능
- server_claims: 생성/수정은 서버를 claim하는 사용자(관리자)만

## 추가 요구
- join_code 생성/회전 로직을 서버 owner(claimer)만 할 수 있도록 정책/함수 설계
- 통계 성능을 위해 view 또는 rpc 함수 중 하나 선택
  - 선택 A: SQL VIEW로 집계 + web에서 추가 가공
  - 선택 B: SQL RPC 함수로 stats JSON 생성
  - MVP는 A를 우선 추천

## 산출물
- supabase/migrations/*.sql 파일로 생성
- README에 테이블 요약 및 RLS 요약 추가