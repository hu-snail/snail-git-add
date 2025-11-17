import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { Validators } from '../utils/validators';
import { COMMIT_TYPES } from '../constants';
import { CommitInfo } from '../types';

export class CommitModule extends GitBase {
  async interactiveCommit(selectedFiles: string[] = []): Promise<void> {
    try {
      // 检查是否有已暂存的文件
      const status = await this.getStatus();
      if (status.staged.length === 0) {
        Logger.warning('没有已暂存的文件可以提交');
        return;
      }

      // 显示实际选择的文件
      Logger.info('准备提交以下文件：');
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file}`);
        });
      } else {
        status.staged.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file}`);
        });
      }

      const commitInfo = await this.collectCommitInfo();
      if (!commitInfo) {
        Logger.warning('提交已取消');
        return;
      }

      const commitMessage = this.generateCommitMessage(commitInfo);

      Logger.info('提交信息：');
      console.log('---');
      console.log(commitMessage);
      console.log('---');

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确认执行提交？',
          default: true
        }
      ]);

      if (!confirm) {
        Logger.warning('提交已取消');
        return;
      }

      Logger.progress('正在提交...');
      await this.commit(commitMessage);
      Logger.clearLine();
      Logger.success('提交成功！');

      // 显示提交后的状态
      const newStatus = await this.getStatus();
      if (newStatus.ahead > 0) {
        Logger.info(`领先远程分支 ${newStatus.ahead} 个提交`);
      }

    } catch (error) {
      throw new Error(`提交时出错：${error}`);
    }
  }

  private async collectCommitInfo(): Promise<CommitInfo> {
    Logger.info('填写提交信息');

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择提交类型：',
        choices: COMMIT_TYPES,
        pageSize: 12
      },
      {
        type: 'input',
        name: 'scope',
        message: '输入作用域 (可选，如模块名):',
        validate: Validators.scope
      },
      {
        type: 'input',
        name: 'subject',
        message: '输入提交主题：',
        validate: Validators.subject
      },
      {
        type: 'input',
        name: 'body',
        message: '输入详细描述 (可选):',
        default: ''
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: '确认提交？',
        default: true
      }
    ]);

    // 清理 body 中的注释行
    const cleanBody = answers.body
      ? answers.body.split('\n')
          .filter((line: string) => !line.startsWith('#'))
          .join('\n')
          .trim()
      : undefined;

    return {
      type: answers.type,
      scope: answers.scope || undefined,
      subject: answers.subject.trim(),
      body: cleanBody
    };
  }

  private generateCommitMessage(commitInfo: CommitInfo): string {
    let message = commitInfo.type;

    if (commitInfo.scope) {
      message += `(${commitInfo.scope})`;
    }

    message += `: ${commitInfo.subject}`;

    if (commitInfo.body) {
      message += `\n\n${commitInfo.body}`;
    }

    return message;
  }
}