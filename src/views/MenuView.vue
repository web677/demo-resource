<script setup lang="ts">
import { computed, ref, h, watch, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  FolderOpenOutlined, 
  AppstoreOutlined, 
  FileTextOutlined,
  TableOutlined
} from '@ant-design/icons-vue';
import { Pencil } from 'lucide-vue-next'; // Add Pencil icon
import { Modal, message } from 'ant-design-vue';
import { resources } from '../../resource.demo';
import type { IMenuCapabilityLink, IMenuTreeNode } from '../lib/resourceTransform';
import { useEnvironment } from '../state/environment';
import { getMenuDataByEnvironment, BUSINESS_OPTIONS, APP_OPTIONS, CONFIG_VERSIONS } from '../mocks/environmentData';
import type { IMenuCategory } from '../mocks/environmentData';

type MenuItem = IMenuTreeNode & {
  externalLink?: string;
  openNewTab?: boolean;
};

const { environment } = useEnvironment();
const route = useRoute();

const treeData = ref<MenuItem[]>([]);
const currentCategory = ref<IMenuCategory>('app');
const currentBusiness = ref(BUSINESS_OPTIONS[0].value);
const appOptionsList = ref([...APP_OPTIONS]);
const currentApp = ref(appOptionsList.value[0].value);

// Config Version Logic
const currentConfigVersion = ref(CONFIG_VERSIONS[0].id);
const configVersionOptions = computed(() => configVersionsList.value.map(v => ({ label: v.name, value: v.id })));
const isDependencyModalOpen = ref(false);
const configVersionsList = ref(CONFIG_VERSIONS); // Reactive list

// When opening the modal, we might want to edit the currently selected config's dependencies
// But let's make the modal manage ALL configs or the current one.
// User requirement: "Each version of the configuration table needs to be associated with every application version."
// Let's make the modal a manager for the current selected config version.

const dependencyData = computed(() => {
    const config = configVersionsList.value.find(v => v.id === currentConfigVersion.value);
    return config?.dependencies || [];
});

const dependencyColumns = [
    { title: '应用 ID', dataIndex: 'appId', key: 'appId' },
    { title: '依赖版本', dataIndex: 'version', key: 'version' },
    { title: '操作', key: 'action', width: 100 },
];

const handleUpdateDependency = (appId: string, version: string) => {
    const config = configVersionsList.value.find(v => v.id === currentConfigVersion.value);
    if (config) {
        const dep = config.dependencies.find(d => d.appId === appId);
        if (dep) {
            dep.version = version;
            message.success('版本更新成功');
            // Trigger reload if needed, though dependencyData is computed
        }
    }
};

const editingKey = ref('');
const editableData = reactive<Record<string, string>>({});

const edit = (key: string) => {
    const config = configVersionsList.value.find(v => v.id === currentConfigVersion.value);
    const dep = config?.dependencies.find(d => d.appId === key);
    if (dep) {
        editableData[key] = dep.version;
        editingKey.value = key;
    }
};

const save = (key: string) => {
    handleUpdateDependency(key, editableData[key]);
    editingKey.value = '';
};

const cancel = (key: string) => {
    delete editableData[key];
    editingKey.value = '';
};

const selectedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]); // 控制展开的节点

const isAddAppModalOpen = ref(false);
const newAppForm = ref({ label: '', value: '' });

const handleAddApp = () => {
    if (!newAppForm.value.label || !newAppForm.value.value) {
        message.error('请填写完整的应用信息');
        return;
    }
    const newApp = { ...newAppForm.value };
    appOptionsList.value.push(newApp);
    currentApp.value = newApp.value;
    isAddAppModalOpen.value = false;
    newAppForm.value = { label: '', value: '' };
    message.success('新增应用成功');
};

const openAddAppModal = () => {
    newAppForm.value = { label: '', value: '' };
    isAddAppModalOpen.value = true;
};
const selectedNode = ref<MenuItem | null>(null);
const isAddingChild = ref(false); // 是否正在为当前节点添加子节点

// Form State
const formState = ref({
  title: '',
  key: '',
  type: 'menu' as 'menu' | 'page' | 'sub-page',
  linkType: 'capability', // 'capability' | 'external'
  appId: '', // Added appId
  appVersion: undefined as string | undefined, // Added appVersion
  capability: { capabilityKey: '' } as IMenuCapabilityLink,
  externalLink: '',
  openNewTab: false
});
const isEditing = ref(false);

const handleSelect = (keys: string[], info: { node: MenuItem }) => {
  selectedKeys.value = keys;
  const node = info.node;
  selectedNode.value = node;
  isAddingChild.value = false;
  if (node) {
    // Infer appId from capabilityKey or use default
    // In a real app, this should be stored in the node
    let inferredAppId = 'AppAi';
    if (node.capability?.capabilityKey) {
        if (node.capability.capabilityKey.startsWith('mall.')) inferredAppId = 'AppMall';
        else if (node.capability.capabilityKey.startsWith('commerce.')) inferredAppId = 'AppCommerce';
    }

    formState.value = {
      title: node.title,
      key: node.key,
      type: node.type,
      linkType: node.externalLink ? 'external' : 'capability',
      appId: inferredAppId,
      appVersion: node.capability?.version, // Load version if exists
      capability: node.capability ? { ...node.capability } : { capabilityKey: '' },
      externalLink: node.externalLink || '',
      openNewTab: node.openNewTab || false
    };
    isEditing.value = true;
  }
};

const handleTreeAdd = (node: MenuItem | { key: 'root'; type: 'menu'; title?: string }) => {
  // 点击加号，自动选中当前菜单
  if (node.key !== 'root') {
    selectedKeys.value = [node.key];
    selectedNode.value = node as MenuItem;
  } else {
    selectedKeys.value = [];
    selectedNode.value = { key: 'root', type: 'menu', title: '根目录' } as MenuItem;
  }
  isAddingChild.value = true;
  isEditing.value = true;
  
  // 初始化新子节点表单
  let defaultType: 'menu' | 'page' | 'sub-page' = 'menu';
  if (node.type === 'page' || node.type === 'sub-page') {
    defaultType = 'sub-page';
  }

  formState.value = {
    title: '',
    key: `menu-${Date.now()}`,
    type: defaultType,
    linkType: 'capability',
    appId: currentApp.value, // Default to currently selected app
    appVersion: undefined,
    capability: { capabilityKey: '' },
    externalLink: '',
    openNewTab: false
  };
};

const handleTreeDelete = (node: MenuItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除节点 "${node.title}" 吗？`,
    onOk() {
      const removeFromTree = (nodes: MenuItem[], key: string): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].key === key) {
            nodes.splice(i, 1);
            return true;
          }
          if (nodes[i].children && removeFromTree(nodes[i].children!, key)) {
            return true;
          }
        }
        return false;
      };
      
      removeFromTree(treeData.value, node.key);
      treeData.value = [...treeData.value]; // 强制触发响应式更新
      message.success('节点已删除');
      if (selectedNode.value?.key === node.key) {
        resetEditorState();
      }
    }
  });
};

/**
 * 查找树中指定 Key 的节点原始数据对象
 */
const findNodeByKey = (nodes: MenuItem[], key: string): MenuItem | null => {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

const handleSave = () => {
  if (!selectedNode.value) return;

  const dataToSave: MenuItem = {
    title: formState.value.title,
    key: formState.value.key,
    type: formState.value.type,
    status: 'normal',
  };

  if (formState.value.type === 'page' || formState.value.type === 'sub-page') {
    if (formState.value.linkType === 'capability') {
      const capKey = formState.value.capability.capabilityKey.trim();
      if (!capKey) {
        message.error('请选择关联能力');
        return;
      }
      dataToSave.capability = { 
          capabilityKey: capKey,
          version: formState.value.appVersion // Save version
      };
    } else {
      dataToSave.externalLink = formState.value.externalLink;
    }
    dataToSave.openNewTab = formState.value.openNewTab;
  }

  if (isAddingChild.value) {
    // 关键修复：必须从 treeData 原始数据中查找父节点，因为 handleTreeAdd 传入的可能是视图层的装饰对象
    if (selectedNode.value.key === 'root') {
      treeData.value.push(dataToSave);
    } else {
      const parentNode = findNodeByKey(treeData.value, selectedNode.value.key);
      if (parentNode) {
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(dataToSave);
        // 确保父节点展开
        if (!expandedKeys.value.includes(parentNode.key)) {
          expandedKeys.value = [...expandedKeys.value, parentNode.key];
        }
      } else {
        message.error('未找到父节点，添加失败');
        return;
      }
    }
    
    // 触发响应式更新
    treeData.value = [...treeData.value];
    message.success('节点添加成功');
    
    // 选中新节点
    selectedKeys.value = [dataToSave.key];
    selectedNode.value = dataToSave;
    isAddingChild.value = false;
  } else {
    // 编辑当前节点
    const targetNode = findNodeByKey(treeData.value, selectedNode.value.key);
    if (targetNode) {
      Object.assign(targetNode, dataToSave);
      treeData.value = [...treeData.value];
      message.success('保存成功');
      selectedNode.value = targetNode;
    }
  }
};

const capabilityOptions = computed<Array<{ value: string; label: string }>>(() => {
  // Filter capabilities based on selected appId in the form
  // For mock purposes, we'll return different sets based on formState.appId
  
  if (formState.value.appId === 'AppMall') {
      return [
          { value: 'mall.home', label: '商城首页 (AppMall)' },
          { value: 'mall.product.list', label: '商品列表 (AppMall)' },
          { value: 'mall.category.list', label: '分类管理 (AppMall)' },
          { value: 'mall.product.create', label: '创建商品 (AppMall)' },
      ];
  } else if (formState.value.appId === 'AppCommerce') {
      return [
          { value: 'commerce.work', label: '工作台 (AppCommerce)' },
          { value: 'commerce.order.list', label: '全部订单 (AppCommerce)' },
          { value: 'commerce.order.refund', label: '售后处理 (AppCommerce)' },
          { value: 'commerce.order.manage', label: '订单管理 (AppCommerce)' },
      ];
  }

  // Default AppAi capabilities
  const source = resources.app?.wujieName || resources.app?.appName || resources.app?.appId || 'UnknownApp';
  return (resources.pages ?? []).map((p) => ({
    value: p.capabilityKey,
    label: `${p.title || p.capabilityKey} (${source})`,
  }));
});

const breadcrumbParentOptions = capabilityOptions;

const resetEditorState = () => {
  selectedKeys.value = [];
  selectedNode.value = null;
  isEditing.value = false;
  formState.value = {
    title: '',
    key: '',
    type: 'menu',
    linkType: 'capability',
    appId: '',
    appVersion: undefined,
    capability: { capabilityKey: '' },
    externalLink: '',
    openNewTab: false,
  };
};

const loadByEnvironment = () => {
  const data = getMenuDataByEnvironment(
      environment.value, 
      currentCategory.value, 
      currentBusiness.value, 
      currentApp.value,
      currentConfigVersion.value
  );
  treeData.value = data.treeData;
  // 初始化展开所有根节点
  expandedKeys.value = data.treeData.map(node => node.key);
  resetEditorState();
};

loadByEnvironment();
watch([environment, currentCategory, currentBusiness, currentApp, currentConfigVersion], loadByEnvironment);

// Watch for route query changes to update currentCategory
watch(
  () => route.query.type,
  (newType) => {
    if (newType && ['business', 'app', 'tenant', 'admin'].includes(newType as string)) {
      currentCategory.value = newType as IMenuCategory;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Top Bar: Config Version Selector -->
    <div class="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
        <div class="flex items-center gap-4">
            <h2 class="font-bold text-lg m-0">菜单配置</h2>
            <div class="flex items-center gap-2">
                <span class="text-gray-500 text-sm">配置版本:</span>
                <a-select
                    v-model:value="currentConfigVersion"
                    style="width: 200px"
                    :options="configVersionOptions"
                />
            </div>
        </div>
        <div>
            <a-button @click="isDependencyModalOpen = true">
                <template #icon><TableOutlined /></template>
                配置表管理
            </a-button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
    <!-- Left: Menu Tree -->
    <div class="col-span-1 border-r pr-4 flex flex-col">
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-3">
            菜单结构
            <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ currentCategory === 'business' ? '业态菜单' : 
                   currentCategory === 'app' ? '应用菜单' : 
                   currentCategory === 'tenant' ? '租户菜单' : '超管菜单' }})
            </span>
        </h3>
        
        <div class="space-y-3">
          <!-- Radio Group Removed -->

          <div v-if="currentCategory === 'business'" class="flex items-center bg-gray-50 p-2 rounded border">
            <span class="text-xs text-gray-500 mr-2 whitespace-nowrap">当前业态:</span>
            <a-select 
              v-model:value="currentBusiness" 
              size="small" 
              class="flex-1"
              :options="BUSINESS_OPTIONS"
            />
          </div>

          <div v-if="currentCategory === 'app'" class="flex items-center bg-gray-50 p-2 rounded border">
            <span class="text-xs text-gray-500 mr-2 whitespace-nowrap">当前应用:</span>
            <a-select 
              v-model:value="currentApp" 
              size="small" 
              class="flex-1 mr-2"
              :options="appOptionsList"
            />
            <a-tooltip title="新增应用配置">
                <a-button type="dashed" size="small" shape="circle" :icon="h(PlusOutlined)" @click="openAddAppModal" />
            </a-tooltip>
          </div>
        </div>
      </div>

      <div class="mb-2 flex justify-between items-center text-gray-500 text-xs px-1">
        <span>当前编辑: {{ currentCategory === 'app' || currentCategory === 'business' ? '特定业态/应用 (按环境隔离)' : '通用菜单 (所有环境共享)' }}</span>
        <div class="space-x-2">
          <a-tooltip title="添加根菜单">
            <a-button type="dashed" size="small" shape="circle" :icon="h(PlusOutlined)" @click="handleTreeAdd({ key: 'root', type: 'menu' })" />
          </a-tooltip>
        </div>
      </div>
      
      <div class="flex-1 border rounded p-4 bg-white overflow-auto">
        <a-tree 
          v-model:selectedKeys="selectedKeys" 
          v-model:expandedKeys="expandedKeys"
          :tree-data="treeData" 
          defaultExpandAll 
          blockNode
          @select="handleSelect"
        >
          <template #title="node">
            <div class="flex items-center justify-between group">
              <span class="flex items-center">
                <FolderOpenOutlined v-if="node.type === 'menu'" class="mr-2 text-blue-500" />
                <AppstoreOutlined v-else-if="node.type === 'page'" class="mr-2 text-green-500" />
                <FileTextOutlined v-else class="mr-2 text-orange-500" />
                {{ node.title }}
                <ExclamationCircleOutlined v-if="node.status === 'broken'" class="ml-2 text-red-500" />
                <ExclamationCircleOutlined v-if="node.status === 'warning'" class="ml-2 text-orange-500" />
              </span>
              <div class="space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a-button type="text" size="small" class="p-0 h-auto" @click.stop="handleTreeAdd(node)">
                  <template #icon><PlusOutlined class="text-xs text-blue-500" /></template>
                </a-button>
                <a-button type="text" size="small" danger class="p-0 h-auto" @click.stop="handleTreeDelete(node)">
                  <template #icon><DeleteOutlined class="text-xs" /></template>
                </a-button>
              </div>
            </div>
          </template>
        </a-tree>
      </div>
    </div>

    <!-- Right: Edit Panel -->
    <div class="col-span-2">
      <h3 class="font-bold mb-4 text-lg">
        {{ isAddingChild ? `在 "${selectedNode?.title}" 下添加子节点` : `节点配置 - ${formState.type === 'menu' ? '分类' : (formState.type === 'sub-page' ? '子页面' : '页面')}` }}
      </h3>
      
      <div v-if="isEditing" class="bg-white p-6 rounded border shadow-sm transition-all">
        <a-form layout="vertical">
          <a-form-item label="节点类型">
            <a-radio-group v-model:value="formState.type" button-style="solid">
              <a-radio-button 
                value="menu" 
                :disabled="!isAddingChild || selectedNode?.type !== 'menu'"
              >分类</a-radio-button>
              <a-radio-button 
                value="page" 
                :disabled="!isAddingChild || selectedNode?.type !== 'menu'"
              >页面</a-radio-button>
              <a-radio-button 
                value="sub-page" 
                :disabled="!isAddingChild || (selectedNode?.type !== 'page' && selectedNode?.type !== 'sub-page')"
              >子页面</a-radio-button>
            </a-radio-group>
            <div class="text-xs text-gray-400 mt-1">
              <template v-if="selectedNode?.type === 'menu'">分类节点下可添加分类或页面</template>
              <template v-else-if="selectedNode?.type === 'page' || selectedNode?.type === 'sub-page'">页面/子页面下只能添加子页面</template>
            </div>
          </a-form-item>

          <a-form-item label="名称">
            <a-input v-model:value="formState.title" />
          </a-form-item>
          
          <template v-if="formState.type === 'page' || formState.type === 'sub-page'">
            <a-form-item label="链接类型">
              <a-radio-group v-model:value="formState.linkType" button-style="solid">
                <a-radio-button value="capability">关联内部能力</a-radio-button>
                <a-radio-button value="external">外部链接</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <template v-if="formState.linkType === 'capability'">
              <div class="flex gap-4">
                  <a-form-item label="所属应用" class="flex-1">
                    <a-select
                      v-model:value="formState.appId"
                      :options="appOptionsList"
                      placeholder="请选择应用"
                    />
                  </a-form-item>
                  
                  <a-form-item label="应用版本" class="w-32">
                    <a-input
                      v-model:value="formState.appVersion"
                      placeholder="默认最新"
                    />
                  </a-form-item>
              </div>

              <a-form-item label="关联内部能力">
                <a-select
                  v-model:value="formState.capability.capabilityKey"
                  show-search
                  placeholder="请选择能力"
                  :options="capabilityOptions"
                />
                
                <!-- Status Alerts -->
                <div v-if="selectedNode?.status === 'broken'" class="mt-2 p-2 bg-red-50 text-red-600 rounded text-xs flex items-center">
                  <ExclamationCircleOutlined class="mr-1"/> 错误：该页面关联的能力在当前环境不可用，请重新关联。
                </div>
                <div v-if="selectedNode?.status === 'warning'" class="mt-2 p-2 bg-orange-50 text-orange-600 rounded text-xs flex items-center">
                  <ExclamationCircleOutlined class="mr-1"/> 警告：该页面关联的能力在当前环境存在变更风险。
                </div>
                
                <div class="text-xs text-gray-500 mt-2 p-2 bg-blue-50 rounded" v-if="formState.capability.capabilityKey">
                  <span class="font-bold">Info:</span> 点击该页面将拉起对应子应用。
                </div>
              </a-form-item>
            </template>
            
            <template v-else>
              <a-form-item label="外部链接 URL">
                <a-input v-model:value="formState.externalLink" placeholder="https://..." />
              </a-form-item>
            </template>
            
            <a-form-item label="打开方式">
              <a-checkbox v-model:checked="formState.openNewTab">在新标签页打开</a-checkbox>
            </a-form-item>
          </template>

          <a-form-item>
             <a-button type="primary" @click="handleSave">保存配置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <div v-else class="h-64 flex items-center justify-center bg-gray-50 border rounded border-dashed text-gray-400">
        请选择左侧节点进行编辑
      </div>

      <div class="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded text-sm border border-yellow-200">
        <strong class="text-base">核心原则：</strong>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li><strong>菜单</strong>：仅作为导航结构，可以包含子菜单和页面。</li>
          <li><strong>页面</strong>：实际的功能入口，可以关联一个能力或外部链接。</li>
          <li><strong>层级限制</strong>：页面节点下只能添加子页面。</li>
        </ul>
      </div>
    </div>
  </div>
  </div>

  <a-modal
    v-model:open="isAddAppModalOpen"
    title="新增应用配置"
    @ok="handleAddApp"
  >
    <a-form layout="vertical">
      <a-form-item label="应用 ID" required>
        <a-input v-model:value="newAppForm.value" placeholder="例如: AppNew" />
      </a-form-item>
      <a-form-item label="应用名称" required>
        <a-input v-model:value="newAppForm.label" placeholder="例如: 新业务应用" />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="isDependencyModalOpen"
    title="配置表管理 (关联应用版本)"
    :footer="null"
    width="700px"
  >
    <div class="mb-4 flex items-center justify-between">
        <a-alert message="定义当前配置版本下，各应用所使用的具体版本。" type="info" show-icon class="flex-1 mr-4" />
        <div class="font-bold">当前配置: {{ configVersionOptions.find(o => o.value === currentConfigVersion)?.label }}</div>
    </div>
    
    <a-table 
        :columns="dependencyColumns" 
        :data-source="dependencyData" 
        :pagination="false" 
        size="small" 
        rowKey="appId"
        bordered
    >
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'version'">
                <div v-if="editingKey === record.appId">
                    <a-input v-model:value="editableData[record.appId]" size="small" />
                </div>
                <div v-else>
                    <a-tag color="blue">{{ record.version }}</a-tag>
                </div>
            </template>
            <template v-else-if="column.key === 'action'">
                <div v-if="editingKey === record.appId">
                    <a-typography-link @click="save(record.appId)" class="mr-2">保存</a-typography-link>
                    <a-typography-link @click="cancel(record.appId)">取消</a-typography-link>
                </div>
                <div v-else>
                    <a-button type="link" size="small" @click="edit(record.appId)">
                        <template #icon><Pencil class="w-3 h-3" /></template>
                    </a-button>
                </div>
            </template>
        </template>
    </a-table>
  </a-modal>
</template>
