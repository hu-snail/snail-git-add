export const COMMIT_TYPES = [
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
  { name: 'revert:   回滚提交', value: 'revert' },
];

export const MENU_OPTIONS = [
  { name: '📊 查看状态', value: 'status' },
  { name: '📝 提交更改', value: 'commit' },
  { name: '🌿 分支管理', value: 'branches' },
  { name: '📜 提交历史', value: 'history' },
  { name: '💾 暂存管理', value: 'stash' },
  { name: '🏷️  标签管理', value: 'tags' },
  { name: '🌐 远程管理', value: 'remote' },
  { name: '⚙️  配置管理', value: 'config' },
  { name: '🛠️  高级工具', value: 'advanced' },
  { name: '🚪 退出', value: 'exit' },
];

export const BRANCH_ACTIONS = [
  { name: '📋 查看所有分支', value: 'list' },
  { name: '🌿 创建新分支', value: 'create' },
  { name: '🔄 切换分支', value: 'switch' },
  { name: '🗑️  删除分支', value: 'delete' },
  { name: '📤 推送分支到远程', value: 'push' },
  { name: '🔀 合并分支', value: 'merge' },
  { name: '↩️  返回主菜单', value: 'back' },
];

export const STASH_ACTIONS = [
  { name: '💾 暂存当前修改', value: 'save' },
  { name: '📋 查看暂存列表', value: 'list' },
  { name: '🔄 应用暂存', value: 'apply' },
  { name: '🗑️  删除暂存', value: 'drop' },
  { name: '🌿 从暂存创建分支', value: 'branch' },
  { name: '↩️  返回主菜单', value: 'back' },
];

export const TAG_ACTIONS = [
  { name: '🏷️  创建标签', value: 'create' },
  { name: '📋 查看标签列表', value: 'list' },
  { name: '🗑️  删除标签', value: 'delete' },
  { name: '📤 推送标签到远程', value: 'push' },
  { name: '↩️  返回主菜单', value: 'back' },
];
