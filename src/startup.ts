import figlet from 'figlet';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

export function printBanner(): void {
  const banner = figlet.textSync('OFFHUNTER', { font: 'Big' });
  console.log('\n' + chalk.green(banner));
  console.log(chalk.gray('  Discord Deal Bot  ·  marktguru.de'));
  console.log(chalk.gray('  ' + '─'.repeat(52)) + '\n');
}

export function spin(text: string): Ora {
  return ora({ text, color: 'green' }).start();
}

export function info(text: string): void {
  console.log(chalk.gray('  ') + text);
}

export function success(text: string): void {
  console.log(chalk.green('  ✔ ') + chalk.white(text));
}
