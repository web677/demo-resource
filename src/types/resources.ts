export interface IResourceAppMeta {
  appId: string;
  appName?: string;
  basePath?: string;
  wujieName?: string;
}

export interface IResourceAction {
  actionKey: string;
}

export interface IResourcePage {
  capabilityKey: string;
  title?: string;
  description?: string;
  routePath?: string;
  componentPath?: string;
  actions?: IResourceAction[];
}

export interface IResourceFrontendAppDependency {
  appId: string;
  versionRange: string;
}

export interface IResourceBackendServiceDependency {
  serviceId: string;
  versionRange: string;
}

export interface IResourceDependencies {
  frontendApps?: IResourceFrontendAppDependency[];
  backendServices?: IResourceBackendServiceDependency[];
}

export interface IResourcesDefinition {
  app?: IResourceAppMeta;
  pages?: IResourcePage[];
  dependencies?: IResourceDependencies;
}

