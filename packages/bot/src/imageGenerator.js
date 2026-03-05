import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');
const GENERATED_DIR = path.join(PROJECT_ROOT, 'generated');

const CARD_WIDTH = 800;
const CARD_HEIGHT = 600;

// Cozy Night 브랜딩 팔레트
const BG_DARK = '#2B2F5A';       // Night Indigo
const BG_MID = '#2A3A68';        // Soft Navy
const BG_LIGHT = '#3A4A86';      // Deep Periwinkle
const ACCENT = '#F4D27A';        // Fairy Light Gold
const ACCENT_BLUE = '#AFC6FF';   // Mist Blue
const TEXT_PRIMARY = '#EAF0FF';   // Cloud White
const TEXT_SECONDARY = '#B8C2E6'; // Secondary Text
const TEXT_MUTED = '#8E98C7';     // Muted Text

const SECTIONS = {
  sens: { label: '감도', emoji: '🎯' },
  gear: { label: '장비', emoji: '⌨️' },
  game: { label: '그래픽', emoji: '🖥️' },
  tips: { label: '꿀팁', emoji: '💡' },
};

/**
 * Wrap text to fit within a maximum pixel width.
 * Splits by newlines first, then wraps each line by word.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string[]}
 */
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Generate a setup card image for the given user.
 * @param {string} userId - Discord user ID
 * @param {{ username: string, sens?: string, gear?: string, game?: string, tips?: string, date?: string }} options
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function generateSetupCard(userId, options) {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext('2d');

  // --- Background ---
  const templatePath = path.join(ASSETS_DIR, 'setup_card_template.png');
  let hasTemplate = false;

  try {
    if (fs.existsSync(templatePath)) {
      const templateImg = await loadImage(templatePath);
      ctx.drawImage(templateImg, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      hasTemplate = true;
    }
  } catch {
    hasTemplate = false;
  }

  if (!hasTemplate) {
    // Gradient fallback: top-left BG_DARK → bottom-right BG_LIGHT
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, BG_DARK);
    gradient.addColorStop(0.5, BG_MID);
    gradient.addColorStop(1, BG_LIGHT);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }

  // --- Header area ---
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, CARD_WIDTH, 90);

  // Title
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = ACCENT;
  ctx.fillText('🎮 PUBG SETUP', 24, 40);

  // Username
  ctx.font = '20px sans-serif';
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.fillText(options.username, 24, 70);

  // --- Sections ---
  const sectionKeys = Object.keys(SECTIONS).filter(
    (key) => options[key] && options[key].trim(),
  );

  const CONTENT_TOP = 100;
  const CONTENT_BOTTOM = 560;
  const CONTENT_AREA = CONTENT_BOTTOM - CONTENT_TOP;
  const SECTION_GAP = 10;
  const PADDING_X = 24;
  const PADDING_INNER = 12;
  const MAX_TEXT_WIDTH = 720;

  if (sectionKeys.length > 0) {
    // Pre-calculate heights for each section
    ctx.font = '14px sans-serif';
    const sectionData = sectionKeys.map((key) => {
      const { emoji, label } = SECTIONS[key];
      const wrappedLines = wrapText(ctx, options[key], MAX_TEXT_WIDTH);
      const headerHeight = 24;
      const lineHeight = 20;
      const contentHeight = wrappedLines.length * lineHeight;
      const totalHeight = PADDING_INNER + headerHeight + contentHeight + PADDING_INNER;
      return { key, emoji, label, wrappedLines, totalHeight, lineHeight };
    });

    const totalContentHeight = sectionData.reduce((sum, s) => sum + s.totalHeight, 0)
      + (sectionData.length - 1) * SECTION_GAP;

    // Scale to fit if necessary
    const scale = totalContentHeight > CONTENT_AREA
      ? CONTENT_AREA / totalContentHeight
      : 1;

    let currentY = CONTENT_TOP;

    for (const section of sectionData) {
      const sectionHeight = section.totalHeight * scale;

      // Semi-transparent background rectangle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      const rectX = PADDING_X - 8;
      const rectWidth = CARD_WIDTH - (PADDING_X - 8) * 2;
      ctx.beginPath();
      ctx.roundRect(rectX, currentY, rectWidth, sectionHeight, 8);
      ctx.fill();

      // Section header
      let innerY = currentY + PADDING_INNER + 18;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = ACCENT;
      ctx.fillText(`${section.emoji} ${section.label}`, PADDING_X, innerY);

      // Section content
      innerY += 8;
      ctx.font = '14px sans-serif';
      ctx.fillStyle = TEXT_PRIMARY;

      const scaledLineHeight = section.lineHeight * scale;
      for (const line of section.wrappedLines) {
        innerY += scaledLineHeight;
        ctx.fillText(line, PADDING_X + 4, innerY);
      }

      currentY += sectionHeight + SECTION_GAP * scale;
    }
  }

  // --- Footer ---
  const dateStr = options.date || new Date().toISOString().split('T')[0];

  ctx.font = '12px sans-serif';
  ctx.fillStyle = TEXT_SECONDARY;

  // Bottom-left: bot name
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('SENSI.GG', PADDING_X, CARD_HEIGHT - 16);

  // Bottom-right: date
  const dateMetrics = ctx.measureText(dateStr);
  ctx.fillText(dateStr, CARD_WIDTH - PADDING_X - dateMetrics.width, CARD_HEIGHT - 16);

  // --- Save & Return ---
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(GENERATED_DIR, `setup_${userId}.png`);
  fs.writeFileSync(outputPath, buffer);

  return buffer;
}
