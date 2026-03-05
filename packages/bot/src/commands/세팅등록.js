// src/commands/세팅등록.js — /세팅등록 Slash Command Definition
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { extractSensitivity, cacheOcrResult } from '../ocr.js';

export const data = new SlashCommandBuilder()
  .setName('세팅등록')
  .setDescription('나의 PUBG 세팅을 등록합니다')
  .addAttachmentOption(option =>
    option.setName('스크린샷')
      .setDescription('감도 설정 스크린샷 (선택사항 - 자동으로 수치를 읽어옵니다)')
      .setRequired(false));

function buildSelectMenuRow() {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('setup_select')
    .setPlaceholder('등록할 세팅 항목을 선택하세요')
    .setMinValues(1)
    .setMaxValues(4)
    .addOptions([
      { label: '감도', value: 'sens', description: 'DPI, 인게임 감도, 스코프 감도 등', emoji: '🎯' },
      { label: '장비', value: 'gear', description: '마우스, 키보드, 모니터 등', emoji: '⌨️' },
      { label: '그래픽', value: 'game', description: '해상도, 그래픽 옵션 설정', emoji: '🖥️' },
      { label: '꿀팁', value: 'tips', description: '개인 세팅 팁, 추천 사항', emoji: '💡' },
    ]);
  return new ActionRowBuilder().addComponents(selectMenu);
}

export async function execute(interaction) {
  const attachment = interaction.options.getAttachment('스크린샷');

  // 이미지 없는 경우: 기존 흐름
  if (!attachment) {
    await interaction.reply({ components: [buildSelectMenuRow()], flags: 64 });
    return;
  }

  // 이미지 첨부 시: deferReply → OCR → editReply
  const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!validTypes.includes(attachment.contentType?.split(';')[0])) {
    await interaction.reply({ content: '⚠️ 이미지 파일만 첨부할 수 있습니다. (PNG, JPG, WebP, GIF)', flags: 64 });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  try {
    // 이미지 다운로드
    const response = await fetch(attachment.url);
    if (!response.ok) throw new Error('이미지 다운로드 실패');
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const mimeType = attachment.contentType?.split(';')[0] || 'image/png';

    // Gemini OCR
    const ocrResult = await extractSensitivity(imageBuffer, mimeType);
    if (ocrResult) {
      cacheOcrResult(interaction.user.id, ocrResult);
    }

    const content = ocrResult
      ? '✅ 스크린샷에서 감도 수치를 읽었습니다! 아래에서 등록할 항목을 선택하세요.'
      : '⚠️ 스크린샷에서 수치를 읽지 못했습니다. 직접 입력해주세요.';

    await interaction.editReply({ content, components: [buildSelectMenuRow()] });
  } catch (error) {
    console.error('[OCR] 처리 중 오류:', error);
    await interaction.editReply({
      content: '⚠️ 스크린샷 분석 중 오류가 발생했습니다. 직접 입력해주세요.',
      components: [buildSelectMenuRow()],
    });
  }
}

export default { data, execute };
