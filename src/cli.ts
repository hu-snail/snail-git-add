// src/cli.ts
import { Command } from 'commander';
import { interactiveGitAdd, createInteractiveGitAdd } from './index';
import chalk from 'chalk';

const program = new Command();

program
  .name('snail-git-add')
  .description(chalk.blue.bold('snail-git-add 命令行工具帮助信息'))
  .version('1.2.0')
  .option('-c, --cwd <path>', '指定工作目录', process.cwd())
  .option('-s, --status', '只显示 git 状态', false)
  .option('-a, --all', '默认选择所有文件', false)
  .option('--no-status', '添加后不显示状态')
  .option('--auto-commit', '添加后自动进入提交流程', false)
  .option('--auto-push', '提交后自动推送到远程', false)
  .option('--commit-only', '只执行提交（不添加文件）', false)
  .option('--push-only', '只执行推送（不添加或提交文件）', false)
  .option('--check-remote', '只检查远程分支状态', false)
  .action(async (options) => {
    try {
      const gitAdd = options.cwd ? createInteractiveGitAdd(options.cwd) : interactiveGitAdd;

      if (options.status) {
        await gitAdd.showStatus();
        return;
      }

      if (options.checkRemote) {
        const branches = await gitAdd.checkRemoteBranches();
        gitAdd['displayRemoteBranchesStatus'](branches);
        return;
      }

      if (options.commitOnly) {
        await gitAdd.interactiveCommit();
        return;
      }

      if (options.pushOnly) {
        await gitAdd.interactivePush();
        return;
      }

      await gitAdd.addSelectedFiles({
        cwd: options.cwd,
        showStatusAfterAdd: options.status,
        selectAllByDefault: options.all,
        autoCommit: options.autoCommit,
        autoPush: options.autoPush
      });
    } catch (error) {
      console.error(chalk.red('错误：'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(process.argv);