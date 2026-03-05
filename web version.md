# JUNO Setup DB 확장 (Discord.js Bot + Next.js Web + Supabase 통일)

## 배경
- 기존에 Discord.js 봇 프로젝트가 있고, 디스코드 내에서 세팅 등록/수정/삭제 기능은 이미 구현되어 있다.
- 앞으로는 "웹이 메인"이고, 디스코드 봇은 조회/공유(링크) 중심의 서브로 운용한다.
- 데이터 저장소는 Supabase로 통일한다.
- 서버 통계 페이지는 외부 공개로 제공한다.

## 목표
1) 모노레포 구조로 web + bot을 운영하며 공용 로직(shared)을 분리한다.
2) Supabase DB 스키마를 표준화하고, 봇/웹에서 동일한 테이블을 사용한다.
3) 웹(Next.js)을 메인 UI로 구축한다.
   - 세팅 등록/수정 폼(/setup/me)
   - 유저 프로필 카드 공유 페이지(/u/:handle)
   - 서버 통계 대시보드 공개 페이지(/s/:slug)
4) 봇(Discord.js)은 다음을 제공한다.
   - 내 세팅 조회
   - 특정 유저 세팅 조회
   - 웹 카드 링크 공유(/setup share)
   - 서버 통계 링크 공유(/server stats)
   - (기존 등록/수정/삭제 기능은 유지하되, 웹 링크를 안내 메시지로 추가)
5) 서버 통계는 "봇이 없어도" 가능해야 한다.
   - Server Claim + Join Code 시스템을 도입한다.
   - 서버 멤버십은 서비스 등록자 기반이다(디스코드 서버 전체 멤버 기반이 아님).

## 핵심 정의
- eDPI = dpi * general_sens (※ general_sens 단위는 기존 봇 로직과 일치하도록 확인)
- 감도 밴드(기본값, 설정파일로 관리)
  - low: eDPI < 280
  - mid: 280 <= eDPI < 380
  - high: eDPI >= 380
- 서버 통계는 평균이 아니라 아래 중심:
  - DPI별 인원 분포
  - DPI별 저/중/고감도 비율
  - TOP DPI 그룹의 eDPI 분위수(p25/p50/p75)
  - 장비 TOP(mouse/keyboard/headset)

## 산출물(코드)
- /apps/web : Next.js 앱
- /apps/bot : 기존 Discord.js 봇(리팩토링 최소)
- /packages/shared : 타입/계산/검증/상수/유틸
- Supabase 마이그레이션 SQL(테이블 + 인덱스 + RLS)
- Next.js API(라우트 핸들러) 또는 Supabase RPC/뷰 중 하나로 통계 JSON 제공
- README 업데이트(로컬 실행, env, 배포 방법)

## 진행 순서(권장)
1) repo 구조 정리(모노레포) + shared 패키지 생성
2) Supabase 스키마 확정 + 마이그레이션 작성 + RLS 설계
3) web: Discord OAuth 로그인(Supabase Auth) + /setup/me 구현
4) web: /u/:handle 공유 카드 구현
5) web: /s/:slug 공개 서버 통계 구현(Join Code 기반 membership)
6) bot: Supabase 저장/조회 모듈로 통일 + /setup share, /server stats 추가


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


# Next.js Web (메인) 구현 지시

## 기술
- Next.js App Router
- Supabase JS Client
- Supabase Auth (Discord OAuth)
- UI는 단순하고 빠르게: 카드형 UI 중심

## 필수 페이지
### 1) /setup/me
- 로그인 필요
- 내 세팅을 조회하고 없으면 등록 폼, 있으면 수정 폼
- 입력 항목:
  - dpi, general_sens, vertical, ads, 2x,3x,4x,6x,8x,15x
  - mouse/keyboard/headset/mousepad/monitor
- 저장 성공 시 /u/:handle 로 이동 버튼 제공
- UX: "서버 연결(Join Code)" 입력란/모달 제공
  - join_code 입력 -> server_membership 생성

### 2) /u/:handle
- 외부 공개(비로그인 접근 가능)
- 프로필 카드형 표시:
  - handle/display_name
  - 감도 요약(dpi, general, ads, 2x~6x)
  - 장비 요약(mouse/keyboard/headset)
  - updated_at
- 공유용: OG 메타 태그(가능하면) / 링크 복사 버튼

### 3) /s/:slug
- 외부 공개(비로그인 접근 가능)
- 상단: 서버명, 등록자 수, 최근 업데이트 시간, "내 세팅 등록" CTA
- 감도 통계는 평균 제외하고 아래를 구현:
  1) DPI별 인원 분포(바 차트)
  2) DPI별 저/중/고감도(=eDPI band) 스택 바
  3) TOP DPI 그룹 eDPI 분위수(p25/p50/p75) 표시
  4) 장비 TOP5(mouse/keyboard/headset)
- 데이터 소스: GET /api/server/:slug/stats 또는 Supabase rpc/view

## API(Next Route Handler) 권장
- GET /api/server/:slug/stats : 통계 JSON 반환
- POST /api/server/join : join_code 입력 받아 membership 생성(로그인 필요)
- POST /api/server/claim : 서버 claim(로그인 필요, 관리자 검증은 추후)

## 산출물
- 각 페이지의 컴포넌트, 타입, 로딩/에러 상태 처리
- stats JSON 스펙 문서화(shared에 타입 정의)

# Server Stats 계산 로직 (평균 사용 금지)

## 입력
- server slug

## 출력(JSON)
- server { slug, name, memberCount, lastUpdateAt }
- dpiDistribution: [{ dpi, count, ratio }]
- sensitivityBands:
  - bands: low/mid/high + 기준(절대 eDPI)
  - byDpi: [{ dpi, total, low, mid, high }]
- edpiQuantilesTopDpi:
  - dpi (가장 많은 dpi)
  - p25, p50, p75
- gearTop:
  - mouse/keyboard/headset top list

## 계산 규칙
1) 대상자 = server_memberships에 속해 있고 setups가 존재하는 profile
2) eDPI = dpi * general_sens (단위는 기존 봇 계산과 일치)
3) 저/중/고 구간은 config로 관리(기본 low<280, mid<380)
4) TOP DPI = dpiDistribution에서 count가 가장 높은 dpi
5) 분위수는 TOP DPI 그룹의 eDPI를 대상으로 p25/p50/p75
6) 장비 top은 null/empty 제외하고 count 내림차순

## 구현 방식
- MVP: Next.js API에서 Supabase 쿼리로 raw rows 가져와 집계(서버 인원 많지 않을 것을 가정)
- 확장: Supabase SQL view/rpc로 집계 이전

## 성능/안전
- 공개 페이지이므로 rate limit 또는 캐싱(서버별 30~120초) 적용 권장
- 서버 통계는 membership 기반이므로 "봇이 없어도" 동작해야 함

# Discord.js Bot - Web 중심으로 역할 정리

## 목표
- 기존 등록/수정/삭제 기능은 유지
- 저장소를 Supabase로 통일
- "웹 카드 링크 공유" 기능 추가
- "서버 통계 링크 공유" 기능 추가

## 필수 명령
1) /setup me
- 내 세팅 요약 embed + 웹 카드 링크 버튼
2) /setup user <mention or handle>
- 대상 세팅 요약 embed + 웹 카드 링크
3) /setup share
- 내 웹 카드 링크만 깔끔하게 출력 (채널 공유용)
4) /server stats (또는 /setup server-stats)
- 현재 guild 기준으로 "웹 통계 페이지 링크" 안내
- 단, guildId로 membership이 자동 생성되는 방식이 아니라면:
  - 서버가 claim되어 slug가 있는 경우 링크 제공
  - 없으면 "웹에서 서버 Claim/Join Code로 활성화하세요" 안내 링크 제공

## 추가 요구
- 봇의 저장/조회 로직을 repository 패턴으로 분리
  - /packages/shared에 타입/유틸
  - /apps/bot/src/repositories/supabaseRepo.ts 같은 형태

## 메시지 톤
- 등록/수정/삭제 완료 시 "웹에서 더 편하게 관리 가능" 링크 함께 표시


# 결정 사항(현재는 기본값으로 구현)
- 공개 URL: /u/:handle, /s/:slug
- eDPI 계산식은 기존 봇과 동일하게 맞춘다(불일치 시 마이그레이션/재계산 필요)
- 감도 밴드 기준은 config로 관리(초기값 low<280, mid<380)
- 서버 claim 검증(진짜 디스코드 서버 관리자 여부)은 MVP에서 완화 가능
  - 우선 claim은 로그인 유저 누구나 가능하게 하고, 추후 Discord API로 Manage Guild 확인 추가
- membership 생성은 join_code 기반으로 한다(봇 없는 서버도 가능)

