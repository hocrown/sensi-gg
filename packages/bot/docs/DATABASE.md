# Database — DB 스키마 + 동기화 전략

## 개요

SQLite는 **secondary storage**로, 빠른 조회와 검색을 위한 인덱스 역할을 한다. Source of truth는 Discord Forum Thread의 Embed이다.

**라이브러리**: `better-sqlite3` (동기식 API, 네이티브 바인딩, sqlite3 대비 설치 용이)

**파일 위치**: `data/setup.db` (환경변수 `DATABASE_PATH`로 변경 가능)

## setups 테이블

### 스키마

```sql
CREATE TABLE IF NOT EXISTS setups (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  userId    TEXT NOT NULL UNIQUE,
  threadId  TEXT NOT NULL,
  sens      TEXT,
  gear      TEXT,
  game      TEXT,
  tips      TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
```

### 인덱스

```sql
CREATE INDEX IF NOT EXISTS idx_userId ON setups(userId);
```

> `userId`에 UNIQUE 제약이 있으므로 자동 인덱스가 생성되지만, 명시적 인덱스를 유지한다.

### 필드 설명

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| `id` | INTEGER | PK, AUTO | 내부 식별자 |
| `userId` | TEXT | NOT NULL, UNIQUE | Discord 사용자 ID |
| `threadId` | TEXT | NOT NULL | Discord Forum Thread ID |
| `sens` | TEXT | nullable | 감도 세팅 내용 |
| `gear` | TEXT | nullable | 장비 정보 내용 |
| `game` | TEXT | nullable | 그래픽 설정 내용 |
| `tips` | TEXT | nullable | 꿀팁 내용 |
| `createdAt` | TEXT | DEFAULT now | 최초 등록 시각 (ISO 8601) |
| `updatedAt` | TEXT | DEFAULT now | 최종 수정 시각 (ISO 8601) |

## 저장 전략

```
Discord Forum Thread (Embed)  ←  Source of Truth
        ↕ 동기화
SQLite setups 테이블           ←  매핑 + 검색용
```

- **Forum Thread**: 사용자에게 보여지는 정본. Embed 내용이 실제 세팅 데이터.
- **SQLite**: `userId → threadId` 매핑으로 빠른 조회. 검색 쿼리 지원.

## 동기화 규칙

| 이벤트 | Forum Thread | SQLite |
|---|---|---|
| `/세팅등록` | Thread 생성 + Embed | INSERT |
| `/세팅수정` | Embed 업데이트 | UPDATE (updatedAt 갱신) |
| `/세팅검색` | — (읽기만) | SELECT |

### 동기화 원칙

1. **Forum Thread 먼저** — Thread 생성/수정이 성공한 후에 DB 조작
2. **실패 시 로깅** — Thread는 성공했으나 DB 실패 시, 에러 로그 기록 (Thread가 source of truth이므로 데이터 유실 없음)
3. **1:1 관계** — 한 사용자당 하나의 Thread, 하나의 DB row (`userId UNIQUE`)

## CRUD 함수 (database.js)

| 함수 | 설명 | SQL |
|---|---|---|
| `initDB()` | 테이블/인덱스 생성 | CREATE TABLE IF NOT EXISTS |
| `insertSetup(userId, threadId, data)` | 세팅 등록 | INSERT INTO setups |
| `getSetupByUserId(userId)` | 사용자 세팅 조회 | SELECT * WHERE userId = ? |
| `updateSetup(userId, data)` | 세팅 수정 | UPDATE setups SET ... WHERE userId = ? |
| `searchSetups(filters)` | 세팅 검색 | SELECT * WHERE ... LIMIT/OFFSET |

## better-sqlite3 선택 이유

| 항목 | sqlite3 | better-sqlite3 |
|---|---|---|
| API | 비동기 (callback) | 동기식 |
| 설치 | node-gyp 빌드 필요 | prebuild 바이너리 |
| 성능 | 양호 | 더 빠름 (동기식) |
| 사용성 | 복잡 | 간단 |

봇 특성상 DB 조작이 빈번하지 않고, 동기식 API가 코드를 단순화하므로 better-sqlite3를 사용한다.
