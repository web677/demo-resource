import type { DataNode } from 'ant-design-vue/es/tree';
import { mockTree } from './rootTree';

type IRawMenuNode = {
  id?: string;
  key?: string;
  label?: string;
  name?: string;
  parentId?: string | null;
  sortOrder?: number | null;
  nimbusAppName?: string | null;
  children?: IRawMenuNode[];
};

const getTitle = (node: IRawMenuNode): string => {
  const raw = node.label ?? node.name ?? node.id ?? node.key ?? '-';
  return String(raw);
};

const getId = (node: IRawMenuNode): string => String(node.key ?? node.id ?? getTitle(node));

const toTree = (node: IRawMenuNode, prefix: string): DataNode => {
  const rawKey = getId(node);
  const children = Array.isArray(node.children) ? node.children : [];
  return {
    title: getTitle(node),
    key: `${prefix}${rawKey}`,
    children: children.map((c) => toTree(c, prefix)),
  };
};

export const buildProjectMenuTree = (): DataNode[] => {
  const values = Array.from(mockTree.values()) as IRawMenuNode[];
  const roots = values.filter((v) => v.parentId == null && (v.nimbusAppName ?? 'PlatformBusiness') === 'PlatformBusiness');
  return roots
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((r) => toTree(r, 'project:'));
};

export const buildAppMenuTree = (appId: string): DataNode[] => {
  const values = Array.from(mockTree.values()) as IRawMenuNode[];
  const roots = values.filter((v) => v.parentId == null && v.nimbusAppName === appId);
  return roots.sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)).map((r) => toTree(r, `app:${appId}:`));
};
