// @sensi-gg/shared — Constants

/** 섹션 정의 */
export const SECTIONS = {
  sens: { label: '감도', emoji: '🎯' },
  gear: { label: '장비', emoji: '⌨️' },
  game: { label: '그래픽', emoji: '🖥️' },
  tips: { label: '꿀팁', emoji: '💡' },
};

/** 유효한 섹션 키 목록 */
export const SECTION_KEYS = /** @type {const} */ (['sens', 'gear', 'game', 'tips']);

/** 섹션 라벨 (이모지 포함) */
export const SECTION_LABELS = {
  sens: '🎯 감도',
  gear: '⌨️ 장비',
  game: '🖥️ 그래픽',
  tips: '💡 꿀팁',
};

/** 디자인 테마 컬러 */
export const COLORS = {
  NIGHT_INDIGO: '#2B2F5A',
  DEEP_PERIWINKLE: '#3A4A86',
  SOFT_NAVY: '#2A3A68',
  FAIRY_GOLD: '#F4D27A',
  MIST_BLUE: '#AFC6FF',
  CLOUD_WHITE: '#EAF0FF',
  TEXT_SECONDARY: '#B8C2E6',
  TEXT_MUTED: '#8E98C7',
};

/** Embed 컬러바 (0x 형식) */
export const EMBED_COLOR = 0xF4D27A;

/** 입력 제한 */
export const LIMITS = {
  SECTION_MAX_LENGTH: 1000,
  SEARCH_PAGE_SIZE: 5,
};

/** 동기화 상태 */
export const SYNC_STATUS = /** @type {const} */ ({
  SYNCED: 'synced',
  PENDING_THREAD: 'pending_thread',
  PENDING_DELETE: 'pending_delete',
});

/** 세팅 출처 */
export const SOURCE = /** @type {const} */ ({
  BOT: 'bot',
  WEB: 'web',
});

/** eDPI 감도 밴드 경계값 */
export const SENSITIVITY_BANDS = /** @type {const} */ ({
  low: 280,
  mid: 380,
});

/** 장비 통계 대상 필드 */
export const TOP_GEAR_FIELDS = /** @type {const} */ (['mouse', 'keyboard', 'headset']);

/** 서버 통계 캐시 TTL (ms) */
export const STATS_CACHE_TTL_MS = 60000;
