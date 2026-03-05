import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import command from '../src/commands/세팅등록.js';
import editCommand from '../src/commands/세팅수정.js';
import searchCommand from '../src/commands/세팅검색.js';
import deleteCommand from '../src/commands/세팅삭제.js';
import setupCommand from '../src/commands/setup.js';
import serverStatsCommand from '../src/commands/server-stats.js';

const commands = [command.data.toJSON(), editCommand.data.toJSON(), searchCommand.data.toJSON(), deleteCommand.data.toJSON(), setupCommand.data.toJSON(), serverStatsCommand.data.toJSON()];

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
