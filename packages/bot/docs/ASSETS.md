# Assets — 에셋 목록 + 생성 전략

## 에셋 분류

| 구분 | 생성 방식 | 시점 | 저장 위치 | 변경 빈도 |
|---|---|---|---|---|
| 고정 에셋 | Gemini 이미지 생성 | 사전 1회 | `assets/` | 디자인 변경 시만 |
| 카드 템플릿 | Gemini 이미지 생성 | 사전 1회 | `assets/` | 디자인 변경 시만 |
| 세팅 카드 | node-canvas 동적 생성 | 매 등록/수정 시 | `generated/` | 매번 |

---

## 고정 에셋 (Gemini 사전 생성)

### 파일 목록

| 파일 | 용도 | 크기 | Embed 사용법 |
|---|---|---|---|
| `banner_setup_db.png` | Embed 상단 배너 | 960×540 권장 | `.setImage("attachment://banner_setup_db.png")` |
| `thumb_sens.png` | 감도 섹션 썸네일 | 128×128 권장 | `.setThumbnail("attachment://thumb_sens.png")` |
| `thumb_gear.png` | 장비 섹션 썸네일 | 128×128 권장 | `.setThumbnail("attachment://thumb_gear.png")` |
| `thumb_game.png` | 그래픽 섹션 썸네일 | 128×128 권장 | `.setThumbnail("attachment://thumb_game.png")` |
| `thumb_tips.png` | 꿀팁 섹션 썸네일 | 128×128 권장 | `.setThumbnail("attachment://thumb_tips.png")` |
| `setup_card_template.png` | 세팅 카드 배경 템플릿 | 800×600 권장 | node-canvas 렌더링 기반 |

### 생성 스크립트: `scripts/generate-assets.js`

Gemini API를 사용하여 디자인 에셋을 자동 생성하는 스크립트.

#### 사전 요구사항

- `.env`에 `GEMINI_API_KEY` 설정 필요 (`.env.example` 참조)

#### 사용법

```bash
npm run generate-assets
```

#### 구현 방식

```javascript
import { GoogleGenAI } from "@google/genai";

// gemini-2.0-flash-exp 모델의 이미지 생성 기능 활용
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 각 에셋별 프롬프트로 이미지 생성
// response에서 base64 이미지 데이터 추출 → PNG 저장
```

#### 에셋별 프롬프트 가이드

모든 프롬프트는 아래 디자인 테마를 기반으로 작성:

| 에셋 | 프롬프트 키워드 |
|---|---|
| `banner_setup_db.png` | Gaming setup, PUBG, cozy night atmosphere, blue-purple gradient background, warm accent lighting, banner format |
| `thumb_sens.png` | Mouse sensitivity icon, crosshair, targeting, dark theme, blue-purple glow |
| `thumb_gear.png` | Gaming peripherals icon, keyboard mouse, dark theme, blue-purple glow |
| `thumb_game.png` | Monitor display icon, graphics settings, dark theme, blue-purple glow |
| `thumb_tips.png` | Light bulb tip icon, idea, dark theme, warm golden glow |
| `setup_card_template.png` | Card background template, gaming aesthetic, dark navy, subtle gradient, clean layout areas for text |

> 프롬프트는 생성 결과에 따라 반복 조정이 필요합니다. 위는 초기 가이드입니다.

---

## 세팅 카드 (node-canvas 동적 생성)

### 개요

사용자의 세팅 데이터를 시각적 카드 이미지로 렌더링. 등록/수정 시마다 생성하여 Embed에 첨부.

### 구현: `src/imageGenerator.js`

#### 입력

| 필드 | 설명 |
|---|---|
| `username` | Discord 사용자명 |
| `sens` | 감도 세팅 텍스트 |
| `gear` | 장비 정보 텍스트 |
| `game` | 그래픽 설정 텍스트 |
| `tips` | 꿀팁 텍스트 |
| `date` | 등록/수정 날짜 |

#### 렌더링 흐름

```
1. setup_card_template.png 로드 (배경)
2. Canvas에 템플릿 그리기
3. 텍스트 렌더링 (각 섹션별 영역에 배치)
4. generated/setup_<userId>.png로 저장
5. Buffer 반환 (Embed 첨부용)
```

#### 출력

| 항목 | 값 |
|---|---|
| 파일명 | `generated/setup_<userId>.png` |
| 크기 | 800×600 (템플릿 기준) |
| Embed 첨부 | `attachment://setup_card.png` |

#### 성능 목표

- 이미지 생성: **300ms 이내**
- 템플릿은 앱 시작 시 한 번 로드 후 메모리 캐시

#### 텍스트 렌더링 스타일

- 폰트: 시스템 sans-serif (한글 지원 필요)
- 색상: 흰색 텍스트 + 반투명 섹션 배경
- 줄바꿈: 긴 텍스트는 자동 줄바꿈 처리

---

## 디자인 테마 가이드

### 테마: Cozy Night

| 요소 | 설명 |
|---|---|
| **Mood** | 따뜻하고 아늑한 밤 분위기 |
| **Primary Color** | Blue-Purple Gradient (`#1a1a2e` → `#16213e` → `#0f3460`) |
| **Accent Color** | Warm Light (`#e2a626`, `#f4c430`) |
| **Text Color** | 밝은 흰색 (`#f0f0f0`) + 서브텍스트 (`#a0a0b0`) |
| **Background** | 진한 네이비-퍼플 그라디언트 |

### Embed 색상

- Primary embed color: `#0f3460` (Blue)
- 모든 Embed에 통일 적용

### 일관성 원칙

- 모든 에셋은 동일한 색감과 분위기를 유지
- 배너, 썸네일, 카드 템플릿이 시각적으로 하나의 세트로 느껴져야 함
- Gemini 생성 시 동일한 스타일 키워드를 반복 사용
