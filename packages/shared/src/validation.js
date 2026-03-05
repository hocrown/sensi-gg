// @sensi-gg/shared — Input validation

import { SECTION_KEYS, LIMITS } from './constants.js';

/**
 * 섹션 데이터 검증
 * @param {Record<string, string>} data - 섹션 키-값 쌍
 * @param {string[]} requiredSections - 필수 섹션 키 (tips 제외 시)
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSections(data, requiredSections = []) {
  const errors = [];

  for (const key of Object.keys(data)) {
    if (!SECTION_KEYS.includes(key)) {
      errors.push(`유효하지 않은 섹션: ${key}`);
      continue;
    }

    const value = data[key];
    if (typeof value !== 'string') {
      errors.push(`${key}: 문자열이어야 합니다.`);
      continue;
    }

    if (value.length > LIMITS.SECTION_MAX_LENGTH) {
      errors.push(`${key}: 최대 ${LIMITS.SECTION_MAX_LENGTH}자까지 입력 가능합니다.`);
    }
  }

  for (const key of requiredSections) {
    if (!data[key] || !data[key].trim()) {
      errors.push(`${key}: 필수 항목입니다.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 유효한 섹션 태그인지 확인
 * @param {string} tag
 * @returns {boolean}
 */
export function isValidTag(tag) {
  return SECTION_KEYS.includes(tag);
}
