// src/modules/tag.ts
import inquirer from 'inquirer';
import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { Validators } from '../utils/validators';
import { TAG_ACTIONS } from '../constants';

export class TagModule extends GitBase {
  async manageTags(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择标签操作：',
        choices: TAG_ACTIONS
      }
    ]);

    switch (action) {
      case 'create':
        await this.createNewTag(); // 重命名方法
        break;
      case 'list':
        await this.listTags();
        break;
      case 'delete':
        await this.deleteTag();
        break;
      case 'push':
        await this.pushTags();
        break;
      case 'back':
        return;
    }

    // 递归调用以继续标签管理，直到选择返回
    await this.manageTags();
  }

  async createNewTag(): Promise<void> { // 重命名方法
    const { tagName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'tagName',
        message: '输入标签名称：',
        validate: Validators.tagName
      }
    ]);

    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '输入标签描述（可选）：',
        default: ''
      }
    ]);

    await super.createTag(tagName, message || undefined); // 使用 super 调用父类方法
    Logger.success(`标签 ${tagName} 创建成功`);
  }

  async listTags(): Promise<void> {
    const tags = await super.getTags(); // 使用 super 调用父类方法
    
    if (tags.all.length === 0) {
      Logger.warning('没有标签');
      return;
    }

    Logger.info('标签列表：');
    tags.all.forEach(tag => {
      console.log(`  ${tag}`);
    });
  }

  async deleteTag(): Promise<void> {
    const tags = await super.getTags(); // 使用 super 调用父类方法
    
    if (tags.all.length === 0) {
      Logger.warning('没有标签');
      return;
    }

    const choices = tags.all.map(tag => ({
      name: tag,
      value: tag
    }));

    const { tagName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tagName',
        message: '选择要删除的标签：',
        choices
      }
    ]);

    await super.deleteTag(tagName); // 使用 super 调用父类方法
    Logger.success(`标签 ${tagName} 删除成功`);
  }

  async pushTags(): Promise<void> {
    try {
      await super.pushTag(); // 使用 super 调用父类方法，推送所有标签
      Logger.success('标签推送成功');
    } catch (error) {
      Logger.error(`标签推送失败：${error}`);
    }
  }
}