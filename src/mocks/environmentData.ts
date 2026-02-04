import { resources } from "../../resource.demo";
import type { IEnvironmentKey } from "../state/environment";
import type {
    ICapabilityRow,
    IManifestAppRow,
    IMenuTreeNode,
    IPermissionTreeNode,
} from "../lib/resourceTransform";
import {
    buildCapabilitiesFromResources,
    buildManifestAppsFromResources,
    buildMenuTreeFromResources,
    buildPermissionTreeFromResources,
} from "../lib/resourceTransform";

const ENV_ORDER: IEnvironmentKey[] = [
    "21",
    "60",
    "40",
    "70",
    "独墅湖",
    "太湖新城",
    "市民中心",
    "先导区",
    "苏州科技馆",
    "美术馆",
];

const getEnvIndex = (env: IEnvironmentKey): number => {
    const idx = ENV_ORDER.indexOf(env);
    return idx >= 0 ? idx : 0;
};

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const applyEnvToCapabilities = (
    base: ICapabilityRow[],
    env: IEnvironmentKey,
): ICapabilityRow[] => {
    const seed = getEnvIndex(env);
    const rows = cloneJson(base);

    const statuses: Array<ICapabilityRow["status"]> = [
        "normal",
        "new",
        "changed",
        "deprecated",
    ];
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const pick = statuses[(seed + i) % statuses.length];
        if ((seed + i) % 3 === 0) row.status = pick;
        row.versions = seed % 2 === 0 ? ["v1.0.0"] : ["v1.0.0", "v0.9.0"];
    }

    return rows;
};

export const getManifestDataByEnvironment = (
    env: IEnvironmentKey,
): { appList: IManifestAppRow[]; capabilities: ICapabilityRow[] } => {
    const seed = getEnvIndex(env);

    const baseApps = buildManifestAppsFromResources(resources).map((app) => ({
        ...app,
        version: `1.${seed}.0`,
        buildTime: `2026-01-${String(Math.min(seed + 1, 28)).padStart(2, "0")} 10:00`,
    }));

    const extraApps: IManifestAppRow[] = [
        {
            appName: "AppMall",
            description: "商城应用",
            version: `2.${seed}.0`,
            buildTime: "2026-02-01 12:00",
            status: "已解析",
            sync: "已同步",
        },
        {
            appName: "AppCommerce",
            description: "商务应用",
            version: `1.${seed + 2}.0`,
            buildTime: "2026-02-02 09:30",
            status: "已解析",
            sync: "已同步",
        },
        {
            appName: "AppHvac",
            description: "暖通空调",
            version: `3.0.${seed}`,
            buildTime: "2026-01-15 14:20",
            status: "已解析",
            sync: "已同步",
        },
        {
            appName: "AppMetting",
            description: "会议系统",
            version: `1.1.${seed}`,
            buildTime: "2026-01-20 16:45",
            status: "已解析",
            sync: "已同步",
        },
    ];

    const appList = [...baseApps, ...extraApps];

    const capabilities = applyEnvToCapabilities(
        buildCapabilitiesFromResources(resources),
        env,
    );

    const extraCapabilities: ICapabilityRow[] = [
        {
            key: "mall.product.list",
            name: "商品列表",
            desc: "展示商品信息",
            source: "AppMall",
            type: "Page",
            versions: ["v2.0.0"],
            status: "normal",
        },
        {
            key: "mall.product.create",
            name: "创建商品",
            desc: "新增商品",
            source: "AppMall",
            type: "Action",
            versions: ["v2.0.0"],
            status: "new",
        },
        {
            key: "commerce.order.manage",
            name: "订单管理",
            desc: "处理订单",
            source: "AppCommerce",
            type: "Page",
            versions: ["v1.2.0"],
            status: "normal",
        },
        {
            key: "hvac.control.panel",
            name: "控制面板",
            desc: "空调控制",
            source: "AppHvac",
            type: "Page",
            versions: ["v3.0.0"],
            status: "changed",
        },
        {
            key: "meeting.room.book",
            name: "会议室预定",
            desc: "预定会议室",
            source: "AppMetting",
            type: "Page",
            versions: ["v1.1.0"],
            status: "normal",
        },
        {
            key: "meeting.cancel",
            name: "取消会议",
            desc: "取消已预定的会议",
            source: "AppMetting",
            type: "Action",
            versions: ["v1.1.0"],
            status: "deprecated",
        },
    ];

    return { appList, capabilities: [...capabilities, ...extraCapabilities] };
};

export const getPermissionDataByEnvironment = (
    env: IEnvironmentKey,
): {
    roles: string[];
    treeData: IPermissionTreeNode[];
    checkedKeys: string[];
    expandedKeys: string[];
} => {
    const seed = getEnvIndex(env);
    const rolesBase = [
        "超级管理员",
        "运营人员",
        "审计员",
        "知识管理员",
        "数据标注员",
    ];
    const roles = rolesBase.map((r) => (seed % 2 === 0 ? r : `${r}（${env}）`));

    const treeData = buildPermissionTreeFromResources(resources);
    const expandedKeys = treeData.map((n) => n.key);

    const pageKeys = (resources.pages ?? []).map((p) => p.capabilityKey);
    const checkedKeys =
        pageKeys.length > 0 ? [pageKeys[seed % pageKeys.length]] : [];

    return { roles, treeData, checkedKeys, expandedKeys };
};

export interface IBusinessOption {
    label: string;
    value: string;
}

export const BUSINESS_OPTIONS: IBusinessOption[] = [
    { label: '运维服务', value: 'edge-gateway' },
    { label: '基础服务', value: 'basic-service' },
    { label: '运营服务', value: 'customer-service' },
];

export interface IAppOption {
    label: string;
    value: string;
}

export const APP_OPTIONS: IAppOption[] = [
    { label: 'AI 知识库 (AppAi)', value: 'AppAi' },
    { label: '商城应用 (AppMall)', value: 'AppMall' },
    { label: '票务应用 (AppCommerce)', value: 'AppCommerce' },
];

export type IMenuCategory = "business" | "tenant" | "admin" | "app";

export interface IConfigVersion {
    id: string;
    name: string;
    dependencies: { appId: string; version: string }[];
}

export const CONFIG_VERSIONS: IConfigVersion[] = [
    {
        id: 'v1.0',
        name: 'v1.0.0 (生产环境)',
        dependencies: [
            { appId: 'AppAi', version: 'v1.2.0' },
            { appId: 'AppMall', version: 'v2.0.0' },
            { appId: 'AppCommerce', version: 'v1.0.0' },
        ]
    },
    {
        id: 'v1.1',
        name: 'v1.1.0 (测试环境)',
        dependencies: [
            { appId: 'AppAi', version: 'v1.3.0-beta' },
            { appId: 'AppMall', version: 'v2.1.0-alpha' },
            { appId: 'AppCommerce', version: 'v1.0.0' },
        ]
    }
];

export const getMenuDataByEnvironment = (
    env: IEnvironmentKey,
    category: IMenuCategory = "business",
    businessId: string = "edge-gateway",
    appId: string = "AppAi",
    configVersion: string = "v1.0"
): { treeData: IMenuTreeNode[] } => {
    const seed = getEnvIndex(env);
    let treeData: IMenuTreeNode[] = [];
    
    // Simulate config version impact (just appending version string to titles for demo)
    const versionSuffix = configVersion === 'v1.0' ? '' : ` (${configVersion})`;

    // Simple mock logic to differentiate business types
    const businessPrefix =
        businessId === "edge-gateway"
            ? "[运维服务]"
            : businessId === "basic-service"
              ? "[基础服务]"
              : "[运营服务]";

    if (category === "business") {
        treeData = [
            {
                title: `${businessPrefix}${versionSuffix}`,
                key: "business-overview",
                type: "page",
                capability: { capabilityKey: "business.overview" },
                status: "normal",
            },
            {
                title: "客户服务",
                key: "business-settings",
                type: "menu",
                children: [
                    {
                        title: "基本信息",
                        key: "business-info",
                        type: "page",
                        capability: { capabilityKey: "business.info" },
                        status: "normal",
                    },
                    {
                        title: "成员管理",
                        key: "business-members",
                        type: "page",
                        capability: { capabilityKey: "business.members" },
                        status: "normal",
                    },
                ],
            },
        ];
    } else if (category === "tenant") {
        treeData = [
            {
                title: `租户中心${versionSuffix}`,
                key: "tenant-center",
                type: "menu",
                children: [
                    {
                        title: "租户概览",
                        key: "tenant-overview",
                        type: "page",
                        capability: { capabilityKey: "tenant.overview" },
                        status: "normal",
                    },
                    {
                        title: "计费管理",
                        key: "tenant-billing",
                        type: "page",
                        capability: { capabilityKey: "tenant.billing" },
                        status: "normal",
                    },
                ],
            },
            {
                title: "组织架构",
                key: "tenant-org",
                type: "page",
                capability: { capabilityKey: "tenant.org" },
                status: "normal",
            },
        ];
    } else if (category === "admin") {
        treeData = [
            {
                title: `系统管理${versionSuffix}`,
                key: "sys-admin",
                type: "menu",
                children: [
                    {
                        title: "系统配置",
                        key: "sys-config",
                        type: "page",
                        capability: { capabilityKey: "sys.config" },
                        status: "normal",
                    },
                    {
                        title: "日志监控",
                        key: "sys-log",
                        type: "page",
                        capability: { capabilityKey: "sys.log" },
                        status: "normal",
                    },
                    {
                        title: "插件管理",
                        key: "sys-plugins",
                        type: "page",
                        capability: { capabilityKey: "sys.plugins" },
                        status: "normal",
                    },
                ],
            },
        ];
    } else {
        // App category
        // In a real scenario, we would filter resources based on appId.
        // For mock, we'll just modify the titles slightly or structure.
        
        if (appId === 'AppMall') {
             treeData = [
                { title: `商城首页${versionSuffix}`, key: 'mall-home', type: 'page', capability: { capabilityKey: 'mall.home' }, status: 'normal' },
                { 
                    title: `商品管理`, 
                    key: 'mall-product', 
                    type: 'menu', 
                    children: [
                        { title: '商品列表', key: 'mall.product.list', type: 'page', capability: { capabilityKey: 'mall.product.list' }, status: 'normal' },
                        { title: '分类管理', key: 'mall.category.list', type: 'page', capability: { capabilityKey: 'mall.category.list' }, status: 'normal' }
                    ]
                }
             ];
        } else if (appId === 'AppCommerce') {
             treeData = [
                { title: `工作台${versionSuffix}`, key: 'commerce-work', type: 'page', capability: { capabilityKey: 'commerce.work' }, status: 'normal' },
                { 
                    title: `订单中心`, 
                    key: 'commerce-order', 
                    type: 'menu', 
                    children: [
                        { title: '全部订单', key: 'commerce.order.list', type: 'page', capability: { capabilityKey: 'commerce.order.list' }, status: 'normal' },
                        { title: '售后处理', key: 'commerce.order.refund', type: 'page', capability: { capabilityKey: 'commerce.order.refund' }, status: 'normal' }
                    ]
                }
             ];
        } else {
            // Default AppAi
            treeData = cloneJson(buildMenuTreeFromResources(resources));
            // Removed prefix modification logic for apps
            const biz = treeData.find((n) => n.key === "biz");
            if (biz) {
                biz.title = `${biz.title}${versionSuffix}`;
            }
            const firstBizChild = biz?.children?.[0];
            const secondBizChild = biz?.children?.[1];

            if (firstBizChild && seed % 3 === 1) firstBizChild.status = "warning";
            if (secondBizChild && seed % 3 === 2) secondBizChild.status = "broken";
        }
    }

    return { treeData };
};
