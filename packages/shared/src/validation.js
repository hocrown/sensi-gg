// @sensi-gg/shared — Input validation

import { SECTION_KEYS, LIMITS } from './constants.js';
import { FIELDS } from './fields.js';

/** Default max length for text/textarea fields that don't specify one */
const DEFAULT_TEXT_MAX_LENGTH = 200;

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

/**
 * 개별 필드를 FIELDS 스키마에 따라 검증합니다.
 * @param {string} sectionKey - 'sens' | 'gear' | 'game' | 'tips'
 * @param {string} fieldKey - 필드명 (예: 'dpi', 'mouse')
 * @param {*} value - 검증할 값
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateField(sectionKey, fieldKey, value) {
  const fields = FIELDS[sectionKey];
  if (!fields) {
    return { valid: false, error: `유효하지 않은 섹션: ${sectionKey}` };
  }

  const field = fields.find((f) => f.key === fieldKey);
  if (!field) {
    return { valid: false, error: `유효하지 않은 필드: ${fieldKey}` };
  }

  // readonly fields skip validation
  if (field.type === 'readonly') {
    return { valid: true };
  }

  // required check
  if (field.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${field.label}: 필수 항목입니다.` };
    }
  }

  // optional fields allow null/undefined
  if (value === null || value === undefined) {
    return { valid: true };
  }

  switch (field.type) {
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { valid: false, error: `${field.label}: 숫자여야 합니다.` };
      }
      if (field.min !== undefined && value < field.min) {
        return { valid: false, error: `${field.label}: 최솟값은 ${field.min}입니다.` };
      }
      if (field.max !== undefined && value > field.max) {
        return { valid: false, error: `${field.label}: 최댓값은 ${field.max}입니다.` };
      }
      break;
    }

    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.label}: 문자열이어야 합니다.` };
      }
      const maxLen = field.maxLength ?? DEFAULT_TEXT_MAX_LENGTH;
      if (value.length > maxLen) {
        return { valid: false, error: `${field.label}: 최대 ${maxLen}자까지 입력 가능합니다.` };
      }
      break;
    }

    case 'select': {
      if (field.multiselect) {
        if (!Array.isArray(value)) {
          return { valid: false, error: `${field.label}: 배열이어야 합니다.` };
        }
        for (const item of value) {
          if (!field.options.includes(item)) {
            return { valid: false, error: `${field.label}: 유효하지 않은 옵션 "${item}"` };
          }
        }
      } else {
        if (typeof value !== 'string') {
          return { valid: false, error: `${field.label}: 문자열이어야 합니다.` };
        }
        if (value !== '' && !field.options.includes(value)) {
          return { valid: false, error: `${field.label}: 유효하지 않은 옵션 "${value}"` };
        }
      }
      break;
    }

    case 'toggle': {
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${field.label}: 불리언이어야 합니다.` };
      }
      break;
    }
  }

  return { valid: true };
}

/**
 * 섹션의 모든 필드를 일괄 검증합니다.
 * @param {string} sectionKey
 * @param {Object} data - { fieldKey: value, ... }
 * @returns {{ valid: boolean, errors: { [fieldKey: string]: string } }}
 */
export function validateSectionFields(sectionKey, data) {
  const fields = FIELDS[sectionKey];
  if (!fields) {
    return { valid: false, errors: { _section: `유효하지 않은 섹션: ${sectionKey}` } };
  }

  /** @type {{ [fieldKey: string]: string }} */
  const errors = {};

  for (const field of fields) {
    if (field.type === 'readonly') continue;

    const value = data[field.key];
    const result = validateField(sectionKey, field.key, value);
    if (!result.valid) {
      errors[field.key] = result.error;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
