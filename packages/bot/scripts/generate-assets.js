// scripts/generate-assets.js — Gemini Asset Generator
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

// Cozy Night 브랜딩 팔레트
// Base: Night Indigo #2B2F5A, Deep Periwinkle #3A4A86, Soft Navy #2A3A68
// Accent: Fairy Light Gold #F4D27A, Mist Blue #AFC6FF, Cloud White #EAF0FF
const BRAND_STYLE = 'Cozy night city atmosphere. Pastel blue-purple gradient background (Night Indigo #2B2F5A to Deep Periwinkle #3A4A86). Warm fairy light gold (#F4D27A) accent glow like string lights. Soft, low-contrast, easy on the eyes. Thin lines, rounded corners.';

const ASSETS = [
  {
    filename: 'banner_setup_db.png',
    prompt:
      `Create a wide banner image (1200x300, 2x export so render at 2400x600) for "SENSI.GG" — a PUBG gaming setup database. ${BRAND_STYLE} Left side: large "SENSI.GG" text with subtle glow. Small subtitle area below: "Gear · Sens · In-game · Tips". Right side: small sparkles and a minimal night city silhouette. Top edges: thin string light lines in gold (#F4D27A). Background: horizontal gradient Indigo→Periwinkle with 3-6% noise texture for illustration feel. Gold accent outer glow on highlights.`,
  },
  {
    filename: 'thumb_sens.png',
    prompt:
      `Create a small icon (256x256, 2x export so render at 512x512) representing mouse sensitivity/aiming. Crosshair symbol (circle + crosshair lines). ${BRAND_STYLE} Icon stroke: 2-3px, rounded corners 8-16px. Base color: Cloud White #EAF0FF and Mist Blue #AFC6FF. Small gold (#F4D27A) highlight dot at center. Dark background #2B2F5A. No text.`,
  },
  {
    filename: 'thumb_gear.png',
    prompt:
      `Create a small icon (256x256, 2x export so render at 512x512) representing gaming peripherals. Mouse silhouette, clean outline style. ${BRAND_STYLE} Icon stroke: 2-3px, rounded corners 8-16px. Base color: Cloud White #EAF0FF and Mist Blue #AFC6FF. Small gold (#F4D27A) highlight accent. Dark background #2B2F5A. No text.`,
  },
  {
    filename: 'thumb_game.png',
    prompt:
      `Create a small icon (256x256, 2x export so render at 512x512) representing monitor/graphics settings. Monitor screen with a small gear icon. ${BRAND_STYLE} Icon stroke: 2-3px, rounded corners 8-16px. Base color: Cloud White #EAF0FF and Mist Blue #AFC6FF. Small gold (#F4D27A) highlight accent. Dark background #2B2F5A. No text.`,
  },
  {
    filename: 'thumb_tips.png',
    prompt:
      `Create a small icon (256x256, 2x export so render at 512x512) representing tips/ideas. Light bulb icon with warm golden glow. ${BRAND_STYLE} Icon stroke: 2-3px, rounded corners 8-16px. Bulb outline: Cloud White #EAF0FF. Gold (#F4D27A) glow/fill as main accent — connects to fairy light theme. Dark background #2B2F5A. No text.`,
  },
  {
    filename: 'setup_card_template.png',
    prompt:
      `Create a card background template (1200x675, for text overlay by bot) for a gaming setup info card. ${BRAND_STYLE} Layout: 4 semi-transparent dark content blocks for sections (감도/장비/그래픽/메모). Top-right: space for a 256px thumbnail icon. Bottom footer bar: subtle dark strip for "SENSI.GG" + date area. Background: diagonal gradient Night Indigo #2B2F5A → Deep Periwinkle #3A4A86 with 3-6% noise. No text, just the background template with layout guides.`,
  },
];

/**
 * Sleep utility for rate-limiting.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('[generate-assets] GEMINI_API_KEY is not set. Aborting.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Ensure assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  console.log(`[generate-assets] Generating ${ASSETS.length} assets into ${ASSETS_DIR}\n`);

  let successCount = 0;

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    console.log(`[${i + 1}/${ASSETS.length}] Generating ${asset.filename}...`);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: asset.prompt,
      });

      // Extract image data from response parts
      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData,
      );

      if (!imagePart || !imagePart.inlineData?.data) {
        console.error(`  ⚠ No image data returned for ${asset.filename}. Skipping.`);
        continue;
      }

      const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const outputPath = path.join(ASSETS_DIR, asset.filename);
      fs.writeFileSync(outputPath, buffer);
      console.log(`  ✓ Saved ${asset.filename} (${buffer.length} bytes)`);
      successCount++;
    } catch (err) {
      console.error(`  ✗ Failed to generate ${asset.filename}:`, err.message || err);
      // Continue with remaining assets
    }

    // Rate-limit: small delay between requests (skip after last)
    if (i < ASSETS.length - 1) {
      await sleep(1000);
    }
  }

  console.log(`\n[generate-assets] Complete: ${successCount}/${ASSETS.length} assets generated.`);
}

main();
