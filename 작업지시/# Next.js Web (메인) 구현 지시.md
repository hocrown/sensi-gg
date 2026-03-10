# Next.js Web (메인) 구현 지시

## 기술
- Next.js App Router
- Supabase JS Client
- Supabase Auth (Discord OAuth)
- UI는 단순하고 빠르게: 카드형 UI 중심 (../22.figma-make-sensi-v2 를 참고하여, 22.figma-make-sensi-v2 가 UI 기준임을 명확히 하여 작업 진행.) 

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