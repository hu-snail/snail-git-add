// src/modules/history.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';

export class HistoryModule extends GitBase {
  async viewCommitHistory(): Promise<void> {
    const { limit } = await inquirer.prompt([
      {
        type: 'number',
        name: 'limit',
        message: '显示最近的提交数量：',
        default: 10,
        validate: (input: number) => input > 0 && input <= 100
      }
    ]);

    const log = await this.getLog(limit);
    
    Logger.info(`最近 ${limit} 个提交:`);
    
    log.all.forEach((commit, index) => {
      console.log(`提交 ${index + 1}:`);
      console.log(`哈希：${commit.hash.slice(0, 8)}`);
      console.log(`作者：${commit.author_name}`);
      console.log(`日期：${commit.date}`);
      console.log(`信息：${commit.message}`);
      console.log('─'.repeat(50));
    });
  }
}