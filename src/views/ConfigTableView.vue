<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Modal, message } from 'ant-design-vue';
import { APP_OPTIONS } from '../mocks/environmentData';
import { APP_VERSION_OPTIONS } from '../mocks/appVersionOptions';
import { useConfigTable } from '../state/configTable';
import type { IConfigTable, IConfigTableAppVersion } from '../state/configTable';
import type { IAppVersionOption } from '../mocks/appVersionOptions';

interface IConfigTableEditForm {
  id: string;
  name: string;
  description: string;
}

type IQuickCreateStrategy = 'blank' | 'copy' | 'majorVersion';

interface ISelectOption {
  label: string;
  value: string;
}

interface IAppVersionRow {
  appId: string;
  appName: string;
  version: string;
  options: IAppVersionOption[];
}

const { activeConfigTableId, configTables, normalizeAllConfigTables, removeConfigTable, setAppVersion, upsertConfigTable } =
  useConfigTable();

normalizeAllConfigTables();

const ALPHABET_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const createUppercaseId = (length: number): string => {
  const chars = Array.from({ length }, () => {
    const idx = Math.floor(Math.random() * ALPHABET_UPPERCASE.length);
    return ALPHABET_UPPERCASE[idx] ?? 'A';
  });
  return chars.join('');
};

const isEditModalOpen = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const editForm = ref<IConfigTableEditForm>({ id: '', name: '', description: '' });

const createStrategy = ref<IQuickCreateStrategy>('blank');
const copySourceConfigTableId = ref<string>('');
const majorAppVersion = ref<string>('');

const detailOpen = ref(false);
const detailEditEnabled = ref(false);
const detailConfigTableId = ref<string>('');

const configTableRows = computed(() =>
  configTables.value.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    isActive: t.id === activeConfigTableId.value,
  })),
);

const detailConfigTable = computed<IConfigTable | undefined>(() =>
  configTables.value.find((t) => t.id === detailConfigTableId.value),
);

const detailAppRows = computed<IAppVersionRow[]>(() => {
  const table = detailConfigTable.value;
  const map = new Map<string, string>((table?.appVersions ?? []).map((v) => [v.appId, v.version]));
  return APP_OPTIONS.map((app) => ({
    appId: app.value,
    appName: app.label,
    version: map.get(app.value) ?? '',
    options: APP_VERSION_OPTIONS[app.value] ?? [],
  }));
});

const copyFromOptions = computed<ISelectOption[]>(() =>
  configTables.value.map((t) => ({
    label: `${t.name} (${t.id})`,
    value: t.id,
  })),
);

const openCreateModal = (strategy: IQuickCreateStrategy = 'blank'): void => {
  editMode.value = 'create';
  editForm.value = { id: createUppercaseId(16), name: '', description: '' };
  createStrategy.value = strategy;
  copySourceConfigTableId.value = '';
  majorAppVersion.value = '';
  isEditModalOpen.value = true;
};

const openEditModal = (table: IConfigTable): void => {
  editMode.value = 'edit';
  editForm.value = { id: table.id, name: table.name, description: table.description ?? '' };
  isEditModalOpen.value = true;
};

const splitBaseVersion = (version: string): string => version.trim().split('-', 1)[0] ?? '';

const parseVersionTuple = (version: string): readonly [number, number, number] => {
  const [major, minor, patch] = splitBaseVersion(version).split('.', 3);
  const m = Number(major ?? 0);
  const n = Number(minor ?? 0);
  const p = Number(patch ?? 0);
  return [Number.isFinite(m) ? m : 0, Number.isFinite(n) ? n : 0, Number.isFinite(p) ? p : 0];
};

const compareVersionTuple = (
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number => {
  if (a[0] !== b[0]) return a[0] > b[0] ? 1 : -1;
  if (a[1] !== b[1]) return a[1] > b[1] ? 1 : -1;
  if (a[2] !== b[2]) return a[2] > b[2] ? 1 : -1;
  return 0;
};

const pickBestAvailableVersion = (target: string, candidates: string[]): string => {
  const normalizedTarget = target.trim();
  if (!normalizedTarget) return '';
  if (candidates.includes(normalizedTarget)) return normalizedTarget;
  if (candidates.length === 0) return normalizedTarget;

  const targetTuple = parseVersionTuple(normalizedTarget);
  const scored = candidates.map((v) => ({
    version: v,
    tuple: parseVersionTuple(v),
    hasSuffix: v.includes('-'),
  }));

  const lessOrEqual = scored.filter((s) => compareVersionTuple(s.tuple, targetTuple) <= 0);
  const pool = lessOrEqual.length > 0 ? lessOrEqual : scored;
  pool.sort((a, b) => {
    const tupleCmp = compareVersionTuple(a.tuple, b.tuple);
    if (tupleCmp !== 0) return tupleCmp * -1;
    if (a.hasSuffix !== b.hasSuffix) return a.hasSuffix ? 1 : -1;
    return a.version === b.version ? 0 : a.version > b.version ? -1 : 1;
  });
  return pool[0]?.version ?? normalizedTarget;
};

const buildAppVersionsByMajor = (targetVersion: string): IConfigTableAppVersion[] =>
  APP_OPTIONS.map((app) => {
    const options = (APP_VERSION_OPTIONS[app.value] ?? []).map((o) => o.value);
    return { appId: app.value, version: pickBestAvailableVersion(targetVersion, options) };
  });

const getConfigTableById = (id: string): IConfigTable | undefined =>
  configTables.value.find((t) => t.id === id);

const openDetail = (id: string): void => {
  detailConfigTableId.value = id;
  detailEditEnabled.value = false;
  detailOpen.value = true;
};

const handleSaveConfigTableMeta = (): void => {
  const id = editForm.value.id.trim();
  const name = editForm.value.name.trim();
  const description = editForm.value.description.trim();
  if (!id) {
    message.error('配置表 ID 会自动生成，请重新打开弹窗');
    return;
  }
  if (!name) {
    message.error('请填写配置表名称');
    return;
  }

  const exists = configTables.value.some((t) => t.id === id);
  if (editMode.value === 'create' && exists) {
    message.error('配置表 ID 已存在，请更换');
    return;
  }
  if (editMode.value === 'edit' && id !== activeConfigTableId.value && exists) {
    message.error('配置表 ID 已存在，请更换');
    return;
  }

  const base = getConfigTableById(id);
  const copied =
    editMode.value === 'create' && createStrategy.value === 'copy'
      ? getConfigTableById(copySourceConfigTableId.value)
      : undefined;
  if (editMode.value === 'create' && createStrategy.value === 'copy' && !copied) {
    message.error('请选择要复制的配置表');
    return;
  }
  if (editMode.value === 'create' && createStrategy.value === 'majorVersion' && !majorAppVersion.value.trim()) {
    message.error('请输入主要应用版本');
    return;
  }

  const next: IConfigTable = {
    id,
    name,
    description,
    createdAt: base?.createdAt ?? '',
    updatedAt: base?.updatedAt ?? '',
    appVersions:
      editMode.value === 'edit'
        ? base?.appVersions ?? []
        : createStrategy.value === 'copy'
          ? (copied?.appVersions ?? []).map((v) => ({ ...v }))
          : createStrategy.value === 'majorVersion'
            ? buildAppVersionsByMajor(majorAppVersion.value)
            : [],
  };

  upsertConfigTable(next);
  isEditModalOpen.value = false;
  message.success('保存成功');
};

watch(
  () => [editMode.value, createStrategy.value] as const,
  ([mode, strategy]) => {
    if (mode !== 'create') return;
    if (strategy === 'blank') {
      copySourceConfigTableId.value = '';
      majorAppVersion.value = '';
    }
    if (strategy === 'copy') {
      majorAppVersion.value = '';
    }
    if (strategy === 'majorVersion') {
      copySourceConfigTableId.value = '';
    }
  },
);

watch(
  () => copySourceConfigTableId.value,
  (id) => {
    if (editMode.value !== 'create' || createStrategy.value !== 'copy') return;
    if (editForm.value.name.trim()) return;
    const src = getConfigTableById(id);
    if (!src) return;
    editForm.value.name = `${src.name}（复制）`;
  },
);

watch(
  () => majorAppVersion.value,
  (v) => {
    if (editMode.value !== 'create' || createStrategy.value !== 'majorVersion') return;
    if (editForm.value.name.trim()) return;
    const ver = v.trim();
    if (!ver) return;
    editForm.value.name = ver === '4.2.2' ? '4.2.2-独墅湖' : `${ver}-产品化`;
  },
);

const handleRemoveConfigTable = (table: IConfigTable): void => {
  Modal.confirm({
    title: '确认删除',
    content: `确定删除配置表 "${table.name}" 吗？`,
    okText: '删除',
    cancelText: '取消',
    onOk: () => {
      removeConfigTable(table.id);
      message.success('已删除');
    },
  });
};

const handleVersionUpdate = (appId: string, version: string): void => {
  const tableId = detailConfigTableId.value;
  if (!tableId) return;
  const next = version.trim();
  if (!next) {
    message.error('应用版本不能为空');
    return;
  }
  setAppVersion({ configTableId: tableId, appId, version: next });
};
</script>

<template>
  <div class="p-4">
    <a-alert
      type="info"
      show-icon
      message="配置表是全局概念：切换后，“配置中心”下的功能都按当前配置表生效。"
      class="mb-4"
    />

    <a-card title="配置表列表" class="mb-4" :bordered="true">
      <div class="flex items-center justify-between mb-3">
        <a-space>
          <a-button type="primary" @click="() => openCreateModal('blank')">新建配置表</a-button>
          <a-button @click="() => openCreateModal('majorVersion')">快速创建</a-button>
        </a-space>
      </div>
      <a-table :dataSource="configTableRows" :pagination="false" rowKey="id" size="small" bordered>
        <a-table-column title="ID" dataIndex="id" key="id" />
        <a-table-column title="名称" dataIndex="name" key="name" />
        <a-table-column title="描述" key="description">
          <template #default="{ record }">
            <span class="text-gray-600">{{ record.description || '-' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="创建时间" key="createdAt" width="180">
          <template #default="{ record }">
            <span class="text-gray-500">{{ record.createdAt || '-' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="更新时间" key="updatedAt" width="180">
          <template #default="{ record }">
            <span class="text-gray-500">{{ record.updatedAt || '-' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="状态" key="status" width="120">
          <template #default="{ record }">
            <a-tag v-if="record.isActive" color="green">当前</a-tag>
            <a-tag v-else color="default">可用</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" key="action" width="260">
          <template #default="{ record }">
            <a-space>
              <a-button size="small" @click="openDetail(record.id)">详情</a-button>
              <a-button
                size="small"
                @click="() => { const t = getConfigTableById(record.id); if (t) openEditModal(t); }"
              >
                编辑
              </a-button>
              <a-button
                danger
                size="small"
                @click="() => { const t = getConfigTableById(record.id); if (t) handleRemoveConfigTable(t); }"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="isEditModalOpen"
      :title="editMode === 'create' ? '新建配置表' : '编辑配置表'"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveConfigTableMeta"
    >
      <a-form layout="vertical">
        <a-form-item label="配置表 ID" required>
          <a-space class="w-full">
            <a-input v-model:value="editForm.id" placeholder="系统自动生成" :disabled="true" />
            <!-- <a-button v-if="editMode === 'create'" @click="editForm.id = createUppercaseId(16)">重新生成</a-button> -->
          </a-space>
        </a-form-item>

        <a-form-item v-if="editMode === 'create'" label="创建方式" required>
          <a-radio-group v-model:value="createStrategy">
            <a-radio value="blank">空白配置</a-radio>
            <a-radio value="copy">复制已有配置表</a-radio>
            <a-radio value="majorVersion">指定主要应用版本</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="editMode === 'create' && createStrategy === 'copy'" label="复制来源" required>
          <a-select
            v-model:value="copySourceConfigTableId"
            :options="copyFromOptions"
            placeholder="请选择要复制的配置表"
            show-search
            option-filter-prop="label"
          />
        </a-form-item>

        <a-form-item v-if="editMode === 'create' && createStrategy === 'majorVersion'" label="主要应用版本" required>
          <a-input v-model:value="majorAppVersion" placeholder="例如：4.4.1" />
        </a-form-item>

        <a-form-item label="配置表名称" required>
          <a-input v-model:value="editForm.name" placeholder="例如：配置表 4.2.1（生产）" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="editForm.description" :rows="3" placeholder="请输入配置表描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:open="detailOpen" :width="1100" placement="right" title="配置表详情">
      <div v-if="detailConfigTable" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-gray-800">{{ detailConfigTable.name }}</div>
            <div class="text-gray-500 text-sm">ID：{{ detailConfigTable.id }}</div>
            <div class="text-gray-500 text-sm">描述：{{ detailConfigTable.description || '-' }}</div>
            <div class="text-gray-400 text-xs mt-1">
              创建时间：{{ detailConfigTable.createdAt || '-' }}，更新时间：{{ detailConfigTable.updatedAt || '-' }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a-button v-if="!detailEditEnabled" @click="detailEditEnabled = true">编辑</a-button>
            <a-button v-else @click="detailEditEnabled = false">完成</a-button>
          </div>
        </div>

        <a-card size="small" title="应用关联版本" :bordered="true">
          <div class="grid grid-cols-3 gap-4">
            <div v-for="row in detailAppRows" :key="row.appId" class="border rounded p-4 bg-white">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="min-w-0">
                  <div class="font-medium text-gray-800 truncate">{{ row.appName }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ row.appId }}</div>
                </div>
                <a-tag v-if="!row.version.trim()" color="red">未选择</a-tag>
              </div>
              <a-auto-complete
                :value="row.version"
                style="width: 100%"
                :options="row.options"
                placeholder="选择或输入版本号"
                :disabled="!detailEditEnabled"
                @update:value="(v) => handleVersionUpdate(row.appId, String(v))"
              />
            </div>
          </div>
        </a-card>
      </div>
      <div v-else class="text-gray-400">请选择配置表查看详情</div>
    </a-drawer>
  </div>
</template>
