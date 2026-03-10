/**
 * @sensi-gg/shared — Structured field schema for all 4 setup sections.
 *
 * Each field descriptor has the following shape:
 * @typedef {Object} FieldDescriptor
 * @property {string} key - camelCase key used in JSON
 * @property {string} label - Korean display label
 * @property {'number'|'text'|'select'|'toggle'|'textarea'|'readonly'} type
 * @property {boolean} [required=false]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {string[]} [options] - for 'select' and multiselect
 * @property {boolean} [multiselect] - true for multiselect
 * @property {string} [placeholder]
 * @property {string} [note] - helper text shown under field
 * @property {number} [maxLength] - max character length for textarea/text
 */

/** @type {Record<'sens'|'gear'|'game'|'tips', FieldDescriptor[]>} */
export const FIELDS = {
  sens: [
    { key: 'dpi',      label: 'DPI',           type: 'number',   required: true,  min: 100, max: 6400, step: 50,  placeholder: '800' },
    { key: 'ingame',   label: '인게임 감도',    type: 'number',   required: true,  min: 1,   max: 100,  step: 1,   placeholder: '42' },
    { key: 'ads',      label: '조준 감도',      type: 'number',   required: false, min: 1,   max: 100,  step: 1,   placeholder: '35' },
    { key: 'scope2x',  label: '2× 배율',        type: 'number',   required: false, min: 1,   max: 100,  step: 1 },
    { key: 'scope3x',  label: '3× 배율',        type: 'number',   required: false, min: 1,   max: 100,  step: 1 },
    { key: 'scope4x',  label: '4× 배율',        type: 'number',   required: false, min: 1,   max: 100,  step: 1 },
    { key: 'scope6x',  label: '6× 배율',        type: 'number',   required: false, min: 1,   max: 100,  step: 1 },
    { key: 'scope8x',  label: '8× 배율',        type: 'number',   required: false, min: 1,   max: 100,  step: 1 },
    { key: 'vertical', label: '수직 감도 배율', type: 'number',   required: false, min: 0.5, max: 2.0,  step: 0.1, placeholder: '1.0' },
    { key: 'edpi',     label: 'eDPI (자동계산)', type: 'readonly', note: 'DPI × 인게임 감도' },
    { key: 'note',     label: '메모',           type: 'textarea', required: false, placeholder: '낮은 감도 입문자 추천', maxLength: 200 },
  ],

  gear: [
    { key: 'mouse',       label: '마우스',     type: 'text',     required: true,  placeholder: 'Logitech G Pro X Superlight' },
    { key: 'mousepad',    label: '마우스패드', type: 'text',     required: false, placeholder: 'Artisan Hien XL' },
    { key: 'keyboard',    label: '키보드',     type: 'text',     required: false, placeholder: 'Wooting 60HE' },
    { key: 'monitor',     label: '모니터',     type: 'text',     required: false, placeholder: 'BenQ XL2546K' },
    { key: 'refreshRate', label: '주사율',     type: 'select',   required: false, options: ['60Hz', '144Hz', '165Hz', '240Hz', '360Hz', '500Hz', '기타'] },
    { key: 'resolution',  label: '해상도',     type: 'select',   required: false, options: ['1920×1080', '2560×1440', '1728×1080', '1600×900', '기타'] },
    { key: 'headset',         label: '헤드셋',     type: 'text',     required: false },
    { key: 'monitorSettings', label: '모니터 설정', type: 'textarea', required: false, placeholder: 'DyAc: Premium, Black eQualizer: 8, Color Vibrance: 12', maxLength: 300 },
    { key: 'note',            label: '메모',       type: 'textarea', required: false, maxLength: 200 },
  ],

  game: [
    { key: 'renderScale',    label: '렌더링 스케일', type: 'select', required: false, options: ['70', '80', '90', '100', '120'],                         note: '%' },
    { key: 'antiAliasing',   label: '안티앨리어싱', type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'postProcessing', label: '후처리',       type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'shadows',        label: '그림자',       type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'textures',       label: '텍스처',       type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'effects',        label: '효과',         type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'foliage',        label: '식생',         type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'viewDistance',   label: '거리보기',     type: 'select', required: false, options: ['매우낮음', '낮음', '중간', '높음', '울트라'] },
    { key: 'fpsLimit',       label: 'FPS 제한',     type: 'select', required: false, options: ['무제한', '60', '144', '240', '커스텀'] },
    { key: 'motionBlur',     label: '모션블러',     type: 'toggle', required: false },
    { key: 'vsync',          label: '수직동기화',   type: 'toggle', required: false },
    { key: 'screenMode',     label: '화면 모드',    type: 'select', required: false, options: ['전체화면', '창모드', '전체창모드'] },
  ],

  tips: [
    { key: 'categories', label: '카테고리', type: 'select',   multiselect: true, required: false, options: ['에임', '무빙', '포지셔닝', '설정', '기타'] },
    { key: 'content',    label: '내용',     type: 'textarea', required: true,  placeholder: '자유롭게 팁을 작성하세요!', maxLength: 1000 },
  ],
};

/**
 * Returns a default-value object for all fields in a given section.
 * - number   → null
 * - text     → ''
 * - select   → '' (or [] when multiselect: true)
 * - toggle   → false
 * - textarea → ''
 * - readonly → null
 *
 * @param {'sens'|'gear'|'game'|'tips'} sectionKey
 * @returns {Record<string, null|string|boolean|string[]>}
 */
export function getDefaultValues(sectionKey) {
  const fields = FIELDS[sectionKey];
  if (!fields) return {};

  return Object.fromEntries(
    fields.map((field) => {
      let defaultValue;
      switch (field.type) {
        case 'number':
        case 'readonly':
          defaultValue = null;
          break;
        case 'toggle':
          defaultValue = false;
          break;
        case 'select':
          defaultValue = field.multiselect ? [] : '';
          break;
        case 'text':
        case 'textarea':
        default:
          defaultValue = '';
          break;
      }
      return [field.key, defaultValue];
    })
  );
}
