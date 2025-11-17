// src/index.ts
export { InteractiveGitAdd } from './core/InteractiveGitAdd';
export { createInteractiveGitAdd } from './core/InteractiveGitAdd';

// 导出默认实例
import { InteractiveGitAdd } from './core/InteractiveGitAdd';
export const interactiveGitAdd = new InteractiveGitAdd();
export default interactiveGitAdd;