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
        content: `This server's stats page: ${WEB_URL}/s/${server.slug}`,
        flags: 64,
      });
    } else {
      await interaction.reply({
        content: `This server is not registered yet.\nClaim or join via the web: ${WEB_URL}`,
        flags: 64,
      });
    }
  } catch (err) {
    console.error('[server-stats] command error:', err);
    const reply = { content: 'An error occurred. Please try again later.', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}

export default { data, execute };
