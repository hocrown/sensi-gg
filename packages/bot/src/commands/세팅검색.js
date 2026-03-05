import { SlashCommandBuilder } from 'discord.js';
import { searchSetups } from '../supabase.js';
import { createSearchResultEmbed } from '../embed.js';

export const data = new SlashCommandBuilder()
  .setName('세팅검색')
  .setDescription('등록된 PUBG 세팅을 검색합니다')
  .addUserOption(option =>
    option.setName('사용자')
      .setDescription('특정 사용자의 세팅 검색')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('태그')
      .setDescription('세팅 종류 필터')
      .setRequired(false)
      .addChoices(
        { name: '감도', value: 'sens' },
        { name: '장비', value: 'gear' },
        { name: '그래픽', value: 'game' },
        { name: '꿀팁', value: 'tips' },
      )
  );

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('사용자');
  const tag = interaction.options.getString('태그');
  const filters = {};
  if (targetUser) filters.userId = targetUser.id;
  if (tag) filters.tag = tag;

  const result = await searchSetups(filters, 1, 5);

  if (result.total === 0) {
    return interaction.reply({
      content: '검색 결과가 없습니다.',
      flags: 64,
    });
  }

  const { embed, components } = createSearchResultEmbed(result, filters, interaction.client);
  await interaction.reply({ embeds: [embed], components, flags: 64 });
}

export default { data, execute };
