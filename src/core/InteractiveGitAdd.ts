import inquirer from 'inquirer';
import chalk from 'chalk';
import { StatusModule } from '../modules/status';
import { CommitModule } from '../modules/commit';
import { PushModule } from '../modules/push';
import { BranchModule } from '../modules/branch';
import { HistoryModule } from '../modules/history';
import { StashModule } from '../modules/stash';
import { TagModule } from '../modules/tag';
import { RemoteModule } from '../modules/remote';
import { ConfigModule } from '../modules/config';
import { MenuModule } from '../modules/menu';
import { Logger } from '../utils/logger';
import { FileStatus, GitAddOptions, SelectedFiles, InteractiveGitAddInterface } from '../types';

const version = require('../../package.json').version;

import simpleGit, { SimpleGit } from 'simple-git';

export class InteractiveGitAdd implements InteractiveGitAddInterface {
  private selectedFiles: SelectedFiles = { addedFiles: [] };
  private statusModule: StatusModule;
  private commitModule: CommitModule;
  private pushModule: PushModule;
  private branchModule: BranchModule;
  private historyModule: HistoryModule;
  private stashModule: StashModule;
  private tagModule: TagModule;
  private remoteModule: RemoteModule;
  private configModule: ConfigModule;
  private menuModule: MenuModule;
  protected git: SimpleGit;

  constructor(basePath?: string) {
    this.git = simpleGit(basePath || process.cwd());
    this.statusModule = new StatusModule(basePath);
    this.commitModule = new CommitModule(basePath);
    this.pushModule = new PushModule(basePath);
    this.branchModule = new BranchModule(basePath);
    this.historyModule = new HistoryModule(basePath);
    this.stashModule = new StashModule(basePath);
    this.tagModule = new TagModule(basePath);
    this.remoteModule = new RemoteModule(basePath);
    this.configModule = new ConfigModule(basePath);
    this.menuModule = new MenuModule(basePath);
    this.selectedFiles = { addedFiles: [] };
  }

  /**
   * 显示主菜单
   */
  async showMainMenu(): Promise<void> {
    await this.menuModule.showWelcomeMessage(version);

    while (true) {
      const action = await this.menuModule.showMainMenu();

      switch (action) {
        case 'status':
          await this.showStatus();
          break;
        case 'commit':
          await this.addSelectedFiles();
          break;
        case 'branches':
          await this.branchModule.manageBranches();
          break;
        case 'history':
          await this.historyModule.viewCommitHistory();
          break;
        case 'stash':
          await this.stashModule.manageStash();
          break;
        case 'tags':
          await this.tagModule.manageTags();
          break;
        case 'remote':
          await this.remoteModule.manageRemote();
          break;
        case 'config':
          await this.configModule.manageConfig();
          break;
        case 'advanced':
          await this.showAdvancedTools();
          break;
        case 'exit':
          await this.menuModule.showGoodbyeMessage();
          process.exit(0);
      }

      // 在每个操作后暂停，让用户看清结果
      if (action !== 'exit') {
        await this.pauseForUser();
      }
    }
  }

  /**
   * 显示高级工具菜单
   */
  private async showAdvancedTools(): Promise<void> {
    const action = await this.menuModule.showAdvancedTools();
    
    switch (action) {
      case 'rebase':
        Logger.info('交互式 Rebase 功能开发中...');
        break;
      case 'cherrypick':
        Logger.info('Cherry-pick 功能开发中...');
        break;
      case 'bisect':
        Logger.info('Git Bisect 功能开发中...');
        break;
      case 'back':
        return;
    }
  }

  /**
   * 等待用户按键继续
   */
  private async pauseForUser(): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: '按回车键继续...'
      }
    ]);
  }

  /**
   * 获取修改过的文件列表
   */
  async getModifiedFiles(): Promise<FileStatus[]> {
    return await this.statusModule.getModifiedFiles();
  }

  /**
   * 显示 git 状态
   */
  async showStatus(): Promise<void> {
    await this.statusModule.showStatus();
  }

  /**
   * 交互式提交
   */
  async interactiveCommit(): Promise<void> {
    await this.commitModule.interactiveCommit(this.selectedFiles.addedFiles);
  }

  /**
   * 交互式推送
   */
  async interactivePush(): Promise<void> {
    await this.pushModule.interactivePush();
  }

  /**
   * 检查远程分支状态
   */
  async checkRemoteBranches(): Promise<any[]> {
    return await this.pushModule.checkRemoteBranches();
  }

  /**
   * 显示远程分支状态
   */
  displayRemoteBranchesStatus(branches: any[]): void {
    this.pushModule.displayRemoteBranchesStatus(branches);
  }

  /**
   * 分支管理
   */
  async manageBranches(): Promise<void> {
    await this.branchModule.manageBranches();
  }

  /**
   * 显示提交历史
   */
  async showCommitHistory(): Promise<void> {
    await this.historyModule.viewCommitHistory();
  }

  /**
   * 撤销操作
   */
  async undoChanges(): Promise<void> {
    const status = await this.statusModule.getStatus();
    
    // 检查是否有未暂存的修改
    const hasUnstagedChanges = status.modified.length > 0 || status.created.length > 0;
    // 检查是否有已暂存的修改
    const hasStagedChanges = status.staged.length > 0;
    
    const choices = [];
    
    if (hasStagedChanges) {
      choices.push({ name: '撤销暂存（将已暂存的文件恢复为未暂存）', value: 'unstage' });
    }
    
    if (hasUnstagedChanges) {
      choices.push({ name: '撤销修改（丢弃未暂存的更改）', value: 'discard' });
    }
    
    choices.push({ name: '撤销上次提交（保留更改）', value: 'softReset' });
    choices.push({ name: '完全撤销上次提交（丢弃所有更改）', value: 'hardReset' });
    choices.push({ name: '返回', value: 'back' });
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择要执行的撤销操作：',
        choices
      }
    ]);
    
    try {
      switch (action) {
        case 'unstage':
          await this.git.reset();
          Logger.success('已撤销所有暂存');
          await this.showStatus();
          break;
        case 'discard':
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: '警告：此操作将永久丢弃所有未暂存的更改，确定要继续吗？',
              default: false
            }
          ]);
          
          if (confirm) {
            await this.git.checkout(['--', '.']);
            Logger.success('已丢弃所有未暂存的更改');
            await this.showStatus();
          } else {
            Logger.info('撤销操作已取消');
          }
          break;
        case 'softReset':
          await this.git.reset(['--soft', 'HEAD~1']);
          Logger.success('已撤销上次提交，更改已保留在暂存区');
          await this.showStatus();
          break;
        case 'hardReset':
          const { confirmHard } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmHard',
              message: '警告：此操作将永久丢弃上次提交的所有更改，确定要继续吗？',
              default: false
            }
          ]);
          
          if (confirmHard) {
            await this.git.reset(['--hard', 'HEAD~1']);
            Logger.success('已完全撤销上次提交');
            await this.showStatus();
          } else {
            Logger.info('撤销操作已取消');
          }
          break;
        case 'back':
          break;
      }
    } catch (error) {
      Logger.error(`执行撤销操作时出错：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ... 其他现有方法保持不变（selectFiles, executeGitAdd, resetSelectedFiles, addSelectedFiles 等）
  // 这些方法的实现与之前相同，只是现在使用模块化的方式

  /**
   * 格式化文件状态显示
   */
  private formatFileStatus(file: FileStatus): string {
    const statusMap: { [key: string]: { text: string; color: (text: string) => string } } = {
      'M': { text: '修改', color: chalk.yellow },
      'A': { text: '新增', color: chalk.green },
      'D': { text: '删除', color: chalk.red },
      'R': { text: '重命名', color: chalk.blue }
    };

    const statusInfo = statusMap[file.index] || { text: file.index, color: chalk.white };
    const statusText = statusInfo.color(statusInfo.text);
    const stagedIndicator = file.isStaged ? ' [' + chalk.green('已暂存') + ']' : '';
    return `[${statusText}] ${file.path}${stagedIndicator}`;
  }

  /**
   * 交互式选择文件
   */
  private async selectFiles(files: FileStatus[]): Promise<string[]> {
    if (files.length === 0) {
      Logger.warning('没有找到修改过的文件');
      return [];
    }

    // 分离已暂存和未暂存的文件
    const stagedFiles = files.filter(file => file.isStaged);
    const unstagedFiles = files.filter(file => !file.isStaged);

    // 已暂存的文件默认选中且不可取消
    const stagedChoices = stagedFiles.map(file => ({
      name: this.formatFileStatus(file),
      value: file.path,
      checked: true,
      disabled: true
    }));

    // 未暂存的文件让用户选择
    const unstagedChoices = unstagedFiles.map(file => ({
      name: this.formatFileStatus(file),
      value: file.path,
      checked: false
    }));

    const choices = [
      ...(stagedFiles.length > 0 ? [
        new inquirer.Separator(' = 已暂存的文件（自动包含）= '),
        ...stagedChoices
      ] : []),
      ...(unstagedFiles.length > 0 ? [
        new inquirer.Separator(' = 未暂存的文件（请选择）= '),
        ...unstagedChoices
      ] : [])
    ];

    // 显示文件统计信息
    Logger.info(`找到 ${files.length} 个修改过的文件:`);
    if (stagedFiles.length > 0) {
      console.log(`  - ${stagedFiles.length} 个文件已在暂存区（自动包含在提交中）`);
    }
    if (unstagedFiles.length > 0) {
      console.log(`  - ${unstagedFiles.length} 个文件未暂存（请选择要添加的文件）`);
    }
    console.log('');

    const { selectedFiles } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFiles',
        message: '选择要添加到暂存区的文件：',
        choices: choices,
        pageSize: Math.min(20, choices.length + 3),
        validate: (answer: string[]) => {
          const totalSelected = answer.length + stagedFiles.length;
          if (totalSelected === 0) {
            return Logger.warning('请至少选择一个文件');
          }
          return true;
        }
      }
    ]);

    return [...stagedFiles.map(f => f.path), ...selectedFiles];
  }

  /**
   * 执行 git add
   */
  private async executeGitAdd(files: string[], showStatusAfterAdd: boolean = true): Promise<void> {
    if (files.length === 0) {
      return;
    }

    try {
      // 获取当前暂存状态，避免重复添加已暂存的文件
      const status = await this.statusModule.getStatus();
      const filesToAdd = files.filter(file => !status.staged.includes(file));

      if (filesToAdd.length > 0) {
        Logger.info('正在添加文件到暂存区...');

        for (const file of filesToAdd) {
          await this.statusModule.addFiles([file]);
          console.log(`✓ 已添加：${file}`);
        }
        Logger.success(`成功添加 ${filesToAdd.length} 个文件到暂存区`);
      } else {
        Logger.warning('所有选择的文件已在暂存区中');
      }

      if (showStatusAfterAdd) {
        await this.showStatus();
      }
    } catch (error) {
      this.resetSelectedFiles();
      throw new Error(`添加文件时出错：${error}`);
    }
  }

  /**
   * 重置选择的文件记录
   */
  private resetSelectedFiles(): void {
    this.selectedFiles = { addedFiles: [] };
  }

  /**
   * 交互式添加文件
   */
  async addSelectedFiles(options: GitAddOptions = {}): Promise<void> {
    const {
      showStatusAfterAdd = true,
      autoCommit = false,
      autoPush = false
    } = options;

    try {
      // 重置选择的文件
      this.resetSelectedFiles();
      console.log(chalk.green.bold(`\n👏 欢迎使用 snail-git-add@${version} 交互式 Git 工具\n`));
      // 检查是否在 git 仓库中
      const isRepo = await this.statusModule.checkIsRepo();
      if (!isRepo) {
        throw new Error('当前目录不是 git 仓库');
      }

      // 获取修改的文件（区分已暂存和未暂存）
      const files = await this.getModifiedFiles();

      if (files.length === 0) {
        Logger.warning('没有找到修改过的文件');
        return;
      }

      // 选择文件（已暂存的文件自动选中，未暂存的让用户选择）
      const selectedFiles = await this.selectFiles(files);

      if (selectedFiles.length > 0) {
        // 保存选择的文件
        this.selectedFiles.addedFiles = selectedFiles;

        // 执行 git add（只会添加新选择的未暂存文件）
        await this.executeGitAdd(selectedFiles, showStatusAfterAdd);

        // 询问是否提交
        let shouldCommit = autoCommit;
        if (!autoCommit) {
          const commitAnswer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'shouldCommit',
              message: '是否立即提交这些文件？',
              default: true
            }
          ]);
          shouldCommit = commitAnswer.shouldCommit;
        }

        if (shouldCommit) {
          await this.interactiveCommit();

          // 询问是否推送
          let shouldPush = autoPush;
          if (!autoPush) {
            const pushAnswer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'shouldPush',
                message: '是否立即推送到远程仓库？',
                default: true
              }
            ]);
            shouldPush = pushAnswer.shouldPush;
          }

          if (shouldPush) {
            await this.interactivePush();
          } else {
            Logger.warning('您可以在稍后使用 git push 命令推送到远程');
          }
        } else {
          Logger.warning('您可以在稍后使用 git commit 命令提交文件');
        }
      } else {
        Logger.warning('未选择任何文件，操作取消');
      }

    } catch (error) {
      this.resetSelectedFiles();
      Logger.error('错误：' + (error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}

// 导出创建新实例的函数
export const createInteractiveGitAdd = (basePath?: string) => {
  return new InteractiveGitAdd(basePath);
};