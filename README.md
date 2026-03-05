# SENSI.GG Bot

Discord.js 기반 PUBG 장비/감도/그래픽/꿀팁 세팅 공유 및 관리 봇. 포럼 채널을 데이터베이스처럼 활용하여 사용자의 세팅을 저장하고 공유합니다.

## 주요 기능

### 현재 (Phase 1)
- `/세팅등록` — Select Menu + Modal 기반 세팅 입력
- Discord Forum Thread에 Embed + 세팅 카드 이미지로 자동 등록
- SQLite 기반 사용자-스레드 매핑

### 예정
- `/세팅수정` — 기존 세팅 수정 (Phase 2)
- `/세팅검색` — 세팅 검색 + 페이지네이션 (Phase 3)
- 좋아요/추천 시스템 (Phase 4)

## 기술 스택

| 기술 | 용도 |
|---|---|
| Node.js 18+ | 런타임 (ES Modules) |
| discord.js v14 | Discord API |
| better-sqlite3 | 매핑/검색용 DB |
| canvas (node-canvas) | 세팅 카드 이미지 생성 |
| @google/genai | Gemini 디자인 에셋 생성 |
| dotenv | 환경변수 관리 |

## 프로젝트 구조

```
sensi-gg-bot/
├── src/
│   ├── index.js              # 봇 메인 엔트리
│   ├── embed.js              # Embed 생성
│   ├── database.js           # DB CRUD
│   ├── imageGenerator.js     # 카드 이미지 생성
│   ├── commands/             # 슬래시 커맨드 정의
│   └── handlers/             # Interaction 핸들러
├── scripts/
│   ├── deploy-commands.js    # 커맨드 등록
│   └── generate-assets.js    # Gemini 에셋 생성
├── assets/                   # 디자인 에셋
├── generated/                # 동적 생성 이미지
├── data/                     # SQLite DB
├── docs/                     # 상세 문서
├── CLAUDE.md                 # Source of Truth
└── README.md
```

## 빠른 시작

### 1. 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env`로 복사하고 값을 채웁니다:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
FORUM_CHANNEL_ID=your_forum_channel_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 디자인 에셋 생성 (최초 1회)

```bash
npm run generate-assets
```

### 4. 슬래시 커맨드 등록

```bash
npm run deploy
```

### 5. 봇 실행

```bash
npm start
```

## Discord 권한 요구사항

Bot Permissions:
- Send Messages
- Use Slash Commands
- Create Public Threads
- Send Messages in Threads
- Embed Links
- Attach Files
- Manage Threads

## 문서

| 문서 | 내용 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Source of Truth — 전체 기획 + 개발 가이드 |
| [docs/COMMANDS.md](./docs/COMMANDS.md) | 명령어 상세 스펙 |
| [docs/DATABASE.md](./docs/DATABASE.md) | DB 스키마 + 동기화 전략 |
| [docs/ASSETS.md](./docs/ASSETS.md) | 에셋 목록 + 생성 전략 |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | 개발 로드맵 |
