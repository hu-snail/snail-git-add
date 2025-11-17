import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';

export class ConfigModule extends GitBase {
  async manageConfig(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择配置操作：',
        choices: [
          { name: '📋 查看配置', value: 'list' },
          { name: '👤 设置用户信息', value: 'user' },
          { name: '↩️  返回主菜单', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'list':
        await this.listConfig();
        break;
      case 'user':
        await this.setUserConfig();
        break;
      case 'back':
        return;
    }

    // 递归调用以继续配置管理，直到选择返回
    await this.manageConfig();
  }

  async listConfig(): Promise<void> {
    try {
      // 获取本地配置
      const localConfig = await this.git.raw(['config', '--list', '--local']);
      Logger.info('本地配置：');
      console.log(localConfig);

      // 获取全局配置
      const globalConfig = await this.git.raw(['config', '--list', '--global']);
      Logger.info('全局配置：');
      console.log(globalConfig);
    } catch (error) {
      Logger.error(`获取配置失败：${error}`);
    }
  }

  async setUserConfig(): Promise<void> {
    const { scope } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scope',
        message: '选择配置范围：',
        choices: [
          { name: '本地', value: 'local' },
          { name: '全局', value: 'global' }
        ]
      }
    ]);

    const { name, email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '输入用户名：'
      },
      {
        type: 'input',
        name: 'email',
        message: '输入邮箱：'
      }
    ]);

    try {
      // 使用 raw 命令设置配置，避免类型问题
      if (scope === 'global') {
        await this.git.raw(['config', '--global', 'user.name', name]);
        await this.git.raw(['config', '--global', 'user.email', email]);
      } else {
        await this.git.raw(['config', '--local', 'user.name', name]);
        await this.git.raw(['config', '--local', 'user.email', email]);
      }
      
      Logger.success('用户信息设置成功');
    } catch (error) {
      Logger.error(`设置用户信息失败：${error}`);
    }
  }

  // 添加其他配置管理方法
  async getConfigValue(key: string, scope: string = 'local'): Promise<string> {
    try {
      const args = ['config'];
      if (scope === 'global') {
        args.push('--global');
      } else if (scope === 'system') {
        args.push('--system');
      } else {
        args.push('--local');
      }
      args.push(key);
      
      return await this.git.raw(args);
    } catch {
      return '';
    }
  }

  async setConfigValue(key: string, value: string, scope: string = 'local'): Promise<void> {
    const args = ['config'];
    if (scope === 'global') {
      args.push('--global');
    } else if (scope === 'system') {
      args.push('--system');
    } else {
      args.push('--local');
    }
    args.push(key, value);
    
    await this.git.raw(args);
  }
}