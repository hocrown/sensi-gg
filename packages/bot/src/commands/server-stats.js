// src/commands/server-stats.js — /server-stats command
import { SlashCommandBuilder } from 'discord.js';
import { getServerByGuildId } from '../repositories/supabaseRepo.js';
import { WEB_URL } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('server-stats')
  .setDescription('View this server\'s stats page link');

export async function execute(interaction) {
  const guildId = interaction.guildId;
  if (!guildId) {
    return interaction.reply({
      content: 'This command can only be used in a server.',
      flags: 64,
    });
  }

  try {
    const server = await getServerByGuildId(guildId);

    if (server && server.slug) {
      await interaction.reply({
        content: `이 서버의 통계 페이지: ${WEB_URL}/s/${server.slug}`,
        flags: 64,
      });
    } else {
      await interaction.reply({
        content: `이 서버는 아직 등록되지 않았습니다.\n웹에서 서버를 Claim 후 활성화하세요: ${WEB_URL}`,
        flags: 64,
      });
    }
  } catch (err) {
    console.error('[server-stats] command error:', err);
    const reply = { content: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}

export default { data, execute };
