// src/utils/validators.ts
export class Validators {
  static scope(input: string): boolean | string {
    if (input && !/^[a-zA-Z0-9-]+$/.test(input)) {
      return '作用域只能包含字母、数字和连字符';
    }
    return true;
  }

  static subject(input: string): boolean | string {
    if (!input.trim()) {
      return '提交主题不能为空';
    }
    if (input.length > 72) {
      return '提交主题不能超过 72 个字符';
    }
    return true;
  }

  static branchName(input: string): boolean | string {
    if (!input.trim()) {
      return '分支名称不能为空';
    }
    if (!/^[a-zA-Z0-9/._-]+$/.test(input)) {
      return '分支名称包含非法字符';
    }
    return true;
  }

  static tagName(input: string): boolean | string {
    if (!input.trim()) {
      return '标签名称不能为空';
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(input)) {
      return '标签名称包含非法字符';
    }
    return true;
  }
}