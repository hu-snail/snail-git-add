// src/types/index.ts
export interface FileStatus {
  path: string;
  index: string;
  working_dir: string;
  isStaged: boolean;
}

export interface GitAddOptions {
  cwd?: string;
  showStatusAfterAdd?: boolean;
  selectAllByDefault?: boolean;
  autoCommit?: boolean;
  autoPush?: boolean;
}

export interface CommitInfo {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
}

export interface BranchInfo {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  commit: string;
  message: string;
}

export interface RemoteBranchInfo {
  name: string;
  ahead: number;
  behind: number;
  needsMerge: boolean;
}

export interface InteractiveGitAddInterface {
  addSelectedFiles(options?: GitAddOptions): Promise<void>;
  getModifiedFiles(): Promise<FileStatus[]>;
  showStatus(): Promise<void>;
  interactiveCommit(): Promise<void>;
  interactivePush(): Promise<void>;
  checkRemoteBranches(): Promise<RemoteBranchInfo[]>;
}

// 添加新的接口来跟踪选择的文件
export interface SelectedFiles {
  addedFiles: string[];      // 用户选择的文件
  committedFiles?: string[]; // 实际提交的文件（可能和 addedFiles 相同）
}