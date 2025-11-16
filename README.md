# snail-git-add

一个功能强大的交互式 Git 工作流工具，支持智能文件选择和约定式提交规范。

## ✨ 特性

- 🎯 **交互式文件选择** - 可视化选择要暂存的文件
- 📝 **约定式提交** - 遵循标准提交规范，生成规范的提交信息
- 🎨 **彩色终端输出** - 清晰的视觉反馈和状态提示
- 🔄 **完整工作流** - 从文件选择到提交的一站式解决方案
- ⚙️ **灵活配置** - 支持多种使用场景和自定义选项
- 🛡️ **类型安全** - 使用 TypeScript 开发，提供完整的类型定义

## 📦 安装

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

### 命令行选项

```bash
# 交互式选择文件并提交（推荐）
npx snail-git-add

# 添加文件后自动进入提交流程
npx snail-git-add --auto-commit

# 只提交已暂存的文件（不添加新文件）
npx snail-git-add --commit-only

# 默认选择所有修改的文件
npx snail-git-add --all

# 指定工作目录
npx snail-git-add --cwd ./project-path

# 只显示 Git 状态，不进行任何操作
npx snail-git-add --status

# 添加文件后不显示状态信息
npx snail-git-add --no-status

# 显示帮助信息
npx snail-git-add --help

# 显示版本信息
npx snail-git-add --version
```

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
# 开发完成后，提交当前改动
npx snail-git-add

# 或者使用快捷方式（如果配置了 package.json 脚本）
npm run commit
```

### 代码审查前整理提交
```bash
# 选择性提交部分文件，保持提交的原子性
npx snail-git-add

# 只提交已暂存的文件（用于拆分大提交）
npx snail-git-add --commit-only
```

### 团队协作规范
```bash
# 确保所有提交都符合团队规范
npx snail-git-add --auto-commit
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