import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { searchSetups, deleteSetup } from '../supabase.js';
import { createSearchResultEmbed } from '../embed.js';

/**
 * Handle search pagination button interactions.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
export async function handleSearchButton(interaction) {
  try {
    const parts = interaction.customId.split('_');
    const direction = parts[1];
    const currentPage = parseInt(parts[2], 10);
    const filtersStr = parts.slice(3).join('_');

    const filters = {};
    if (filtersStr) {
      for (const pair of filtersStr.split(',')) {
        const [key, value] = pair.split(':');
        if (key && value) filters[key] = value;
      }
    }

    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    const result = await searchSetups(filters, newPage, 5);

    const { embed, components } = createSearchResultEmbed(result, filters, interaction.client);
    await interaction.update({ embeds: [embed], components });
  } catch (error) {
    console.error('[buttonHandler] Search pagination error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ 검색 중 오류가 발생했습니다.', flags: 64 }).catch(() => {});
    } else {
      await interaction.reply({ content: '❌ 검색 중 오류가 발생했습니다.', flags: 64 }).catch(() => {});
    }
  }
}

/**
 * Handle like button interactions (deprecated — likes table removed in schema v2).
 * @param {import('discord.js').ButtonInteraction} interaction
 */
export async function handleLikeButton(interaction) {
  await interaction.reply({
    content: 'Like feature is being migrated to the web.',
    flags: 64,
  });
}

/**
 * Handle delete confirmation/cancel button interactions.
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('discord.js').Client} client
 */
export async function handleDeleteButton(interaction, client) {
  try {
    if (interaction.customId === 'setup_delete_cancel') {
      return interaction.update({
        content: '취소되었습니다.',
        components: [],
      });
    }

    await interaction.deferUpdate();

    const result = await deleteSetup(interaction.user.id);
    if (!result.success) {
      return interaction.editReply({
        content: '⚠️ 삭제할 세팅이 없습니다.',
        components: [],
      });
    }

    await interaction.editReply({
      content: '✅ 세팅이 삭제되었습니다.',
      components: [],
    });
  } catch (error) {
    console.error('[buttonHandler] Delete button error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: '❌ 삭제 중 오류가 발생했습니다.', components: [] }).catch(() => {});
    } else {
      await interaction.reply({ content: '❌ 삭제 중 오류가 발생했습니다.', flags: 64 }).catch(() => {});
    }
  }
}
