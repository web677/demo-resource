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

const APP_VERSION_POOL = [
    "4.0.0",
    "4.1.0",
    "4.2.0",
    "4.2.4",
    "4.2.4-dsh",
    "4.3.0",
    "4.3.4",
    "4.4.0",
];

const pickVersion = (seed: number, offset: number): string => {
    const idx = (seed + offset) % APP_VERSION_POOL.length;
    return APP_VERSION_POOL[idx];
};

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
        row.versions =
            seed % 2 === 0
                ? [pickVersion(seed, 2)]
                : [pickVersion(seed, 2), pickVersion(seed, 1)];
    }

    return rows;
};

export const getManifestDataByEnvironment = (
    env: IEnvironmentKey,
): { appList: IManifestAppRow[]; capabilities: ICapabilityRow[] } => {
    const seed = getEnvIndex(env);

    const baseApps = buildManifestAppsFromResources(resources).map((app) => ({
        ...app,
        version: pickVersion(seed, 3),
        firstBuildTime: `2026-01-${String(Math.min(seed + 1, 28)).padStart(2, "0")} 10:00`,
        updatedTime: `2026-02-${String(Math.min(seed + 1, 28)).padStart(2, "0")} 18:00`,
    }));

    const extraApps: IManifestAppRow[] = [
        {
            appName: "AppMall",
            description: "商城应用",
            version: pickVersion(seed, 5),
            firstBuildTime: "2026-01-08 12:00",
            updatedTime: "2026-02-01 12:00",
            status: "已解析",
        },
        {
            appName: "AppCommerce",
            description: "商务应用",
            version: pickVersion(seed, 4),
            firstBuildTime: "2026-01-10 09:30",
            updatedTime: "2026-02-02 09:30",
            status: "已解析",
        },
        {
            appName: "AppHvac",
            description: "暖通空调",
            version: pickVersion(seed, 1),
            firstBuildTime: "2026-01-15 14:20",
            updatedTime: "2026-02-03 11:10",
            status: "已解析",
        },
        {
            appName: "AppMetting",
            description: "会议系统",
            version: pickVersion(seed, 0),
            firstBuildTime: "2026-01-20 16:45",
            updatedTime: "2026-02-04 08:15",
            status: "已解析",
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
            versions: [pickVersion(seed, 5)],
            status: "normal",
        },
        {
            key: "mall.product.create",
            name: "创建商品",
            desc: "新增商品",
            source: "AppMall",
            type: "Action",
            versions: [pickVersion(seed, 5)],
            status: "new",
        },
        {
            key: "commerce.order.manage",
            name: "订单管理",
            desc: "处理订单",
            source: "AppCommerce",
            type: "Page",
            versions: [pickVersion(seed, 4)],
            status: "normal",
        },
        {
            key: "hvac.control.panel",
            name: "控制面板",
            desc: "空调控制",
            source: "AppHvac",
            type: "Page",
            versions: [pickVersion(seed, 1)],
            status: "changed",
        },
        {
            key: "meeting.room.book",
            name: "会议室预定",
            desc: "预定会议室",
            source: "AppMetting",
            type: "Page",
            versions: [pickVersion(seed, 0)],
            status: "normal",
        },
        {
            key: "meeting.cancel",
            name: "取消会议",
            desc: "取消已预定的会议",
            source: "AppMetting",
            type: "Action",
            versions: [pickVersion(seed, 0)],
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
    { label: "运维服务", value: "edge-gateway" },
    { label: "基础服务", value: "basic-service" },
    { label: "运营服务", value: "customer-service" },
];

export interface IAppOption {
    label: string;
    value: string;
}

export const APP_OPTIONS: IAppOption[] = [
    { label: "AI 知识库 (AppAi)", value: "AppAi" },
    { label: "商城应用 (AppMall)", value: "AppMall" },
    { label: "票务应用 (AppCommerce)", value: "AppCommerce" },
];

export type IMenuCategory = "project" | "tenant" | "app";

export interface IConfigVersion {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    dependencies: { appId: string; version: string }[];
}

export const CONFIG_VERSIONS: IConfigVersion[] = [
    {
        id: "cfg-4.2.1",
        name: "配置表 4.2.1",
        description: "4.2.1产品主配置",
        createdAt: "2026-01-05 10:00:00",
        updatedAt: "2026-02-01 10:00:00",
        dependencies: [
            { appId: "AppAi", version: "4.3.4" },
            { appId: "AppMall", version: "4.4.0" },
            { appId: "AppCommerce", version: "4.2.4-dsh" },
        ],
    },
    {
        id: "cfg-4.3.2",
        name: "配置表 4.3.2",
        description: "4.3.2产品主配置",
        createdAt: "2026-01-10 15:20:00",
        updatedAt: "2026-02-02 09:30:00",
        dependencies: [
            { appId: "AppAi", version: "4.2.4" },
            { appId: "AppMall", version: "4.3.0" },
            { appId: "AppCommerce", version: "4.2.0" },
        ],
    },
    {
        id: "cfg-4.3.2",
        name: "独墅湖配置-基于4.3.2",
        description: "独墅湖定制配置表，大部分基于4.3.2，个别基于定制分支",
        createdAt: "2026-01-10 15:20:00",
        updatedAt: "2026-02-02 09:30:00",
        dependencies: [
            { appId: "AppAi", version: "4.2.4" },
            { appId: "AppMall", version: "4.3.0" },
            { appId: "AppCommerce", version: "4.2.0" },
        ],
    },
    {
        id: "cfg-4.4.1",
        name: "配置表 4.4.1",
        description: "预发灰度配置表（用于版本验证）",
        createdAt: "2026-01-20 09:00:00",
        updatedAt: "2026-02-03 14:10:00",
        dependencies: [
            { appId: "AppAi", version: "4.4.0" },
            { appId: "AppMall", version: "4.3.4" },
            { appId: "AppCommerce", version: "4.3.4" },
        ],
    },
];

export const getMenuDataByEnvironment = (
    env: IEnvironmentKey,
    category: IMenuCategory = "project",
    businessId: string = "edge-gateway",
    appId: string = "AppAi",
    configVersion: string = "cfg-4.2.1",
): { treeData: IMenuTreeNode[] } => {
    const seed = getEnvIndex(env);
    let treeData: IMenuTreeNode[] = [];

    // Simulate config version impact (just appending version string to titles for demo)
    const versionSuffix = configVersion === "v1.0" ? "" : ` (${configVersion})`;

    if (category === "project") {
        treeData = [
            {
                title: `项目工作台${versionSuffix}`,
                key: "project-dashboard",
                type: "page",
                capability: { capabilityKey: "project.dashboard" },
                status: "normal",
            },
            {
                title: "基础配置",
                key: "project-settings",
                type: "menu",
                children: [
                    {
                        title: "组织管理",
                        key: "project-org",
                        type: "page",
                        capability: { capabilityKey: "project.org" },
                        status: "normal",
                    },
                    {
                        title: "用户管理",
                        key: "project-user",
                        type: "page",
                        capability: { capabilityKey: "project.user" },
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
    } else {
        // App category
        // In a real scenario, we would filter resources based on appId.
        // For mock, we'll just modify the titles slightly or structure.

        if (appId === "AppMall") {
            treeData = [
                {
                    title: `商城首页${versionSuffix}`,
                    key: "mall-home",
                    type: "page",
                    capability: { capabilityKey: "mall.home" },
                    status: "normal",
                },
                {
                    title: `商品管理`,
                    key: "mall-product",
                    type: "menu",
                    children: [
                        {
                            title: "商品列表",
                            key: "mall.product.list",
                            type: "page",
                            capability: { capabilityKey: "mall.product.list" },
                            status: "normal",
                        },
                        {
                            title: "分类管理",
                            key: "mall.category.list",
                            type: "page",
                            capability: { capabilityKey: "mall.category.list" },
                            status: "normal",
                        },
                    ],
                },
            ];
        } else if (appId === "AppCommerce") {
            treeData = [
                {
                    title: `工作台${versionSuffix}`,
                    key: "commerce-work",
                    type: "page",
                    capability: { capabilityKey: "commerce.work" },
                    status: "normal",
                },
                {
                    title: `订单中心`,
                    key: "commerce-order",
                    type: "menu",
                    children: [
                        {
                            title: "全部订单",
                            key: "commerce.order.list",
                            type: "page",
                            capability: {
                                capabilityKey: "commerce.order.list",
                            },
                            status: "normal",
                        },
                        {
                            title: "售后处理",
                            key: "commerce.order.refund",
                            type: "page",
                            capability: {
                                capabilityKey: "commerce.order.refund",
                            },
                            status: "normal",
                        },
                    ],
                },
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

            if (firstBizChild && seed % 3 === 1)
                firstBizChild.status = "warning";
            if (secondBizChild && seed % 3 === 2)
                secondBizChild.status = "broken";
        }
    }

    return { treeData };
};
