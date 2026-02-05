<script setup lang="ts">
import { computed, ref } from 'vue';
import { Modal, message } from 'ant-design-vue';
import { useBusinessModule } from '../state/businessModule';
import { APP_OPTIONS } from '../mocks/environmentData';
import { buildAppMenuTree, buildProjectMenuTree } from '../mocks/rootTreeAdapter';
import type { DataNode } from 'ant-design-vue/es/tree';
import type { IModuleRow } from '../state/businessModule';

interface IEditForm {
  name: string;
}

const getNodeTitle = (node: DataNode): string => {
  const title = node.title;
  if (typeof title === 'string') return title;
  if (typeof title === 'number') return String(title);
  return '';
};

const buildKeyPathMap = (nodes: readonly DataNode[]): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  const walk = (list: readonly DataNode[], parentPath: readonly string[]): void => {
    list.forEach((node) => {
      const key = String(node.key ?? '');
      const title = getNodeTitle(node);
      const nextPath = title ? [...parentPath, title] : [...parentPath];
      if (key) result.set(key, nextPath);
      const children = Array.isArray(node.children) ? node.children : [];
      if (children.length) walk(children, nextPath);
    });
  };
  walk(nodes, []);
  return result;
};

const parseAppIdFromKey = (key: string): string | null => {
  if (!key.startsWith('app:')) return null;
  const rest = key.slice('app:'.length);
  const idx = rest.indexOf(':');
  if (idx <= 0) return null;
  return rest.slice(0, idx);
};

const appSearch = ref('');
const activeAppPanels = ref<string[]>([]);

const {
  activeModule,
  activeModuleId,
  clearStorage,
  createModule,
  modules,
  normalizeActive,
  removeModule,
  setModuleMenus,
  updateModule,
} = useBusinessModule();

normalizeActive();

const isEditModalOpen = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const editingId = ref<string>('');
const editForm = ref<IEditForm>({ name: '' });

const moduleRows = computed(() => modules.value.map((m) => ({ ...m, isActive: m.id === activeModuleId.value })));

const detailEditEnabled = ref(false);
const projectTreeData = ref<DataNode[]>(buildProjectMenuTree());
const appTreeCache = ref(new Map<string, DataNode[]>());
const projectKeyPathMap = computed(() => buildKeyPathMap(projectTreeData.value));

const filteredApps = computed(() => {
  const q = appSearch.value.trim().toLowerCase();
  if (!q) return APP_OPTIONS;
  return APP_OPTIONS.filter((a) => a.label.toLowerCase().includes(q) || a.value.toLowerCase().includes(q));
});

const getAppTreeData = (appId: string): DataNode[] => {
  const cached = appTreeCache.value.get(appId);
  if (cached) return cached;
  const data = buildAppMenuTree(appId);
  appTreeCache.value.set(appId, data);
  return data;
};

const openCreate = (): void => {
  editMode.value = 'create';
  editingId.value = '';
  editForm.value = { name: '' };
  isEditModalOpen.value = true;
};

const handleResetDemo = (): void => {
  Modal.confirm({
    title: '重置示例数据',
    content: '将清空本地缓存并恢复默认示例数据（基础服务/运维服务/运营服务），是否继续？',
    okText: '继续',
    cancelText: '取消',
    onOk: () => {
      clearStorage();
      message.success('已重置');
    },
  });
};

const openEdit = (row: IModuleRow): void => {
  editMode.value = 'edit';
  editingId.value = row.id;
  editForm.value = { name: row.name };
  isEditModalOpen.value = true;
};

const handleSave = (): void => {
  const name = editForm.value.name.trim();
  if (!name) {
    message.error('请填写功能模块名称');
    return;
  }
  if (editMode.value === 'create') createModule(name);
  else updateModule({ id: editingId.value, name });
  isEditModalOpen.value = false;
  message.success('保存成功');
};

const handleRemove = (row: IModuleRow): void => {
  Modal.confirm({
    title: '确认删除',
    content: `确定删除功能模块 "${row.name}" 吗？（会从所有业态中移除该模块）`,
    okText: '删除',
    cancelText: '取消',
    onOk: () => {
      removeModule(row.id);
      message.success('已删除');
    },
  });
};

const handleSelectRow = (row: IModuleRow): void => {
  activeModuleId.value = row.id;
  detailEditEnabled.value = false;
};

const toggleEdit = (): void => {
  if (!activeModule.value) return;
  detailEditEnabled.value = !detailEditEnabled.value;
};

const updateKeysByPrefix = (prefix: string, nextChecked: string[]): void => {
  if (!detailEditEnabled.value) return;
  const moduleId = activeModuleId.value;
  const current = activeModule.value?.menuKeys ?? [];
  const kept = current.filter((k) => !k.startsWith(prefix));
  setModuleMenus({ moduleId, menuKeys: [...kept, ...nextChecked] });
};

const projectCheckedKeys = computed<string[]>(() => {
  const mod = activeModule.value;
  if (!mod) return [];
  return mod.menuKeys.filter((k) => k.startsWith('project:'));
});

const buildAppPrefix = (appId: string): string => `app:${appId}:`;

const getAppCheckedKeys = (appId: string): string[] => {
  const mod = activeModule.value;
  if (!mod) return [];
  const prefix = buildAppPrefix(appId);
  return mod.menuKeys.filter((k) => k.startsWith(prefix));
};

const selectedMenuLabels = computed<string[]>(() => {
  const mod = activeModule.value;
  if (!mod) return [];
  const appIds = new Set<string>();
  mod.menuKeys.forEach((key) => {
    const appId = parseAppIdFromKey(key);
    if (appId) appIds.add(appId);
  });
  const appKeyPathMaps = new Map<string, Map<string, string[]>>();
  appIds.forEach((appId) => {
    appKeyPathMaps.set(appId, buildKeyPathMap(getAppTreeData(appId)));
  });

  const seen = new Set<string>();
  const labels = mod.menuKeys
    .map((key) => {
      if (key.startsWith('project:')) {
        const path = projectKeyPathMap.value.get(key);
        return path?.length ? path.join('-') : key;
      }
      if (key.startsWith('app:')) {
        const appId = parseAppIdFromKey(key);
        if (!appId) return key;
        const path = appKeyPathMaps.get(appId)?.get(key);
        return path?.length ? path.join('-') : key;
      }
      return key;
    })
    .filter((label) => {
      if (!label) return false;
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    });
  return labels;
});
</script>

<template>
  <div class="p-4 h-full">
    <div class="grid grid-cols-3 gap-6 h-full">
      <div class="col-span-1">
        <a-card title="功能模块列表" :bordered="true">
          <div class="flex justify-between items-center mb-3">
            <a-space>
              <a-button type="primary" @click="openCreate">新建模块</a-button>
              <a-button @click="handleResetDemo">重置示例数据</a-button>
            </a-space>
          </div>
          <a-list :data-source="moduleRows" bordered size="small">
            <template #renderItem="{ item }">
              <a-list-item
                class="cursor-pointer"
                :class="item.isActive ? 'bg-blue-50' : ''"
                @click="handleSelectRow(item)"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="min-w-0">
                    <div class="font-medium text-gray-800 truncate">{{ item.name }}</div>
                    <div class="text-xs text-gray-400">已选菜单：{{ item.menuKeys.length }}</div>
                  </div>
                  <a-space>
                    <a-button size="small" @click.stop="openEdit(item)">编辑</a-button>
                    <a-button danger size="small" @click.stop="handleRemove(item)">删除</a-button>
                  </a-space>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>

      <div class="col-span-2">
        <a-card title="模块详情" :bordered="true">
          <div v-if="activeModule" class="space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold text-gray-800">{{ activeModule.name }}</div>
                <div class="text-sm text-gray-500">已选菜单数：{{ activeModule.menuKeys.length }}</div>
              </div>
              <div class="flex items-center gap-2">
                <a-button v-if="!detailEditEnabled" @click="toggleEdit">编辑</a-button>
                <a-button v-else type="primary" @click="toggleEdit">完成</a-button>
              </div>
            </div>

            <a-divider class="my-2" />

            <div class="space-y-6">
              <div>
                <div class="font-medium text-gray-700 mb-3">项目菜单</div>
                <a-tree
                  checkable
                  :tree-data="projectTreeData"
                  :checkedKeys="projectCheckedKeys"
                  :disabled="!detailEditEnabled"
                  @check="(keys) => updateKeysByPrefix('project:', (keys as string[]))"
                />
              </div>

              <div>
                <div class="font-medium text-gray-700 mb-3">应用菜单</div>
                <div class="mb-3 flex items-center gap-3">
                  <a-input v-model:value="appSearch" placeholder="搜索应用（支持 60+）" style="width: 320px" />
                  <span class="text-xs text-gray-400">仅渲染展开的应用树，避免应用数过多时卡顿</span>
                </div>
                <a-collapse v-model:activeKey="activeAppPanels" :bordered="true">
                  <a-collapse-panel v-for="app in filteredApps" :key="app.value" :header="app.label">
                    <a-tree
                      v-if="activeAppPanels.includes(app.value)"
                      checkable
                      :tree-data="getAppTreeData(app.value)"
                      :checkedKeys="getAppCheckedKeys(app.value)"
                      :disabled="!detailEditEnabled"
                      @check="(keys) => updateKeysByPrefix(buildAppPrefix(app.value), (keys as string[]))"
                    />
                  </a-collapse-panel>
                </a-collapse>
              </div>
            </div>

            <a-card size="small" title="已选菜单预览">
              <div v-if="selectedMenuLabels.length" class="text-sm text-gray-700">
                <div v-for="label in selectedMenuLabels" :key="label" class="py-0.5">{{ label }}</div>
              </div>
              <div v-else class="text-gray-400 text-sm">未选择</div>
            </a-card>
          </div>
          <div v-else class="text-gray-400">请选择左侧模块进行配置</div>
        </a-card>
      </div>
    </div>

    <a-modal v-model:open="isEditModalOpen" :title="editMode === 'create' ? '新建功能模块' : '编辑功能模块'" @ok="handleSave">
      <a-form layout="vertical">
        <a-form-item label="模块名称" required>
          <a-input v-model:value="editForm.name" placeholder="例如：票务管理模块" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
