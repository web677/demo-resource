<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import { Pencil, Check, X, Filter } from 'lucide-vue-next';
import type { ICapabilityRow, IManifestAppRow } from '../lib/resourceTransform';
import type { IEnvironmentKey } from '../state/environment';
import { ENVIRONMENT_OPTIONS } from '../state/environment.ts';
import { useConfigTable } from '../state/configTable';
import { getManifestDataByEnvironment } from '../mocks/environmentData';

const columnsManifest = [
    { title: "子应用 ID", dataIndex: "appName" },
    { title: "当前版本号", dataIndex: "version" },
    { title: "首次构建时间", dataIndex: "firstBuildTime" },
    { title: "更新时间", dataIndex: "updatedTime" },
    {
        title: "Manifest 状态",
        dataIndex: "status",
        customRender: (info: { text?: string }) => info.text || "已解析",
    },
];

const columnsCap = [
    { title: "Capability Key", dataIndex: "key", width: "200px" },
    { title: "名称", dataIndex: "name", width: "180px" },
    { title: "描述", dataIndex: "desc" },
    { title: "来源子应用", dataIndex: "source", width: "150px" },
    { title: "类型", dataIndex: "type", width: "100px" },
    // { title: "支持版本", dataIndex: "versions", width: "120px" },
    { title: "操作", dataIndex: "action", width: "100px", fixed: "right" },
];

const { configTables } = useConfigTable();

const appList = ref<IManifestAppRow[]>([]);
const capabilities = ref<ICapabilityRow[]>([]);

// Filters
const filters = reactive({
    app: undefined as string | undefined,
    version: undefined as string | undefined,
    configTableId: undefined as string | undefined,
    type: undefined as string | undefined,
});

const configTableOptions = computed(() =>
    configTables.value.map((t) => ({ value: t.id, label: t.name })),
);

const resolveEnvKeyByConfigTableId = (configTableId: string | undefined): IEnvironmentKey => {
    const pool = ENVIRONMENT_OPTIONS.map((o) => o.value);
    const index = configTableId
        ? Math.max(0, configTables.value.findIndex((t) => t.id === configTableId))
        : 0;
    return pool[index % pool.length] ?? pool[0] ?? "21";
};

const buildConfigTableVersionMap = (configTableId: string | undefined): Map<string, string> => {
    if (!configTableId) return new Map<string, string>();
    const table = configTables.value.find((t) => t.id === configTableId);
    if (!table) return new Map<string, string>();
    return new Map<string, string>(table.appVersions.map((v) => [v.appId, v.version]));
};

watch(
    () => filters.configTableId,
    (newVal) => {
        if (newVal) filters.version = undefined;
    },
);


// Options for filters
const appOptions = computed(() => {
    const apps = new Set(capabilities.value.map((c) => c.source));
    return Array.from(apps).map((app) => ({ value: app, label: app }));
});

const versionOptions = computed(() => {
    const versions = new Set<string>();
    for (const c of capabilities.value) {
        for (const v of c.versions) versions.add(v);
    }
    return Array.from(versions).map((v) => ({ value: v, label: v }));
});

const typeOptions = computed(() => {
    const types = new Set(capabilities.value.map((c) => c.type));
    return Array.from(types).map((t) => ({ value: t, label: t }));
});

// Filtered Data
const filteredCapabilities = computed(() => {
    return capabilities.value.filter((item) => {
        if (filters.app && item.source !== filters.app) return false;
        if (filters.version && !item.versions.includes(filters.version)) return false;
        if (filters.type && item.type !== filters.type) return false;
        return true;
    });
});

// Editing Logic
const editableData: Record<string, ICapabilityRow> = reactive({});

const edit = (key: string) => {
    const target = capabilities.value.find((item) => item.key === key);
    if (target) {
        editableData[key] = { ...target };
    }
};

const save = (key: string) => {
    const index = capabilities.value.findIndex((item) => item.key === key);
    if (index > -1) {
        Object.assign(capabilities.value[index], editableData[key]);
        delete editableData[key];
    }
};

const cancel = (key: string) => {
    delete editableData[key];
};

const deleteCapability = (key: string) => {
  capabilities.value = capabilities.value.filter(item => item.key !== key);
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "new":
            return "green";
        case "changed":
            return "orange";
        case "deprecated":
            return "red";
        default:
            return "blue";
    }
};

interface IVersionOption {
    value: string;
    label: string;
}

interface ISnapshotItem {
    key: string;
    routePath: string;
    type: 'Page';
    app: string;
}

const VERSIONS: IVersionOption[] = [
    { value: 'v4.0.0', label: 'v4.0.0 (Current)' },
    { value: 'v4.3.4', label: 'v4.3.4 (2025-12-01)' },
    { value: 'v4.4.1', label: 'v4.4.1 (2025-10-15)' },
];

const SNAPSHOT_DATA: Record<string, ISnapshotItem[]> = {
    'v4.0.0': [
        { key: 'ai.knowledge.graph', routePath: '/ai/knowledge-graph', type: 'Page', app: 'AppAi' },
        { key: 'ai.knowledge.library.manage', routePath: '/ai/knowledge-library', type: 'Page', app: 'AppAi' },
    ],
    'v4.3.4': [
        { key: 'ai.knowledge.graph', routePath: '/ai/kg', type: 'Page', app: 'AppAi' },
        { key: 'ai.question.library.manage', routePath: '/ai/question-library', type: 'Page', app: 'AppAi' },
    ],
    'v4.4.1': [
        { key: 'ai.knowledge.library.manage', routePath: '/ai/knowledge-library', type: 'Page', app: 'AppAi' },
    ],
};

type IDiffColor = 'green' | 'orange' | 'red';
interface IDiffItem {
    key: string;
    type: '新增' | '变更' | '删除';
    field: string;
    scope: string;
    color: IDiffColor;
    app: string;
}

const diffOpen = ref(false);
const diffExecuted = ref(false);
const diffApp = ref<string | undefined>(undefined);
const diffSourceVersion = ref<string | undefined>(undefined);
const diffTargetVersion = ref<string | undefined>(undefined);

// Mock Diff Logic based on versions
const getDiffs = (app: string | undefined, v1: string | undefined, v2: string | undefined): IDiffItem[] => {
    if (!app) return [];
    if (!v1 || !v2) return [];
    if (v1 === v2) return [];

    const baseDiffs: IDiffItem[] = [
        {
            key: "ai.knowledge.graph",
            type: "变更",
            field: "routePath: /ai/kg -> /ai/knowledge-graph",
            scope: "所有用户",
            color: "orange",
            app: "AppAi",
        },
        {
            key: "ai.question.library.manage",
            type: "新增",
            field: "新页面能力引入",
            scope: "运营人员",
            color: "green",
            app: "AppAi",
        },
    ];

    if (v2 === "v0.8.0") {
        return [
            ...baseDiffs,
            {
                key: "ai.knowledge.graph",
                type: "删除",
                field: "页面能力下线",
                scope: "管理员",
                color: "red",
                app: "AppAi",
            },
        ];
    }

    return baseDiffs;
};

const appNameOptions = computed<Array<{ value: string; label: string }>>(() =>
    appList.value.map((a) => ({ value: a.appName, label: a.appName }))
);

watch([diffApp, diffSourceVersion, diffTargetVersion], () => {
    diffExecuted.value = false;
});

const diffs = computed(() => {
    if (!diffExecuted.value) return [];
    return getDiffs(diffApp.value, diffSourceVersion.value, diffTargetVersion.value);
});

const snapshotList = computed(() => {
    if (!diffExecuted.value) return [];
    if (!diffSourceVersion.value) return [];
    const list = SNAPSHOT_DATA[diffSourceVersion.value] || [];
    if (!diffApp.value) return list;
    return list.filter((it) => it.app === diffApp.value);
});

const openDiff = () => {
    if (!diffApp.value) diffApp.value = appList.value[0]?.appName;
    diffOpen.value = true;
};

const executeDiff = () => {
    diffExecuted.value = true;
};

const resetEditableData = (target: Record<string, ICapabilityRow>) => {
    for (const k of Object.keys(target)) delete target[k];
};

const loadByEnvironment = () => {
    const envKey = resolveEnvKeyByConfigTableId(filters.configTableId);
    const data = getManifestDataByEnvironment(envKey);
    const versionMap = buildConfigTableVersionMap(filters.configTableId);

    appList.value = data.appList.map((app) => ({
        ...app,
        version: versionMap.get(app.appName) ?? app.version,
    }));
    capabilities.value = data.capabilities.map((cap) => {
        const version = versionMap.get(cap.source);
        if (!version) return cap;
        return { ...cap, versions: [version] };
    });

    filters.app = undefined;
    filters.type = undefined;

    resetEditableData(editableData);
    diffOpen.value = false;
    diffExecuted.value = false;
    diffApp.value = data.appList[0]?.appName;
    diffSourceVersion.value = undefined;
    diffTargetVersion.value = undefined;
};

loadByEnvironment();
watch(() => filters.configTableId, loadByEnvironment);
</script>

<template>
    <div class="h-full flex flex-col pt-2 space-y-4">
        <div
            class="border p-4 rounded bg-white shadow-sm flex-col hidden lg:flex"
            style="max-height: 300px"
        >
            <h3 class="text-lg font-bold mb-4 flex items-center shrink-0">
                <span class="w-2 h-6 bg-blue-500 mr-2 rounded"></span>
                Manifest 列表 (最新构建)
            </h3>
            <div class="overflow-auto flex-1">
                <a-table
                    :dataSource="appList"
                    :columns="columnsManifest"
                    :pagination="false"
                    bordered
                    size="small"
                    rowKey="appName"
                />
            </div>
        </div>

        <div class="border p-4 rounded bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
            <h3 class="text-lg font-bold mb-4 flex items-center shrink-0 justify-between">
                <div class="flex items-center">
                    <span class="w-2 h-6 bg-green-500 mr-2 rounded"></span>
                    能力目录 (产品视角)
                </div>
                <div class="flex items-center gap-3">
                    <a-button type="primary" @click="openDiff">能力目录 Diff</a-button>
                    <div class="text-xs font-normal text-gray-500 flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Pencil class="w-3 h-3 mr-1" />
                        支持编辑名称与描述
                    </div>
                </div>
            </h3>

            <div class="mb-4 flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded border">
                <div class="flex items-center">
                    <Filter class="w-4 h-4 text-gray-500 mr-2" />
                    <span class="text-sm font-bold text-gray-700 mr-2">筛选:</span>
                </div>

                <a-select
                    v-model:value="filters.app"
                    placeholder="选择应用"
                    style="width: 160px"
                    allowClear
                    :options="appOptions"
                />

                <a-select
                    v-model:value="filters.version"
                    placeholder="选择版本"
                    style="width: 120px"
                    allowClear
                    :options="versionOptions"
                />

                <a-select
                    v-model:value="filters.configTableId"
                    placeholder="选择配置表"
                    style="width: 220px"
                    allowClear
                    :options="configTableOptions"
                />

                <a-select
                    v-model:value="filters.type"
                    placeholder="选择类型"
                    style="width: 120px"
                    allowClear
                    :options="typeOptions"
                />

                <div class="ml-auto text-gray-400 text-xs">
                    共 {{ filteredCapabilities.length }} 条记录
                </div>
            </div>

            <div class="overflow-auto flex-1">
                <a-table
                    :dataSource="filteredCapabilities"
                    :columns="columnsCap"
                    :pagination="false"
                    bordered
                    size="small"
                    rowKey="key"
                >
                    <template #bodyCell="{ column, text, record }">
                        <template v-if="['name', 'desc'].includes(column.dataIndex)">
                            <div v-if="editableData[record.key]">
                                <a-input
                                    v-model:value="editableData[record.key][column.dataIndex as 'name' | 'desc']"
                                    size="small"
                                />
                            </div>
                            <div v-else class="group flex items-center justify-between">
                                <span class="truncate" :title="text">{{ text }}</span>
                                <Pencil
                                    class="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-blue-500 transition-opacity"
                                    @click="edit(record.key)"
                                />
                            </div>
                        </template>

                        <template v-else-if="column.dataIndex === 'versions'">
                            <div class="flex flex-wrap gap-1">
                                <a-tag v-for="v in record.versions" :key="v" color="purple">{{ v }}</a-tag>
                            </div>
                        </template>

                        <template v-else-if="column.dataIndex === 'action'">
                            <div class="flex items-center space-x-2">
                                <template v-if="editableData[record.key]">
                                    <a-button type="primary" size="small" shape="circle" @click="save(record.key)">
                                        <template #icon><Check class="w-3 h-3" /></template>
                                    </a-button>
                                    <a-button size="small" shape="circle" @click="cancel(record.key)">
                                        <template #icon><X class="w-3 h-3" /></template>
                                    </a-button>
                                </template>
                                <template v-else>
                                    <a-button type="link" size="small" @click="edit(record.key)">编辑</a-button>
                                    <!-- <a-button type="link" danger size="small" @click="deleteCapability(record.key)">
                                        <template #icon><Trash2 class="w-3 h-3" /></template>
                                    </a-button> -->
                                </template>
                            </div>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>

        <a-modal v-model:open="diffOpen" title="能力目录 Diff" :width="1100" :footer="null">
            <div class="space-y-4">
                <div class="bg-white p-4 rounded border flex items-center gap-4">
                    <div class="flex items-center">
                        <span class="font-bold mr-2 text-gray-700">应用:</span>
                        <a-select
                            v-model:value="diffApp"
                            style="width: 200px"
                            :options="appNameOptions"
                            placeholder="请选择应用"
                        />
                    </div>
                    <div class="flex items-center">
                        <span class="font-bold mr-2 text-gray-700">基准版本:</span>
                        <a-select
                            v-model:value="diffSourceVersion"
                            style="width: 200px"
                            :options="VERSIONS"
                            placeholder="请选择版本"
                        />
                    </div>
                    <div class="text-gray-400 font-bold">VS</div>
                    <div class="flex items-center">
                        <span class="font-bold mr-2 text-gray-700">目标版本:</span>
                        <a-select
                            v-model:value="diffTargetVersion"
                            style="width: 200px"
                            :options="VERSIONS"
                            placeholder="请选择版本"
                        />
                    </div>
                    <div class="ml-auto">
                        <a-button
                            type="primary"
                            :disabled="!diffApp || !diffSourceVersion || !diffTargetVersion"
                            @click="executeDiff"
                        >
                            执行对比
                        </a-button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6" style="min-height: 520px">
                    <div class="border p-4 rounded bg-gray-50 flex flex-col">
                        <h3 class="font-bold mb-4 text-lg border-b pb-2 flex justify-between">
                            当前基准 ({{ diffSourceVersion || "未选择" }})
                            <span class="text-xs font-normal text-gray-500">能力目录快照</span>
                        </h3>

                        <div
                            v-if="!diffExecuted"
                            class="flex-1 flex items-center justify-center flex-col text-gray-400"
                        >
                            请选择应用与版本后点击「执行对比」
                        </div>

                        <div
                            v-else-if="snapshotList.length === 0"
                            class="flex-1 flex items-center justify-center flex-col text-gray-400"
                        >
                            无该版本快照数据
                        </div>

                        <div v-else class="flex-1 overflow-auto space-y-3 pr-2">
                            <div
                                v-for="item in snapshotList"
                                :key="item.key"
                                class="p-3 bg-white border rounded shadow-sm text-sm"
                            >
                                <div class="flex justify-between items-center mb-1">
                                    <span class="font-bold text-gray-700">{{ item.key }}</span>
                                    <a-tag color="blue">{{ item.type }}</a-tag>
                                </div>
                                <div class="text-gray-500 flex justify-between">
                                    <span class="font-mono bg-gray-100 px-1 rounded">{{ item.routePath }}</span>
                                    <span class="text-xs">{{ item.app }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="border p-4 rounded bg-white shadow-sm flex flex-col relative">
                        <h3 class="font-bold mb-4 text-lg border-b pb-2 flex justify-between items-center">
                            差异分析结果 ({{ diffTargetVersion || "未选择" }})
                            <a-tag color="blue">待确认</a-tag>
                        </h3>

                        <div v-if="!diffExecuted" class="flex-1 flex items-center justify-center text-gray-400">
                            请选择应用与版本后点击「执行对比」
                        </div>

                        <div
                            v-else-if="diffs.length === 0"
                            class="flex-1 flex items-center justify-center text-gray-400"
                        >
                            无差异
                        </div>

                        <div v-else class="space-y-4 flex-1 overflow-auto pb-20">
                            <div
                                v-for="diff in diffs"
                                :key="diff.key"
                                class="p-4 border rounded flex justify-between items-start transition hover:shadow-md relative overflow-hidden"
                                :class="{
                                    'bg-green-50 border-green-200': diff.color === 'green',
                                    'bg-orange-50 border-orange-200': diff.color === 'orange',
                                    'bg-red-50 border-red-200': diff.color === 'red',
                                }"
                            >
                                <div class="absolute top-0 left-0 w-1 h-full" :class="`bg-${diff.color}-500`"></div>
                                <div class="pl-2">
                                    <div class="font-bold text-base flex items-center">
                                        {{ diff.key }}
                                        <span class="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                            {{ diff.app }}
                                        </span>
                                    </div>
                                    <div v-if="diff.field !== '-'" class="text-sm text-gray-600 mt-1 font-mono">
                                        {{ diff.field }}
                                    </div>
                                </div>

                                <div class="text-right">
                                    <a-tag :color="diff.color">{{ diff.type }}</a-tag>
                                    <div class="text-xs text-gray-500 mt-2">影响范围: {{ diff.scope }}</div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="absolute bottom-4 left-4 right-4 p-3 bg-blue-50 text-sm text-blue-800 rounded border border-blue-100 shadow-lg"
                        >
                            <p class="font-bold flex items-center">
                                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                治理策略提示：
                            </p>
                            <ul class="list-disc pl-5 mt-1 text-xs">
                                <li>红色差异（删除）建议人工二次确认，防止误删线上入口。</li>
                                <li>橙色差异（变更）需关注前端路由或兼容性。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<style scoped></style>
