<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import type { Component } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
    Code,
    Database,
    ShieldCheck,
    Menu as MenuIcon,
    Network,
    Workflow,
} from "lucide-vue-next";
import ResourceView from "../views/ResourceView.vue";
import ProcessView from "../views/ProcessView.vue";
import { useConfigTable } from "../state/configTable";

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const router = useRouter();
const route = useRoute();
type IDocType = "resource" | "process";
const docOpen = ref(false);
const docType = ref<IDocType>("resource");

watchEffect(() => {
    selectedKeys.value = [route.fullPath];
});

type ITopNavKey = "capability" | "config";

const { activeConfigTableId, configTables } = useConfigTable();

const topNavKey = ref<ITopNavKey>("capability");

const inferTopNavFromRoute = (path: string): ITopNavKey => {
    if (
        path.startsWith("/manifest") ||
        path.startsWith("/resource") ||
        path.startsWith("/process")
    )
        return "capability";
    return "config";
};

watchEffect(() => {
    topNavKey.value = inferTopNavFromRoute(route.path);
});

const configTableOptions = computed(() =>
    configTables.value.map((t) => ({ label: t.name, value: t.id })),
);

interface IMenuChildItem {
    key: string;
    label: string;
}

interface IMenuItem {
    key: string;
    label: string;
    icon?: Component;
    children?: IMenuChildItem[];
}

const capabilityMenuItems: IMenuItem[] = [
    { key: "/manifest", icon: Database, label: "能力管理 (Manifest & Diff)" },
];

const configMenuItems: IMenuItem[] = [
    //   { key: '/permission', icon: ShieldCheck, label: '权限管理' },
    { key: "/config-table", icon: Database, label: "配置表" },
    { key: "/business", icon: MenuIcon, label: "业态管理" },
    { key: "/module", icon: MenuIcon, label: "功能模块" },
    {
        key: "/menu",
        icon: MenuIcon,
        label: "菜单管理",
        children: [
            { key: "/menu?type=project", label: "项目菜单" },
            { key: "/menu?type=app", label: "应用菜单" },
            //   { key: '/menu?type=tenant', label: '租户菜单' },
        ],
    },
    { key: "/dependency", icon: Network, label: "服务依赖管理" },
];

const menuItems = computed<IMenuItem[]>(() =>
    topNavKey.value === "capability" ? capabilityMenuItems : configMenuItems,
);

const showSider = computed<boolean>(() => {
    if (menuItems.value.length > 1) return true;
    const first = menuItems.value[0];
    return Boolean(first?.children && first.children.length > 0);
});

const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
};

const handleTopNavClick = ({ key }: { key: string }): void => {
    const next = key === "config" ? "config" : "capability";
    topNavKey.value = next;
    router.push(next === "capability" ? "/manifest" : "/config-table");
};

const openDoc = (type: IDocType) => {
    docType.value = type;
    docOpen.value = true;
};
</script>

<template>
    <a-layout style="min-height: 100vh">
        <a-layout-header
            style="padding: 0 16px; display: flex; align-items: center"
            ><div class="logo">
                <span class="text-white font-bold text-lg p-4 block"
                    >资源管理中心-DEMO</span
                >
            </div>
            <a-menu
                mode="horizontal"
                theme="dark"
                :selectedKeys="[topNavKey]"
                style="background: transparent; margin-left: -16px"
                @click="handleTopNavClick"
            >
                <a-menu-item key="capability">能力中心</a-menu-item>
                <a-menu-item key="config">配置中心</a-menu-item>
            </a-menu>

            <div
                style="
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                "
            >
                <div
                    v-if="topNavKey === 'config'"
                    style="display: flex; align-items: center; gap: 8px"
                >
                    <span class="text-white opacity-90">配置表</span>
                    <a-select
                        v-model:value="activeConfigTableId"
                        style="width: 260px"
                        :options="configTableOptions"
                        placeholder="请选择配置表"
                    />
                </div>
                <a-tooltip title="Resource 声明示意">
                    <a-button
                        type="text"
                        style="color: #fff"
                        @click="openDoc('resource')"
                    >
                        <template #icon>
                            <Code class="anticon" style="margin-right: 0" />
                        </template>
                    </a-button>
                </a-tooltip>
                <a-tooltip title="整体流程示意">
                    <a-button
                        type="text"
                        style="color: #fff"
                        @click="openDoc('process')"
                    >
                        <template #icon>
                            <Workflow class="anticon" style="margin-right: 0" />
                        </template>
                    </a-button>
                </a-tooltip>
            </div>
        </a-layout-header>

        <a-layout>
            <a-layout-sider
                v-if="showSider"
                v-model:collapsed="collapsed"
                collapsible
            >
                <a-menu
                    v-model:selectedKeys="selectedKeys"
                    theme="dark"
                    mode="inline"
                    @click="handleMenuClick"
                >
                    <template v-for="item in menuItems" :key="item.key">
                        <a-sub-menu v-if="item.children" :key="item.key">
                            <template #title>
                                <span>
                                    <component
                                        :is="item.icon"
                                        class="anticon"
                                    />
                                    <span>{{ item.label }}</span>
                                </span>
                            </template>
                            <a-menu-item
                                v-for="child in item.children"
                                :key="child.key"
                            >
                                <span>{{ child.label }}</span>
                            </a-menu-item>
                        </a-sub-menu>
                        <a-menu-item v-else :key="item.key">
                            <component :is="item.icon" class="anticon" />
                            <span>{{ item.label }}</span>
                        </a-menu-item>
                    </template>
                </a-menu>
            </a-layout-sider>

            <a-layout>
                <a-layout-content style="margin: 16px">
                    <div
                        :style="{
                            padding: '24px',
                            background: '#fff',
                            minHeight: '360px',
                            height: '100%',
                            overflow: 'auto',
                        }"
                    >
                        <router-view />
                    </div>
                </a-layout-content>
                <a-drawer
                    v-model:open="docOpen"
                    :width="980"
                    :title="
                        docType === 'resource'
                            ? 'Resource 声明示意'
                            : '整体流程示意'
                    "
                    placement="right"
                >
                    <ResourceView v-if="docType === 'resource'" />
                    <ProcessView v-else />
                </a-drawer>
                <a-layout-footer style="text-align: center">
                    Frontend Governance Demo ©2024 Created by Trae
                </a-layout-footer>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<style scoped>
.logo {
    height: 32px;
    margin: 16px 80px 16px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.anticon {
    margin-right: 10px;
    width: 16px;
    height: 16px;
    vertical-align: middle;
}
</style>
