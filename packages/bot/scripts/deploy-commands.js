import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import setupCommand from '../src/commands/setup.js';
import serverStatsCommand from '../src/commands/server-stats.js';

const commands = [setupCommand.data.toJSON(), serverStatsCommand.data.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[DEPLOY] ${commands.length}개의 슬래시 커맨드 등록 중...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`[DEPLOY] ${commands.length}개의 슬래시 커맨드 등록 완료!`);
  } catch (error) {
    console.error('[DEPLOY] 커맨드 등록 중 오류:', error);
  }
})();
