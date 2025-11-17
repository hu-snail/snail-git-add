#!/usr/bin/env node

const { execSync } = require('child_process');
const inquirer = require('inquirer');

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(colors.red, `命令执行失败: ${command}`);
    log(colors.red, `错误信息: ${error.message}`);
    return false;
  }
}

function checkGitStatus() {
  log(colors.blue, '检查Git工作目录状态...');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim() !== '') {
      log(colors.red, '工作目录不干净，请先提交所有更改！');
      log(colors.yellow, '未提交的更改：');
      console.log(status);
      return false;
    }
    log(colors.green, '工作目录干净，可以继续部署。');
    return true;
  } catch (error) {
    log(colors.red, '检查Git状态失败');
    log(colors.red, `错误信息: ${error.message}`);
    return false;
  }
}

function updateVersion(versionType) {
  log(colors.blue, `更新版本号 (${versionType})...`);
  return runCommand(`npm version ${versionType}`);
}

function checkNpmLogin() {
  log(colors.blue, '检查npm登录状态...');
  try {
    const username = execSync('npm whoami', { encoding: 'utf8', stdio: 'pipe' });
    log(colors.green, `已登录npm账户：${username.trim()}`);
    return true;
  } catch {
    log(colors.red, '未登录npm账户');
    return false;
  }
}

function loginNpm() {
  log(colors.yellow, '请登录npm账户：');
  return runCommand('npm login');
}

function deploy() {
  // 步骤0：检查npm登录状态
  if (!checkNpmLogin()) {
    if (!loginNpm()) {
      log(colors.red, 'npm登录失败，无法继续部署');
      process.exit(1);
    }
  }

  // 步骤1：检查Git状态
  if (!checkGitStatus()) {
    process.exit(1);
  }

  // 步骤2：询问版本更新类型
  inquirer.prompt([
    {
      type: 'list',
      name: 'versionType',
      message: '请选择版本更新类型：',
      choices: [
        {
          name: 'patch (补丁版本) - 修复bug，向后兼容',
          value: 'patch'
        },
        {
          name: 'minor (次版本) - 新增功能，向后兼容',
          value: 'minor'
        },
        {
          name: 'major (主版本) - 破坏性更新，不向后兼容',
          value: 'major'
        }
      ],
      default: 'patch'
    }
  ]).then((answers) => {
    const versionType = answers.versionType;

    // 步骤3：更新版本号
    if (!updateVersion(versionType)) {
      process.exit(1);
      return;
    }

    // 步骤4：直接进行构建和发布（已跳过测试）
    proceedWithBuildAndPublish();
  });

  function proceedWithBuildAndPublish() {
    // 步骤5：构建项目
    log(colors.blue, '构建项目...');
    if (!runCommand('npm run build')) {
      process.exit(1);
      return;
    }

    // 步骤6：发布到npm
    log(colors.blue, '发布到npm...');
    if (runCommand('npm publish')) {
      log(colors.green, '🎉 部署成功！');
    } else {
      log(colors.red, '❌ 部署失败！');
    }

    // 步骤7：推送到Git仓库
    log(colors.blue, '推送到Git仓库...');
    if (runCommand('git push origin main --tags')) {
      log(colors.green, '🎉 Git推送成功！');
    } else {
      log(colors.red, '❌ Git推送失败！');
    }
  }
}

// 开始部署流程
log(colors.magenta, '🚀 开始部署snail-git-add到npm...');
deploy();