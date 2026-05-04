import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { DISCORD_TOKEN } from '../config';
import { initScheduler } from '../scheduler';
import * as deals from './commands/deals';
import * as setup from './commands/setup';

const commands = new Collection([
  ['deals', { data: deals.data, execute: deals.execute }],
  ['setup', { data: setup.data, execute: setup.execute }],
]);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`[bot] Logged in as ${client.user!.tag}`);

  const rest = new REST().setToken(DISCORD_TOKEN);
  const body = [...commands.values()].map(c => c.data.toJSON());

  try {
    await rest.put(Routes.applicationCommands(client.user!.id), { body });
    console.log('[bot] Slash commands registered globally.');
  } catch (err) {
    console.error('[bot] Failed to register commands:', err);
  }

  await initScheduler(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[bot] Command error (${interaction.commandName}):`, err);
    const msg = { content: 'Ein Fehler ist aufgetreten.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.login(DISCORD_TOKEN);
