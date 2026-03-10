import { deleteSetup } from '../supabase.js';
import { WEB_URL } from '../config.js';

/**
 * Handle search pagination button interactions (legacy — search moved to web).
 * @param {import('discord.js').ButtonInteraction} interaction
 */
export async function handleSearchButton(interaction) {
  await interaction.reply({
    content: `검색 기능은 웹으로 이전되었습니다: ${WEB_URL}`,
    flags: 64,
  });
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
