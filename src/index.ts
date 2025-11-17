import inquirer from 'inquirer';
import simpleGit, { SimpleGit, StatusResult, BranchSummary, PushResult } from 'simple-git';
import chalk from 'chalk';
import { FileStatus, GitAddOptions, CommitInfo, RemoteBranchInfo, InteractiveGitAddInterface, SelectedFiles } from './types';

const version = require('../package.json').version;

export class InteractiveGitAdd implements InteractiveGitAddInterface {
  private git: SimpleGit;
  private selectedFiles: SelectedFiles = { addedFiles: [] };

  constructor(basePath?: string) {
    this.git = simpleGit(basePath || process.cwd());
    this.selectedFiles = { addedFiles: [] };
  }

  /**
   * 获取修改过的文件列表（区分已暂存和未暂存）
   */
  async getModifiedFiles(): Promise<FileStatus[]> {
    try {
      const status: StatusResult = await this.git.status();

      // 已暂存的文件
      const stagedFiles: FileStatus[] = [
        ...status.staged.map(path => ({
          path,
          index: 'M',
          working_dir: ' ',
          isStaged: true
        }))
      ];

      // 未暂存的文件
      const unstagedFiles: FileStatus[] = [
        ...status.modified.filter(path => !status.staged.includes(path)).map(path => ({
          path,
          index: 'M',
          working_dir: ' ',
          isStaged: false
        })),
        // 未跟踪的文件 = 新增文件
        ...status.not_added.map(path => ({
          path,
          index: 'A',
          working_dir: ' ',
          isStaged: false
        })),
        ...status.deleted.filter(path => !status.staged.includes(path)).map(path => ({
          path,
          index: 'D',
          working_dir: ' ',
          isStaged: false
        })),
        ...status.renamed.filter(rename => !status.staged.includes(rename.to)).map(rename => ({
          path: rename.to,
          index: 'R',
          working_dir: ' ',
          isStaged: false
        }))
      ];

      return [...stagedFiles, ...unstagedFiles];
    } catch  {
      throw new Error('当前目录不是 git 仓库');
    }
  }

  /**
   * 格式化文件状态显示
   */
  private formatFileStatus(file: FileStatus): string {
    const statusMap: { [key: string]: string } = {
      'M': chalk.yellow('修改'),
      'A': chalk.green('新增'),
      'D': chalk.red('删除'),
      'R': chalk.blue('重命名')
    };

    const statusText = statusMap[file.index] || file.index;
    const stagedIndicator = file.isStaged ? chalk.green(' [已暂存]') : '';
    return `[${statusText}] ${file.path}${stagedIndicator}`;
  }

  /**
   * 交互式选择文件
   */
  private async selectFiles(files: FileStatus[]): Promise<string[]> {
    if (files.length === 0) {
      console.log(chalk.yellow('没有找到修改过的文件'));
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
      disabled: true  // 已暂存的文件不可取消选择
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
    console.log(chalk.blue(`📁 找到 ${files.length} 个修改过的文件:`));
    if (stagedFiles.length > 0) {
      console.log(chalk.green(`  - ${stagedFiles.length} 个文件已在暂存区（自动包含在提交中）`));
    }
    if (unstagedFiles.length > 0) {
      console.log(chalk.yellow(`  - ${unstagedFiles.length} 个文件未暂存（请选择要添加的文件）`));
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
          // 即使未选择任何未暂存文件，只要有已暂存文件也是有效的
          const totalSelected = answer.length + stagedFiles.length;
          if (totalSelected === 0) {
            return chalk.red('请至少选择一个文件');
          }
          return true;
        }
      }
    ]);

    // 返回所有选中的文件（包括已暂存的和用户选择的未暂存文件）
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
      const status = await this.git.status();
      const filesToAdd = files.filter(file => !status.staged.includes(file));

      if (filesToAdd.length > 0) {
        console.log(chalk.blue('\n正在添加文件到暂存区...'));

        for (const file of filesToAdd) {
          await this.git.add(file);
          console.log(chalk.green(`✓ 已添加：${file}`));
        }
        console.log(chalk.green(`\n✅ 成功添加 ${filesToAdd.length} 个文件到暂存区`));
      } else {
        console.log(chalk.yellow('\n所有选择的文件已在暂存区中'));
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
   * 显示 git 状态
   */
  async showStatus(): Promise<void> {
    try {
      const status = await this.git.status();

      console.log(chalk.blue('\n当前 Git 状态：'));
      console.log(`分支：${chalk.green(status.current)}`);

      if (status.staged.length > 0) {
        console.log(chalk.green('\n已暂存的文件：'));
        status.staged.forEach(file => console.log(chalk.cyan(`  ${file}`)));
      }

      const unstagedFiles = [
        ...status.modified,
        ...status.not_added,
        ...status.deleted,
        ...status.created
      ];

      if (unstagedFiles.length > 0) {
        console.log(chalk.yellow('\n未暂存的文件：'));
        unstagedFiles.forEach(file => console.log(`  ${file}`));
      }

      // 显示远程信息
      if (status.tracking) {
        console.log(chalk.blue('\n远程分支信息：'));
        console.log(`跟踪分支：${chalk.cyan(status.tracking)}`);
        if (status.ahead > 0) {
          console.log(chalk.green(`领先远程：${status.ahead} 个提交`));
        }
        if (status.behind > 0) {
          console.log(chalk.yellow(`落后远程：${status.behind} 个提交`));
        }
      }
    } catch {
      throw new Error('获取 git 状态时出错');
    }
  }

  /**
   * 检查远程分支状态
   */
  async checkRemoteBranches(): Promise<RemoteBranchInfo[]> {
    try {
      console.log(chalk.blue('🔄 检查远程分支状态...'));

      // 获取远程更新
      await this.git.fetch();

      const status = await this.git.status();
      const branches: RemoteBranchInfo[] = [];

      if (status.tracking) {
        branches.push({
          name: status.tracking,
          ahead: status.ahead,
          behind: status.behind,
          needsMerge: status.behind > 0
        });
      }

      // 检查其他可能有冲突的分支
      const branchSummary: BranchSummary = await this.git.branch();
      const currentBranch = branchSummary.current;

      for (const branch of branchSummary.all) {
        if (branch !== currentBranch && !branch.startsWith('remotes/')) {
          try {
            // 检查分支是否与远程有差异
            const branchStatus = await this.git.status([branch]);
            if (branchStatus.behind > 0 || branchStatus.ahead > 0) {
              branches.push({
                name: branch,
                ahead: branchStatus.ahead,
                behind: branchStatus.behind,
                needsMerge: branchStatus.behind > 0
              });
            }
          } catch  {
            // 忽略无法检查的分支
          }
        }
      }

      return branches;
    } catch (error) {
      throw new Error(`检查远程分支时出错：${error}`);
    }
  }

  /**
   * 显示远程分支状态
   */
  private displayRemoteBranchesStatus(branches: RemoteBranchInfo[]): void {
    console.log(chalk.blue.bold('\n📊 远程分支状态检查结果:\n'));

    if (branches.length === 0) {
      console.log(chalk.green('✅ 所有分支都是最新的，没有需要合并的更改'));
      return;
    }

    let hasMergeNeeded = false;

    branches.forEach(branch => {
      if (branch.needsMerge) {
        hasMergeNeeded = true;
        console.log(chalk.yellow(`⚠️  分支 ${chalk.bold(branch.name)} 需要合并:`));
        console.log(`   落后远程：${chalk.yellow(branch.behind + ' 个提交')}`);
        if (branch.ahead > 0) {
          console.log(`   领先远程：${chalk.green(branch.ahead + ' 个提交')}`);
        }
        console.log('');
      } else if (branch.ahead > 0) {
        console.log(chalk.blue(`📤 分支 ${chalk.bold(branch.name)} 可以推送:`));
        console.log(`   领先远程：${chalk.green(branch.ahead + ' 个提交')}`);
        console.log('');
      }
    });

    if (hasMergeNeeded) {
      console.log(chalk.yellow('💡 建议：在推送前先拉取并合并远程更改以避免冲突'));
    }
  }

  /**
   * 获取最后一次提交的文件列表
   */
  private async getLastCommitFiles(): Promise<string[]> {
    try {
      const lastCommit = await this.git.show(['--name-only', '--pretty=format:', 'HEAD']);
      return lastCommit.split('\n').filter(line => line.trim() !== '');
    } catch {
      return [];
    }
  }

  /**
   * 交互式收集提交信息
   */
  private async collectCommitInfo(): Promise<CommitInfo> {
    console.log(chalk.blue.bold('\n📝 填写提交信息\n'));

    const commitTypes = [
      { name: 'feat:     新功能', value: 'feat' },
      { name: 'fix:      修复 bug', value: 'fix' },
      { name: 'docs:     文档更新', value: 'docs' },
      { name: 'style:    代码格式调整（不影响功能）', value: 'style' },
      { name: 'refactor: 代码重构', value: 'refactor' },
      { name: 'perf:     性能优化', value: 'perf' },
      { name: 'test:     测试相关', value: 'test' },
      { name: 'build:    构建系统或外部依赖变更', value: 'build' },
      { name: 'ci:       CI 配置变更', value: 'ci' },
      { name: 'chore:    其他修改', value: 'chore' },
      { name: 'revert:   回滚提交', value: 'revert' }
    ];

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择提交类型：',
        choices: commitTypes,
        pageSize: 12
      },
      {
        type: 'input',
        name: 'scope',
        message: '输入作用域 (可选，如模块名):',
        validate: (input: string) => {
          if (input && !/^[a-zA-Z0-9-]+$/.test(input)) {
            return '作用域只能包含字母、数字和连字符';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'subject',
        message: '输入提交主题：',
        validate: (input: string) => {
          if (!input.trim()) {
            return '提交主题不能为空';
          }
          if (input.length > 72) {
            return '提交主题不能超过 72 个字符';
          }
          return true;
        }
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

  /**
   * 生成提交信息
   */
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

  /**
   * 重置选择的文件记录
   */
  private resetSelectedFiles(): void {
    this.selectedFiles = { addedFiles: [] };
  }

  /**
   * 执行 git commit
   */
  async interactiveCommit(): Promise<void> {
    try {
      // 检查是否有已暂存的文件
      const status = await this.git.status();
      if (status.staged.length === 0) {
        console.log(chalk.yellow('没有已暂存的文件可以提交'));
        return;
      }

      // 显示实际选择的文件
      console.log(chalk.blue('准备提交以下文件：'));
      if (this.selectedFiles.addedFiles.length > 0) {
        this.selectedFiles.addedFiles.forEach((file, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${file}`));
        });
      } else {
        status.staged.forEach((file, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${file}`));
        });
      }

      const commitInfo = await this.collectCommitInfo();

      if (!commitInfo) {
        console.log(chalk.yellow('提交已取消'));
        return;
      }

      const commitMessage = this.generateCommitMessage(commitInfo);

      console.log(chalk.blue('\n提交信息：'));
      console.log(chalk.gray('---'));
      console.log(chalk.white(commitMessage));
      console.log(chalk.gray('---'));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确认执行提交？',
          default: true
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('提交已取消'));
        return;
      }

      console.log(chalk.blue('\n正在提交...'));
      await this.git.commit(commitMessage);

      console.log(chalk.green('✅ 提交成功！'));

      // 显示提交后的状态
      const newStatus = await this.git.status();
      if (newStatus.ahead > 0) {
        console.log(chalk.blue(`领先远程分支 ${newStatus.ahead} 个提交`));
      }

    } catch (error) {
      throw new Error(`提交时出错：${error}`);
    }
  }

  /**
   * 显示推送进度 - 绿色进度条
   */
  private displayPushProgress(progress: number, total: number): void {
    const percentage = Math.min(100, Math.round((progress / total) * 100));
    const barLength = 20;
    const filledLength = Math.min(barLength, Math.round(barLength * progress / total));
    
    // 使用绿色进度条
    const completedBar = chalk.green('█'.repeat(filledLength));
    const remainingBar = chalk.gray('░'.repeat(barLength - filledLength));
    const bar = completedBar + remainingBar;

    process.stdout.write(`\r${chalk.green('推送进度:')} [${bar}] ${percentage}%`);

    if (progress >= total) {
      process.stdout.write('\n');
    }
  }

  /**
   * 显示推送动画
   */
  private async showPushAnimation(): Promise<void> {
    const totalSteps = 10;
    
    // 显示初始进度
    this.displayPushProgress(0, totalSteps);
    
    // 模拟推送过程
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      this.displayPushProgress(i, totalSteps);
    }
    
    // 确保显示 100%
    this.displayPushProgress(totalSteps, totalSteps);
  }

  /**
   * 交互式推送
   */
  async interactivePush(): Promise<void> {
    try {
      console.log(chalk.blue.bold('\n🚀 开始推送流程\n'));

      // 检查远程分支状态
      const remoteBranches = await this.checkRemoteBranches();
      this.displayRemoteBranchesStatus(remoteBranches);

      // 检查是否需要合并的分支
      const branchesNeedingMerge = remoteBranches.filter(branch => branch.needsMerge);

      if (branchesNeedingMerge.length > 0) {
        console.log(chalk.yellow.bold('\n⚠️  发现需要合并的分支：'));

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: '请选择操作：',
            choices: [
              { name: '📥 先拉取并合并远程更改', value: 'pull' },
              { name: '🚀 强制推送（不推荐）', value: 'force' },
              { name: '❌ 取消推送', value: 'cancel' }
            ],
            default: 'pull'
          }
        ]);

        if (action === 'cancel') {
          console.log(chalk.yellow('推送已取消'));
          return;
        }

        if (action === 'pull') {
          console.log(chalk.blue('\n正在拉取远程更改...'));
          for (const branch of branchesNeedingMerge) {
            try {
              await this.git.pull('origin', branch.name.replace('remotes/origin/', ''));
              console.log(chalk.green(`✅ 已拉取并合并分支 ${branch.name}`));
            } catch (error) {
              console.log(chalk.red(`❌ 拉取分支 ${branch.name} 时出错：${error}`));
              const { continuePush } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'continuePush',
                  message: '拉取失败，是否继续推送？',
                  default: false
                }
              ]);
              if (!continuePush) {
                console.log(chalk.yellow('推送已取消'));
                return;
              }
            }
          }
        }
      }

      // 确认推送
      const status = await this.git.status();
      if (status.ahead === 0) {
        console.log(chalk.yellow('没有需要推送的提交'));
        return;
      }

      // 显示实际选择的文件，而不是所有待提交文件
      console.log(chalk.blue(`\n准备推送 ${status.ahead} 个提交到远程，包含以下文件:`));

      if (this.selectedFiles.addedFiles.length > 0) {
        // 显示用户实际选择的文件
        this.selectedFiles.addedFiles.forEach((file, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${file}`));
        });
      } else {
        // 如果没有记录选择的文件，显示最后一次提交的文件
        const committedFiles = await this.getLastCommitFiles();
        if (committedFiles.length > 0) {
          committedFiles.forEach((file, index) => {
            console.log(chalk.cyan(`  ${index + 1}. ${file}`));
          });
        } else {
          console.log(chalk.yellow('   无法获取具体文件列表'));
        }
      }

      const { confirmPush } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmPush',
          message: '确认推送到远程仓库？',
          default: true
        }
      ]);

      if (!confirmPush) {
        console.log(chalk.yellow('推送已取消'));
        return;
      }

      // 执行推送
      console.log(chalk.blue('\n开始推送...'));

      // 显示推送动画
      await this.showPushAnimation();

      // 执行实际的推送命令
      const pushResult: PushResult = await this.git.push();

      console.log(chalk.green.bold('\n✅ 推送成功！'));

      // 显示推送结果摘要
      console.log(chalk.blue.bold('\n📋 推送摘要：'));
      console.log(`分支：${chalk.cyan(status.current)}`);
      console.log(`远程：${chalk.cyan(pushResult.repo?.toString() || 'origin')}`);
      console.log(`推送提交数：${chalk.green(status.ahead)}`);

      // 安全地访问哈希值
      if (pushResult.update && pushResult.update.hash && typeof pushResult.update.hash.to === 'string') {
        console.log(`最新提交：${chalk.cyan(pushResult.update.hash.to.slice(0, 8))}`);
      } else {
        // 如果无法从推送结果获取哈希，尝试从最后一次提交获取
        const latestCommit = await this.git.log(['-1']);
        if (latestCommit.latest) {
          console.log(`最新提交：${chalk.cyan(latestCommit.latest.hash.slice(0, 8))}`);
        }
      }

      // 重置选择的文件
      this.resetSelectedFiles();

      // 显示后续建议
      console.log(chalk.blue.bold('\n💡 后续建议：'));
      console.log('• 在代码仓库中检查推送的更改');
      console.log('• 如有需要，创建 Pull Request');
      console.log('• 通知团队成员相关变更');

    } catch (error) {
      this.resetSelectedFiles();
      throw new Error(`推送时出错：${error}`);
    }
  }

  /**
   * 交互式添加文件
   */
  async addSelectedFiles(options: GitAddOptions = {}): Promise<void> {
    const {
      showStatusAfterAdd = true,
      selectAllByDefault = false,
      autoCommit = false,
      autoPush = false
    } = options;

    console.log(chalk.green.bold(`\n👏欢迎使用  snail-git-add@${version} 交互式 Git 工具\n`));

    try {
      // 重置选择的文件
      this.resetSelectedFiles();

      // 检查是否在 git 仓库中
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('当前目录不是 git 仓库');
      }

      // 获取修改的文件（区分已暂存和未暂存）
      const files = await this.getModifiedFiles();

      if (files.length === 0) {
        console.log(chalk.yellow('没有找到修改过的文件'));
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
            console.log(chalk.yellow('您可以在稍后使用 git push 命令推送到远程'));
          }
        } else {
          console.log(chalk.yellow('您可以在稍后使用 git commit 命令提交文件'));
        }
      } else {
        console.log(chalk.yellow('未选择任何文件，操作取消'));
      }

    } catch (error) {
      this.resetSelectedFiles();
      console.error(chalk.red('错误：'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}

// 导出默认实例
export const interactiveGitAdd = new InteractiveGitAdd();

// 导出创建新实例的函数
export const createInteractiveGitAdd = (basePath?: string) => {
  return new InteractiveGitAdd(basePath);
};

// 默认导出
export default interactiveGitAdd;