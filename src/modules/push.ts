// src/modules/push.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { Progress } from '../utils/progress';
import { RemoteBranchInfo } from '../types';

export class PushModule extends GitBase {
  async interactivePush(): Promise<void> {
    try {
      Logger.info('开始推送流程');

      // 检查远程分支状态
      const remoteBranches = await this.checkRemoteBranches();
      this.displayRemoteBranchesStatus(remoteBranches);

      // 检查是否需要合并的分支
      const branchesNeedingMerge = remoteBranches.filter(branch => branch.needsMerge);

      if (branchesNeedingMerge.length > 0) {
        Logger.warning('发现需要合并的分支：');

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
          Logger.warning('推送已取消');
          return;
        }

        if (action === 'pull') {
          Logger.info('正在拉取远程更改...');
          for (const branch of branchesNeedingMerge) {
            try {
              await this.pull(branch.name.replace('remotes/origin/', ''));
              Logger.success(`已拉取并合并分支 ${branch.name}`);
            } catch (error) {
              Logger.error(`拉取分支 ${branch.name} 时出错：${error}`);
              const { continuePush } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'continuePush',
                  message: '拉取失败，是否继续推送？',
                  default: false
                }
              ]);
              if (!continuePush) {
                Logger.warning('推送已取消');
                return;
              }
            }
          }
        }
      }

      // 确认推送
      const status = await this.getStatus();
      if (status.ahead === 0) {
        Logger.warning('没有需要推送的提交');
        return;
      }

      // 显示推送信息
      Logger.info(`准备推送 ${status.ahead} 个提交到远程`);
      
      // 显示要推送的提交和文件列表
      if (status.ahead > 0 && status.tracking) {
        try {
          // 获取本地分支与远程分支的差异提交
          const log = await this.git.log([`${status.tracking}..HEAD`]);
          
          Logger.info('要推送的提交：');
          for (let index = 0; index < log.all.length; index++) {
            const commit = log.all[index];
            console.log(`\n提交 ${index + 1}:`);
            console.log(`哈希：${commit.hash.slice(0, 8)}`);
            console.log(`作者：${commit.author_name}`);
            console.log(`日期：${commit.date}`);
            console.log(`信息：${commit.message}`);
            
            // 获取该提交的文件列表
            console.log('修改的文件：');
            let files: string[] = [];
            if (commit.diff?.files) {
              files = commit.diff.files.map((file: any) => file.path);
            }
            
            if (files.length > 0) {
              files.forEach(file => {
                console.log(`  - ${file}`);
              });
            } else {
              // 如果diff.files不存在，尝试通过git show获取
              try {
                const fileList = await this.git.show(['--name-only', '--pretty=format:', commit.hash]);
                const fileArray = fileList.split('\n').filter(line => line.trim() !== '');
                if (fileArray.length > 0) {
                  fileArray.forEach(file => {
                    console.log(`  - ${file}`);
                  });
                } else {
                  console.log('  - 没有文件修改记录');
                }
              } catch {
                console.log('  - 无法获取文件列表');
              }
            }
          }
        } catch {
          Logger.warning('无法获取提交详情');
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
        Logger.warning('推送已取消');
        return;
      }

      // 执行推送
      Logger.info('开始推送...');

      // 显示 loading 状态
      const loadingInterval = Progress.showPushLoading();

      try {
        // 执行实际的推送命令
        const pushResult = await this.push();

        // 清除 loading 状态
        Progress.stopPushLoading(loadingInterval);

        Logger.success('推送成功！');

        // 显示推送结果摘要
        Logger.info('推送摘要：');
        console.log(`分支：${status.current}`);
        console.log(`远程：${pushResult.repo?.toString() || 'origin'}`);
        console.log(`推送提交数：${status.ahead}`);

        // 安全地访问哈希值
        if (pushResult.update && pushResult.update.hash && typeof pushResult.update.hash.to === 'string') {
          console.log(`最新提交：${pushResult.update.hash.to.slice(0, 8)}`);
        } else {
          // 如果无法从推送结果获取哈希，尝试从最后一次提交获取
          const latestCommit = await this.getLog(1);
          if (latestCommit.latest) {
            console.log(`最新提交：${latestCommit.latest.hash.slice(0, 8)}`);
          }
        }

        // 显示后续建议
        Logger.info('后续建议：');
        console.log('• 在代码仓库中检查推送的更改');
        console.log('• 如有需要，创建 Pull Request');
        console.log('• 通知团队成员相关变更');

      } catch (error) {
        // 清除 loading 状态
        Progress.stopPushLoading(loadingInterval);
        throw error;
      }

    } catch (error) {
      throw new Error(`推送时出错：${error}`);
    }
  }

  async checkRemoteBranches(): Promise<RemoteBranchInfo[]> {
    try {
      Logger.progress('检查远程分支状态...');

      // 获取远程更新
      await this.fetch();

      const status = await this.getStatus();
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
      const branchSummary = await this.getBranchSummary();
      const currentBranch = branchSummary.current;

      for (const branch of branchSummary.all) {
        if (branch !== currentBranch && !branch.startsWith('remotes/')) {
          try {
            // 检查分支是否与远程有差异
            const branchStatus = await this.getStatus();
            if (branchStatus.behind > 0 || branchStatus.ahead > 0) {
              branches.push({
                name: branch,
                ahead: branchStatus.ahead,
                behind: branchStatus.behind,
                needsMerge: branchStatus.behind > 0
              });
            }
          } catch {
            // 忽略无法检查的分支
          }
        }
      }

      Logger.clearLine();
      return branches;
    } catch (error) {
      throw new Error(`检查远程分支时出错：${error}`);
    }
  }

  public displayRemoteBranchesStatus(branches: RemoteBranchInfo[]): void {
    Logger.info('远程分支状态检查结果：');

    if (branches.length === 0) {
      Logger.success('所有分支都是最新的，没有需要合并的更改');
      return;
    }

    let hasMergeNeeded = false;

    branches.forEach(branch => {
      if (branch.needsMerge) {
        hasMergeNeeded = true;
        Logger.warning(`分支 ${branch.name} 需要合并:`);
        console.log(`   落后远程：${branch.behind} 个提交`);
        if (branch.ahead > 0) {
          console.log(`   领先远程：${branch.ahead} 个提交`);
        }
        console.log('');
      } else if (branch.ahead > 0) {
        Logger.info(`分支 ${branch.name} 可以推送:`);
        console.log(`   领先远程：${branch.ahead} 个提交`);
        console.log('');
      }
    });

    if (hasMergeNeeded) {
      Logger.warning('建议：在推送前先拉取并合并远程更改以避免冲突');
    }
  }
}