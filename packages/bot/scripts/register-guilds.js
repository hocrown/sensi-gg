import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`Found ${client.guilds.cache.size} guild(s)`);

  for (const [, guild] of client.guilds.cache) {
    const slug = guild.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '') || guild.id;

    const iconUrl = guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : null;

    const { data, error } = await supabase.from('servers').upsert({
      guild_id: guild.id,
      name: guild.name,
      slug,
      icon_url: iconUrl,
      owner_discord_id: guild.ownerId,
      member_count: guild.memberCount,
    }, { onConflict: 'guild_id' }).select().single();

    if (error) {
      console.error(`Failed: ${guild.name}`, error.message);
    } else {
      console.log(`Registered: ${guild.name} (${guild.id}) → /s/${data.slug}`);
    }
  }

  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
