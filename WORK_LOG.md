# SENSI.GG Work Log

## 2026-03-10: 서버 통계, 멤버십 동기화, 듀얼 테마

### Web (packages/web)
- **Statistics 페이지** (`/s/[slug]`): DPI 분포, 감도 밴드, eDPI 분위수, 인기 장비 (Recharts)
- **서버 목록** (`/s`): 공개 서버 리스트 + 봇 초대 CTA
- **서버 전환 바**: 복수 서버 사용자 인라인 전환
- **듀얼 테마**: SENSI.GG / Figma 컬러 토글 (`ThemeProvider` + localStorage)
  - SENSI.GG: `#2B2F5A` bg, `#F4D27A` accent, `#AFC6FF` secondary
  - Figma: `#1A1A3A` bg, `#FFD700` accent, `#9370DB` purple
- **탭별 세팅 업데이트**: sens/gear/tips 각 탭이 해당 필드만 전송
- **i18n**: EN/KR (`LangProvider`)
- **GearSelector**: 검색 가능한 장비 카탈로그
- LikeButton/likes API 제거 (deprecated)

### Bot (packages/bot)
- 시작 시 Discord 길드 멤버 → server_memberships 자동 동기화
- 실시간 GuildMemberAdd/GuildMemberRemove 멤버십 동기화
- registerServer: icon_url, owner_discord_id, member_count 포함
- `register-guilds.js`: 수동 길드 일괄 등록 스크립트

### Shared (packages/shared)
- `stats.js`: percentile, topCounts 헬퍼
- types.js: Server/Setup 타입 업데이트

### DB Migration (003)
- servers: icon_url, owner_discord_id, member_count 추가
- setups: monitor_settings 추가

### 환경 설정 (gitignore 대상 — 별도 관리)
| 파일 | 내용 | 템플릿 |
|------|------|--------|
| `packages/bot/.env` | DISCORD_TOKEN, SUPABASE keys, GUILD_ID | `packages/bot/.env.example` |
| `packages/web/.env.local` | SUPABASE keys, GUILD_ID, CLIENT_ID | `packages/web/.env.local.example` |

### Figma 디자인 원본
- `/mnt/d/12.개인프로젝트/22.figma-make-sensi-gg-v2` (Vite+React 코드)
- StatsPage.tsx, MySetupPage.tsx, ShareTab.tsx 등 참조 가능
