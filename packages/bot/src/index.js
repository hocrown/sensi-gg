import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { initDB } from './supabase.js';
import { startRealtimeListener, recoverPending } from './sync.js';
import setupCommand from './commands/setup.js';
import serverStatsCommand from './commands/server-stats.js';
import { handleSearchButton, handleLikeButton, handleDeleteButton } from './handlers/buttonHandler.js';
import { handleSelectMenu } from './handlers/selectMenu.js';
import { handleModal, handleEditModal } from './handlers/modal.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  initDB();
  console.log(`[READY] ${client.user.tag} 봇이 준비되었습니다.`);

  // Recover any pending sync operations from while bot was offline
  await recoverPending(client).catch(err =>
    console.error('[sync] Recovery failed:', err)
  );

  // Start Supabase Realtime listener for web → bot sync
  startRealtimeListener(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'setup') {
        await setupCommand.execute(interaction);
      } else if (interaction.commandName === 'server-stats') {
        await serverStatsCommand.execute(interaction);
      }
    } else if (interaction.isButton()) {
      const id = interaction.customId;
      if (id.startsWith('search_prev_') || id.startsWith('search_next_')) {
        await handleSearchButton(interaction);
      } else if (id.startsWith('setup_like_')) {
        await handleLikeButton(interaction);
      } else if (id === 'setup_delete_confirm' || id === 'setup_delete_cancel') {
        await handleDeleteButton(interaction, client);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'setup_select' || interaction.customId === 'setup_edit_select') {
        await handleSelectMenu(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('setup_edit_modal_')) {
        await handleEditModal(interaction, client);
      } else if (interaction.customId.startsWith('setup_modal_')) {
        await handleModal(interaction, client);
      }
    }
  } catch (error) {
    console.error('[ERROR] Interaction 처리 중 오류:', error);
    const replyOptions = {
      content: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions).catch(() => {});
    } else {
      await interaction.reply(replyOptions).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
