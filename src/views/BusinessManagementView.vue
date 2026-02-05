<script setup lang="ts">
import { computed, ref } from 'vue';
import { Modal, message } from 'ant-design-vue';
import { useBusinessModule } from '../state/businessModule';
import type { IBusinessRow, IModuleRow } from '../state/businessModule';

interface IEditForm {
  name: string;
}

const {
  activeBusiness,
  activeBusinessId,
  businesses,
  createBusiness,
  modules,
  normalizeActive,
  removeBusiness,
  setBusinessModules,
  updateBusiness,
} = useBusinessModule();

normalizeActive();

const isEditModalOpen = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const editingId = ref<string>('');
const editForm = ref<IEditForm>({ name: '' });

const businessRows = computed(() => businesses.value.map((b) => ({ ...b, isActive: b.id === activeBusinessId.value })));

const detailEditEnabled = ref(false);

const openCreate = (): void => {
  editMode.value = 'create';
  editingId.value = '';
  editForm.value = { name: '' };
  isEditModalOpen.value = true;
};

const openEdit = (row: IBusinessRow): void => {
  editMode.value = 'edit';
  editingId.value = row.id;
  editForm.value = { name: row.name };
  isEditModalOpen.value = true;
};

const handleSave = (): void => {
  const name = editForm.value.name.trim();
  if (!name) {
    message.error('请填写业态名称');
    return;
  }
  if (editMode.value === 'create') createBusiness(name);
  else updateBusiness({ id: editingId.value, name });
  isEditModalOpen.value = false;
  message.success('保存成功');
};

const handleRemove = (row: IBusinessRow): void => {
  Modal.confirm({
    title: '确认删除',
    content: `确定删除业态 "${row.name}" 吗？`,
    okText: '删除',
    cancelText: '取消',
    onOk: () => {
      removeBusiness(row.id);
      message.success('已删除');
    },
  });
};

const handleSelectRow = (row: IBusinessRow): void => {
  activeBusinessId.value = row.id;
  detailEditEnabled.value = false;
};

const toggleEdit = (): void => {
  if (!activeBusiness.value) return;
  detailEditEnabled.value = !detailEditEnabled.value;
};

const handleToggleModule = (moduleId: string): void => {
  if (!detailEditEnabled.value) return;
  const businessId = activeBusinessId.value;
  const current = activeBusiness.value?.moduleIds ?? [];
  const next = current.includes(moduleId)
    ? current.filter((id) => id !== moduleId)
    : [...current, moduleId];
  if (!businessId) return;
  setBusinessModules({ businessId, moduleIds: next });
};

const findModuleName = (id: string, list: IModuleRow[]): string =>
  list.find((m) => m.id === id)?.name ?? id;
</script>

<template>
  <div class="p-4 h-full">
    <div class="grid grid-cols-3 gap-6 h-full">
      <div class="col-span-1">
        <a-card title="业态列表" :bordered="true">
          <div class="flex justify-between items-center mb-3">
            <a-button type="primary" @click="openCreate">新建业态</a-button>
          </div>
          <a-list :data-source="businessRows" bordered size="small">
            <template #renderItem="{ item }">
              <a-list-item
                class="cursor-pointer"
                :class="item.isActive ? 'bg-blue-50' : ''"
                @click="handleSelectRow(item)"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="min-w-0">
                    <div class="font-medium text-gray-800 truncate">{{ item.name }}</div>
                    <div class="text-xs text-gray-400">已选模块：{{ item.moduleIds.length }}</div>
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
        <a-card title="业态详情" :bordered="true">
          <div v-if="activeBusiness" class="space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-bold text-gray-800">{{ activeBusiness.name }}</div>
                <div class="text-sm text-gray-500">
                  已选模块：{{
                    activeBusiness.moduleIds.length
                      ? activeBusiness.moduleIds.map((id) => findModuleName(id, modules)).join('、')
                      : '未选择'
                  }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a-button v-if="!detailEditEnabled" @click="toggleEdit">编辑</a-button>
                <a-button v-else type="primary" @click="toggleEdit">完成</a-button>
              </div>
            </div>

            <a-divider class="my-2" />

            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="m in modules"
                :key="m.id"
                class="border rounded p-3 bg-white hover:border-blue-300"
                :class="detailEditEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'"
                @click="handleToggleModule(m.id)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="font-medium text-gray-800 truncate">{{ m.name }}</div>
                    <div class="text-xs text-gray-400 truncate">{{ m.id }}</div>
                  </div>
                  <a-checkbox :checked="activeBusiness.moduleIds.includes(m.id)" :disabled="!detailEditEnabled" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400">请选择左侧业态进行配置</div>
        </a-card>
      </div>
    </div>

    <a-modal v-model:open="isEditModalOpen" :title="editMode === 'create' ? '新建业态' : '编辑业态'" @ok="handleSave">
      <a-form layout="vertical">
        <a-form-item label="业态名称" required>
          <a-input v-model:value="editForm.name" placeholder="例如：票务业态" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
