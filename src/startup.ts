import figlet from 'figlet';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

const GRADIENT = [
  [0,   180,  80],
  [0,   200,  95],
  [20,  220, 110],
  [45,  235, 120],
  [70,  245, 135],
  [95,  252, 148],
  [120, 255, 165],
  [150, 255, 185],
] as const;

function gradientText(text: string): string {
  const lines = text.split('\n');
  return lines
    .map((line, i) => {
      const [r, g, b] = GRADIENT[Math.min(i, GRADIENT.length - 1)]!;
      return chalk.rgb(r, g, b)(line);
    })
    .join('\n');
}

function dbLabel(url: string): string {
  if (url.startsWith('file:'))    return chalk.cyan('SQLite');
  if (url.startsWith('mysql:') || url.startsWith('mariadb:')) return chalk.yellow('MariaDB/MySQL');
  if (url.startsWith('postgres')) return chalk.blue('PostgreSQL');
  return chalk.gray('Unknown');
}

export function printBanner(): void {
  const banner = figlet.textSync('OFFHUNTER', { font: 'Big' });
  console.log('\n' + gradientText(banner));
  console.log(
    chalk.gray('  ') +
    chalk.bold.white('Discord Deal Bot') +
    chalk.gray('  ·  ') +
    chalk.dim('marktguru.de'),
  );
  console.log(chalk.gray('  ' + '─'.repeat(52)) + '\n');
}

export function spin(text: string): Ora {
  return ora({ text: chalk.gray(text), color: 'green' }).start();
}

export function stepDone(label: string, detail?: string): void {
  const d = detail ? chalk.gray(' — ') + chalk.white(detail) : '';
  console.log(chalk.green('  ✔  ') + chalk.bold.white(label) + d);
}

export function printDbStep(): void {
  const url = process.env['DATABASE_URL'] ?? '';
  stepDone('Database', dbLabel(url));
}

export function printReady(tag: string): void {
  console.log('\n' + chalk.gray('  ' + '─'.repeat(52)));
  console.log(
    chalk.green('  ★  ') +
    chalk.bold.greenBright('OFFHUNTER is live') +
    chalk.gray('  ·  ') +
    chalk.cyan(tag),
  );
  console.log(chalk.gray('  ' + '─'.repeat(52)) + '\n');
}
