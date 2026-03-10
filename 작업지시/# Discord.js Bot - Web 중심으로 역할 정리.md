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