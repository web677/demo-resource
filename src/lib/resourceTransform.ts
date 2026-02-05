import type { IResourcesDefinition } from '../types/resources';

export type ICapabilityStatus = 'normal' | 'new' | 'changed' | 'deprecated' | 'deleted';

export interface ICapabilityRow {
  key: string;
  name: string;
  desc: string;
  source: string;
  type: 'Page' | 'Action';
  versions: string[];
  status: ICapabilityStatus;
}

export interface IManifestAppRow {
  appName: string;
  description: string;
  version: string;
  buildTime: string;
  status?: string;
  sync?: string;
}

export interface IPermissionTreeNode {
  title: string;
  key: string;
  status?: ICapabilityStatus;
  children?: IPermissionTreeNode[];
}

export type IMenuItemStatus = 'normal' | 'warning' | 'broken';

export interface IMenuCapabilityLink {
  capabilityKey: string;
  breadcrumbParentCapabilityKey?: string;
  version?: string;
}

export interface IMenuTreeNode {
  title: string;
  key: string;
  type: 'menu' | 'page' | 'sub-page';
  capability?: IMenuCapabilityLink;
  status?: IMenuItemStatus;
  children?: IMenuTreeNode[];
}

const toTitle = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const buildActionName = (actionKey: string): string => {
  const parts = actionKey.split('.').filter(Boolean);
  const last = parts.length > 0 ? parts[parts.length - 1] : actionKey;
  return toTitle(last);
};

const buildPageName = (pageTitle: string | undefined, capabilityKey: string): string => {
  if (pageTitle && pageTitle.trim()) return pageTitle.trim();
  const parts = capabilityKey.split('.').filter(Boolean);
  const last = parts.length > 0 ? parts[parts.length - 1] : capabilityKey;
  return toTitle(last);
};

const buildPageDesc = (pageDesc: string | undefined): string => pageDesc?.trim() || '-';

export const buildManifestAppsFromResources = (
  definition: IResourcesDefinition
): IManifestAppRow[] => {
  const appName = definition.app?.wujieName || definition.app?.appName || definition.app?.appId || 'UnknownApp';
  return [
    {
      appName,
      description: definition.app?.appName || '-',
      version: '3.7.4',
      buildTime: '2026-01-01 10:00',
      status: '已解析',
      sync: '已同步',
    },
  ];
};

export const buildCapabilitiesFromResources = (
  definition: IResourcesDefinition
): ICapabilityRow[] => {
  const source = definition.app?.wujieName || definition.app?.appName || definition.app?.appId || 'UnknownApp';
  const pages = definition.pages ?? [];

  return pages.map((page) => ({
    key: page.capabilityKey,
    name: buildPageName(page.title, page.capabilityKey),
    desc: buildPageDesc(page.description),
    source,
    type: 'Page',
    versions: ['v3.7.4'],
    status: 'normal',
  }));
};

export const buildPermissionTreeFromResources = (
  definition: IResourcesDefinition
): IPermissionTreeNode[] => {
  const source = definition.app?.wujieName || definition.app?.appName || definition.app?.appId || 'UnknownApp';
  const pages = definition.pages ?? [];

  return [
    {
      title: `${definition.app?.appName || source} (${source})`,
      key: `app.${source}`,
      children: pages.map((page) => ({
        title: buildPageName(page.title, page.capabilityKey),
        key: page.capabilityKey,
        status: 'normal',
        children: (page.actions ?? []).map((action) => ({
          title: buildActionName(action.actionKey),
          key: action.actionKey,
          status: 'normal',
        })),
      })),
    },
  ];
};

export const buildMenuTreeFromResources = (
  definition: IResourcesDefinition
): IMenuTreeNode[] => {
  const pages = definition.pages ?? [];

  const nodes: IMenuTreeNode[] = pages.map((page) => ({
    title: buildPageName(page.title, page.capabilityKey),
    key: page.capabilityKey,
    type: 'page',
    capability: { capabilityKey: page.capabilityKey },
    status: 'normal',
  }));

  return [
    { 
      title: '首页', 
      key: 'home', 
      type: 'page',
      capability: { capabilityKey: 'home' }, 
      status: 'normal' 
    },
    {
      title: definition.app?.appName || '业务功能',
      key: 'biz',
      type: 'menu',
      children: nodes,
    },
  ];
};
