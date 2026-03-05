import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getSetupByUserId } from '../supabase.js';

export const data = new SlashCommandBuilder()
  .setName('세팅삭제')
  .setDescription('등록된 PUBG 세팅을 삭제합니다');

export async function execute(interaction) {
  const existing = await getSetupByUserId(interaction.user.id);
  if (!existing) {
    return interaction.reply({
      content: '⚠️ 등록된 세팅이 없습니다.',
      flags: 64,
    });
  }

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_delete_confirm')
      .setLabel('삭제')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('setup_delete_cancel')
      .setLabel('취소')
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.reply({
    content: '⚠️ 정말로 세팅을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    components: [confirmRow],
    flags: 64,
  });
}

export default { data, execute };
