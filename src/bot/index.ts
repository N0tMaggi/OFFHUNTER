import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  Events,
  Interaction,
  MessageFlags,
} from 'discord.js';
import chalk from 'chalk';
import { DISCORD_TOKEN } from '../config.js';
import { initScheduler } from '../scheduler/index.js';
import { handleButton } from './handlers/buttonHandler.js';
import { printBanner, spin, stepDone, printDbStep, printReady } from '../startup.js';
import prisma from '../db/index.js';
import * as deals from './commands/deals.js';
import * as setup from './commands/setup.js';
import { locale } from '../i18n/index.js';

const commands = new Collection([
  [locale.commands.deals.name, { data: deals.data, execute: deals.execute }],
  [locale.commands.setup.name, { data: setup.data, execute: setup.execute }],
]);

async function main(): Promise<void> {
  printBanner();

  const dbSpinner = spin('Connecting to database...');
  await prisma.$connect();
  dbSpinner.stop();
  printDbStep();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async (c) => {
    const cmdSpinner = spin('Registering slash commands...');
    const rest = new REST().setToken(DISCORD_TOKEN);
    const body = [...commands.values()].map(cmd => cmd.data.toJSON());
    try {
      await rest.put(Routes.applicationCommands(c.user.id), { body });
      cmdSpinner.stop();
      stepDone('Commands', `${commands.size} registered`);
    } catch (err) {
      cmdSpinner.fail(chalk.red('Failed to register slash commands'));
      console.error(err);
    }

    const schedSpinner = spin('Starting scheduler...');
    const count = await initScheduler(c);
    schedSpinner.stop();
    stepDone('Scheduler', `${count} guild${count !== 1 ? 's' : ''} loaded`);

    printReady(c.user.tag);
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isButton()) {
      try { await handleButton(interaction); } catch (err) {
        console.error('[button]', err);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[cmd:${interaction.commandName}]`, err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'Something went wrong.' }).catch(() => {});
      } else {
        await interaction.reply({ content: 'Something went wrong.', flags: MessageFlags.Ephemeral }).catch(() => {});
      }
    }
  });

  const loginSpinner = spin('Logging in to Discord...');
  try {
    await client.login(DISCORD_TOKEN);
    loginSpinner.stop();
  } catch (err) {
    loginSpinner.fail(chalk.red('Login failed — check your DISCORD_TOKEN'));
    console.error(err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(chalk.red('\n  Fatal:'), err);
  process.exit(1);
});
