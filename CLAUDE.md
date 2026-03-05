# CLAUDE.md

This file is the **Source of Truth** for the SENSI.GG Bot project. Claude Code must follow this document as the primary reference.

## Project Overview

SENSI.GG Bot — Discord.js 기반 PUBG 세팅(감도/장비/그래픽/꿀팁) 공유 및 관리 봇.

**핵심 컨셉: Forum as DB** — Discord Forum Channel을 primary 데이터 저장소로 활용하고, SQLite를 secondary 매핑/검색용으로 사용한다. Forum Thread의 Embed가 source of truth이며, SQLite는 빠른 조회와 검색을 위한 인덱스 역할을 한다.

## Tech Stack

- **Runtime**: Node.js 18+, ES Modules (`"type": "module"`)
- **Discord**: discord.js v14
- **Database**: better-sqlite3 (동기식, 설치 용이)
- **Image**: canvas (node-canvas) — 세팅 카드 동적 생성
- **AI Assets**: @google/genai — Gemini 이미지 생성 (고정 에셋 사전 생성용)
- **Config**: dotenv

## Commands

```bash
npm install                # 의존성 설치
npm run deploy             # Discord slash command 등록
npm start                  # 봇 실행
npm run generate-assets    # Gemini 디자인 에셋 생성
```

## Environment Variables

| 변수 | 필수 | 설명 |
|---|---|---|
| `DISCORD_TOKEN` | O | Discord Bot 토큰 |
| `CLIENT_ID` | O | Discord Application ID |
| `GUILD_ID` | O | 대상 서버 ID |
| `FORUM_CHANNEL_ID` | O | 세팅 포럼 채널 ID |
| `GEMINI_API_KEY` | O | Gemini API 키 (에셋 생성용) |
| `DATABASE_PATH` | X | SQLite DB 경로 (기본: `data/setup.db`) |

템플릿: `.env.example` 참조

## Architecture

### 데이터 흐름 (확정)

```
User → /세팅등록
  → Select Menu (복수 선택: sens, gear, game, tips 중 원하는 항목)
  → Modal (선택한 항목에 대한 텍스트 입력)
  → Embed 생성 (embed.js)
  → node-canvas 카드 이미지 생성 (imageGenerator.js)
  → Forum Thread 생성 (index.js)
  → SQLite Insert (database.js)
```

> Image Generator는 Phase 1부터 포함. Embed 생성 → 카드 생성 → Thread 생성 → DB Insert 순서.

### 프로젝트 파일 구조

```
sensi-gg-bot/
├── src/
│   ├── index.js              # 봇 메인 엔트리, Interaction 라우팅
│   ├── embed.js              # Embed 생성 + 브랜딩 적용
│   ├── database.js           # better-sqlite3 CRUD
│   ├── imageGenerator.js     # node-canvas 카드 이미지 생성
│   ├── commands/
│   │   └── 세팅등록.js        # 슬래시 커맨드 정의
│   └── handlers/
│       ├── selectMenu.js     # Select Menu 핸들러
│       └── modal.js          # Modal 핸들러
├── scripts/
│   ├── deploy-commands.js    # 슬래시 커맨드 등록
│   └── generate-assets.js    # Gemini 에셋 생성 스크립트
├── assets/                   # 고정 디자인 에셋 (Gemini 생성)
├── generated/                # 동적 생성 이미지 (.gitignore)
├── data/                     # SQLite DB 파일 (.gitignore)
├── docs/
│   ├── COMMANDS.md           # 명령어 상세 스펙
│   ├── DATABASE.md           # DB 스키마 + 동기화 전략
│   ├── ASSETS.md             # 에셋 목록 + 생성 전략
│   └── ROADMAP.md            # 로드맵 상세
├── .env                      # 환경변수 (.gitignore)
├── .env.example              # 환경변수 템플릿
├── .gitignore
├── package.json
├── CLAUDE.md                 # Source of Truth
└── README.md                 # 프로젝트 소개
```

### File Responsibilities

| 파일 | 역할 |
|---|---|
| `src/index.js` | 봇 메인 엔트리. Client 생성, Interaction 라우팅 (command → select menu → modal) |
| `src/embed.js` | Embed 생성. 배너/썸네일 적용, 브랜딩 통일 |
| `src/database.js` | better-sqlite3 CRUD. setups 테이블 관리 |
| `src/imageGenerator.js` | node-canvas 기반 세팅 카드 이미지 생성. 템플릿 위에 사용자 데이터 렌더링 |
| `src/commands/세팅등록.js` | `/세팅등록` 슬래시 커맨드 정의 (SlashCommandBuilder) |
| `src/handlers/selectMenu.js` | Select Menu interaction 처리. 선택된 섹션 기반으로 Modal 생성 |
| `src/handlers/modal.js` | Modal submit 처리. Embed 생성 → 카드 생성 → Thread 생성 → DB 저장 |
| `scripts/deploy-commands.js` | REST API로 slash command 등록 |
| `scripts/generate-assets.js` | Gemini API로 고정 디자인 에셋(배너/썸네일) 생성 |

## Data Model

### setups 테이블

```sql
CREATE TABLE setups (
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

CREATE INDEX idx_userId ON setups(userId);
```

- **Forum Thread** = source of truth (Embed 내용이 정본)
- **SQLite** = userId → threadId 매핑 + 검색용 인덱스
- 동기화: create → INSERT, update → UPDATE

상세: `docs/DATABASE.md` 참조

## 에셋 전략

| 구분 | 생성 방식 | 시점 | 저장 위치 |
|---|---|---|---|
| 배너/썸네일 (고정) | Gemini 이미지 생성 | 사전 생성 (1회) | `assets/` |
| 세팅 카드 (동적) | node-canvas 템플릿 | 등록/수정 시마다 | `generated/` |
| 카드 템플릿 (고정) | Gemini 이미지 생성 | 사전 생성 (1회) | `assets/` |

고정 에셋 목록: `banner_setup_db.png`, `thumb_sens.png`, `thumb_gear.png`, `thumb_game.png`, `thumb_tips.png`, `setup_card_template.png`

상세: `docs/ASSETS.md` 참조

## Slash Commands

| 명령어 | Phase | 설명 |
|---|---|---|
| `/세팅등록` | 1 | Select Menu → Modal → Embed + 카드 → Thread 생성 + DB Insert |
| `/세팅수정` | 2 | DB에서 threadId 조회 → Embed/카드 업데이트 + DB Update |
| `/세팅검색` | 3 | DB 쿼리 → Embed 목록 반환 (페이지네이션) |

상세: `docs/COMMANDS.md` 참조

## Development Rules

1. **Thread 중복 방지** — Forum Thread를 중복 생성하지 않는다. 기존 thread를 재사용한다.
2. **모듈 분리** — Embed 생성은 `embed.js`, 이미지 생성은 `imageGenerator.js`를 통해 수행한다.
3. **기존 기능 보호** — 기존 명령어를 깨뜨리지 않는다. 모든 신규 기능은 모듈 단위로 추가한다.
4. **에러 처리** — 모든 interaction 핸들러는 try/catch로 감싸고, 사용자에게 ephemeral 에러 메시지를 반환한다.
5. **Stateless 설계** — Bot 재시작 시 기능이 깨지지 않도록 stateless 설계를 유지한다.
6. **입력 검증** — 사용자 입력은 반드시 길이/형식 검증 후 처리한다.
7. **동시성 제어** — 같은 사용자의 중복 등록 요청을 방지한다 (DB UNIQUE 제약 + 사전 체크).

## Design Theme (SENSI.GG Branding)

- **Mood**: Cozy / Calm / Night city / Soft glow
- **Base**: Night Indigo `#2B2F5A`, Deep Periwinkle `#3A4A86`, Soft Navy `#2A3A68`
- **Accent**: Fairy Light Gold `#F4D27A`, Mist Blue `#AFC6FF`
- **Text**: Primary `#EAF0FF`, Secondary `#B8C2E6`, Muted `#8E98C7`
- **Embed Color Bar**: `#F4D27A` (Gold)
- 모든 Embed와 에셋은 이 테마를 일관되게 따른다.

## package.json

```json
{
  "name": "sensi-gg-bot",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "deploy": "node scripts/deploy-commands.js",
    "generate-assets": "node scripts/generate-assets.js"
  },
  "dependencies": {
    "discord.js": "^14.x",
    "better-sqlite3": "^11.x",
    "canvas": "^2.x",
    "dotenv": "^16.x",
    "@google/genai": "^1.x"
  }
}
```
