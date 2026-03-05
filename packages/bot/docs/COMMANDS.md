# Commands — 명령어 상세 스펙

## /세팅등록 (Phase 1)

### 전체 플로우

```
1. 사용자가 /세팅등록 실행
2. Bot이 Select Menu 표시 (ephemeral)
   ├── 사용자가 1개 이상의 섹션 선택 (복수 선택 가능)
   └── Bot이 선택된 섹션에 맞는 Modal 표시
3. 사용자가 Modal에 텍스트 입력 후 Submit
4. Bot 처리:
   a. 기존 등록 여부 확인 (DB 조회)
   b. Embed 생성 (embed.js)
   c. 세팅 카드 이미지 생성 (imageGenerator.js)
   d. Forum Thread 생성 + Embed/이미지 첨부
   e. SQLite INSERT
   f. 사용자에게 완료 메시지 (ephemeral, Thread 링크 포함)
```

### Select Menu

| 속성 | 값 |
|---|---|
| Type | StringSelectMenu |
| Custom ID | `setup_select` |
| Placeholder | `등록할 세팅 항목을 선택하세요` |
| Min Values | 1 |
| Max Values | 4 |

#### 옵션

| Value | Label | Description | Emoji |
|---|---|---|---|
| `sens` | 감도 | DPI, 인게임 감도, 스코프 감도 등 | 🎯 |
| `gear` | 장비 | 마우스, 키보드, 모니터 등 | ⌨️ |
| `game` | 그래픽 | 해상도, 그래픽 옵션 설정 | 🖥️ |
| `tips` | 꿀팁 | 개인 세팅 팁, 추천 사항 | 💡 |

### Modal

선택된 섹션에 따라 동적으로 Modal 필드가 구성됩니다.

| Custom ID | `setup_modal` |
|---|---|

#### 필드 (TextInput)

각 선택된 섹션마다 1개의 TextInput이 생성됩니다:

| 섹션 | Label | Style | Required | Max Length |
|---|---|---|---|---|
| sens | 감도 세팅 | Paragraph | O | 1000 |
| gear | 장비 정보 | Paragraph | O | 1000 |
| game | 그래픽 설정 | Paragraph | O | 1000 |
| tips | 꿀팁 | Paragraph | X | 1000 |

> Modal은 최대 5개 ActionRow를 지원하므로 4개 섹션 모두 선택 가능.

### Thread 생성

| 속성 | 값 |
|---|---|
| 채널 | `FORUM_CHANNEL_ID` (Forum Channel) |
| 이름 | `[사용자명] Setup` |
| 메시지 | Embed + 세팅 카드 이미지 첨부 |

#### Forum Tag 규칙

선택한 섹션에 해당하는 Forum Tag를 자동 적용:

| 섹션 | Tag |
|---|---|
| sens | 감도 |
| gear | 장비 |
| game | 그래픽 |
| tips | 꿀팁 |

> Forum Channel에 해당 태그가 사전에 생성되어 있어야 합니다.

### 입력 검증

| 검증 항목 | 규칙 | 에러 메시지 |
|---|---|---|
| 텍스트 길이 | 각 필드 1~1000자 | `입력 내용이 너무 깁니다.` |
| 빈 값 (필수 필드) | 공백만 있는 경우 거부 | `내용을 입력해주세요.` |
| 중복 등록 | DB에 userId 존재 여부 확인 | `이미 세팅이 등록되어 있습니다. /세팅수정을 사용해주세요.` |

### 에러 시나리오

| 시나리오 | 처리 |
|---|---|
| Forum Channel 없음 | ephemeral 에러: `포럼 채널을 찾을 수 없습니다.` |
| Thread 생성 실패 | ephemeral 에러: `세팅 등록에 실패했습니다. 잠시 후 다시 시도해주세요.` |
| DB Insert 실패 | Thread는 생성되었으므로 로그 기록 + 사용자에게 부분 성공 알림 |
| 이미지 생성 실패 | 이미지 없이 Embed만 전송 + 로그 기록 |

### 동시성 처리

- `setups` 테이블의 `userId` 컬럼에 `UNIQUE` 제약 적용
- Thread 생성 전 DB 조회로 기존 등록 여부 사전 체크
- UNIQUE 제약 위반 시 graceful 에러 반환

---

## /세팅수정 (Phase 2)

### 전체 플로우

```
1. 사용자가 /세팅수정 실행
2. Bot이 DB에서 사용자의 threadId 조회
   ├── 없으면: ephemeral 에러 "등록된 세팅이 없습니다."
   └── 있으면: Select Menu 표시 (수정할 섹션 선택)
3. Modal 표시 (기존 값이 pre-filled)
4. Bot 처리:
   a. 기존 Thread의 Embed 업데이트
   b. 세팅 카드 이미지 재생성
   c. SQLite UPDATE
   d. 완료 메시지 (ephemeral)
```

### 권한 체크

- 본인의 세팅만 수정 가능
- `interaction.user.id`와 DB의 `userId` 일치 여부 확인

### 수정 가능 항목

- sens, gear, game, tips 각 섹션 개별 수정
- 새로운 섹션 추가 가능
- 기존 섹션 내용 변경 가능

---

## /세팅검색 (Phase 3)

### 전체 플로우

```
1. 사용자가 /세팅검색 실행
   ├── 옵션: 사용자명 (선택)
   └── 옵션: 태그 필터 (선택)
2. Bot이 DB 쿼리 실행
3. 결과를 Embed 목록으로 반환 (ephemeral)
```

### 커맨드 옵션

| 옵션 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `사용자` | User | X | 특정 사용자의 세팅 검색 |
| `태그` | String (choices) | X | 감도/장비/그래픽/꿀팁 필터 |

### 결과 표시

- Embed 목록 형태로 반환
- 한 페이지에 최대 5개 결과
- 페이지네이션: Button (이전/다음)
- 각 결과에 Thread 링크 포함

### 정렬

- 기본: 최신 등록순 (`createdAt DESC`)
- 향후: 추천수 기준 정렬 추가 예정
