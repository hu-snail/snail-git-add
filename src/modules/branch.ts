// src/modules/branch.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { Validators } from '../utils/validators';
import { BRANCH_ACTIONS } from '../constants';

export class BranchModule extends GitBase {
  async manageBranches(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择分支操作：',
        choices: BRANCH_ACTIONS
      }
    ]);

    switch (action) {
      case 'list':
        await this.listBranches();
        break;
      case 'create':
        await this.createNewBranch();
        break;
      case 'switch':
        await this.switchBranch();
        break;
      case 'delete':
        await this.deleteBranch();
        break;
      case 'push':
        await this.pushBranch();
        break;
      case 'merge':
        await this.mergeBranch();
        break;
      case 'back':
        return;
    }

    // 递归调用以继续分支管理，直到选择返回
    await this.manageBranches();
  }

  async listBranches(): Promise<void> {
    const branchSummary = await this.getBranchSummary();
    const currentBranch = branchSummary.current;

    Logger.info('分支列表：');
    console.log(`当前分支：${currentBranch}\n`);

    // 显示本地分支
    console.log('本地分支：');
    branchSummary.all.forEach(branch => {
      const isCurrent = branch === currentBranch;
      const prefix = isCurrent ? '* ' : '  ';
      console.log(`${prefix}${branch}`);
    });

    // 显示远程分支 - 修正后的代码
    console.log('\n远程分支：');
    Object.entries(branchSummary.branches).forEach(([branchName]) => {
      if (branchName.startsWith('remotes/')) {
        console.log(`  ${branchName}`);
      }
    });
  }

  async createNewBranch(): Promise<void> {
    const { branchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'branchName',
        message: '输入新分支名称：',
        validate: Validators.branchName
      }
    ]);

    await super.createBranch(branchName);
    Logger.success(`分支 ${branchName} 创建成功`);
  }

  async switchBranch(): Promise<void> {
    const branchSummary = await this.getBranchSummary();
    const currentBranch = branchSummary.current;

    const choices = branchSummary.all.map(branch => ({
      name: branch === currentBranch ? `${branch} (当前)` : branch,
      value: branch
    }));

    const { branchName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'branchName',
        message: '选择要切换的分支：',
        choices
      }
    ]);

    await super.checkoutBranch(branchName);
    Logger.success(`已切换到分支 ${branchName}`);
  }

  async deleteBranch(): Promise<void> {
    const branchSummary = await this.getBranchSummary();
    const currentBranch = branchSummary.current;

    const choices = branchSummary.all
      .filter(branch => branch !== currentBranch)
      .map(branch => ({
        name: branch,
        value: branch
      }));

    if (choices.length === 0) {
      Logger.warning('没有可删除的分支');
      return;
    }

    const { branchName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'branchName',
        message: '选择要删除的分支：',
        choices
      }
    ]);

    const { force } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'force',
        message: '是否强制删除？',
        default: true
      }
    ]);

    try {
      await super.deleteBranch(branchName, force);
      Logger.success(`分支 ${branchName} 删除成功`);
    } catch (error) {
      Logger.error(`删除分支失败：${error}`);
    }
  }

  async pushBranch(): Promise<void> {
    const branchSummary = await this.getBranchSummary();
    const currentBranch = branchSummary.current;

    const { branchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'branchName',
        message: '输入要推送的分支名称：',
        default: currentBranch
      }
    ]);

    try {
      await this.git.push('origin', branchName);
      Logger.success(`分支 ${branchName} 推送成功`);
    } catch (error) {
      Logger.error(`推送分支失败：${error}`);
    }
  }

  async mergeBranch(): Promise<void> {
    const branchSummary = await this.getBranchSummary();
    const currentBranch = branchSummary.current;

    const choices = branchSummary.all
      .filter(branch => branch !== currentBranch)
      .map(branch => ({
        name: branch,
        value: branch
      }));

    const { branchName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'branchName',
        message: '选择要合并的分支：',
        choices
      }
    ]);

    try {
      await this.git.merge([branchName]);
      Logger.success(`分支 ${branchName} 合并成功`);
    } catch (error) {
      Logger.error(`合并分支失败：${error}`);
    }
  }
}