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

export interface SelectedFiles {
  addedFiles: string[];
  committedFiles?: string[];
}

export interface StashItem {
  id: string;
  message: string;
  branch: string;
  date: string;
}

export interface TagInfo {
  name: string;
  commit: string;
  message?: string;
}

export interface RemoteInfo {
  name: string;
  url: string;
  type: string;
}

export interface GitToolConfig {
  autoFetch: boolean;
  defaultCommitType: string;
  enableEmojis: boolean;
  pushAfterCommit: boolean;
  branchNamingConvention: string;
}

export interface InteractiveGitAddInterface {
  addSelectedFiles(options?: GitAddOptions): Promise<void>;
  getModifiedFiles(): Promise<FileStatus[]>;
  showStatus(): Promise<void>;
  interactiveCommit(): Promise<void>;
  interactivePush(): Promise<void>;
  checkRemoteBranches(): Promise<RemoteBranchInfo[]>;
  displayRemoteBranchesStatus(branches: RemoteBranchInfo[]): void;
  manageBranches(): Promise<void>;
  showCommitHistory(): Promise<void>;
  undoChanges(): Promise<void>;
  showMainMenu(): Promise<void>;
}