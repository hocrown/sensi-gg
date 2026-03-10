import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { initDB } from './supabase.js';
import { startRealtimeListener, recoverPending } from './sync.js';
import setupCommand from './commands/setup.js';
import serverStatsCommand from './commands/server-stats.js';
import { registerServer, getServerByGuildId, syncMemberships, addMembership, removeMembership } from './repositories/supabaseRepo.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, async () => {
  initDB();
  console.log(`[READY] ${client.user.tag} 봇이 준비되었습니다.`);

  // Recover any pending sync operations from while bot was offline
  await recoverPending(client).catch(err =>
    console.error('[sync] Recovery failed:', err)
  );

  // Sync memberships for all guilds on startup
  for (const [, guild] of client.guilds.cache) {
    try {
      const server = await getServerByGuildId(guild.id);
      if (!server) continue;
      const members = await guild.members.fetch();
      const count = await syncMemberships(server.id, members);
      if (count > 0) {
        console.log(`[membership] Synced ${count} member(s) for ${guild.name}`);
      }
    } catch (err) {
      console.error(`[membership] Sync failed for ${guild.name}:`, err.message);
    }
  }

  // Start Supabase Realtime listener for web → bot sync
  startRealtimeListener(client);
});

// Auto-register server when bot joins a new guild
client.on(Events.GuildCreate, async (guild) => {
  try {
    const server = await registerServer(guild);
    console.log(`[guild] Registered server: ${guild.name} (${guild.id}) → /s/${server.slug}`);
  } catch (err) {
    console.error(`[guild] Failed to register ${guild.name}:`, err);
  }
});

// Sync membership when a member joins a guild
client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.bot) return;
  try {
    const server = await getServerByGuildId(member.guild.id);
    if (!server) return;
    const added = await addMembership(server.id, member.user.id);
    if (added) console.log(`[membership] Added ${member.user.tag} to ${member.guild.name}`);
  } catch (err) {
    console.error(`[membership] Add failed:`, err.message);
  }
});

// Remove membership when a member leaves a guild
client.on(Events.GuildMemberRemove, async (member) => {
  if (member.user.bot) return;
  try {
    const server = await getServerByGuildId(member.guild.id);
    if (!server) return;
    const removed = await removeMembership(server.id, member.user.id);
    if (removed) console.log(`[membership] Removed ${member.user.tag} from ${member.guild.name}`);
  } catch (err) {
    console.error(`[membership] Remove failed:`, err.message);
  }
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
