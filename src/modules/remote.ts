// src/modules/remote.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { RemoteInfo } from '../types';

export class RemoteModule extends GitBase {
  async manageRemote(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择远程操作：',
        choices: [
          { name: '📋 查看远程仓库', value: 'list' },
          { name: '➕ 添加远程仓库', value: 'add' },
          { name: '🔄 重命名远程仓库', value: 'rename' },
          { name: '🗑️  移除远程仓库', value: 'remove' },
          { name: '↩️  返回主菜单', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list':
        await this.listRemotes();
        break;
      case 'add':
        await this.addRemote();
        break;
      case 'rename':
        await this.renameRemote();
        break;
      case 'remove':
        await this.removeRemote();
        break;
      case 'back':
        return;
    }

    // 递归调用以继续远程管理，直到选择返回
    await this.manageRemote();
  }

  async listRemotes(): Promise<void> {
    const remotes = await this.getRemotes();
    
    if (remotes.length === 0) {
      Logger.warning('没有配置远程仓库');
      return;
    }

    Logger.info('远程仓库列表：');
    remotes.forEach((remote: RemoteInfo) => {
      console.log(`  ${remote.name}\t${remote.url} (${remote.type})`);
    });
  }

  async addRemote(): Promise<void> {
    const { name, url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '输入远程仓库名称：',
        default: 'origin'
      },
      {
        type: 'input',
        name: 'url',
        message: '输入远程仓库 URL：'
      }
    ]);

    try {
      await this.git.addRemote(name, url);
      Logger.success(`远程仓库 ${name} 添加成功`);
    } catch (error) {
      Logger.error(`添加远程仓库失败：${error}`);
    }
  }

  async renameRemote(): Promise<void> {
    const remotes = await this.getRemotes();
    
    if (remotes.length === 0) {
      Logger.warning('没有配置远程仓库');
      return;
    }

    const choices = remotes.map((remote: RemoteInfo) => ({
      name: `${remote.name} (${remote.url})`,
      value: remote.name
    }));

    const { oldName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'oldName',
        message: '选择要重命名的远程仓库：',
        choices
      }
    ]);

    const { newName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newName',
        message: '输入新的远程仓库名称：',
        default: oldName
      }
    ]);

    try {
      await this.git.removeRemote(oldName, newName);
      Logger.success(`远程仓库 ${oldName} 重命名为 ${newName} 成功`);
    } catch (error) {
      Logger.error(`重命名远程仓库失败：${error}`);
    }
  }

  async removeRemote(): Promise<void> {
    const remotes = await this.getRemotes();
    
    if (remotes.length === 0) {
      Logger.warning('没有配置远程仓库');
      return;
    }

    const choices = remotes.map((remote: RemoteInfo) => ({
      name: `${remote.name} (${remote.url})`,
      value: remote.name
    }));

    const { name } = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择要移除的远程仓库：',
        choices
      }
    ]);

    try {
      await this.git.removeRemote(name);
      Logger.success(`远程仓库 ${name} 移除成功`);
    } catch (error) {
      Logger.error(`移除远程仓库失败：${error}`);
    }
  }
}