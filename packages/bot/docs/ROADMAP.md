# Roadmap — 개발 로드맵

## 전체 로드맵

```
Phase 1 (세팅 등록) → Phase 2 (세팅 수정) → Phase 3 (세팅 검색) → Phase 4 (추천 시스템)
```

---

## Phase 1: 세팅 등록

**목표**: 사용자가 자신의 PUBG 세팅을 등록하고 Forum Thread로 공유

### 구현 범위

| 항목 | 상세 |
|---|---|
| `/세팅등록` 커맨드 | SlashCommandBuilder 정의 + deploy |
| Select Menu | 복수 선택 가능 (sens, gear, game, tips) |
| Modal | 선택한 섹션별 TextInput 동적 생성 |
| Embed 생성 | 배너/썸네일 적용, 브랜딩 통일 (embed.js) |
| 카드 이미지 생성 | node-canvas 템플릿 기반 동적 렌더링 (imageGenerator.js) |
| Forum Thread 생성 | Embed + 카드 이미지 첨부, 태그 자동 적용 |
| DB Insert | better-sqlite3로 userId → threadId 매핑 저장 |
| 중복 방지 | userId UNIQUE 제약, 기존 등록 시 에러 반환 |

### 선행 작업

- [ ] Gemini 에셋 생성 (`npm run generate-assets`)
- [ ] Forum Channel 및 태그 설정
- [ ] 환경변수 설정

### 완료 기준

- `/세팅등록` 실행 → Select Menu → Modal → Thread 생성까지 전체 플로우 동작
- Embed에 배너/썸네일 정상 표시
- 세팅 카드 이미지가 Embed에 첨부
- DB에 userId-threadId 매핑 저장
- 중복 등록 시 에러 메시지 반환

---

## Phase 2: 세팅 수정

**목표**: 기존 등록된 세팅을 수정하고 Thread를 업데이트

### 구현 범위

| 항목 | 상세 |
|---|---|
| `/세팅수정` 커맨드 | SlashCommandBuilder 정의 + deploy |
| 기존 세팅 조회 | DB에서 userId로 threadId 조회 |
| Select Menu | 수정할 섹션 선택 |
| Modal | 기존 값 pre-fill |
| Embed 업데이트 | 기존 Thread의 첫 메시지 Embed 수정 |
| 카드 이미지 재생성 | 변경된 데이터로 카드 재렌더링 |
| DB Update | updatedAt 갱신 |
| 권한 체크 | 본인 세팅만 수정 가능 |

### 완료 기준

- `/세팅수정` 실행 → 기존 Thread의 Embed가 정상 업데이트
- 카드 이미지 재생성 확인
- DB의 updatedAt이 갱신
- 다른 사용자의 세팅 수정 시도 시 에러 반환
- 미등록 사용자가 수정 시도 시 적절한 안내 메시지

---

## Phase 3: 세팅 검색

**목표**: 다른 사용자의 세팅을 검색하고 조회

### 구현 범위

| 항목 | 상세 |
|---|---|
| `/세팅검색` 커맨드 | 옵션: 사용자(User), 태그(String choices) |
| DB 쿼리 | 필터 조건에 맞는 setups 검색 |
| 결과 표시 | Embed 목록 + Thread 링크 |
| 페이지네이션 | Button 기반 (이전/다음), 페이지당 5개 |
| 정렬 | 최신 등록순 (createdAt DESC) |

### 완료 기준

- 사용자명 검색, 태그 필터 동작
- 5개 이상 결과 시 페이지네이션 정상 동작
- 각 결과에서 Thread 링크 클릭하면 해당 Thread로 이동

---

## Phase 4: 추천 시스템

**목표**: 세팅에 좋아요/추천 기능 추가, 인기 세팅 랭킹

### 구현 범위 (초안)

| 항목 | 상세 |
|---|---|
| 좋아요 버튼 | Thread Embed에 Reaction 또는 Button 추가 |
| 추천 수 저장 | DB에 likes 컬럼 추가 또는 별도 테이블 |
| 인기 랭킹 | 추천수 기준 정렬된 검색 결과 |
| 중복 추천 방지 | 사용자당 1회 추천 제한 |

### 완료 기준

- 세팅 Thread에서 좋아요 가능
- 인기순 정렬 검색 동작
- 중복 추천 방지 동작
