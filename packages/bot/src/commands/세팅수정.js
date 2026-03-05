import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getSetupByUserId } from '../supabase.js';

export const data = new SlashCommandBuilder()
  .setName('세팅수정')
  .setDescription('등록된 PUBG 세팅을 수정합니다');

export async function execute(interaction) {
  const existing = await getSetupByUserId(interaction.user.id);
  if (!existing) {
    return interaction.reply({
      content: '⚠️ 등록된 세팅이 없습니다. `/세팅등록`을 먼저 사용해주세요.',
      flags: 64,
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('setup_edit_select')
    .setPlaceholder('수정할 세팅 항목을 선택하세요')
    .setMinValues(1)
    .setMaxValues(4)
    .addOptions([
      { label: '감도', value: 'sens', description: 'DPI, 인게임 감도, 스코프 감도 등', emoji: '🎯' },
      { label: '장비', value: 'gear', description: '마우스, 키보드, 모니터 등', emoji: '⌨️' },
      { label: '그래픽', value: 'game', description: '해상도, 그래픽 옵션 설정', emoji: '🖥️' },
      { label: '꿀팁', value: 'tips', description: '개인 세팅 팁, 추천 사항', emoji: '💡' },
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);
  await interaction.reply({ components: [row], flags: 64 });
}

export default { data, execute };
