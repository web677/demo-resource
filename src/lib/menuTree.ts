import type { IMenuTreeNode } from './resourceTransform';

export interface IMenuOption {
  label: string;
  value: string;
}

export const flattenMenuTree = (nodes: IMenuTreeNode[]): IMenuOption[] => {
  const result: IMenuOption[] = [];

  const walk = (items: IMenuTreeNode[], parentTitles: string[]): void => {
    for (const item of items) {
      const nextTitles = [...parentTitles, item.title];
      if (item.type === 'page' || item.type === 'sub-page') {
        result.push({ value: item.key, label: nextTitles.join(' / ') });
      }
      if (item.children && item.children.length > 0) {
        walk(item.children, nextTitles);
      }
    }
  };

  walk(nodes, []);
  const uniq = new Map<string, IMenuOption>();
  for (const opt of result) uniq.set(opt.value, opt);
  return Array.from(uniq.values()).sort((a, b) => a.label.localeCompare(b.label));
};

