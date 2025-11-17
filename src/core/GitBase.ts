import simpleGit, { SimpleGit, StatusResult, BranchSummary, PushResult, LogResult } from 'simple-git';

export class GitBase {
  protected git: SimpleGit;

  constructor(basePath?: string) {
    this.git = simpleGit(basePath || process.cwd());
  }

  async checkIsRepo(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<StatusResult> {
    return await this.git.status();
  }

  async getBranchSummary(): Promise<BranchSummary> {
    return await this.git.branch();
  }

  async addFiles(files: string[]): Promise<void> {
    for (const file of files) {
      await this.git.add(file);
    }
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  async push(): Promise<PushResult> {
    return await this.git.push();
  }

  async fetch(): Promise<void> {
    await this.git.fetch();
  }

  async pull(branch: string): Promise<void> {
    await this.git.pull('origin', branch);
  }

  async getLog(maxCount: number = 10): Promise<LogResult> {
    return await this.git.log({ maxCount });
  }

  async getLastCommitFiles(): Promise<string[]> {
    try {
      const lastCommit = await this.git.show(['--name-only', '--pretty=format:', 'HEAD']);
      return lastCommit.split('\n').filter(line => line.trim() !== '');
    } catch {
      return [];
    }
  }

  async createBranch(name: string): Promise<void> {
    await this.git.branch([name]);
  }

  async checkoutBranch(name: string): Promise<void> {
    await this.git.checkout(name);
  }

  async deleteBranch(name: string, force: boolean = false): Promise<void> {
    const args = ['-d'];
    if (force) args[0] = '-D';
    args.push(name);
    await this.git.branch(args);
  }

  async getStashList(): Promise<any> {
    return await this.git.stashList();
  }

  async stashSave(message?: string): Promise<void> {
    const args = ['save'];
    if (message) args.push(message);
    await this.git.stash(args);
  }

  async stashApply(index: string = ''): Promise<void> {
    const args = ['apply'];
    if (index) args.push(index);
    await this.git.stash(args);
  }

  async stashDrop(index: string = ''): Promise<void> {
    const args = ['drop'];
    if (index) args.push(index);
    await this.git.stash(args);
  }

  async getTags(): Promise<{ all: string[] }> {
    return await this.git.tags();
  }

  async createTag(name: string, message?: string): Promise<void> {
    if (message) {
      await this.git.addAnnotatedTag(name, message);
    } else {
      await this.git.addTag(name);
    }
  }

  async deleteTag(name: string): Promise<void> {
    await this.git.tag(['-d', name]);
  }

  async pushTag(): Promise<void> {
    await this.git.pushTags('origin');
  }

  async getRemotes(): Promise<any> {
    return await this.git.getRemotes(true);
  }
}