// src/commands/setup.js — /setup me | /setup user | /setup share
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getSetupByDiscordUserId, getSetupByHandle, getProfileByDiscordUserId } from '../repositories/supabaseRepo.js';
import { WEB_URL } from '../config.js';
import { EMBED_COLOR } from '@sensi-gg/shared';

/**
 * Build a setup summary embed for a given combined profile+setup result.
 * @param {object} result - From getSetupByDiscordUserId or getSetupByHandle
 * @returns {{ embed: EmbedBuilder, components: ActionRowBuilder[] }}
 */
function buildSetupEmbed(result) {
  const { profile, setup } = result;
  const edpi = result.edpi;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setAuthor({
      name: profile.display_name,
      iconURL: profile.avatar_url || undefined,
    })
    .setTitle('PUBG Setup')
    .setFooter({ text: 'SENSI.GG' })
    .setTimestamp(new Date(setup.updated_at));

  // Sensitivity summary
  const sensLines = [`DPI: ${setup.dpi} | General: ${setup.general_sens} | eDPI: ${Math.round(edpi).toLocaleString()}`];
  if (setup.ads_sens != null) sensLines.push(`ADS: ${setup.ads_sens}`);
  const scopeParts = [];
  if (setup.scope_2x != null) scopeParts.push(`2x ${setup.scope_2x}`);
  if (setup.scope_4x != null) scopeParts.push(`4x ${setup.scope_4x}`);
  if (setup.scope_6x != null) scopeParts.push(`6x ${setup.scope_6x}`);
  if (setup.scope_8x != null) scopeParts.push(`8x ${setup.scope_8x}`);
  if (scopeParts.length > 0) sensLines.push(scopeParts.join(' / '));

  embed.addFields({ name: 'Sensitivity', value: sensLines.join('\n'), inline: false });

  // Gear summary
  const gearLines = [];
  if (setup.mouse) gearLines.push(`Mouse: ${setup.mouse}`);
  if (setup.keyboard) gearLines.push(`Keyboard: ${setup.keyboard}`);
  if (setup.monitor) gearLines.push(`Monitor: ${setup.monitor}`);
  if (setup.headset) gearLines.push(`Headset: ${setup.headset}`);
  if (gearLines.length > 0) {
    embed.addFields({ name: 'Gear', value: gearLines.join('\n'), inline: false });
  }

  // Web link button
  const webButton = new ButtonBuilder()
    .setLabel('View on Web')
    .setStyle(ButtonStyle.Link)
    .setURL(`${WEB_URL}/u/${profile.handle}`);

  const components = [new ActionRowBuilder().addComponents(webButton)];

  return { embed, components };
}

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('PUBG setup viewer')
  .addSubcommand(sub =>
    sub.setName('me')
      .setDescription('View my PUBG setup'))
  .addSubcommand(sub =>
    sub.setName('user')
      .setDescription('View another user\'s PUBG setup')
      .addStringOption(opt =>
        opt.setName('handle')
          .setDescription('User handle or @mention')
          .setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('share')
      .setDescription('Share my setup link in the channel'));

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    if (subcommand === 'me') {
      const result = await getSetupByDiscordUserId(interaction.user.id);
      if (!result) {
        return interaction.reply({
          content: `No setup found. Register on the web: ${WEB_URL}/setup/me`,
          flags: 64,
        });
      }

      const { embed, components } = buildSetupEmbed(result);
      await interaction.reply({ embeds: [embed], components, flags: 64 });

    } else if (subcommand === 'user') {
      const handleInput = interaction.options.getString('handle');

      // Check if it's a mention format <@123456> — only extract numeric ID
      const mentionMatch = handleInput.match(/^<@!?(\d+)>$/);
      let result;

      if (mentionMatch) {
        result = await getSetupByDiscordUserId(mentionMatch[1]);
      } else {
        // Try as handle first, then as Discord user ID
        result = await getSetupByHandle(handleInput);
        if (!result) {
          result = await getSetupByDiscordUserId(handleInput);
        }
      }

      if (!result) {
        return interaction.reply({
          content: 'No setup found for that user.',
          flags: 64,
        });
      }

      const { embed, components } = buildSetupEmbed(result);
      await interaction.reply({ embeds: [embed], components, flags: 64 });

    } else if (subcommand === 'share') {
      const profile = await getProfileByDiscordUserId(interaction.user.id);
      if (!profile) {
        return interaction.reply({
          content: `No profile found. Register on the web: ${WEB_URL}/setup/me`,
          flags: 64,
        });
      }

      const displayName = profile.display_name || interaction.user.username;
      // NOT ephemeral — designed for channel sharing
      await interaction.reply({
        content: `${displayName}'s PUBG Setup: ${WEB_URL}/u/${profile.handle}`,
      });
    }
  } catch (err) {
    console.error('[setup] command error:', err);
    const reply = { content: 'An error occurred. Please try again later.', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}

export default { data, execute };
