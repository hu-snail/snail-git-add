// src/modules/menu.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { MENU_OPTIONS } from '../constants';

export class MenuModule extends GitBase {
  async showMainMenu(): Promise<string> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择要执行的操作：',
        choices: MENU_OPTIONS
      }
    ]);

    return action;
  }

  async showAdvancedTools(): Promise<string> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择高级工具：',
        choices: [
          { name: '🔄 交互式 Rebase', value: 'rebase' },
          { name: '🍒 Cherry-pick', value: 'cherrypick' },
          { name: '🔍 Git Bisect', value: 'bisect' },
          { name: '↩️  返回主菜单', value: 'back' }
        ]
      }
    ]);

    return action;
  }

  async showWelcomeMessage(version: string): Promise<void> {
    console.log(`
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🐌 snail-git-add v${version}              │
│                                                     │
│           交互式 Git 工具 - 让 Git 更简单            │
│                                                     │
└─────────────────────────────────────────────────────┘
    `);
  }

  async showGoodbyeMessage(): Promise<void> {
    Logger.info('感谢使用 snail-git-add，再见！👋');
  }
}