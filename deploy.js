#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

// 创建交互式输入接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  } catch {
    log(colors.red, '检查Git状态失败');
    return false;
  }
}

function updateVersion(versionType) {
  log(colors.blue, `更新版本号 (${versionType})...`);
  return runCommand(`npm version ${versionType}`);
}

function deploy() {
  // 步骤1：检查Git状态
  if (!checkGitStatus()) {
    process.exit(1);
  }

  // 步骤2：询问版本更新类型
  rl.question(log(colors.yellow, '请选择版本更新类型 (patch/minor/major) [patch]: '), (versionType) => {
    versionType = versionType || 'patch';

    // 确保版本类型有效
    const validTypes = ['patch', 'minor', 'major'];
    if (!validTypes.includes(versionType)) {
      log(colors.red, `无效的版本类型: ${versionType}，必须是 ${validTypes.join(', ')} 之一`);
      rl.close();
      process.exit(1);
      return;
    }

    // 步骤3：更新版本号
    if (!updateVersion(versionType)) {
      rl.close();
      process.exit(1);
      return;
    }

    // 步骤4：运行测试
    log(colors.blue, '运行测试...');
    if (!runCommand('npm test')) {
      log(colors.yellow, '测试失败，但仍可继续部署？');
      rl.question('是否继续？(y/n) [n]: ', (continueDeploy) => {
        if (continueDeploy.toLowerCase() !== 'y') {
          log(colors.red, '部署已取消');
          rl.close();
          process.exit(1);
          return;
        }
        proceedWithBuildAndPublish();
      });
    } else {
      proceedWithBuildAndPublish();
    }
  });

  function proceedWithBuildAndPublish() {
    // 步骤5：构建项目
    log(colors.blue, '构建项目...');
    if (!runCommand('npm run build')) {
      rl.close();
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

    rl.close();
  }
}

// 开始部署流程
log(colors.magenta, '🚀 开始部署snail-git-add到npm...');
deploy();