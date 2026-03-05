// src/ocr.js — Gemini Vision OCR for PUBG sensitivity screenshots
import { GoogleGenAI } from '@google/genai';

// 임시 OCR 결과 저장소 (userId → { data, timestamp })
const ocrCache = new Map();
const OCR_TTL = 5 * 60 * 1000; // 5분

const OCR_PROMPT = `PUBG 감도 설정 스크린샷입니다. 다음 항목을 추출하세요:
- DPI
- 인게임 감도 (일반)
- 조준 감도
- 스코프별 감도 (2x, 3x, 4x, 6x, 8x)

추출한 값을 아래 형식으로 정리:
DPI: [값]
인게임 감도: [값]
조준 감도: [값]
스코프 감도:
2x: [값]
3x: [값]
4x: [값]
6x: [값]
8x: [값]

이미지에서 보이는 값만 작성하고, 보이지 않는 항목은 생략하세요.`;

/**
 * Gemini Vision API로 PUBG 감도 스크린샷에서 수치 추출
 * @param {Buffer} imageBuffer - 이미지 데이터
 * @param {string} mimeType - 이미지 MIME 타입
 * @returns {Promise<string|null>} 추출된 감도 텍스트
 */
export async function extractSensitivity(imageBuffer, mimeType = 'image/png') {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { text: OCR_PROMPT },
      { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
    ],
  });

  const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
  return textPart?.text || null;
}

/**
 * OCR 결과를 userId 키로 캐시에 저장
 */
export function cacheOcrResult(userId, data) {
  ocrCache.set(userId, { data, timestamp: Date.now() });
}

/**
 * 캐시에서 OCR 결과를 꺼냄 (1회 사용 후 삭제, TTL 만료 시 null)
 */
export function getOcrResult(userId) {
  const entry = ocrCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > OCR_TTL) {
    ocrCache.delete(userId);
    return null;
  }
  ocrCache.delete(userId); // 1회 사용 후 삭제
  return entry.data;
}

// 주기적 정리 (10분마다)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ocrCache) {
    if (now - val.timestamp > OCR_TTL) ocrCache.delete(key);
  }
}, 10 * 60 * 1000).unref();
