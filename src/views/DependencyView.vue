<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { DEPENDENCY_MAP, APP_LIST } from "../constants/mockData";
import { useConfigTable } from "../state/configTable";

const currentApp = ref<string | undefined>(undefined);
const filterType = ref("all"); // 'all', 'frontend', 'backend'
const canvasRef = ref<HTMLDivElement | null>(null);
const centerCanvas = () => {
    const el = canvasRef.value as HTMLElement | null;
    if (el) {
        const centerX = (el.scrollWidth - el.clientWidth) / 2;
        const centerY = (el.scrollHeight - el.clientHeight) / 2;
        el.scrollLeft = Math.max(centerX, 0);
        el.scrollTop = Math.max(centerY, 0);
    }
};

const rawDependencies = computed(() => {
    if (!currentApp.value) return [];
    return DEPENDENCY_MAP[currentApp.value] || [];
});

const dependencies = computed(() => {
    if (filterType.value === "all") return rawDependencies.value;
    return rawDependencies.value.filter((d) => d.category === filterType.value);
});

const layout = computed(() => {
    const items = dependencies.value;
    const n = items.length || 1;
    const step = 360 / n;
    const innerRadius = 240 + Math.min(n, 20) * 6;
    const outerRadius = 380 + Math.min(n, 20) * 8;
    return items.map((dep, i) => {
        const ring = i % 2 === 0 ? "inner" : "outer";
        const angle = i * step + (ring === "outer" ? step / 2 : 0);
        const radius = ring === "inner" ? innerRadius : outerRadius;
        const jitter = ((i % 3) - 1) * 22;
        return { dep, angle, radius, jitter, ring };
    });
});

const canvasSize = computed(() => {
    const maxRadius = layout.value.reduce((m, it) => Math.max(m, it.radius), 0);
    return maxRadius * 2 + 480;
});

const columns = [
    { title: "Service ID", dataIndex: "id" },
    { title: "Category", dataIndex: "category" },
    { title: "Version", dataIndex: "version" },
    { title: "Type", dataIndex: "type" },
    { title: "Status", dataIndex: "status" },
    { title: "Description", dataIndex: "desc" },
];

const appOptions = APP_LIST.map((app) => ({
    value: app.appName,
    label: app.appName,
}));

const { activeConfigTable, getVersionByAppId } = useConfigTable();

const currentAppVersion = computed(() => {
    if (!currentApp.value) return "-";
    const cfg = getVersionByAppId(currentApp.value);
    if (cfg) return cfg;
    const meta = APP_LIST.find((a) => a.appName === currentApp.value);
    return meta?.version ?? "-";
});

onMounted(centerCanvas);
watch([currentApp, dependencies], centerCanvas);
</script>

<template>
    <div class="p-4 h-full flex flex-col">
        <div
            class="mb-6 flex justify-between items-center bg-white p-4 rounded shadow-sm border"
        >
            <div class="flex items-center">
                <span class="mr-4 font-bold text-gray-700">当前应用:</span>
                <a-select
                    v-model:value="currentApp"
                    style="width: 240px"
                    :options="appOptions"
                    placeholder="请选择应用"
                />
                <div v-if="activeConfigTable" class="ml-4 text-gray-500 text-sm">
                    当前配置表：{{ activeConfigTable.name }}
                </div>
            </div>
            <div class="flex items-center">
                <span class="mr-4 font-bold text-gray-700">视图筛选:</span>
                <a-radio-group v-model:value="filterType" button-style="solid">
                    <a-radio-button value="all">全部</a-radio-button>
                    <a-radio-button value="frontend">前端依赖</a-radio-button>
                    <a-radio-button value="backend">后端服务</a-radio-button>
                </a-radio-group>
            </div>
        </div>

        <!-- Graph Area -->
        <div
            class="flex-1 bg-gray-50 rounded border relative overflow-auto mb-6 flex items-center justify-center p-8"
            style="padding-top: 200px"
            ref="canvasRef"
        >
            <!-- Central Node -->
            <div
                v-if="currentApp"
                class="relative z-10 w-40 h-40 rounded-full bg-blue-600 shadow-xl flex flex-col items-center justify-center text-white transition-transform hover:scale-105"
            >
                <div class="text-3xl mb-1">📦</div>
                <div class="font-bold text-lg">{{ currentApp }}</div>
                <div class="text-xs opacity-80 mt-1">{{ currentAppVersion }}</div>
            </div>

            <!-- Orbiting Nodes -->
            <div
                v-if="dependencies.length > 0"
                class="absolute flex items-center justify-center pointer-events-none"
                :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
            >
                <div
                    v-for="node in layout"
                    :key="`${node.ring}-${node.dep.id}`"
                    class="absolute flex flex-col items-center justify-center transition-all duration-500"
                    :style="{
                        transform: `rotate(${node.angle}deg) translate(${node.radius}px) translateY(${node.jitter}px) rotate(-${node.angle}deg)`,
                    }"
                >
                    <div
                        class="absolute bg-gray-300 -z-10"
                        :style="{
                            width: `${node.radius - 60}px`,
                            height: '2px',
                            transform: `rotate(${node.angle + 180}deg)`,
                            transformOrigin: 'center left',
                            left: '50%',
                            top: '50%',
                        }"
                    ></div>
                    <div
                        class="pointer-events-auto w-56 bg-white rounded-lg shadow-lg border-l-4 p-4 hover:-translate-y-1 hover:shadow-xl transition-all"
                        :class="
                            node.dep.category === 'frontend'
                                ? 'border-purple-500'
                                : 'border-green-500'
                        "
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div
                                class="font-bold text-gray-800 text-base truncate"
                                :title="node.dep.id"
                            >
                                {{ node.dep.id }}
                            </div>
                            <a-tag
                                :color="
                                    node.dep.status === 'Running' ||
                                    node.dep.status === 'Loaded' ||
                                    node.dep.status === 'Ready'
                                        ? 'success'
                                        : 'default'
                                "
                            >
                                {{ node.dep.status }}
                            </a-tag>
                        </div>
                        <div
                            class="flex justify-between text-xs text-gray-500 mb-2"
                        >
                            <span class="px-1.5 py-0.5 rounded bg-gray-100">{{
                                node.dep.category === "frontend"
                                    ? "Frontend"
                                    : "Backend"
                            }}</span>
                            <span class="font-mono">{{
                                node.dep.version
                            }}</span>
                        </div>
                        <div
                            class="text-xs text-gray-400 border-t pt-2 truncate"
                        >
                            {{ node.dep.desc }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="absolute mt-32 text-gray-400 italic">
                {{
                    currentApp
                        ? "暂无符合条件的依赖项"
                        : "请先选择一个应用查看依赖"
                }}
            </div>
        </div>

        <!-- Table Area -->
        <div class="bg-white p-4 rounded border shadow-sm">
            <h4 class="font-bold mb-4 text-lg border-b pb-2">依赖详情列表</h4>
            <a-table
                :dataSource="dependencies"
                :columns="columns"
                :pagination="false"
                bordered
                size="small"
                rowKey="id"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'category'">
                        <a-tag
                            :color="
                                record.category === 'frontend'
                                    ? 'purple'
                                    : 'green'
                            "
                        >
                            {{
                                record.category === "frontend"
                                    ? "前端依赖"
                                    : "后端服务"
                            }}
                        </a-tag>
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>
