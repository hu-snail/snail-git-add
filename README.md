# snail-git-add

一个功能强大的交互式 Git 工作流工具，支持智能文件选择和约定式提交规范。

> Interactive git add, commit and push tool with conventional commits and remote checks

## ✨ 特性

- 🎯 **交互式文件选择** - 可视化选择要暂存的文件，支持文件状态高亮显示
- 📝 **约定式提交** - 遵循标准提交规范，生成规范的提交信息
- 🎨 **彩色终端输出** - 文件状态使用不同颜色区分（修改-黄色，新增-绿色，删除-红色，重命名-蓝色）
- 🔄 **完整工作流** - 从文件选择、提交到推送的一站式解决方案
- 📋 **交互式菜单** - 提供主菜单和高级工具菜单，方便管理 Git 仓库
- 🌿 **分支管理** - 创建、切换、删除和合并分支
- 📜 **提交历史** - 查看和管理提交历史
- 🗂️ **Stash 管理** - 暂存和恢复工作区更改
- 🏷️ **标签管理** - 创建、删除和推送标签
- 🔗 **远程管理** - 管理远程仓库和分支
- ⚙️ **灵活配置** - 支持多种使用场景和自定义选项
- 🛡️ **类型安全** - 使用 TypeScript 开发，提供完整的类型定义
- 📦 **模块化设计** - 清晰的代码结构，易于扩展和维护

## 📦 全局安装
```bash
npm install -g snail-git-add
# 使用 yarn
yarn add -D snail-git-add
# 使用 pnpm
pnpm add -D snail-git-add
# 使用bun
bun install -D snail-git-add
```
## 📦 局部安装

```bash
# 使用 npm
npm install -D snail-git-add

# 使用 yarn
yarn add -D snail-git-add

# 使用 pnpm
pnpm add -D snail-git-add
```

## 🚀 快速开始

### 基本使用

```bash
# 交互式选择文件并提交
npx snail-git-add
```

### 完整工作流示例

1. 运行命令：
   ```bash
   npx snail-git-add
   ```

2. 选择要暂存的文件（使用空格选择，回车确认）

3. 填写提交信息：
   - 选择提交类型（feat、fix、docs 等）
   - 输入作用域（可选）
   - 编写提交主题
   - 添加详细描述（可选）

4. 确认并完成提交

## 📖 使用指南

### 主菜单功能

启动工具后，您将看到主菜单，提供以下选项：

| 选项 | 描述 |
|------|------|
| `查看状态` | 显示当前 Git 仓库的状态，包括修改的文件、已暂存的文件等 |
| `提交更改` | 交互式选择要暂存的文件并提交 |
| `管理分支` | 创建、切换、删除和合并分支 |
| `查看历史记录` | 查看提交历史，支持查看详细信息和搜索 |
| `管理 Stash` | 暂存当前工作区的更改，或恢复之前的暂存 |
| `管理标签` | 创建、删除和推送标签 |
| `管理远程` | 添加、删除和查看远程仓库，推送和拉取代码 |
| `配置设置` | 配置工具的默认行为和偏好设置 |
| `高级工具` | 提供高级 Git 操作工具 |
| `退出` | 退出工具 |

### 命令行选项

| 参数 | 简写 | 描述 | 示例 |
|------|------|------|------|
| `--help` | `-h` | 显示帮助信息 | `npx snail-git-add --help` |
| `--version` | `-V` | 显示版本信息 | `npx snail-git-add --version` |
| `--auto-commit` | - | 添加文件后自动进入提交流程 | `npx snail-git-add --auto-commit` |
| `--commit-only` | - | 只提交已暂存的文件（不添加新文件） | `npx snail-git-add --commit-only` |
| `--push-only` | - | 只执行推送（不添加或提交文件） | `npx snail-git-add --push-only` |
| `--all` | `-a` | 默认选择所有修改的文件 | `npx snail-git-add --all` |
| `--cwd` | `-c` | 指定工作目录 | `npx snail-git-add --cwd ./project-path` |
| `--status` | `-s` | 只显示 Git 状态，不进行任何操作 | `npx snail-git-add --status` |
| `--no-status` | - | 添加后不显示状态信息 | `npx snail-git-add --no-status` |
| `--auto-push` | - | 提交后自动推送到远程仓库 | `npx snail-git-add --auto-push` |
| `--check-remote` | - | 只检查远程分支状态 | `npx snail-git-add --check-remote` |
| `--branches` | - | 分支管理 | `npx snail-git-add --branches` |
| `--log` | - | 查看提交历史 | `npx snail-git-add --log` |
| `--undo` | - | 撤销操作 | `npx snail-git-add --undo` |
| 无参数 | - | 启动交互式主菜单（默认） | `npx snail-git-add` |

### 编程方式使用

```typescript
import { interactiveGitAdd, createInteractiveGitAdd } from 'snail-git-add';

// 基本使用 - 交互式添加文件并提交
await interactiveGitAdd.addSelectedFiles();

// 自动提交模式
await interactiveGitAdd.addSelectedFiles({
  autoCommit: true,
  selectAllByDefault: false,
  showStatusAfterAdd: true
});

// 只执行提交（针对已暂存的文件）
await interactiveGitAdd.interactiveCommit();

// 在指定目录中使用
const gitAdd = createInteractiveGitAdd('/path/to/your/project');
await gitAdd.addSelectedFiles();

// 获取修改的文件列表
const modifiedFiles = await interactiveGitAdd.getModifiedFiles();
console.log(`找到 ${modifiedFiles.length} 个修改的文件`);

// 显示当前 Git 状态
await interactiveGitAdd.showStatus();
```

### 提交类型规范

工具遵循[约定式提交规范](https://www.conventionalcommits.org/)，支持以下提交类型：

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加用户登录功能` |
| `fix` | 修复 bug | `fix(api): 修复数据查询错误` |
| `docs` | 文档更新 | `docs(readme): 更新安装说明` |
| `style` | 代码格式调整 | `style: 格式化代码缩进` |
| `refactor` | 代码重构 | `refactor(utils): 优化工具函数` |
| `perf` | 性能优化 | `perf(db): 优化数据库查询` |
| `test` | 测试相关 | `test(auth): 添加登录测试用例` |
| `build` | 构建系统变更 | `build: 更新 webpack 配置` |
| `ci` | CI 配置变更 | `ci: 添加 GitHub Actions` |
| `chore` | 其他修改 | `chore: 更新依赖版本` |
| `revert` | 回滚提交 | `revert: 回滚某次错误提交` |

### 提交信息格式

```
类型(作用域): 主题

详细描述（可选）

脚注信息（可选）
```

**示例：**
```
feat(auth): 添加 JWT 认证功能

- 实现用户登录接口
- 添加 token 验证中间件
- 更新用户认证文档

Closes #123
```

## 🚀 推送功能

工具提供了强大的交互式推送功能，帮助您安全地将本地提交推送到远程仓库：

### 推送流程

1. **检查远程状态** - 自动检查本地分支与远程分支的差异
2. **处理冲突** - 如果存在需要合并的分支，提供拉取合并或强制推送选项
3. **预览提交** - 显示要推送的所有提交和修改的文件列表
4. **确认推送** - 提示用户确认是否继续推送
5. **执行推送** - 显示推送进度并完成操作

### 自动推送选项

```bash
# 提交后自动推送到远程仓库
npx snail-git-add --auto-push

# 编程方式使用自动推送
await interactiveGitAdd.addSelectedFiles({
  autoCommit: true,
  autoPush: true
});
```

### 推送前的提交预览

在推送前，工具会显示详细的提交信息和修改的文件列表，帮助您确认推送内容：

```
要推送的提交：

提交 1:
哈希：a1b2c3d4
作者：张三
日期：2023-10-15T10:30:00Z
信息：feat(auth): 添加用户登录功能
修改的文件：
  - src/auth/login.ts
  - src/auth/validate.ts
  - src/docs/auth.md

提交 2:
哈希：e5f6g7h8
作者：李四
日期：2023-10-15T11:45:00Z
信息：fix(api): 修复数据查询错误
修改的文件：
  - src/api/query.ts
```

## 🔧 配置选项

### GitAddOptions

```typescript
interface GitAddOptions {
  // 工作目录路径（默认：process.cwd()）
  cwd?: string;
  
  // 添加后是否显示状态信息（默认：true）
  showStatusAfterAdd?: boolean;
  
  // 是否默认选择所有文件（默认：false）
  selectAllByDefault?: boolean;
  
  // 是否自动进入提交流程（默认：false）
  autoCommit?: boolean;
  
  // 提交后是否自动推送到远程仓库（默认：false）
  autoPush?: boolean;
}
```

### 其他接口

```typescript
// 文件状态接口
export interface FileStatus {
  path: string;           // 文件路径
  index: string;          // 文件状态代码（M/A/D/R）
  working_dir: string;    // 工作目录状态
  isStaged: boolean;      // 是否已暂存
}

// 提交信息接口
export interface CommitInfo {
  type: string;           // 提交类型
  scope?: string;         // 作用域（可选）
  subject: string;        // 提交主题
  body?: string;          // 详细描述（可选）
  footer?: string;        // 脚注信息（可选）
}

// 分支信息接口
export interface BranchInfo {
  name: string;           // 分支名称
  isCurrent: boolean;     // 是否为当前分支
  isRemote: boolean;      // 是否为远程分支
  commit: string;         // 最新提交哈希
  message: string;        // 最新提交信息
}

// 远程分支状态接口
export interface RemoteBranchInfo {
  name: string;           // 分支名称
  ahead: number;          // 领先远程的提交数
  behind: number;         // 落后远程的提交数
  needsMerge: boolean;    // 是否需要合并
}
```

### 在项目中的集成示例

```typescript
// scripts/git-commit.ts
import { interactiveGitAdd } from 'snail-git-add';

// 自定义提交脚本
async function main() {
  try {
    await interactiveGitAdd.addSelectedFiles({
      autoCommit: true,
      selectAllByDefault: process.argv.includes('--all')
    });
  } catch (error) {
    console.error('提交过程出错：', error);
    process.exit(1);
  }
}

main();
```

在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "commit": "ts-node scripts/git-commit.ts",
    "commit:all": "ts-node scripts/git-commit.ts --all"
  }
}
```

## 🎯 使用场景

### 日常开发工作流
```bash
# 启动主菜单，进行完整的 Git 操作
npx snail-git-add

# 开发完成后，快速提交当前改动
npx snail-git-add --auto-commit

# 或者使用快捷方式（如果配置了 package.json 脚本）
npm run commit
```

### 代码审查前整理提交
```bash
# 选择性提交部分文件，保持提交的原子性
npx snail-git-add

# 只提交已暂存的文件（用于拆分大提交）
npx snail-git-add --commit-only

# 查看提交历史，确保提交记录清晰
npx snail-git-add --history
```

### 团队协作规范
```bash
# 确保所有提交都符合团队规范
npx snail-git-add --auto-commit

# 提交后自动推送到远程仓库
npx snail-git-add --auto-commit --auto-push

# 统一分支管理
npx snail-git-add --branches
```

### 分支管理
```bash
# 创建新分支
npx snail-git-add --branches

# 切换到其他分支
npx snail-git-add --branches

# 合并分支
npx snail-git-add --branches
```

### Stash 管理
```bash
# 暂存当前工作区的更改
npx snail-git-add --stash

# 恢复之前的暂存
npx snail-git-add --stash

# 查看所有暂存记录
npx snail-git-add --stash
```

### 标签管理
```bash
# 创建新标签
npx snail-git-add --tags

# 推送标签到远程仓库
npx snail-git-add --tags

# 查看所有标签
npx snail-git-add --tags
```

## 🔍 故障排除

### 常见问题

**Q: 运行命令时提示 "当前目录不是 git 仓库"**
A: 确保在 Git 仓库的根目录中运行命令，或使用 `--cwd` 参数指定正确的目录。

**Q: 提交时遇到 "没有已暂存的文件可以提交"**
A: 先使用 `npx snail-git-add` 选择并暂存文件，或直接使用 `git add` 命令添加文件。

**Q: 编辑器打开后不知道如何保存退出**
A: 在 Vim 中按 `ESC` 后输入 `:wq` 回车；在 Nano 中按 `Ctrl+X` 然后按 `Y` 确认。

### 环境要求

- Node.js >= 14.0.0
- Git >= 2.0.0

### 调试模式

```bash
# 显示详细错误信息
DEBUG=* npx snail-git-add

# 或使用 Node.js 调试模式
node --inspect-brk bin/cli.js
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🏗️ 开发

```bash
# 克隆项目
git clone https://github.com/snail-admin/git-add.git

# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev

# 运行测试
npm test
```