// src/modules/stash.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { Validators } from '../utils/validators';
import { STASH_ACTIONS } from '../constants';

export class StashModule extends GitBase {
  async manageStash(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择 Stash 操作：',
        choices: STASH_ACTIONS
      }
    ]);

    switch (action) {
      case 'save':
        await this.stashSave();
        break;
      case 'list':
        await this.stashList();
        break;
      case 'apply':
        await this.stashApply();
        break;
      case 'drop':
        await this.stashDrop();
        break;
      case 'branch':
        await this.stashToBranch(); // 重命名方法
        break;
      case 'back':
        return;
    }

    // 递归调用以继续 stash 管理，直到选择返回
    await this.manageStash();
  }

  async stashSave(): Promise<void> {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '输入暂存描述（可选）：',
        default: ''
      }
    ]);

    await super.stashSave(message || 'Stash by snail-git-add'); // 使用 super 调用父类方法
    Logger.success('已暂存当前修改');
  }

  async stashList(): Promise<void> {
    const stashList = await super.getStashList(); // 使用 super 调用父类方法
    
    if (stashList.all.length === 0) {
      Logger.warning('没有暂存记录');
      return;
    }

    Logger.info('暂存列表：');
    stashList.all.forEach((stash: any, index: number) => {
      console.log(`${index}: ${stash.message} (${stash.date})`);
    });
  }

  async stashApply(): Promise<void> {
    const stashList = await super.getStashList(); // 使用 super 调用父类方法
    
    if (stashList.all.length === 0) {
      Logger.warning('没有暂存记录');
      return;
    }

    const choices = stashList.all.map((stash: any, index: number) => ({
      name: `${index}: ${stash.message} (${stash.date})`,
      value: index.toString()
    }));

    const { stashIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stashIndex',
        message: '选择要应用的暂存：',
        choices
      }
    ]);

    await super.stashApply(stashIndex); // 使用 super 调用父类方法
    Logger.success('暂存应用成功');
  }

  async stashDrop(): Promise<void> {
    const stashList = await super.getStashList(); // 使用 super 调用父类方法
    
    if (stashList.all.length === 0) {
      Logger.warning('没有暂存记录');
      return;
    }

    const choices = stashList.all.map((stash: any, index: number) => ({
      name: `${index}: ${stash.message} (${stash.date})`,
      value: index.toString()
    }));

    const { stashIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stashIndex',
        message: '选择要删除的暂存：',
        choices
      }
    ]);

    await super.stashDrop(stashIndex); // 使用 super 调用父类方法
    Logger.success('暂存删除成功');
  }

  async stashToBranch(): Promise<void> { // 重命名方法
    const { branchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'branchName',
        message: '输入新分支名称：',
        validate: Validators.branchName
      }
    ]);

    try {
      await this.git.stash(['branch', branchName]);
      Logger.success(`从暂存创建分支 ${branchName} 成功`);
    } catch (error) {
      Logger.error(`从暂存创建分支失败：${error}`);
    }
  }
}