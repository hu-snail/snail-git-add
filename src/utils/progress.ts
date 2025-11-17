import chalk from 'chalk';

export class Progress {
  private interval: NodeJS.Timeout | null = null;

  showLoading(text: string = '处理中...'): NodeJS.Timeout {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    this.interval = setInterval(() => {
      process.stdout.write(`\r${chalk.blue(frames[i])} ${chalk.blue(text)}`);
      i = (i + 1) % frames.length;
    }, 100);

    return this.interval;
  }

  stopLoading(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write('\r');
  }

  static showPushLoading(): NodeJS.Timeout {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    const interval = setInterval(() => {
      process.stdout.write(`\r${chalk.blue(frames[i])} ${chalk.blue('推送中...')}`);
      i = (i + 1) % frames.length;
    }, 100);

    return interval;
  }

  static stopPushLoading(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    process.stdout.write('\r');
  }
}
