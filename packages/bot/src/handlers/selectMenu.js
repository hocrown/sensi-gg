// src/handlers/selectMenu.js — Select Menu Interaction Handler
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { getSetupByUserId } from '../supabase.js';
import { getOcrResult } from '../ocr.js';

const SECTIONS = {
  sens: {
    label: '감도 세팅',
    placeholder: '예시)\nDPI: 800\n인게임 감도: 42\n조준 감도: 35\n스코프 감도: 2x 38 / 3x 32 / 4x 28 / 6x 24',
  },
  gear: {
    label: '장비 정보',
    placeholder: '예시)\n마우스: Logitech G Pro X Superlight\n키보드: Wooting 60HE\n모니터: BenQ XL2546K 240Hz\n마우스패드: Artisan Zero Soft XL',
  },
  game: {
    label: '그래픽 설정',
    placeholder: '예시)\n해상도: 1920x1080\n렌더링: 100\n안티앨리어싱: 울트라\n텍스처: 중간\n시야거리: 울트라\nFPP 시야각: 103',
  },
  tips: {
    label: '꿀팁',
    placeholder: '예시)\n- 감도 찾기: 180도 회전 기준 15cm가 편함\n- 스트레치 해상도 추천\n- 사운드: HRTF ON\n자유롭게 작성하세요!',
  },
};

/**
 * Handle setup_select and setup_edit_select string select menu interactions.
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
export async function handleSelectMenu(interaction) {
  const selectedSections = interaction.values;
  const isEditFlow = interaction.customId === 'setup_edit_select';

  // --- Duplicate check (registration flow only) ---
  if (!isEditFlow) {
    const existing = await getSetupByUserId(interaction.user.id);
    if (existing) {
      return interaction.reply({
        content: '⚠️ 이미 세팅이 등록되어 있습니다. `/세팅수정`을 사용해주세요.',
        flags: 64,
      });
    }
  }

  // --- Retrieve existing data for pre-fill (edit flow) ---
  let existingData = null;
  if (isEditFlow) {
    existingData = await getSetupByUserId(interaction.user.id);
  }

  // --- Retrieve OCR result for pre-fill ---
  const ocrResult = (!isEditFlow && selectedSections.includes('sens'))
    ? getOcrResult(interaction.user.id)
    : null;

  // --- Build Modal ---
  const prefix = isEditFlow ? 'setup_edit_modal' : 'setup_modal';
  const customId = `${prefix}_${selectedSections.join('_')}`;
  const title = isEditFlow ? 'PUBG 세팅 수정' : 'PUBG 세팅 등록';

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  for (const section of selectedSections) {
    const sectionInfo = SECTIONS[section];
    if (!sectionInfo) continue;

    const textInput = new TextInputBuilder()
      .setCustomId(section)
      .setLabel(sectionInfo.label)
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(sectionInfo.placeholder)
      .setRequired(section !== 'tips')
      .setMaxLength(1000);

    if (isEditFlow && existingData && existingData[section]) {
      textInput.setValue(existingData[section]);
    } else if (!isEditFlow && section === 'sens' && ocrResult) {
      textInput.setValue(ocrResult);
    }

    const row = new ActionRowBuilder().addComponents(textInput);
    modal.addComponents(row);
  }

  await interaction.showModal(modal);
}
