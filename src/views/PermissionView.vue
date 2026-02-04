<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-vue-next';
import { resources } from '../../resource.demo';
import type { IPermissionTreeNode, ICapabilityStatus } from '../lib/resourceTransform';
import { useEnvironment } from '../state/environment.ts';
import { getPermissionDataByEnvironment } from '../mocks/environmentData';

const { environment } = useEnvironment();

const roles = ref<string[]>([]);
const selectedRole = ref<string>('');

const treeData = ref<IPermissionTreeNode[]>([]);

const defaultExpandedKeys = computed<string[]>(() => treeData.value.map((n) => n.key));
const expandedKeys = ref<string[]>([]);
type ITreeCheckedKeys = { checked: string[]; halfChecked: string[] };
const checkedKeys = ref<ITreeCheckedKeys>({ checked: [], halfChecked: [] });
const authorizedKeys = computed<string[]>(() => checkedKeys.value.checked);

// Detail Modal
const detailVisible = ref(false);
interface ICurrentCapability {
  key: string;
  title: string;
  status: ICapabilityStatus;
  desc: string;
  source: string;
}
const currentCapability = ref<ICurrentCapability | null>(null);

const handleSelect = (_selectedKeys: string[], info: { node: IPermissionTreeNode }) => {
  const node = info.node;
  if (node.children && node.children.length > 0) return;
  currentCapability.value = {
    key: node.key,
    title: node.title,
    status: node.status ?? 'normal',
    desc: `来自资源声明：${node.title}`,
    source: resources.app?.wujieName || resources.app?.appName || resources.app?.appId || 'UnknownApp',
  };
  detailVisible.value = true;
};

const getStatusIcon = (status: ICapabilityStatus) => {
  if (status === 'new') return { icon: AlertCircle, color: 'text-green-500', text: '新增' };
  if (status === 'changed') return { icon: HelpCircle, color: 'text-orange-500', text: '变更' };
  if (status === 'deleted') return { icon: AlertCircle, color: 'text-red-500', text: '已删除' };
  if (status === 'deprecated') return { icon: AlertCircle, color: 'text-red-500', text: '已废弃' };
  return { icon: CheckCircle, color: 'text-blue-500', text: '正常' };
};

type ITreeIndex = {
  parentByKey: Map<string, string | undefined>;
  childrenByKey: Map<string, string[]>;
};

const buildTreeIndex = (nodes: IPermissionTreeNode[]): ITreeIndex => {
  const parentByKey = new Map<string, string | undefined>();
  const childrenByKey = new Map<string, string[]>();

  const walk = (list: IPermissionTreeNode[], parentKey: string | undefined) => {
    for (const node of list) {
      parentByKey.set(node.key, parentKey);
      const children = node.children?.map((c) => c.key) ?? [];
      childrenByKey.set(node.key, children);
      if (node.children && node.children.length > 0) walk(node.children, node.key);
    }
  };

  walk(nodes, undefined);
  return { parentByKey, childrenByKey };
};

const getAncestors = (key: string, parentByKey: Map<string, string | undefined>): string[] => {
  const result: string[] = [];
  let current: string | undefined = key;
  while (true) {
    const parent = parentByKey.get(current);
    if (!parent) break;
    result.push(parent);
    current = parent;
  }
  return result;
};

const getDescendants = (key: string, childrenByKey: Map<string, string[]>): string[] => {
  const result: string[] = [];
  const stack: string[] = [...(childrenByKey.get(key) ?? [])];
  while (stack.length > 0) {
    const k = stack.pop();
    if (!k) continue;
    result.push(k);
    const children = childrenByKey.get(k) ?? [];
    for (const c of children) stack.push(c);
  }
  return result;
};

type ITreeCheckInfo = {
  checked: boolean;
  node: { key: string; children?: unknown[] };
};

const normalizeCheckedKeysByRule = (rawChecked: string[]) => {
  const { parentByKey } = buildTreeIndex(treeData.value);
  const set = new Set<string>();
  for (const k of rawChecked) {
    set.add(k);
    for (const p of getAncestors(k, parentByKey)) set.add(p);
  }
  checkedKeys.value = { checked: Array.from(set), halfChecked: [] };
};

const handleCheck = (next: ITreeCheckedKeys, info: ITreeCheckInfo) => {
  const nodeKey = String(info.node.key);
  const isChecked = info.checked;
  const { parentByKey, childrenByKey } = buildTreeIndex(treeData.value);

  const set = new Set<string>(next.checked.map((k) => String(k)));
  const descendants = getDescendants(nodeKey, childrenByKey);

  if (!isChecked) {
    set.delete(nodeKey);
    for (const d of descendants) set.delete(d);
  } else {
    set.add(nodeKey);
    for (const p of getAncestors(nodeKey, parentByKey)) set.add(p);
    for (const d of descendants) set.add(d);
  }

  checkedKeys.value = { checked: Array.from(set), halfChecked: [] };
};

const loadByEnvironment = () => {
  const data = getPermissionDataByEnvironment(environment.value);
  roles.value = data.roles;
  selectedRole.value = data.roles[0] ?? '';
  treeData.value = data.treeData;
  expandedKeys.value = data.expandedKeys.length > 0 ? data.expandedKeys : defaultExpandedKeys.value;
  normalizeCheckedKeysByRule(data.checkedKeys);
  detailVisible.value = false;
  currentCapability.value = null;
};

loadByEnvironment();
watch(environment, loadByEnvironment);
</script>

<template>
  <div class="grid grid-cols-4 gap-4 h-full">
    <!-- Left: Roles -->
    <div class="col-span-1 border-r pr-4 flex flex-col">
      <h3 class="font-bold mb-4 text-lg">角色列表</h3>
      <a-list :dataSource="roles" bordered class="flex-1 bg-white overflow-auto">
        <template #renderItem="{ item }">
          <a-list-item class="cursor-pointer hover:bg-blue-50 transition-colors" :class="{'bg-blue-100 text-blue-600 font-bold': selectedRole === item}" @click="selectedRole = item">
            {{ item }}
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- Middle: Capability Tree -->
    <div class="col-span-2 border-r px-4 flex flex-col">
      <h3 class="font-bold mb-4 text-lg flex items-center justify-between">
        <span>能力树 (Capabilities)</span>
        <span class="text-xs text-gray-500 font-normal">点击节点查看详情</span>
      </h3>
      <div class="flex-1 overflow-auto border rounded p-4 bg-white">
        <a-tree 
          v-model:expandedKeys="expandedKeys" 
          v-model:checkedKeys="checkedKeys" 
          checkable 
          :checkStrictly="true"
          :tree-data="treeData" 
          defaultExpandAll
          @check="handleCheck"
          @select="handleSelect"
        >
          <template #title="{ title, status }">
            <span class="flex items-center group">
              <span :class="{'text-gray-400 line-through': status === 'deleted', 'font-bold': status === 'new'}">{{ title }}</span>
              <span v-if="status && status !== 'normal'" class="ml-2 text-xs px-1.5 rounded border flex items-center scale-90" 
                    :class="{'bg-green-50 text-green-600 border-green-200': status === 'new', 
                             'bg-orange-50 text-orange-600 border-orange-200': status === 'changed',
                             'bg-red-50 text-red-600 border-red-200': status === 'deleted'}">
                {{ getStatusIcon(status).text }}
              </span>
            </span>
          </template>
        </a-tree>
      </div>
    </div>

    <!-- Right: Authorized List -->
    <div class="col-span-1 pl-4 flex flex-col">
      <h3 class="font-bold mb-4 text-lg">已授权能力</h3>
      <div class="bg-gray-50 p-4 rounded flex-1 border overflow-auto">
        <div v-if="authorizedKeys.length === 0" class="text-gray-400 text-center mt-10">暂无授权</div>
        <div v-for="key in authorizedKeys" :key="key" class="mb-2 text-sm font-mono text-gray-700 bg-white p-2 rounded border shadow-sm flex items-center justify-between">
          <span>{{ key }}</span>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <a-modal v-model:open="detailVisible" title="能力详情" :footer="null">
      <a-descriptions bordered column="1">
        <a-descriptions-item label="Capability Key">{{ currentCapability?.key }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ currentCapability?.title }}</a-descriptions-item>
        <a-descriptions-item label="来源应用">{{ currentCapability?.source }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentCapability?.status === 'new' ? 'green' : currentCapability?.status === 'changed' ? 'orange' : currentCapability?.status === 'deleted' || currentCapability?.status === 'deprecated' ? 'red' : 'blue'">
            {{ currentCapability?.status ? currentCapability.status.toUpperCase() : 'NORMAL' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="描述">{{ currentCapability?.desc }}</a-descriptions-item>
        <a-descriptions-item label="Diff 信息" v-if="currentCapability && currentCapability.status !== 'normal'">
          <div class="text-xs text-gray-500">
            <p v-if="currentCapability.status === 'changed'">参数定义发生变更，请确认是否影响现有业务逻辑。</p>
            <p v-if="currentCapability.status === 'new'">新引入的能力，请确认是否需要分配权限。</p>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>
