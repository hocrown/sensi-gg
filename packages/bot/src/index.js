import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { initDB } from './supabase.js';
import { startRealtimeListener, recoverPending } from './sync.js';
import setupCommand from './commands/setup.js';
import serverStatsCommand from './commands/server-stats.js';

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
      // Legacy Forum-as-DB commands — deprecated after web-first migration (002)
      if (['세팅등록', '세팅수정', '세팅검색', '세팅삭제'].includes(interaction.commandName)) {
        await interaction.reply({
          content: `이 명령어는 웹 전환으로 더 이상 사용되지 않습니다.\n세팅 등록/수정: ${process.env.WEB_URL || 'https://sensi.gg'}/setup/me`,
          ephemeral: true,
        });
      } else if (interaction.commandName === 'setup') {
        await setupCommand.execute(interaction);
      } else if (interaction.commandName === 'server-stats') {
        await serverStatsCommand.execute(interaction);
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
