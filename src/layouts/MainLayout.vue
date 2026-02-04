<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Code, 
  Database, 
  ShieldCheck, 
  Menu as MenuIcon, 
  Network, 
  Workflow 
} from 'lucide-vue-next';
import ResourceView from '../views/ResourceView.vue';
import ProcessView from '../views/ProcessView.vue';

const collapsed = ref(false);
const selectedKeys = ref<string[]>([]);
const router = useRouter();
const route = useRoute();
type IDocType = 'resource' | 'process';
const docOpen = ref(false);
const docType = ref<IDocType>('resource');

watchEffect(() => {
  selectedKeys.value = [route.path];
});

const menuItems = [
  { key: '/manifest', icon: Database, label: '能力管理 (Manifest & Diff)' },
  { key: '/permission', icon: ShieldCheck, label: '权限管理' },
  { 
    key: '/menu', 
    icon: MenuIcon, 
    label: '菜单管理',
    children: [
        { key: '/menu?type=business', label: '业态菜单' },
        { key: '/menu?type=app', label: '应用菜单' },
        { key: '/menu?type=tenant', label: '租户菜单' },
        { key: '/menu?type=admin', label: '超管菜单' },
    ]
  },
  { key: '/dependency', icon: Network, label: '服务依赖管理' },
];

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key);
};

const openDoc = (type: IDocType) => {
  docType.value = type;
  docOpen.value = true;
};
</script>

<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">
         <span v-if="!collapsed" class="text-white font-bold text-lg p-4 block">Gov Demo</span>
         <span v-else class="text-white font-bold text-lg p-4 block">GD</span>
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" @click="handleMenuClick">
        <template v-for="item in menuItems" :key="item.key">
            <a-sub-menu v-if="item.children" :key="item.key">
                <template #title>
                    <span>
                        <component :is="item.icon" class="anticon" />
                        <span>{{ item.label }}</span>
                    </span>
                </template>
                <a-menu-item v-for="child in item.children" :key="child.key">
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
      <a-layout-header style="background: #fff; padding: 0 16px; display: flex; align-items: center;">
        <h2 class="text-xl font-semibold m-0">前端微前端治理方案 Demo</h2>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 12px;">
          <a-tooltip title="Resource 声明示意">
            <a-button type="text" @click="openDoc('resource')">
              <template #icon>
                <Code class="anticon" style="margin-right: 0" />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="整体流程示意">
            <a-button type="text" @click="openDoc('process')">
              <template #icon>
                <Workflow class="anticon" style="margin-right: 0" />
              </template>
            </a-button>
          </a-tooltip>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px', height: '100%', overflow: 'auto' }">
          <router-view />
        </div>
      </a-layout-content>
      <a-drawer
        v-model:open="docOpen"
        :width="980"
        :title="docType === 'resource' ? 'Resource 声明示意' : '整体流程示意'"
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
</template>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.2);
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
