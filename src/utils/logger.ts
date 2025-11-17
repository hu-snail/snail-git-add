import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }

  static success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  static warning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  static error(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
  }

  static step(message: string): void {
    console.log(chalk.cyan(`📝 ${message}`));
  }

  static progress(message: string): void {
    process.stdout.write(chalk.blue(`🔄 ${message}`));
  }

  static clearLine(): void {
    process.stdout.write('\r');
  }
}
