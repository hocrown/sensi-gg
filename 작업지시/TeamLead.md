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

# 결정 사항(현재는 기본값으로 구현)
- 공개 URL: /u/:handle, /s/:slug
- eDPI 계산식은 기존 봇과 동일하게 맞춘다(불일치 시 마이그레이션/재계산 필요)
- 감도 밴드 기준은 config로 관리(초기값 low<280, mid<380)
- 서버 claim 검증(진짜 디스코드 서버 관리자 여부)은 MVP에서 완화 가능
  - 우선 claim은 로그인 유저 누구나 가능하게 하고, 추후 Discord API로 Manage Guild 확인 추가
- membership 생성은 join_code 기반으로 한다(봇 없는 서버도 가능)

## 진행 순서(권장)
1) repo 구조 정리(모노레포) + shared 패키지 생성
2) Supabase 스키마 확정 + 마이그레이션 작성 + RLS 설계
3) web: Discord OAuth 로그인(Supabase Auth) + /setup/me 구현
4) web: /u/:handle 공유 카드 구현
5) web: /s/:slug 공개 서버 통계 구현(Join Code 기반 membership)
6) bot: Supabase 저장/조회 모듈로 통일 + /setup share, /server stats 추가
