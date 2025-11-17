import { GitBase } from '../core/GitBase';
import { Logger } from '../utils/logger';
import { FileStatus } from '../types';

export class StatusModule extends GitBase {
    async getModifiedFiles(): Promise<FileStatus[]> {
        try {
            const status = await this.getStatus();

            // 已暂存的文件
            const stagedFiles: FileStatus[] = status.staged.map(path => ({
                    path,
                    index: 'M',
                    working_dir: ' ',
                    isStaged: true
                }));

            // 未暂存的文件
            const unstagedFiles: FileStatus[] = [
                ...status.modified.filter(path => !status.staged.includes(path)).map(path => ({
                    path,
                    index: 'M',
                    working_dir: ' ',
                    isStaged: false
                })),
                ...status.not_added.map(path => ({
                    path,
                    index: 'A',
                    working_dir: ' ',
                    isStaged: false
                })),
                ...status.deleted.filter(path => !status.staged.includes(path)).map(path => ({
                    path,
                    index: 'D',
                    working_dir: ' ',
                    isStaged: false
                })),
                ...status.renamed.filter(rename => !status.staged.includes(rename.to)).map(rename => ({
                    path: rename.to,
                    index: 'R',
                    working_dir: ' ',
                    isStaged: false
                }))
            ];

            return [...stagedFiles, ...unstagedFiles];
        } catch {
            throw new Error('当前目录不是 git 仓库');
        }
    }

    async showStatus(): Promise<void> {
        try {
            const status = await this.getStatus();

            Logger.info('当前 Git 状态：');
            console.log(`分支：${status.current}`);

            if (status.staged.length > 0) {
                Logger.success('已暂存的文件：');
                status.staged.forEach(file => console.log(`  ${file}`));
            }

            const unstagedFiles = [
                ...status.modified,
                ...status.not_added,
                ...status.deleted,
                ...status.created
            ];

            if (unstagedFiles.length > 0) {
                Logger.warning('未暂存的文件：');
                unstagedFiles.forEach(file => console.log(`  ${file}`));
            }

            // 显示远程信息
            if (status.tracking) {
                Logger.info('远程分支信息：');
                console.log(`跟踪分支：${status.tracking}`);
                if (status.ahead > 0) {
                    console.log(`领先远程：${status.ahead} 个提交`);
                }
                if (status.behind > 0) {
                    console.log(`落后远程：${status.behind} 个提交`);
                }
            }
        } catch {
            throw new Error('获取 git 状态时出错');
        }
    }
}