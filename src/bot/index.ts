import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  Events,
  Interaction,
} from 'discord.js';
import chalk from 'chalk';
import { DISCORD_TOKEN } from '../config';
import { initScheduler } from '../scheduler';
import { handleButton } from './handlers/buttonHandler';
import { printBanner, spin, success } from '../startup';
import prisma from '../db';
import * as deals from './commands/deals';
import * as setup from './commands/setup';

const commands = new Collection([
  ['deals', { data: deals.data, execute: deals.execute }],
  ['setup', { data: setup.data, execute: setup.execute }],
]);

async function main(): Promise<void> {
  printBanner();

  const dbSpinner = spin('Connecting to database...');
  await prisma.$connect();
  dbSpinner.succeed(chalk.white('Database connected'));

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async (c) => {
    const cmdSpinner = spin('Registering slash commands...');
    const rest = new REST().setToken(DISCORD_TOKEN);
    const body = [...commands.values()].map(cmd => cmd.data.toJSON());
    try {
      await rest.put(Routes.applicationCommands(c.user.id), { body });
      cmdSpinner.succeed(chalk.white(`Slash commands registered  (${commands.size})`));
    } catch (err) {
      cmdSpinner.fail('Failed to register slash commands');
      console.error(err);
    }

    const schedSpinner = spin('Loading scheduler...');
    const count = await initScheduler(c);
    schedSpinner.succeed(chalk.white(`Scheduler ready  (${count} guild${count !== 1 ? 's' : ''})`));

    console.log('\n' + chalk.green('  ✔ ') + chalk.bold.white(`Online as ${c.user.tag}`) + '\n');
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isButton()) {
      try {
        await handleButton(interaction);
      } catch (err) {
        console.error('[button] Error:', err);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[command:${interaction.commandName}] Error:`, err);
      const msg = { content: 'Something went wrong.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
  });

  const loginSpinner = spin('Logging in to Discord...');
  try {
    await client.login(DISCORD_TOKEN);
    loginSpinner.stop();
  } catch (err) {
    loginSpinner.fail('Login failed — check your DISCORD_TOKEN');
    console.error(err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
